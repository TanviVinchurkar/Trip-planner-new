import { getTripById, updateItinerary, isLoggedIn } from './api.js';

function getHeroImage(destination) {
  const city = (destination || '').toLowerCase().trim();
  const W = 'https://upload.wikimedia.org/wikipedia/commons/thumb';
  const imgs = {
    mumbai:      `${W}/3/3a/Gateway_of_India_2009.jpg/800px-Gateway_of_India_2009.jpg`,
    delhi:       `${W}/b/bc/India_Gate_in_New_Delhi_03-2016.jpg/800px-India_Gate_in_New_Delhi_03-2016.jpg`,
    'new delhi': `${W}/b/bc/India_Gate_in_New_Delhi_03-2016.jpg/800px-India_Gate_in_New_Delhi_03-2016.jpg`,
    jaipur:      `${W}/5/5e/Hawa_Mahal%2C_Jaipur%2C_Rajasthan%2C_India.jpg/800px-Hawa_Mahal%2C_Jaipur%2C_Rajasthan%2C_India.jpg`,
    agra:        `${W}/b/bd/Taj_Mahal%2C_Agra%2C_India_edit3.jpg/800px-Taj_Mahal%2C_Agra%2C_India_edit3.jpg`,
    varanasi:    `${W}/3/3d/Dashashwamedh_Ghat_During_Ganga_Aarti.jpg/800px-Dashashwamedh_Ghat_During_Ganga_Aarti.jpg`,
    udaipur:     `${W}/4/4b/City_Palace_of_Udaipur.jpg/800px-City_Palace_of_Udaipur.jpg`,
    jodhpur:     `${W}/0/08/Mehrangarh_Fort%2C_Jodhpur.jpg/800px-Mehrangarh_Fort%2C_Jodhpur.jpg`,
    jaisalmer:   `${W}/8/89/Sonar_Quila_Jaisalmer_Fort.jpg/800px-Sonar_Quila_Jaisalmer_Fort.jpg`,
    pune:        `${W}/a/a7/Shaniwarwada_Gate.jpg/800px-Shaniwarwada_Gate.jpg`,
    nashik:      `${W}/e/ec/Kalaram_Temple%2C_Nashik.jpg/800px-Kalaram_Temple%2C_Nashik.jpg`,
    lucknow:     `${W}/c/c9/Rumi_Darwaza_Lucknow.jpg/800px-Rumi_Darwaza_Lucknow.jpg`,
    lonavala:    `${W}/9/97/Lions_point_lonavala.jpg/800px-Lions_point_lonavala.jpg`,
    chennai:     `${W}/2/2e/Kapaleeshwarar_Temple%2C_Mylapore.jpg/800px-Kapaleeshwarar_Temple%2C_Mylapore.jpg`,
    channai:     `${W}/2/2e/Kapaleeshwarar_Temple%2C_Mylapore.jpg/800px-Kapaleeshwarar_Temple%2C_Mylapore.jpg`,
    chainnai:    `${W}/2/2e/Kapaleeshwarar_Temple%2C_Mylapore.jpg/800px-Kapaleeshwarar_Temple%2C_Mylapore.jpg`,
    amravati:    'pictures/location/amravati.png',
    chikhaldara: 'pictures/location/chilkharldara.png',
  };
  if (imgs[city]) return imgs[city];
  for (const [key, url] of Object.entries(imgs)) {
    if (city.includes(key) || key.includes(city)) return url;
  }
  return 'pictures/nature.jpeg';
}

// ── Tab switching ──────────────────────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(p => p.style.display = 'none');
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).style.display = 'flex';
    document.getElementById('tab-' + btn.dataset.tab).style.flexDirection = 'column';
  });
});

// ── Load trip ─────────────────────────────────────────────────────────────────
async function loadTrip() {
  let trip = null;

  const tripId = localStorage.getItem('currentTripId');
  if (isLoggedIn() && tripId) {
    try { trip = await getTripById(tripId); }
    catch { trip = JSON.parse(localStorage.getItem('guestTrip')); }
  }
  if (!trip) trip = JSON.parse(localStorage.getItem('guestTrip'));

  if (!trip) {
    document.querySelector('.container').innerHTML =
      `<div style="padding:3rem;text-align:center">
        <h2>No trip found.</h2>
        <a href="index.html" style="color:#2563eb">← Plan a trip first</a>
       </div>`;
    return;
  }
  renderPlan(trip);
}

