const axios = require('axios');
const Spot = require('../models/Spot');
const DestinationImage = require('../models/DestinationImage');
const Hotel = require('../models/Hotel');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ─── GET /api/plan/weather?city=Amravati ─────────────────────────────────────
// Used in plan.html and when building a trip
// Free: OpenWeatherMap (1000 calls/day)
exports.getWeather = async (req, res) => {
  const { city } = req.query;
  if (!city) return res.status(400).json({ message: 'City is required' });

  try {
    const { data } = await axios.get(
      'https://api.openweathermap.org/data/2.5/weather',
      {
        params: {
          q: city,
          appid: process.env.OPENWEATHER_API_KEY,
          units: 'metric',
        },
      }
    );

    res.json({
      city: data.name,
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      description: data.weather[0].description,
      icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
      wind: data.wind.speed,
    });
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ message: `City "${city}" not found` });
    }
    res.status(500).json({ message: 'Weather fetch failed' });
  }
};

// ─── GET /api/plan/image?query=Amravati ──────────────────────────────────────
exports.getDestinationImage = async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ message: 'Query is required' });

  const city = query.toLowerCase().trim();

  // Source 0: Curated map — guaranteed accurate landmark images, zero API calls
  const W = 'https://upload.wikimedia.org/wikipedia/commons/thumb';
  const curatedImages = {
    mumbai:    `${W}/3/3a/Gateway_of_India_2009.jpg/800px-Gateway_of_India_2009.jpg`,
    delhi:     `${W}/b/bc/India_Gate_in_New_Delhi_03-2016.jpg/800px-India_Gate_in_New_Delhi_03-2016.jpg`,
    'new delhi':`${W}/b/bc/India_Gate_in_New_Delhi_03-2016.jpg/800px-India_Gate_in_New_Delhi_03-2016.jpg`,
    jaipur:    `${W}/5/5e/Hawa_Mahal%2C_Jaipur%2C_Rajasthan%2C_India.jpg/800px-Hawa_Mahal%2C_Jaipur%2C_Rajasthan%2C_India.jpg`,
    agra:      `${W}/b/bd/Taj_Mahal%2C_Agra%2C_India_edit3.jpg/800px-Taj_Mahal%2C_Agra%2C_India_edit3.jpg`,
    varanasi:  `${W}/3/3d/Dashashwamedh_Ghat_During_Ganga_Aarti.jpg/800px-Dashashwamedh_Ghat_During_Ganga_Aarti.jpg`,
    udaipur:   `${W}/4/4b/City_Palace_of_Udaipur.jpg/800px-City_Palace_of_Udaipur.jpg`,
    jodhpur:   `${W}/0/08/Mehrangarh_Fort%2C_Jodhpur.jpg/800px-Mehrangarh_Fort%2C_Jodhpur.jpg`,
    jaisalmer: `${W}/8/89/Sonar_Quila_Jaisalmer_Fort.jpg/800px-Sonar_Quila_Jaisalmer_Fort.jpg`,
    pune:      `${W}/a/a7/Shaniwarwada_Gate.jpg/800px-Shaniwarwada_Gate.jpg`,
    nashik:    `${W}/e/ec/Kalaram_Temple%2C_Nashik.jpg/800px-Kalaram_Temple%2C_Nashik.jpg`,
    lucknow:   `${W}/c/c9/Rumi_Darwaza_Lucknow.jpg/800px-Rumi_Darwaza_Lucknow.jpg`,
    lonavala:  `${W}/9/97/Lions_point_lonavala.jpg/800px-Lions_point_lonavala.jpg`,
    chennai:   `${W}/2/2e/Kapaleeshwarar_Temple%2C_Mylapore.jpg/800px-Kapaleeshwarar_Temple%2C_Mylapore.jpg`,
    channai:   `${W}/2/2e/Kapaleeshwarar_Temple%2C_Mylapore.jpg/800px-Kapaleeshwarar_Temple%2C_Mylapore.jpg`,
    chainnai:  `${W}/2/2e/Kapaleeshwarar_Temple%2C_Mylapore.jpg/800px-Kapaleeshwarar_Temple%2C_Mylapore.jpg`,
    amravati:  'pictures/location/amravati.png',
  };

  // Check exact match and partial match
  let curatedUrl = curatedImages[city];
  if (!curatedUrl) {
    for (const [key, url] of Object.entries(curatedImages)) {
      if (city.includes(key) || key.includes(city)) { curatedUrl = url; break; }
    }
  }
  if (curatedUrl) {
    return res.json({ image: curatedUrl, source: 'Curated' });
  }

  // Source 1: Wikipedia page summary — no key, works for any place
  try {
    const { data } = await axios.get(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`,
      { timeout: 5000 }
    );
    const img = data.originalimage?.source || data.thumbnail?.source;
    if (img) return res.json({ image: img, source: 'Wikipedia' });
  } catch {}

  // Source 2: Wikimedia search (finds images even without a direct page)
  try {
    const { data } = await axios.get('https://commons.wikimedia.org/w/api.php', {
      params: {
        action: 'query',
        generator: 'search',
        gsrsearch: `${query} landmark`,
        gsrnamespace: 6,
        prop: 'imageinfo',
        iiprop: 'url',
        iiurlwidth: 800,
        gsrlimit: 5,
        format: 'json',
        origin: '*',
      },
      timeout: 5000,
    });
    const pages = Object.values(data?.query?.pages || {});
    // Filter out maps, icons, flags — we want actual photos
    const photo = pages.find(p => {
      const url = p.imageinfo?.[0]?.thumburl || '';
      return url && !url.match(/flag|map|logo|icon|coat|seal/i);
    });
    if (photo) return res.json({ image: photo.imageinfo[0].thumburl, source: 'Wikimedia' });
  } catch {}

  // Source 3: Pixabay (PIXABAY_API_KEY in .env — 20,000 calls/month free)
  if (process.env.PIXABAY_API_KEY) {
    try {
      const { data } = await axios.get('https://pixabay.com/api/', {
        params: {
          key: process.env.PIXABAY_API_KEY,
          q: `${query} travel india`,
          image_type: 'photo',
          orientation: 'horizontal',
          category: 'travel',
          min_width: 640,
          safesearch: true,
          per_page: 5,
        },
        timeout: 5000,
      });
      const hit = data.hits?.[0];
      if (hit) return res.json({ image: hit.webformatURL, source: 'Pixabay' });
    } catch {}
  }

  // Source 4: Pexels (PEXELS_API_KEY in .env — 200 calls/hour free)
  if (process.env.PEXELS_API_KEY) {
    try {
      const { data } = await axios.get('https://api.pexels.com/v1/search', {
        params: { query: `${query} travel`, per_page: 3, orientation: 'landscape' },
        headers: { Authorization: process.env.PEXELS_API_KEY },
        timeout: 5000,
      });
      const photo = data.photos?.[0];
      if (photo) return res.json({ image: photo.src.large, source: 'Pexels' });
    } catch {}
  }

  // Source 5: Unsplash (UNSPLASH_ACCESS_KEY in .env — 50 calls/hour free)
  if (process.env.UNSPLASH_ACCESS_KEY) {
    try {
      const { data } = await axios.get('https://api.unsplash.com/search/photos', {
        params: { query: `${query} travel`, per_page: 3, orientation: 'landscape' },
        headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` },
        timeout: 5000,
      });
      const photo = data.results?.[0];
      if (photo) return res.json({ image: photo.urls.regular, source: 'Unsplash' });
    } catch {}
  }

  // Source 6: SVG generated on server — ALWAYS works, zero dependencies
  const svg = `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400"><rect width="800" height="400" fill="#e2e8f0"/><text x="400" y="200" font-family="sans-serif" font-size="32" font-weight="bold" fill="#475569" text-anchor="middle" dominant-baseline="middle">${query}</text></svg>`).toString('base64')}`;
  return res.json({ image: svg, source: 'SVG fallback' });
};

// ─── POST /api/plan/budget ────────────────────────────────────────────────────
// Splits the user's budget into categories
// Called from form.js after all steps complete, result stored in trip
// No external API needed - pure logic
exports.generateBudgetPlan = (req, res) => {
  const { budget, days, people, hotelCost } = req.body;

  if (!budget || !days || !people) {
    return res.status(400).json({ message: 'budget, days, people are required' });
  }

  const total = Number(budget);
  const numDays = Number(days);
  const numPeople = Number(people);
  const actualHotelCost = hotelCost ? Number(hotelCost) : null;

  if (total <= 0 || numDays <= 0 || numPeople <= 0) {
    return res.status(400).json({ message: 'Values must be greater than 0' });
  }

  let accommodation, remaining;

  if (actualHotelCost !== null) {
    // Hotel was selected — use real cost
    accommodation = Math.min(actualHotelCost * numDays, total);
    remaining = Math.max(0, total - accommodation);
  } else {
    // No hotel selected — estimate 35%
    accommodation = Math.round(total * 0.35);
    remaining = total - accommodation;
  }

  const breakdown = {
    accommodation,
    food: Math.round(remaining * 0.40),
    transport: Math.round(remaining * 0.25),
    activities: Math.round(remaining * 0.25),
    emergency: Math.round(remaining * 0.10),
    perPersonPerDay: Math.round(total / numPeople / numDays),
    perPerson: Math.round(total / numPeople),
    totalBudget: total,
  };

  let budgetLabel = 'Budget';
  if (total <= 4000) budgetLabel = 'Low Budget (₹0–₹4,000)';
  else if (total <= 10000) budgetLabel = 'Medium Budget (₹4,000–₹10,000)';
  else if (total <= 30000) budgetLabel = 'Comfortable (₹10,000–₹30,000)';
  else budgetLabel = 'Luxury (₹30,000+)';

  res.json({ ...breakdown, budgetLabel });
};

// ─── GET /api/plan/spots?city=amravati ───────────────────────────────────────
// Returns spots for the "Customise Route" step (form.js renderSpot)
// This replaces the hardcoded array in data/backend.js
exports.getSpots = async (req, res) => {
  const { city } = req.query;
  try {
    const query = city ? { city: city.toLowerCase() } : {};
    const spots = await Spot.find(query);
    res.json(spots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── POST /api/plan/spots ─────────────────────────────────────────────────────
// Admin: seed spots into DB (run once, or via a setup script)
exports.addSpot = async (req, res) => {
  try {
    const spot = await Spot.create(req.body);
    res.status(201).json(spot);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── POST /api/plan/itinerary ────────────────────────────────────────────────
exports.generateItinerary = async (req, res) => {
  const { destination, days, budget, people, selectedSpots, travelStyle } = req.body;

  if (!destination || !days) {
    return res.status(400).json({ message: 'destination and days are required' });
  }

  // Client-side fallback — works even if Gemini key is missing
  function buildFallbackItinerary() {
    const spots = (selectedSpots || []).map(s => s.name);
    const pool  = [
      ...spots,
      `Morning walk in ${destination}`,
      `Visit local market of ${destination}`,
      `Explore city center of ${destination}`,
      `Try famous local food of ${destination}`,
      `Evening at main ghat or park`,
      `Shopping for local souvenirs`,
      `Visit famous temple or heritage site`,
    ];
    let idx = 0;
    return Array.from({ length: Number(days) }, (_, i) => ({
      day: i + 1,
      theme: `Day ${i + 1} in ${destination}`,
      morning:   pool[idx++ % pool.length],
      afternoon: pool[idx++ % pool.length],
      evening:   pool[idx++ % pool.length],
      tip:       `Best time to visit most spots is early morning before crowds.`,
    }));
  }

  // Try Gemini AI first
  if (!process.env.GEMINI_API_KEY) {
    return res.json({ itinerary: buildFallbackItinerary(), source: 'fallback' });
  }

  try {
    const genAI  = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model  = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const spotsList = (selectedSpots || []).map(s => s.name).join(', ') || 'popular local attractions';
    const style     = travelStyle || 'balanced mix of sightseeing and relaxation';

    const prompt = `
