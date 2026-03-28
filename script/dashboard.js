import { getMe, getMyTrips, deleteTrip, isLoggedIn, removeToken, updateProfile } from './api.js';

// ── Guard: redirect to login if not logged in ─────────────────────────────────
if (!isLoggedIn()) {
  window.location.href = 'login.html';
}

// ── Populate profile section ──────────────────────────────────────────────────
async function loadProfile() {
  try {
    const user = await getMe();

    // Navbar user name
    const navUser = document.querySelector('.user');
    if (navUser) navUser.textContent = `${user.name} ▾`;

    // Profile card
    const nameEl = document.querySelector('.name');
    const emailVal = document.querySelector('.info-block:nth-child(2) .value');
    const phoneVal = document.querySelector('.info-block:nth-child(1) .value');

    if (nameEl) nameEl.textContent = user.name;
    if (emailVal) emailVal.textContent = user.email;
    if (phoneVal) phoneVal.textContent = user.phone || 'Not added';

    // Avatar initial if no photo
    const avatar = document.querySelector('.avatar');
    if (avatar) {
      if (user.avatar) {
        avatar.style.backgroundImage = `url(${user.avatar})`;
        avatar.style.backgroundSize = 'cover';
      } else {
        avatar.textContent = user.name.charAt(0).toUpperCase();
        avatar.style.cssText += ';display:flex;align-items:center;justify-content:center;font-size:2rem;font-weight:bold;color:#4a90e2;background:#e8f0fe';
      }
    }
  } catch (err) {
    console.error('Could not load profile:', err.message);
  }
}

// ── Load and render trips ─────────────────────────────────────────────────────
async function loadTrips() {
  const tripGrid = document.querySelector('.trip-grid');
  if (!tripGrid) return;

  tripGrid.innerHTML = `<p style="color:#888;padding:1rem;width:100%">Loading your trips...</p>`;

  try {
    const trips = await getMyTrips();

    if (!trips.length) {
      tripGrid.innerHTML = `
        <div style="text-align:center;padding:2rem;color:#888;width:100%">
          <p>You haven't planned any trips yet.</p>
          <a href="index.html" style="color:#4a90e2;font-weight:500">+ Plan your first trip</a>
        </div>`;
      return;
    }

    const countBadge = document.querySelector('.badge-count');
    if (countBadge) countBadge.textContent = trips.length;

    const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

    tripGrid.innerHTML = trips.map(trip => {
      const days = trip.days || '?';
      const perPerson = trip.budgetBreakdown?.perPerson
        ? `₹${Number(trip.budgetBreakdown.perPerson).toLocaleString('en-IN')} / person`
        : `₹${Number(trip.budget).toLocaleString('en-IN')} total`;

      let statusClass = 'planned';
      if (trip.status === 'ongoing') statusClass = 'ongoing';
      if (trip.status === 'completed') statusClass = 'completed';

      return `
        <div class="trip-card" data-id="${trip._id}" data-status="${(trip.status || 'planned').toLowerCase()}">
          <div class="trip-image" style="${trip.destinationImage ? `background-image:url(${trip.destinationImage});background-size:cover;background-position:center` : ''}">
            <div class="status-badge ${statusClass}">${trip.status || 'Planned'}</div>
            <div class="badge">${days} Day${days > 1 ? 's' : ''}</div>
          </div>
          <div class="trip-content">
            <div class="trip-title">${trip.destination}</div>
            <div class="trip-sub">${trip.startLocation} → ${trip.destination}</div>
            <div class="trip-date" style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px;">${fmt(trip.startDate)} - ${fmt(trip.endDate)}</div>
            <div class="trip-stats">
              <div>${trip.selectedSpots?.length || 0} Spots</div>
              <div>${trip.people || 1} Traveller${trip.people > 1 ? 's' : ''}</div>
            </div>
            <div class="price">${perPerson}</div>
            <div class="trip-actions" style="display:flex;gap:8px;margin-top:auto">
              <button class="trip-btn view-trip btn-primary" data-id="${trip._id}" style="flex:1">View Trip</button>
              <button class="delete-trip delete-btn" data-id="${trip._id}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>`;
    }).join('');

    // View Trip button
    document.querySelectorAll('.view-trip').forEach(btn => {
      btn.addEventListener('click', () => {
        localStorage.setItem('currentTripId', btn.dataset.id);
        window.location.href = 'plan.html';
      });
    });

    // Delete Trip button
    document.querySelectorAll('.delete-trip').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this trip?')) return;
        try {
          await deleteTrip(btn.dataset.id);
          btn.closest('.trip-card').remove();
        } catch (err) {
          alert('Could not delete trip: ' + err.message);
        }
      });
    });

  } catch (err) {
    tripGrid.innerHTML = `<p style="color:#c00;padding:1rem;width:100%">Failed to load trips: ${err.message}</p>`;
  }
}