// ── Render ────────────────────────────────────────────────────────────────────
function renderPlan(trip) {
  const start = new Date(trip.startDate);
  const end   = new Date(trip.endDate);
  const days  = trip.days || Math.max(1, Math.ceil((end - start) / 86400000));
  const fmt   = d => new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short' });

  // Hero
  const heroImg = document.getElementById('hero-img');
  if (heroImg) {
    // If saved image is a real URL (from Wikipedia/Pixabay/Pexels/Unsplash) use it
    // If it's local path or empty, use local SVG
    // Always have a fallback chain: saved → local SVG → nature.jpeg
    if (trip.destinationImage && trip.destinationImage.startsWith('http')) {
      heroImg.src = trip.destinationImage;
      heroImg.onerror = () => {
        // Real URL failed, fall back to local SVG for this city
        heroImg.src = getHeroImage(trip.destination);
        heroImg.onerror = () => {
          heroImg.src = 'pictures/nature.jpeg';
          heroImg.onerror = null;
        };
      };
    } else {
      heroImg.src = getHeroImage(trip.destination);
      heroImg.onerror = () => { heroImg.src = 'pictures/nature.jpeg'; heroImg.onerror = null; };
    }
  }
  const heroTitle = document.getElementById('hero-title');
  if (heroTitle) heroTitle.textContent = `${days} Day${days>1?'s':''} Trip in ${trip.destination}`;
  const heroDate = document.getElementById('hero-date');
  if (heroDate) heroDate.textContent = `${fmt(trip.startDate)} – ${fmt(trip.endDate)}`;

  // Map — use destination name as search query
  const mapFrame = document.getElementById('trip-map');
  if (mapFrame) {
    mapFrame.src = `https://maps.google.com/maps?q=${encodeURIComponent(trip.destination + ' tourist places')}&output=embed`;
  }

  // About
  const aboutText = document.getElementById('about-text');
  if (aboutText) {
    aboutText.textContent = `${trip.destination} awaits you! ${days} day${days>1?'s':''} starting `
      + `${fmt(trip.startDate)}, total budget ₹${Number(trip.budget).toLocaleString('en-IN')} `
      + `for ${trip.people||1} person${(trip.people||1)>1?'s':''}.`;
  }

  // Travel warning banner for long-distance trips
  if (trip.startLocation && trip.destination) {
    const tripRealDist = getCityDistance(trip.startLocation, trip.destination);
    if (tripRealDist && tripRealDist > 500) {
      const tInfo = getTravelInfo(trip.startLocation, trip.destination, tripRealDist);
      const aboutCard = document.getElementById('about-text')?.closest('.card');
      if (aboutCard) {
        const travelBanner = document.createElement('div');
        travelBanner.style.cssText = 'background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;padding:10px 14px;margin-top:10px;font-size:13px;color:#92400e';
        travelBanner.innerHTML = `<strong>${tInfo.mode}</strong> from ${trip.startLocation} to ${trip.destination} · ~${tripRealDist} km · ${tInfo.note}`;
        aboutCard.appendChild(travelBanner);
      }
    }
  }

  // Weather card — inject inside about card
  if (trip.weather) {
    const aboutCard = document.getElementById('about-text')?.closest('.card');
    if (aboutCard) {
      const wEl = document.createElement('div');
      wEl.style.cssText = 'display:flex;align-items:center;gap:10px;margin-top:12px;'
        + 'background:#eff6ff;border-radius:10px;padding:10px 14px';
      wEl.innerHTML = `<img src="${trip.weather.icon}" style="width:40px;height:40px">
        <div>
          <strong>${trip.weather.temp}°C</strong> · ${trip.weather.description}
          <div style="font-size:12px;color:#666">in ${trip.destination}</div>
        </div>`;
      aboutCard.appendChild(wEl);
    }
  }

  // Budget breakdown card
  if (trip.budgetBreakdown) {
    const b = trip.budgetBreakdown;
    const aboutCard = document.getElementById('about-text')?.closest('.card');
    const budgetCard = document.createElement('div');
    budgetCard.className = 'card';
    budgetCard.style.marginTop = '16px';
    const categories = [
      ['🏨 Accommodation', b.accommodation, '#2563eb'],
      ['🍽 Food',          b.food,          '#16a34a'],
      ['🚌 Transport',     b.transport,     '#f59e0b'],
      ['🎯 Activities',    b.activities,    '#8b5cf6'],
      ['🆘 Emergency',     b.emergency,     '#ef4444'],
    ];
    budgetCard.innerHTML = `
      <h3 style="margin-bottom:12px">Budget Breakdown</h3>
      <p style="font-size:13px;color:#666;margin-bottom:10px">
        ${b.budgetLabel || ''} · ₹${(b.perPersonPerDay||0).toLocaleString('en-IN')}/person/day
      </p>
      ${categories.map(([label, val, color]) => `
        <div style="display:flex;justify-content:space-between;align-items:center;
                    padding:7px 0;border-bottom:1px solid #f0f0f0;font-size:14px">
          <span>${label}</span>
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:80px;height:6px;background:#f0f0f0;border-radius:3px">
              <div style="width:${b.totalBudget?Math.round(val/b.totalBudget*100):0}%;height:100%;
                          background:${color};border-radius:3px"></div>
            </div>
            <strong>₹${Number(val).toLocaleString('en-IN')}</strong>
          </div>
        </div>`).join('')}`;

    // Hotel cost detail
    if (b.hotelPricePerNight && b.hotelNights) {
      const noteEl = document.createElement('p');
      noteEl.style.cssText = 'font-size:12px;color:#6b7280;margin-top:8px;padding-top:8px;border-top:1px solid #f0f0f0';
      noteEl.textContent = `🏨 Accommodation = ₹${b.hotelPricePerNight.toLocaleString('en-IN')}/night × ${b.hotelNights} night${b.hotelNights > 1 ? 's' : ''}`;
      budgetCard.appendChild(noteEl);
    }

    // Total verification line
    const totalShown = (b.accommodation||0) + (b.food||0) + (b.transport||0) + (b.activities||0) + (b.emergency||0);
    const totalLine = document.createElement('p');
    totalLine.style.cssText = 'font-size:13px;font-weight:700;margin-top:10px;padding-top:8px;border-top:2px solid #e5e7eb;display:flex;justify-content:space-between';
    totalLine.innerHTML = `<span>💰 Total</span><span>₹${totalShown.toLocaleString('en-IN')}</span>`;
    budgetCard.appendChild(totalLine);

    if (aboutCard) aboutCard.after(budgetCard);
  }

  // Hotels tab
  const hotelList = document.getElementById('hotel-list');
  if (hotelList) {
    if (trip.selectedHotel) {
      const h = trip.selectedHotel;
      hotelList.innerHTML = `
        <div style="display:flex;gap:12px;align-items:center;border:2px solid #2563eb;
                    border-radius:10px;padding:10px">
          <img src="${h.img||'pictures/hotels/grandplace.png'}" alt="${h.name}"
            style="width:80px;height:70px;border-radius:8px;object-fit:cover"
            onerror="this.src='pictures/hotels/grandplace.png'">
          <div>
            <h4>${h.name} <span style="color:#2563eb;font-size:12px">✔ Selected</span></h4>
            <p style="font-size:13px;color:#666">${h.address||''}</p>
            <p style="font-size:13px">${h.rating}</p>
            <p style="font-weight:600">₹${Number(h.price).toLocaleString('en-IN')}/night</p>
          </div>
        </div>
        <p style="margin-top:12px;font-size:13px;color:#666">
          <a href="https://www.google.com/maps/search/hotels+in+${encodeURIComponent(trip.destination)}"
            target="_blank" style="color:#2563eb">
            🔍 Search more hotels in ${trip.destination} on Google Maps →
          </a>
        </p>`;
    } else {
      hotelList.innerHTML = `
        <p style="color:#888;font-size:14px">No hotel selected yet.</p>
        <a href="https://www.google.com/maps/search/hotels+in+${encodeURIComponent(trip.destination||'')}"
           target="_blank" style="color:#2563eb;font-size:14px;display:block;margin-top:8px">
          🔍 Find hotels in ${trip.destination||'your destination'} on Google Maps →
        </a>`;
    }
  }

  // Itinerary
  renderItinerary(trip, days, start);

  // Route tab
  currentMapTrip = trip;
  renderRoute(trip, days, start);

  // Expenses tab
  renderExpenses(trip);
}