You are a professional Indian travel planner. Create a detailed ${days}-day itinerary for:
- Destination: ${destination}
- Travellers: ${people || 1} person(s)
- Total Budget: ₹${budget || 'moderate'}
- Selected spots to visit: ${spotsList}
- Travel style: ${style}

Return ONLY a valid JSON array, no markdown, no extra text, exactly this structure:
[
  {
    "day": 1,
    "theme": "One line catchy theme for the day",
    "morning": "Specific activity with time e.g. 6AM - Sunrise boat ride on Ganges",
    "afternoon": "Specific activity with time e.g. 12PM - Visit Kashi Vishwanath Temple, have lunch at nearby dhaba",
    "evening": "Specific activity with time e.g. 6PM - Watch Ganga Aarti at Dashashwamedh Ghat",
    "tip": "One practical local tip for this day"
  }
]

Rules:
- Be specific to ${destination} — use real place names, real timings
- Include food recommendations specific to ${destination}
- Budget-appropriate suggestions for ₹${budget || 'moderate'} total
- Day 1 should include check-in/arrival logistics
- Last day should include check-out and departure
- Keep each field under 100 characters
- Return ONLY the JSON array, nothing else
`;

    const result   = await model.generateContent(prompt);
    const text     = result.response.text().trim();

    // Clean the response — Gemini sometimes wraps in markdown code blocks
    const cleaned  = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    const itinerary = JSON.parse(cleaned);

    // Validate structure
    if (!Array.isArray(itinerary) || !itinerary[0]?.day) {
      throw new Error('Invalid itinerary structure from Gemini');
    }

    return res.json({ itinerary, source: 'gemini' });

  } catch (err) {
    console.warn('Gemini failed, using fallback:', err.message);
    return res.json({ itinerary: buildFallbackItinerary(), source: 'fallback' });
  }
};

// ─── GET /api/plan/checklist?destination=&weather=&days= ─────────────────────
// Return a packing checklist based on destination and weather
exports.getCheckList = async (req, res) => {
  const { destination = '', weather = '', days = 3 } = req.query;

  const destinationType = destination.toLowerCase();
  const weatherType = weather.toLowerCase();
  const numDays = Number(days) || 3;

  let checklist = [];

  // Base essentials
  const essentials = [
    'Passport/ID',
    'Travel documents',
    'Travel insurance',
    'Credit/Debit cards',
    'Phone charger',
    'Medications',
    'Toothbrush & toothpaste',
    'Toiletries',
    'Underwear & socks',
    'Comfortable walking shoes',
  ];

  checklist.push(...essentials);

  // Destination-specific
  if (destinationType.includes('mountain') || destinationType.includes('hill')) {
    checklist.push('Warm jacket', 'Thermal wear', 'Hiking boots', 'Rain jacket', 'Sunscreen');
  } else if (destinationType.includes('beach') || destinationType.includes('coast')) {
    checklist.push('Swimsuit', 'Flip flops', 'Sunscreen (SPF 50+)', 'Beach bag', 'Hat/cap');
  } else if (destinationType.includes('city') || destinationType.includes('urban')) {
    checklist.push('Casual clothes', 'Smart casual outfit', 'Comfortable shoes');
  } else if (destinationType.includes('desert')) {
    checklist.push('Light clothes', 'Sunscreen', 'Hat', 'Sunglasses', 'Water bottle');
  }

  // Weather-specific
  if (weatherType.includes('rain') || weatherType.includes('monsoon')) {
    checklist.push('Umbrella', 'Raincoat', 'Rain shoes', 'Waterproof bag');
  } else if (weatherType.includes('cold') || weatherType.includes('snow')) {
    checklist.push('Winter coat', 'Gloves', 'Scarf', 'Wool socks');
  } else if (weatherType.includes('hot') || weatherType.includes('sunny')) {
    checklist.push('Light clothes', 'Sunglasses', 'Hat', 'Water bottle');
  }

  // Multi-day trip items
  if (numDays > 3) {
    checklist.push('Extra clothes', 'Extra socks', 'Laundry bag');
  }

  // Remove duplicates
  checklist = [...new Set(checklist)];

  res.json({ checklist, count: checklist.length });
};

// ─── GET /api/plan/hotels?city= ──────────────────────────────────────────────
// Get real hotels from DB for a specific city
exports.getHotels = async (req, res) => {
  const { city } = req.query;

  if (!city) {
    return res.status(400).json({ message: 'City is required' });
  }

  try {
    const hotels = await Hotel.find({ city: city.toLowerCase() }).limit(10);

    if (!hotels.length) {
      // If no hotels in DB, fall back to hardcoded (for demo)
      return res.json([
        {
          _id: '1',
          name: 'Grand Palace Hotel',
          city: city,
          address: `${city} City Center`,
          rating: '⭐ 4.3',
          pricePerNight: 4500,
          stars: 4,
          img: 'pictures/hotels/grandplace.png',
        },
        {
          _id: '2',
          name: 'Royal Stay Inn',
          city: city,
          address: 'Near Railway Station',
          rating: '⭐ 4.6',
          pricePerNight: 6000,
          stars: 5,
          img: 'pictures/hotels/royalStay.png',
        },
        {
          _id: '3',
          name: 'Comfort Residency',
          city: city,
          address: 'Main Market Road',
          rating: '⭐ 4.1',
          pricePerNight: 3800,
          stars: 3,
          img: 'pictures/hotels/comfortR.png',
        },
      ]);
    }

    res.json(hotels);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── POST /api/plan/hotels (Admin) ────────────────────────────────────────────
// Add a hotel to the DB
exports.addHotel = async (req, res) => {
  try {
    const hotel = await Hotel.create(req.body);
    res.status(201).json(hotel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