// ── Edit Profile modal ────────────────────────────────────────────────────────
const editBtn = document.querySelector('.edit');
if (editBtn) {
  editBtn.style.cursor = 'pointer';
  editBtn.addEventListener('click', () => {
    const current = {
      name: document.querySelector('.name').textContent,
      email: document.querySelector('.info-block:nth-child(2) .value').textContent,
      phone: document.querySelector('.info-block:nth-child(1) .value').textContent !== 'Not added'
        ? document.querySelector('.info-block:nth-child(1) .value').textContent
        : '',
    };

    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999';
    modal.innerHTML = `
      <div style="background:#fff;border-radius:12px;padding:24px;max-width:400px;width:90%">
        <h2>Edit Profile</h2>
        <form id="edit-profile-form" style="display:flex;flex-direction:column;gap:16px;margin-top:16px">
          <div>
            <label for="edit-name" style="display:block;font-weight:500;margin-bottom:6px">Name</label>
            <input type="text" id="edit-name" value="${current.name}" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px">
          </div>
          <div>
            <label for="edit-email" style="display:block;font-weight:500;margin-bottom:6px">Email</label>
            <input type="email" id="edit-email" value="${current.email}" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px" disabled>
          </div>
          <div>
            <label for="edit-phone" style="display:block;font-weight:500;margin-bottom:6px">Phone</label>
            <input type="tel" id="edit-phone" value="${current.phone}" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px">
          </div>
          <div style="display:flex;gap:8px;margin-top:8px">
            <button type="button" id="cancel-edit" style="flex:1;padding:10px;background:#f0f0f0;border:none;border-radius:6px;cursor:pointer">Cancel</button>
            <button type="submit" style="flex:1;padding:10px;background:#4a90e2;color:#fff;border:none;border-radius:6px;cursor:pointer">Save</button>
          </div>
        </form>
      </div>`;

    document.body.appendChild(modal);

    modal.querySelector('#cancel-edit').addEventListener('click', () => modal.remove());

    modal.querySelector('#edit-profile-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = modal.querySelector('button[type="submit"]');
      submitBtn.textContent = 'Saving...';
      submitBtn.disabled = true;

      try {
        const name = modal.querySelector('#edit-name').value.trim();
        const phone = modal.querySelector('#edit-phone').value.trim();
        if (!name) throw new Error('Name cannot be empty');

        await updateProfile({ name, phone });
        modal.remove();
        loadProfile();
      } catch (err) {
        alert('Save failed: ' + err.message);
        submitBtn.textContent = 'Save';
        submitBtn.disabled = false;
      }
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  });
}

// ── Search trips by destination ────────────────────────────────────────────────
const tripSearchInput = document.querySelector('.trip-search input');
if (tripSearchInput) {
  tripSearchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    document.querySelectorAll('.trip-card').forEach(card => {
      const title = card.querySelector('.trip-title')?.textContent?.toLowerCase() || '';
      card.style.display = title.includes(query) ? '' : 'none';
    });
  });
}

// ── Filter buttons (Planned / Ongoing / Completed) ────────────────────────────
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = (btn.dataset.filter || btn.textContent.trim()).toLowerCase();
    document.querySelectorAll('.trip-card').forEach(card => {
      const status = (card.dataset.status || '').toLowerCase();
      card.style.display = (filter === 'all' || status === filter) ? '' : 'none';
    });
  });
});

// ── Dropdown handlers ─────────────────────────────────────────────────────────
const dropdownProfile = document.getElementById('dropdown-profile');
if (dropdownProfile) {
  dropdownProfile.style.cursor = 'pointer';
  dropdownProfile.addEventListener('click', () => {
    document.querySelector('.profile-card')?.scrollIntoView({ behavior: 'smooth' });
    document.getElementById('user-dropdown')?.classList.remove('show');
  });
}
const dropdownLogout = document.getElementById('dropdown-logout');
if (dropdownLogout) {
  dropdownLogout.style.cursor = 'pointer';
  dropdownLogout.addEventListener('click', () => {
    removeToken();
    localStorage.removeItem('user');
    window.location.href = 'login.html';
  });
}

// ── Logout (clicking user name) ───────────────────────────────────────────────
const navUser = document.querySelector('.user');
if (navUser) {
  navUser.style.cursor = 'pointer';
}

// ── Plan Trip nav button ───────────────────────────────────────────────────────
document.querySelector('.btn')?.addEventListener('click', () => {
  window.location.href = 'index.html';
});

// ── Boot ──────────────────────────────────────────────────────────────────────
loadProfile();
loadTrips();