// ── Itinerary ─────────────────────────────────────────────────────────────────
function renderItinerary(trip, days, start) {
  const fmt = d => new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short' });

  // Auto-fill from spots if no saved itinerary
  function buildDefaultItinerary() {
    const spots = trip.selectedSpots || [];
    const dest  = trip.destination || 'destination';
    const hotel = trip.selectedHotel?.name || 'hotel';
    const pool  = [
      ...spots.map(s => s.name),
      `Explore ${dest} local market`,
      `Try local cuisine in ${dest}`,
      `Visit ${dest} city center`,
      `Relax and shopping in ${dest}`,
      `Evening walk in ${dest}`,
    ];
    let idx = 0;
    return Array.from({ length: days }, (_, i) => ({
      day: i + 1,
      activities: [
        `Morning: ${pool[idx++ % pool.length]}`,
        `Afternoon: ${pool[idx++ % pool.length]}`,
        `Evening: Check in at ${hotel}`,
      ]
    }));
  }

  const saved   = trip.itinerary?.length ? trip.itinerary : buildDefaultItinerary();
  const planTab = document.getElementById('tab-plan');
  if (!planTab) return;

  // Remove old itinerary card if present, rebuild
  const oldCard = planTab.querySelector('.itinerary-card');
  if (oldCard) oldCard.remove();

  const card = document.createElement('div');
  card.className = 'card itinerary-card';
  card.style.marginTop = '16px';

  let html = '<h3 style="margin-bottom:14px">Day-by-Day Itinerary</h3>';
  let daysHTML = '';

  for (let i = 1; i <= days; i++) {
    const dayData = saved.find(d => d.day === i);

    // Gemini returns: { day, theme, morning, afternoon, evening, tip }
    // Fallback returns: { day, activities: [] }
    const isGeminiFormat = dayData && dayData.morning;

    const activities = isGeminiFormat
      ? [
          `🌅 ${dayData.morning}`,
          `☀️ ${dayData.afternoon}`,
          `🌙 ${dayData.evening}`,
        ]
      : (dayData?.activities || [
          `Morning: Explore ${trip.destination}`,
          `Afternoon: Visit local spots`,
          `Evening: Rest at hotel`,
        ]);

    const theme = isGeminiFormat ? dayData.theme : `Day ${i} in ${trip.destination}`;
    const tip   = isGeminiFormat ? dayData.tip   : '';

    const dateLabel = fmt(new Date(start.getTime() + (i - 1) * 86400000));

    daysHTML += `
      <div class="day" data-day="${i}"
        style="margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid #f0f0f0">
        <h4 style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
          <span style="background:#2563eb;color:white;width:26px;height:26px;
                       border-radius:50%;display:inline-flex;align-items:center;
                       justify-content:center;font-size:12px;font-weight:700;
                       flex-shrink:0">${i}</span>
          Day ${i} — ${dateLabel}
        </h4>
        ${theme ? `<p style="font-size:13px;color:#2563eb;font-weight:500;
                              margin-bottom:10px;margin-left:34px">${theme}</p>` : ''}
        <ul id="act-list-${i}" style="list-style:none;padding:0;margin-bottom:8px">
          ${activities.map(a => `
            <li style="display:flex;justify-content:space-between;align-items:flex-start;
                       padding:7px 10px;background:#f9fafb;border-radius:8px;
                       margin-bottom:5px;font-size:13px;line-height:1.4">
              <span>${a}</span>
              <button class="remove-act"
                style="background:none;border:none;color:#ef4444;cursor:pointer;
                       font-size:14px;padding:0 4px;flex-shrink:0;margin-left:8px">✕</button>
            </li>`).join('')}
        </ul>
        ${tip ? `
          <div style="background:#fffbeb;border-left:3px solid #f59e0b;padding:8px 12px;
                      border-radius:0 8px 8px 0;font-size:12px;color:#92400e;margin-bottom:8px">
            💡 Local tip: ${tip}
          </div>` : ''}
        <div style="display:flex;gap:8px">
          <input type="text" placeholder="Add activity..." id="act-input-${i}"
            style="flex:1;padding:8px 12px;border:1.5px solid #e5e7eb;border-radius:8px;
                   font-size:13px;outline:none"
            onfocus="this.style.borderColor='#2563eb'"
            onblur="this.style.borderColor='#e5e7eb'">
          <button class="action add-act-btn" data-day="${i}"
            style="padding:8px 16px;background:#2563eb;color:white;border:none;
                   border-radius:8px;cursor:pointer;font-size:13px;font-weight:600">
            + Add
          </button>
        </div>
      </div>`;
  }
  
  html += daysHTML;
  html += `<button id="save-itinerary"
    style="width:100%;padding:12px;background:#2563eb;color:white;border:none;
           border-radius:8px;cursor:pointer;font-size:15px;font-weight:600;margin-top:8px">
    Save Itinerary
  </button>`;

  card.innerHTML = html;
  planTab.appendChild(card);

  // Add activity
  card.addEventListener('click', e => {
    if (e.target.classList.contains('add-act-btn')) {
      const day   = Number(e.target.dataset.day);
      const input = document.getElementById(`act-input-${day}`);
      const text  = input.value.trim();
      if (!text) return;
      const li = document.createElement('li');
      li.style.cssText = 'display:flex;justify-content:space-between;align-items:center;'
        + 'padding:6px 0;border-bottom:1px solid #f0f0f0;font-size:14px';
      li.innerHTML = `<span>${text}</span>
        <button class="remove-act" data-act="${text}"
          style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:16px">✕</button>`;
      document.getElementById(`act-list-${day}`).appendChild(li);
      input.value = '';
    }
    if (e.target.classList.contains('remove-act')) {
      e.target.closest('li').remove();
    }
  });

  // Enter key adds activity
  card.querySelectorAll('input[id^="act-input-"]').forEach(input => {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const day = input.id.replace('act-input-', '');
        card.querySelector(`.add-act-btn[data-day="${day}"]`)?.click();
      }
    });
  });

  // Save itinerary
  document.getElementById('save-itinerary').addEventListener('click', async () => {
    const btn = document.getElementById('save-itinerary');
    btn.textContent = 'Saving...';
    const itinerary = [];
    for (let i = 1; i <= days; i++) {
      const acts = [...document.getElementById(`act-list-${i}`)
        .querySelectorAll('li span')].map(s => s.textContent.trim());
      if (acts.length) itinerary.push({ day: i, activities: acts });
    }
    const tripId = localStorage.getItem('currentTripId');
    try {
      if (isLoggedIn() && tripId) await updateItinerary(tripId, itinerary);
      const g = JSON.parse(localStorage.getItem('guestTrip') || '{}');
      g.itinerary = itinerary;
      localStorage.setItem('guestTrip', JSON.stringify(g));
      btn.textContent = '✔ Itinerary Saved!';
      btn.style.background = '#16a34a';
    } catch {
      const g = JSON.parse(localStorage.getItem('guestTrip') || '{}');
      g.itinerary = itinerary;
      localStorage.setItem('guestTrip', JSON.stringify(g));
      btn.textContent = '✔ Saved locally';
      btn.style.background = '#16a34a';
    }
    setTimeout(() => { btn.textContent = 'Save Itinerary'; btn.style.background = '#2563eb'; }, 3000);
  });
}

