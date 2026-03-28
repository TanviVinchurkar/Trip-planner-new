document.querySelectorAll('.js-plan-button').forEach(button => {
  button.addEventListener('click', () => {
    const fb = document.querySelector('.form-bar');
    fb.style.display = 'flex';
  });
});

const loginBtn = document.querySelector('.js-login-signup');
if (loginBtn) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (token && user) {
    loginBtn.textContent = user.name.split(' ')[0] + ' ▾';
    loginBtn.addEventListener('click', () => {
      window.location.href = 'dashBoard.html';
    });
  } else {
    loginBtn.addEventListener('click', () => {
      window.location.href = 'login.html';
    });
  }
}

// Close form-bar with X button
document.querySelector('.form-close')?.addEventListener('click', () => {
  document.querySelector('.form-bar').style.display = 'none';
});

// ── BUG 3: Prevent selecting past dates ───────────────────────────────────────
const today = new Date().toISOString().split('T')[0];
const startDateInput = document.getElementById('start-date');
const endDateInput   = document.getElementById('end-date');
if (startDateInput) startDateInput.min = today;
if (endDateInput)   endDateInput.min   = today;

// When start date changes, end date min becomes start date
startDateInput?.addEventListener('change', () => {
  if (endDateInput) {
    endDateInput.min = startDateInput.value;
    // If end date is before new start date, reset it
    if (endDateInput.value && endDateInput.value < startDateInput.value) {
      endDateInput.value = '';
    }
  }
});

// ── BUG 2: Destination quick-links in footer open the form pre-filled ─────────
document.querySelectorAll('.dest-link, .style-link').forEach(link => {
  link.addEventListener('click', () => {
    const dest = link.dataset.dest;
    // Open the form
    document.querySelector('.form-bar').style.display = 'flex';
    // Pre-fill the destination input
    const destInput = document.getElementById('destination');
    if (destInput) {
      destInput.value = dest;
      destInput.focus();
    }
    // Scroll to the form
    document.querySelector('.form-bar').scrollIntoView({ behavior: 'smooth' });
  });
});

// ── NEW: Destinations section cards "Plan Trip" buttons ───────────────────────
document.querySelectorAll('.dest-plan-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const city = btn.dataset.city;
    // Open the form
    document.querySelector('.form-bar').style.display = 'flex';
    // Pre-fill the destination input
    const destInput = document.getElementById('destination');
    if (destInput) {
      destInput.value = city;
      destInput.focus();
    }
    // Scroll to the form
    document.querySelector('.form-bar').scrollIntoView({ behavior: 'smooth' });
  });
});

// ── City Card Plan Buttons ─────────────────────────────────────────────────────
document.querySelectorAll('.city-plan-btn').forEach(button => {
  button.addEventListener('click', () => {
    const cityCard = button.closest('.city-card');
    const cityName = cityCard?.dataset.city;
    
    if (cityName) {
      // Open the form
      document.querySelector('.form-bar').style.display = 'flex';
      // Pre-fill the destination input
      const destInput = document.getElementById('destination');
      if (destInput) {
        destInput.value = cityName;
      }
      // Scroll to the form
      document.querySelector('.form-bar').scrollIntoView({ behavior: 'smooth' });
    }
  });
});