// ── Expenses tab ──────────────────────────────────────────────────────────────
function renderExpenses(trip) {
  const expContent = document.getElementById('expenses-content');
  if (!expContent) return;

  const EXPENSE_KEY = 'expenses_' + (trip.destination || 'trip');
  let expenses = JSON.parse(localStorage.getItem(EXPENSE_KEY) || '[]');

  const budget = trip.budget || 0;

  function totalSpent() { return expenses.reduce((s, e) => s + Number(e.amount), 0); }

  function render() {
    const spent = totalSpent();
    const remaining = budget - spent;
    expContent.innerHTML = `
      <div style="display:flex;justify-content:space-between;margin-bottom:16px;gap:10px">
        <div style="flex:1;text-align:center;background:#eff6ff;border-radius:10px;padding:12px">
          <div style="font-size:12px;color:#666">Budget</div>
          <div style="font-size:18px;font-weight:700;color:#2563eb">₹${budget.toLocaleString('en-IN')}</div>
        </div>
        <div style="flex:1;text-align:center;background:#fef9ee;border-radius:10px;padding:12px">
          <div style="font-size:12px;color:#666">Spent</div>
          <div style="font-size:18px;font-weight:700;color:#f59e0b">₹${spent.toLocaleString('en-IN')}</div>
        </div>
        <div style="flex:1;text-align:center;background:${remaining>=0?'#f0fdf4':'#fff1f2'};border-radius:10px;padding:12px">
          <div style="font-size:12px;color:#666">Left</div>
          <div style="font-size:18px;font-weight:700;color:${remaining>=0?'#16a34a':'#ef4444'}">
            ₹${Math.abs(remaining).toLocaleString('en-IN')}${remaining<0?' over':''}
          </div>
        </div>
      </div>

      <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">
        <input id="exp-name" type="text" placeholder="What (eg: lunch)"
          style="flex:2;min-width:100px;padding:8px 10px;border:1px solid #ddd;border-radius:8px;font-size:13px">
        <input id="exp-amount" type="number" placeholder="₹ Amount" min="0"
          style="flex:1;min-width:80px;padding:8px 10px;border:1px solid #ddd;border-radius:8px;font-size:13px">
        <select id="exp-cat" style="flex:1;min-width:90px;padding:8px;border:1px solid #ddd;border-radius:8px;font-size:13px">
          <option value="food">🍽 Food</option>
          <option value="transport">🚌 Transport</option>
          <option value="hotel">🏨 Hotel</option>
          <option value="activity">🎯 Activity</option>
          <option value="other">📦 Other</option>
        </select>
        <button id="add-expense"
          style="padding:8px 14px;background:#2563eb;color:white;border:none;border-radius:8px;cursor:pointer;font-size:13px">
          Add
        </button>
      </div>

      ${expenses.length ? `
        <div style="max-height:250px;overflow-y:auto">
          ${expenses.map((e, i) => `
            <div style="display:flex;justify-content:space-between;align-items:center;
                        padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:14px">
              <div>
                <span style="font-weight:500">${e.name}</span>
                <span style="font-size:12px;color:#888;margin-left:6px">${e.category}</span>
              </div>
              <div style="display:flex;align-items:center;gap:10px">
                <span style="font-weight:600">₹${Number(e.amount).toLocaleString('en-IN')}</span>
                <button data-del="${i}"
                  style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:16px">✕</button>
              </div>
            </div>`).join('')}
        </div>` : '<p style="color:#888;font-size:14px;text-align:center;padding:20px 0">No expenses logged yet</p>'}`;

    document.getElementById('add-expense').addEventListener('click', () => {
      const name   = document.getElementById('exp-name').value.trim();
      const amount = Number(document.getElementById('exp-amount').value);
      const cat    = document.getElementById('exp-cat').value;
      if (!name || !amount) return;
      expenses.push({ name, amount, category: cat, date: new Date().toLocaleDateString('en-IN') });
      localStorage.setItem(EXPENSE_KEY, JSON.stringify(expenses));
      render();
    });

    expContent.querySelectorAll('[data-del]').forEach(btn => {
      btn.addEventListener('click', () => {
        expenses.splice(Number(btn.dataset.del), 1);
        localStorage.setItem(EXPENSE_KEY, JSON.stringify(expenses));
        render();
      });
    });
  }
  render();
}

// ── Route Planner ─────────────────────────────────────────────────────────────

// Approximate road distances between major Indian cities (km)
const CITY_DISTANCES = {
  'amravati-nagpur': 155, 'amravati-mumbai': 650, 'amravati-pune': 580,
  'amravati-delhi': 1100, 'amravati-jaipur': 950, 'amravati-agra': 1000,
  'amravati-varanasi': 1050, 'amravati-lucknow': 1000, 'amravati-chennai': 1200,
  'amravati-udaipur': 850, 'amravati-jodhpur': 950, 'amravati-jaisalmer': 1150,
  'amravati-nashik': 480, 'amravati-lonavala': 560,
  'nagpur-mumbai': 840, 'nagpur-delhi': 1100, 'nagpur-pune': 710,
  'nagpur-varanasi': 940, 'nagpur-jaipur': 980, 'nagpur-agra': 980,
  'mumbai-delhi': 1420, 'mumbai-pune': 150, 'mumbai-goa': 590,
  'mumbai-jaipur': 1150, 'mumbai-agra': 1260, 'mumbai-varanasi': 1550,
  'mumbai-nashik': 170, 'mumbai-lonavala': 82, 'mumbai-udaipur': 790,
  'delhi-jaipur': 270, 'delhi-agra': 210, 'delhi-varanasi': 820,
  'delhi-lucknow': 550, 'delhi-jodhpur': 600, 'delhi-udaipur': 670,
  'delhi-jaisalmer': 790, 'delhi-chandigarh': 250, 'delhi-amritsar': 450,
  'delhi-mumbai': 1420, 'delhi-pune': 1470, 'delhi-chennai': 2170,
  'jaipur-agra': 240, 'jaipur-udaipur': 420, 'jaipur-jodhpur': 330,
  'jaipur-jaisalmer': 580, 'jaipur-varanasi': 880,
  'agra-varanasi': 650, 'agra-lucknow': 350,
  'varanasi-lucknow': 320, 'varanasi-patna': 250,
  'pune-goa': 460, 'pune-nashik': 210, 'pune-lonavala': 65,
  'chennai-mumbai': 1340, 'chennai-bangalore': 350, 'chennai-hyderabad': 630,
};

function getCityDistance(from, to) {
  const normalize = s => s.toLowerCase().trim()
    .replace('new delhi', 'delhi')
    .replace('channai', 'chennai')
    .replace('chainnai', 'chennai')
    .replace(/city$/, '').trim();
  const a = normalize(from);
  const b = normalize(to);
  return CITY_DISTANCES[`${a}-${b}`] || CITY_DISTANCES[`${b}-${a}`] || null;
}

function getTravelInfo(fromCity, toCity, distanceKm) {
  if (distanceKm <= 100) {
    return { mode: '🚗 Car/Bus', hours: Math.round(distanceKm / 60 * 10) / 10, overnight: false, note: 'Short drive' };
  } else if (distanceKm <= 300) {
    return { mode: '🚗 Car / 🚌 Bus', hours: Math.round(distanceKm / 55 * 10) / 10, overnight: false, note: 'Day journey' };
  } else if (distanceKm <= 600) {
    const hours = Math.round(distanceKm / 60 * 10) / 10;
    const overnight = hours > 10;
    return { mode: '🚆 Train recommended', hours, overnight, note: overnight ? 'Consider overnight train' : 'Half-day journey' };
  } else {
    const isFlight = distanceKm > 1000;
    const trainHours = Math.round(distanceKm / 65 * 10) / 10;
    const flightHours = 1.5 + (isFlight ? 0.5 : 0);
    return {
      mode: isFlight ? '✈️ Flight recommended' : '🚆 Train recommended',
      hours: isFlight ? flightHours : trainHours,
      overnight: isFlight ? false : (trainHours > 10),
      flightHours,
      trainHours,
      note: isFlight
        ? `~${flightHours}h by flight, ~${Math.round(trainHours)}h by train`
        : `~${Math.round(trainHours)}h by train`,
    };
  }
}

// Seed-based pseudo-random for consistent spot distances
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Estimate distance between two spots (3-8 km, seeded by ids)
function estimateDistance(spotA_id, spotB_id) {
  return Math.round((3 + seededRandom((spotA_id || 1) * 13 + (spotB_id || 1) * 7) * 5) * 10) / 10;
}

// Format minutes to hours/minutes
function fmtDuration(mins) {
  if (mins < 60) return `${Math.round(mins)} min`;
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// Format time from minutes since midnight
function fmtTime(minutesSinceMidnight) {
  let h = Math.floor(minutesSinceMidnight / 60);
  const m = Math.round(minutesSinceMidnight % 60);
  const ampm = h >= 12 ? 'PM' : 'AM';
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return `${h}:${String(m).padStart(2, '0')} ${ampm}`;
}

// Transport tip based on distance
function transportTip(distKm) {
  if (distKm < 3) return { icon: '🚶', text: `Walkable (${Math.round(distKm / 4 * 60)} min)`, mode: 'walking' };
  if (distKm <= 10) return { icon: '🛺', text: 'Auto/Cab recommended', mode: 'driving' };
  return { icon: '🚌', text: 'Local bus or cab', mode: 'driving' };
}

// Build Google Maps directions URL for a list of spot names
function gmapsDirectionUrl(spotNames) {
  return 'https://www.google.com/maps/dir/' + spotNames.map(n => encodeURIComponent(n)).join('/');
}

// Update map iframe to show directions
let currentMapTrip = null;
function updateMapForRoute(trip, mode) {
  const mapFrame = document.getElementById('trip-map');
  if (!mapFrame) return;
  const spots = trip.selectedSpots || [];
  const dest = trip.destination || '';
  if (spots.length < 1) {
    mapFrame.src = `https://maps.google.com/maps?q=${encodeURIComponent(dest + ' tourist places')}&output=embed`;
    return;
  }
  // Build a search query with all spot names for the embed
  const allNames = spots.map(s => s.name || s.location || 'spot');
      mapFrame.src = `https://maps.google.com/maps?q=${encodeURIComponent(dest + ' ' + allNames[0])}&output=embed`;
}

function renderRoute(trip, days, start) {
  const container = document.getElementById('route-container');
  if (!container) return;

  const spots = trip.selectedSpots || [];
  const dest = trip.destination || 'Destination';
  const hotel = trip.selectedHotel?.name || `Hotel in ${dest}`;
  const fmt = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' });

  // Empty state
  if (spots.length === 0) {
    container.innerHTML = `
      <div class="route-empty card">
        <h3>📍 No spots added yet</h3>
        <p>You haven't added any spots yet. Go back and add spots to see your route.</p>
        <a href="index.html" style="color:#2563eb;font-weight:600;margin-top:12px;display:inline-block">← Plan a trip</a>
      </div>`;
    return;
  }

  // Determine if Day 1 is a travel day
  const startLoc = (trip.startLocation || '').toLowerCase().trim();
  const destLoc = dest.toLowerCase().trim();
  const hasTravelDay = days >= 2 && startLoc && startLoc !== destLoc && !destLoc.includes(startLoc) && !startLoc.includes(destLoc);

  // Calculate realistic travel info for inter-city journey
  const realDist = hasTravelDay ? getCityDistance(trip.startLocation, dest) : null;
  const travelInfo = (hasTravelDay && realDist) ? getTravelInfo(trip.startLocation, dest, realDist) : null;
  const travelDays = (hasTravelDay && travelInfo && (travelInfo.hours >= 12 || travelInfo.overnight)) ? 2 : (hasTravelDay ? 1 : 0);
  const sightseeingDays = Math.max(1, days - travelDays);

  // Distribute spots across sightseeing days
  const spotsPerDay = Math.ceil(spots.length / sightseeingDays);
  const dayGroups = [];
  for (let i = 0; i < spots.length; i += spotsPerDay) {
    dayGroups.push(spots.slice(i, i + spotsPerDay));
  }

  // Calculate total distance
  let totalDistance = 0;
  spots.forEach((s, i) => {
    if (i < spots.length - 1) totalDistance += estimateDistance(s.id, spots[i + 1].id);
  });

  // ── Summary card ──
  let html = `
    <div class="route-summary-card">
      <h3>🗺 Your Complete Route</h3>
      <div class="route-summary-stats">
        <div class="route-stat">Route
          <strong>${trip.startLocation || dest} → ${dest}${realDist ? ` (${realDist} km)` : ''}</strong>
        </div>
        <div class="route-stat">Total Spots
          <strong>${spots.length} spots · ${dayGroups.length} day${dayGroups.length > 1 ? 's' : ''} sightseeing</strong>
        </div>
        <div class="route-stat">Est. Distance
          <strong>~${Math.round(totalDistance)} km (within ${dest})</strong>
        </div>
        <div class="route-stat">Trip Duration
          <strong>${days} day${days > 1 ? 's' : ''}${travelDays > 0 ? ` (${travelDays} travel)` : ''}</strong>
        </div>
      </div>
    </div>`;

  // ── Travel day(s) ──
  if (hasTravelDay) {
    const day1Date = new Date(start.getTime());
    const ti = travelInfo || { mode: '🚆 Train/Bus', hours: null, overnight: false, note: 'Check transport options' };
    const travelMapsLink = `https://www.google.com/maps/dir/${encodeURIComponent(trip.startLocation)}/${encodeURIComponent(dest)}`;

    let arrivalNote, arrivalTime, nextDayArrival = false;
    const depTimeMins = ti.overnight || (realDist && realDist > 1000) ? 1080 : 480; // 6 PM if overnight, else 8 AM

    if (ti.hours === null) {
      arrivalNote = 'Evening / depends on transport';
      arrivalTime = 'Evening';
    } else if (ti.overnight || (realDist && realDist > 1000)) {
      nextDayArrival = true;
      arrivalNote = `~${Math.round(ti.trainHours || ti.hours)}h overnight journey`;
      arrivalTime = '8:00 AM (Next Day)';
    } else {
      const arrMins = depTimeMins + ti.hours * 60;
      arrivalTime = fmtTime(arrMins);
      arrivalNote = `~${ti.hours}h journey`;
    }
    const distLabel = realDist ? `${realDist} km` : 'distance unknown';

    html += `
      <div class="route-day">
        <div class="route-day-header">
          <span class="day-badge">1</span>
          🚗 Day 1 — ${fmt(day1Date)} · Travel Day
          ${nextDayArrival ? '<span style="background:#fee2e2;color:#dc2626;font-size:11px;padding:2px 8px;border-radius:12px;margin-left:8px">🌙 Overnight</span>' : ''}
        </div>
        <div class="route-timeline">
          <div class="route-stop">
            <div class="route-dot route-dot--start"></div>
            <div class="route-stop-name">
              <span class="route-stop-time">${fmtTime(depTimeMins)}</span>
              🔵 Depart from ${trip.startLocation}
            </div>
            <div class="route-stop-meta">Head to ${dest} · ${distLabel}</div>
            <div class="route-transport-chip">
              ${ti.mode} · ${arrivalNote}
              <a href="${travelMapsLink}" target="_blank" class="route-maps-link">Open in Maps ↗</a>
            </div>
            ${realDist && realDist > 1000 ? `
            <div class="route-transport-chip" style="background:#fef3c7;color:#92400e">
              ⚠️ Long journey (${distLabel}) — book tickets in advance! ${ti.note}
            </div>` : ''}
          </div>
          <div class="route-stop">
            <div class="route-dot route-dot--end"></div>
            <div class="route-stop-name">
              <span class="route-stop-time">${arrivalTime}</span>
              🏨 ${nextDayArrival ? 'Arrive at 8:00 AM & check-in by evening' : 'Arrive & check in'}: ${hotel}
            </div>
            <div class="route-stop-meta">${nextDayArrival ? 'Rest after long journey. Sightseeing begins Day ' + (travelDays + 1) + '.' : 'Settle in and rest for sightseeing tomorrow.'}</div>
          </div>
        </div>
        <div class="route-day-end">${nextDayArrival ? 'Note: Overnight travel — arrive Day 2 morning' : 'Day ends — rest at hotel'}</div>
      </div>`;
    html += `<a href="${travelMapsLink}" target="_blank" class="route-nav-btn">🧭 Start Navigation for Day 1</a>`;
  }

  // ── Sightseeing days ──
  dayGroups.forEach((daySpots, dayIdx) => {
    const dayNum = travelDays + dayIdx + 1;
    const dayDate = new Date(start.getTime() + (dayNum - 1) * 86400000);
    let currentTime = 480; // 8:00 AM in minutes

    html += `
      <div class="route-day">
        <div class="route-day-header">
          <span class="day-badge">${dayNum}</span>
          🗺 Day ${dayNum} — ${fmt(dayDate)}
        </div>
        <div class="route-timeline">`;

    // START marker
    html += `
          <div class="route-stop">
            <div class="route-dot route-dot--start"></div>
            <div class="route-stop-name">
              <span class="route-stop-time">${fmtTime(currentTime)}</span>
              🔵 START — ${dest}
            </div>
            <div class="route-stop-meta">Depart for Day ${dayNum} sightseeing</div>
          </div>`;

    // Each spot
    daySpots.forEach((spot, spotIdx) => {
      // Travel time from previous stop
      const prevId = spotIdx === 0 ? 0 : daySpots[spotIdx - 1].id;
      const dist = estimateDistance(prevId, spot.id);
      const travelMins = (dist / 30) * 60;
      const tip = transportTip(dist);

      currentTime += travelMins;

      // Spots pair for Google Maps link
      const fromName = spotIdx === 0 ? dest : daySpots[spotIdx - 1].name;
      const toName = spot.name;
      const mapsLink = `https://www.google.com/maps/dir/${encodeURIComponent(fromName + ', ' + dest)}/${encodeURIComponent(toName + ', ' + dest)}`;

      html += `
          <div class="route-stop">
            <div class="route-dot"></div>
            <div class="route-stop-name">
              <span class="route-stop-time">${fmtTime(currentTime)}</span>
              📍 ${spot.name}
            </div>
            <div class="route-stop-meta">
              <span>${spot.location || dest}</span>
              <span>⏱ Spend ~90 min here</span>
            </div>
            <div class="route-transport-chip">
              ${tip.icon} ~${fmtDuration(travelMins)} · ${dist} km
              <a href="${mapsLink}" target="_blank" class="route-maps-link">Open in Maps ↗</a>
            </div>
            <div class="route-transport-chip" style="background:#f5f5f5;color:#555">
              💡 ${tip.text}
            </div>
          </div>`;

      currentTime += 90; // 90 min sightseeing
    });

    // END — hotel check-in
    html += `
          <div class="route-stop">
            <div class="route-dot route-dot--end"></div>
            <div class="route-stop-name">
              <span class="route-stop-time">${fmtTime(currentTime)}</span>
              🏨 Check in: ${hotel}
            </div>
          </div>`;

    html += `</div>`; // close .route-timeline
    html += `<div class="route-day-end">Day ends ~${fmtTime(currentTime)}</div>`;
    html += `</div>`; // close .route-day

    // Navigation button
    const allDayNames = [dest, ...daySpots.map(s => s.name + ', ' + dest), hotel + ', ' + dest];
    const navUrl = gmapsDirectionUrl(allDayNames);
    html += `<a href="${navUrl}" target="_blank" class="route-nav-btn">🧭 Start Navigation for Day ${dayNum}</a>`;
  });

  // ── Action buttons ──
  html += `
    <div class="route-actions">
      <button class="route-action-btn" id="copy-route-btn">📋 Copy Route</button>
      <button class="route-action-btn" id="share-route-btn">📤 Share</button>
      <button class="route-action-btn" id="print-route-btn">🖨 Print</button>
    </div>`;

  container.innerHTML = html;

  // ── Action button handlers ──
  document.getElementById('copy-route-btn')?.addEventListener('click', () => {
    const text = buildRouteText(trip, dayGroups, start, dest, hotel);
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById('copy-route-btn');
      btn.textContent = '✔ Copied!';
      setTimeout(() => btn.textContent = '📋 Copy Route', 2000);
    });
  });

  document.getElementById('share-route-btn')?.addEventListener('click', () => {
    const text = buildRouteText(trip, dayGroups, start, dest, hotel);
    if (navigator.share) {
      navigator.share({ title: `Trip Route: ${dest}`, text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('share-route-btn');
        btn.textContent = '✔ Link Copied!';
        setTimeout(() => btn.textContent = '📤 Share', 2000);
      });
    }
  });

  document.getElementById('print-route-btn')?.addEventListener('click', () => {
    // Switch to route tab before printing
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(p => p.style.display = 'none');
    const routeTab = document.querySelector('[data-tab="route"]');
    if (routeTab) routeTab.classList.add('active');
    const tabRoute = document.getElementById('tab-route');
    if (tabRoute) { tabRoute.style.display = 'flex'; tabRoute.style.flexDirection = 'column'; }
    setTimeout(() => window.print(), 100);
  });
}

// Build plain-text route summary for copy/share
function buildRouteText(trip, dayGroups, start, dest, hotel) {
  const fmt = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const startLoc = (trip.startLocation || '').toLowerCase().trim();
  const destLoc = dest.toLowerCase().trim();
  const days = Math.max(1, Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / 86400000));
  const hasTravelDay = days >= 2 && startLoc && startLoc !== destLoc && !destLoc.includes(startLoc) && !startLoc.includes(destLoc);
  const realDist = hasTravelDay ? getCityDistance(trip.startLocation, dest) : null;
  const travelInfo = (hasTravelDay && realDist) ? getTravelInfo(trip.startLocation, dest, realDist) : null;
  const numTravelDays = (hasTravelDay && travelInfo && (travelInfo.hours >= 12 || travelInfo.overnight)) ? 2 : (hasTravelDay ? 1 : 0);

  let text = `🗺 Trip Route: ${dest}\n`;
  text += `From: ${trip.startLocation || dest}${realDist ? ` (~${realDist} km)` : ''}\n`;
  text += `Date: ${fmt(trip.startDate)} – ${fmt(trip.endDate)}\n`;
  if (travelInfo) text += `Travel: ${travelInfo.mode} · ${travelInfo.note}\n`;
  text += `\n`;

  if (hasTravelDay) {
    const arrivalText = (travelInfo && (travelInfo.hours >= 12 || travelInfo.overnight))
      ? 'Next morning' : 'Evening';
    text += `━━ Day 1 (${fmt(start)}) — Travel Day ━━\n`;
    text += `8:00 AM — Depart from ${trip.startLocation}\n`;
    if (realDist) text += `  ${travelInfo?.mode || '🚆'} · ~${realDist} km · ${travelInfo?.note || ''}\n`;
    text += `${arrivalText} — 🏨 Arrive at ${hotel}\n\n`;
  }

  dayGroups.forEach((daySpots, dayIdx) => {
    const dayNum = numTravelDays + dayIdx + 1;
    const dayDate = new Date(start.getTime() + (dayNum - 1) * 86400000);
    text += `━━ Day ${dayNum} (${fmt(dayDate)}) ━━\n`;
    let currentTime = 480;
    daySpots.forEach((spot, i) => {
      const prevId = i === 0 ? 0 : daySpots[i - 1].id;
      const dist = estimateDistance(prevId, spot.id);
      currentTime += (dist / 30) * 60;
      text += `${fmtTime(currentTime)} — ${spot.name}\n`;
      text += `  📍 ${spot.location || dest} · ⏱ ~90 min · ${dist} km\n`;
      currentTime += 90;
    });
    text += `${fmtTime(currentTime)} — 🏨 ${hotel}\n\n`;
  });
  return text;
}

// ── Travel mode switching ─────────────────────────────────────────────────────
let currentTravelMode = 'driving';
document.querySelectorAll('.travel-mode-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.travel-mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentTravelMode = btn.dataset.mode;
    if (currentMapTrip) updateMapForRoute(currentMapTrip, currentTravelMode);
  });
});

// Update map when switching to route tab
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.dataset.tab === 'route' && currentMapTrip) {
      updateMapForRoute(currentMapTrip, currentTravelMode);
    }
  });
});

loadTrip();
