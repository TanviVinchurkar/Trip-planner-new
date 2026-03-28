import { fetchSpots, getBudgetBreakdown, fetchWeather, fetchDestinationImage, fetchItinerary, saveTrip, isLoggedIn } from './api.js';
import { trip, addToTrip, removeFromTrip, clearTrip } from '../data/addSpot.js';

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

function setStep(n) {
  const bar = document.querySelector('.progress-bar');
  const labels = document.querySelectorAll('.progress-status div');
  if (bar) bar.style.width = (n * 25) + '%';
  if (bar) bar.style.background = 'rgb(0,0,66)';
  labels?.forEach((l, i) => {
    l.style.fontWeight = i < n ? 'bold' : 'normal';
    l.style.color = i < n ? 'rgb(0,0,66)' : 'rgb(139,133,133)';
  });
}

// ── State: collect all form inputs across steps ───────────────────────────────
const formState = {
  startLocation: '',
  destination: '',
  startDate: '',
  endDate: '',
  budget: 0,
  people: 1,
};

const continueBtn = document.querySelector('.continue-btn-form');
const formContent = document.querySelector('.form-content');
const progressBar = document.querySelector('.progress-bar');
const closeBtn = document.querySelector('.close-form-btn');

// ── Helper: Update progress bar ───────────────────────────────────────────────
function updateProgressBar(step) {
  const width = step * 25;
  progressBar.style.width = width + '%';
}

// ── Close button handler ──────────────────────────────────────────────────────
if (closeBtn) {
  closeBtn.addEventListener('click', () => {
    document.querySelector('.form-bar').style.display = 'none';
  });
}

// ── Step 1: Grab inputs when "Continue" is clicked ───────────────────────────
continueBtn.addEventListener('click', () => {
  const startLocation = document.getElementById('start-location').value.trim();
  const destination = document.getElementById('destination').value.trim();
  const sd = document.getElementById('start-date').value;
  const ed = document.getElementById('end-date').value;
  const budget = document.getElementById('budget').value;
  const people = Number(document.getElementById('people')?.value) || 1;

  if (!startLocation || !destination || !sd || !ed || !budget) {
    alert('Please fill in all fields before continuing.');
    return;
  }

  // BUG 3: Date validation
  const today2 = new Date().toISOString().split('T')[0];
  if (sd < today2) {
    alert('Start date cannot be in the past.');
    return;
  }
  if (ed <= sd) {
    alert('End date must be after start date.');
    return;
  }

  formState.startLocation = startLocation;
  formState.destination = destination;
  formState.startDate = sd;
  formState.endDate = ed;
  formState.budget = Number(budget);
  formState.people = people;

  updateProgressBar(2); // Step 2
  renderSpot();
});

// ── Dynamic spot generator — Wikipedia Commons images ──────────────────────────
function generateSpotsForDestination(destination) {
  const P_WIKI = 'https://upload.wikimedia.org/wikipedia/commons/thumb';

  const citySpots = {
    mumbai: [
      { id:201, name:'Gateway of India', location:'Apollo Bunder, Mumbai', fee:'Free',
        timing:'Open 24 hrs', closed:'Open all days', rating:'⭐⭐⭐⭐⭐',
        img:'pictures/location/tour spots/tour spots/maharashtra/mumbai/gateway of india.jpg' },
      { id:202, name:'Marine Drive', location:'Mumbai', fee:'Free',
        timing:'Open 24 hrs', closed:'Open all days', rating:'⭐⭐⭐⭐⭐',
        img:'pictures/location/tour spots/tour spots/maharashtra/mumbai/marine drive.jpg' },
      { id:203, name:'Elephanta Caves', location:'Elephanta Island, Mumbai', fee:'₹40',
        timing:'9:00AM - 5:30PM', closed:'Monday', rating:'⭐⭐⭐⭐☆',
        img:'pictures/location/tour spots/tour spots/maharashtra/mumbai/elephant caves.jpg' },
      { id:204, name:'Chowpatty Beach', location:'Mumbai', fee:'Free',
        timing:'Open 24 hrs', closed:'Open all days', rating:'⭐⭐⭐⭐☆',
        img:'pictures/location/tour spots/tour spots/maharashtra/mumbai/chowpatty beach.jpg' },
      { id:205, name:'Siddhivinayak Temple', location:'Prabhadevi, Mumbai', fee:'Free',
        timing:'5:30AM - 10:00PM', closed:'Open all days', rating:'⭐⭐⭐⭐⭐',
        img:'pictures/location/tour spots/tour spots/maharashtra/mumbai/shree-siddhivinayak.jpg' },
    ],
    delhi: [
      { id:401, name:'India Gate', location:'New Delhi', fee:'Free',
        timing:'Open 24 hrs', closed:'Open all days', rating:'⭐⭐⭐⭐⭐',
        img:'pictures/location/tour spots/tour spots/new delhi/india-gate.jpg' },
      { id:402, name:'Qutub Minar', location:'Mehrauli, Delhi', fee:'₹30',
        timing:'7:00AM - 5:00PM', closed:'Open all days', rating:'⭐⭐⭐⭐⭐',
        img:'pictures/location/tour spots/tour spots/new delhi/qutab-minar.jpg' },
      { id:403, name:'Lotus Temple', location:'Bahapur, Delhi', fee:'Free',
        timing:'9:00AM - 5:30PM', closed:'Monday', rating:'⭐⭐⭐⭐⭐',
        img:'pictures/location/tour spots/tour spots/new delhi/lotus temple.jpg' },
      { id:404, name:"Humayun's Tomb", location:'Nizamuddin, Delhi', fee:'₹35',
        timing:'6:00AM - 6:00PM', closed:'Open all days', rating:'⭐⭐⭐⭐⭐',
        img:'pictures/location/tour spots/tour spots/new delhi/humayun-s-tomb.jpg' },
      { id:405, name:'Akshardham Temple', location:'Pandav Nagar, Delhi', fee:'Free',
        timing:'9:30AM - 6:30PM', closed:'Monday', rating:'⭐⭐⭐⭐⭐',
        img:'pictures/location/tour spots/tour spots/new delhi/swaminarayan akshardham.jpg' },
      { id:406, name:'Red Fort', location:'Old Delhi', fee:'₹35',
        timing:'9:30AM - 4:30PM', closed:'Monday', rating:'⭐⭐⭐⭐⭐',
        img:`${P_WIKI}/2/2b/Red_Fort_-_Lal_Qila_-_Delhi_-_India_-_01.jpg/800px-Red_Fort_-_Lal_Qila_-_Delhi_-_India_-_01.jpg` },
    ],
    'new delhi': null,
    jaipur: [
      { id:501, name:'Amber Palace', location:'Amer, Jaipur', fee:'₹100',
        timing:'8:00AM - 5:30PM', closed:'Open all days', rating:'⭐⭐⭐⭐⭐',
        img:'pictures/location/tour spots/tour spots/rajasthan/jaypur/amber-palace.jpg' },
      { id:502, name:'Hawa Mahal', location:'Jaipur', fee:'₹50',
        timing:'9:00AM - 5:00PM', closed:'Open all days', rating:'⭐⭐⭐⭐⭐',
        img:'pictures/location/tour spots/tour spots/rajasthan/jaypur/hawa mahal.jpg' },
      { id:503, name:'City Palace', location:'Jaipur', fee:'₹130',
        timing:'9:30AM - 5:00PM', closed:'Open all days', rating:'⭐⭐⭐⭐☆',
        img:'pictures/location/tour spots/tour spots/rajasthan/jaypur/the city palace.jpg' },
      { id:504, name:'Jantar Mantar', location:'Jaipur', fee:'₹50',
        timing:'9:00AM - 5:00PM', closed:'Open all days', rating:'⭐⭐⭐⭐☆',
        img:'pictures/location/tour spots/tour spots/rajasthan/jaypur/jantar-mantar.jpg' },
      { id:505, name:'Nahargarh Fort', location:'Jaipur', fee:'₹50',
        timing:'10:00AM - 5:30PM', closed:'Open all days', rating:'⭐⭐⭐⭐☆',
        img:'pictures/location/tour spots/tour spots/rajasthan/jaypur/nahargarh fort.jpg' },
    ],
    agra: [
      { id:601, name:'Taj Mahal', location:'Agra, UP', fee:'₹50 (Indian)',
        timing:'Sunrise to Sunset', closed:'Friday', rating:'⭐⭐⭐⭐⭐',
        img:'pictures/location/tour spots/tour spots/uttar pradesh/Agra/tajMahal.jpg' },
      { id:602, name:'Agra Fort', location:'Agra, UP', fee:'₹40',
        timing:'6:00AM - 6:00PM', closed:'Open all days', rating:'⭐⭐⭐⭐⭐',
        img:'pictures/location/tour spots/tour spots/uttar pradesh/Agra/agra-fort.jpg' },
      { id:603, name:'Mehtab Bagh', location:'Agra, UP', fee:'₹30',
        timing:'6:00AM - 6:00PM', closed:'Open all days', rating:'⭐⭐⭐⭐☆',
        img:'pictures/location/tour spots/tour spots/uttar pradesh/Agra/mehtab-bagh.jpg' },
    ],
    varanasi: [
      { id:701, name:'Dashashwamedh Ghat', location:'Varanasi, UP', fee:'Free',
        timing:'Open 24 hrs', closed:'Open all days', rating:'⭐⭐⭐⭐⭐',
        img:'pictures/location/tour spots/tour spots/uttar pradesh/varanasi/dasaswamedh ghat.jpg' },
      { id:702, name:'Assi Ghat', location:'Varanasi, UP', fee:'Free',
        timing:'Open 24 hrs', closed:'Open all days', rating:'⭐⭐⭐⭐⭐',
        img:'pictures/location/tour spots/tour spots/uttar pradesh/varanasi/assi ghat.jpg' },
      { id:703, name:'Sarnath', location:'Near Varanasi, UP', fee:'₹20',
        timing:'9:00AM - 5:00PM', closed:'Open all days', rating:'⭐⭐⭐⭐⭐',
        img:'pictures/location/tour spots/tour spots/uttar pradesh/varanasi/sarnath.jpg' },
      { id:704, name:'Manikarnika Ghat', location:'Varanasi, UP', fee:'Free',
        timing:'Open 24 hrs', closed:'Open all days', rating:'⭐⭐⭐⭐☆',
        img:'pictures/location/tour spots/tour spots/uttar pradesh/varanasi/manikarnika-ghat.jpg' },
      { id:705, name:'Kashi Vishwanath Temple', location:'Varanasi, UP', fee:'Free',
        timing:'3:00AM - 11:00PM', closed:'Open all days', rating:'⭐⭐⭐⭐⭐',
        img:`${P_WIKI}/1/1e/Kashi_Vishwanath_Temple.jpg/800px-Kashi_Vishwanath_Temple.jpg` },
    ],
    udaipur: [
      { id:801, name:'City Palace', location:'Udaipur, Rajasthan', fee:'₹300',
        timing:'9:30AM - 5:30PM', closed:'Open all days', rating:'⭐⭐⭐⭐⭐',
        img:'pictures/location/tour spots/tour spots/rajasthan/Udaipur/city palace.jpg' },
      { id:802, name:'Lake Pichola', location:'Udaipur, Rajasthan', fee:'₹400 (boat ride)',
        timing:'10:00AM - 6:00PM', closed:'Open all days', rating:'⭐⭐⭐⭐⭐',
        img:'pictures/location/tour spots/tour spots/rajasthan/Udaipur/lake pichola.jpg' },
      { id:803, name:'Jagdish Temple', location:'Udaipur, Rajasthan', fee:'Free',
        timing:'5:00AM - 10:00PM', closed:'Open all days', rating:'⭐⭐⭐⭐⭐',
        img:'pictures/location/tour spots/tour spots/rajasthan/Udaipur/jagdish temple.jpg' },
      { id:804, name:'Saheliyon Ki Bari', location:'Udaipur, Rajasthan', fee:'₹10',
        timing:'9:00AM - 7:00PM', closed:'Open all days', rating:'⭐⭐⭐⭐☆',
        img:'pictures/location/tour spots/tour spots/rajasthan/Udaipur/sahelion-ki-bari.jpg' },
    ],
    jodhpur: [
      { id:901, name:'Mehrangarh Fort', location:'Jodhpur, Rajasthan', fee:'₹100',
        timing:'9:00AM - 5:00PM', closed:'Open all days', rating:'⭐⭐⭐⭐⭐',
        img:'pictures/location/tour spots/tour spots/rajasthan/jodhpur/mehrangarh fort.jpg' },
      { id:902, name:'Jaswant Thada', location:'Jodhpur, Rajasthan', fee:'₹30',
        timing:'9:00AM - 5:00PM', closed:'Open all days', rating:'⭐⭐⭐⭐⭐',
        img:'pictures/location/tour spots/tour spots/rajasthan/jodhpur/jaswant-thada.jpg' },
      { id:903, name:'Umaid Bhawan Palace', location:'Jodhpur, Rajasthan', fee:'₹30',
        timing:'9:00AM - 5:00PM', closed:'Open all days', rating:'⭐⭐⭐⭐⭐',
        img:'pictures/location/tour spots/tour spots/rajasthan/jodhpur/umaid-bhawan museum.jpg' },
    ],
    jaisalmer: [
      { id:1301, name:'Jaisalmer Fort', location:'Jaisalmer, Rajasthan', fee:'₹100',
        timing:'9:00AM - 6:00PM', closed:'Open all days', rating:'⭐⭐⭐⭐⭐',
        img:'pictures/location/tour spots/tour spots/rajasthan/jaisalmer/jaisalmer-fortress.jpg' },
      { id:1302, name:'Patwon Ki Haveli', location:'Jaisalmer, Rajasthan', fee:'₹100',
        timing:'9:00AM - 6:00PM', closed:'Open all days', rating:'⭐⭐⭐⭐⭐',
        img:'pictures/location/tour spots/tour spots/rajasthan/jaisalmer/patwaon-ki-haveli.jpg' },
      { id:1303, name:'Sam Sand Dunes', location:'Near Jaisalmer', fee:'Free',
        timing:'Open all day', closed:'Open all days', rating:'⭐⭐⭐⭐⭐',
        img:`${P_WIKI}/6/67/Sam_sand_dunes.jpg/800px-Sam_sand_dunes.jpg` },
    ],
    pune: [
      { id:1001, name:'Shaniwarwada', location:'Pune, Maharashtra', fee:'₹25',
        timing:'8:00AM - 6:30PM', closed:'Open all days', rating:'⭐⭐⭐⭐⭐',
        img:'pictures/location/tour spots/tour spots/maharashtra/pune/shaniwarwada.jpg' },
      { id:1002, name:'Aga Khan Palace', location:'Nagar Road, Pune', fee:'₹10',
        timing:'9:00AM - 5:30PM', closed:'Open all days', rating:'⭐⭐⭐⭐⭐',
        img:'pictures/location/tour spots/tour spots/maharashtra/pune/aga khan palace.jpg' },
      { id:1003, name:'Sinhagad Fort', location:'Sinhagad, Pune', fee:'₹20',
        timing:'6:00AM - 6:00PM', closed:'Open all days', rating:'⭐⭐⭐⭐⭐',
        img:'pictures/location/tour spots/tour spots/maharashtra/pune/sinhagad fort.jpg' },
    ],
    lucknow: [
      { id:1101, name:'Bara Imambara', location:'Lucknow, UP', fee:'₹25',
        timing:'6:00AM - 5:00PM', closed:'Open all days', rating:'⭐⭐⭐⭐⭐',
        img:'pictures/location/tour spots/tour spots/uttar pradesh/lucknow/bara imambara.jpg' },
      { id:1102, name:'Rumi Darwaza', location:'Lucknow, UP', fee:'Free',
        timing:'Open 24 hrs', closed:'Open all days', rating:'⭐⭐⭐⭐⭐',
        img:'pictures/location/tour spots/tour spots/uttar pradesh/lucknow/rumi-darwaza.jpg' },
      { id:1103, name:'Hazratganj', location:'Lucknow, UP', fee:'Free',
        timing:'Open all day', closed:'Open all days', rating:'⭐⭐⭐⭐☆',
        img:'pictures/location/tour spots/tour spots/uttar pradesh/lucknow/hazratganj.jpg' },
    ],
    nashik: [
      { id:1201, name:'Kalaram Temple', location:'Nashik, Maharashtra', fee:'Free',
        timing:'5:30AM - 9:30PM', closed:'Open all days', rating:'⭐⭐⭐⭐⭐',
        img:'pictures/location/tour spots/tour spots/maharashtra/nashik/kalaram temple.jpg' },
      { id:1202, name:'Pandavleni Caves', location:'Nashik, Maharashtra', fee:'₹15',
        timing:'9:00AM - 5:00PM', closed:'Open all days', rating:'⭐⭐⭐⭐☆',
        img:'pictures/location/tour spots/tour spots/maharashtra/nashik/pandavleni-caves.jpg' },
    ],
    lonavala: [
      { id:1401, name:"Lion's Point", location:'Lonavala, Maharashtra', fee:'Free',
        timing:'Open all day', closed:'Open all days', rating:'⭐⭐⭐⭐⭐',
        img:'pictures/location/tour spots/tour spots/maharashtra/lonavala/lion\'s point.jpg' },
      { id:1402, name:'Bhaja Caves', location:'Near Lonavala', fee:'₹15',
        timing:'9:00AM - 5:00PM', closed:'Open all days', rating:'⭐⭐⭐⭐☆',
        img:'pictures/location/tour spots/tour spots/maharashtra/lonavala/bhaja caves.jpg' },
      { id:1403, name:'Pawana Lake', location:'Near Lonavala', fee:'Free',
        timing:'Open all day', closed:'Open all days', rating:'⭐⭐⭐⭐⭐',
        img:'pictures/location/tour spots/tour spots/maharashtra/lonavala/pawana-lake.jpg' },
    ],
    amravati: [
      { id:1, name:'Chikhaldara Hill Station', location:'Amravati, Maharashtra', fee:'₹50',
        timing:'9:00AM - 6:00PM', closed:'Open all days', rating:'⭐⭐⭐⭐☆',
        img:'pictures/location/chilkharldara.png' },
      { id:2, name:'Gavilgad Fort', location:'Satpura Range', fee:'Free',
        timing:'8:00AM - 5:30PM', closed:'Monday', rating:'⭐⭐⭐⭐☆',
        img:'pictures/location/govilghadport.png' },
      { id:3, name:'Ambadevi Temple', location:'Amravati City', fee:'Free',
        timing:'6:00AM - 9:00PM', closed:'Open all days', rating:'⭐⭐⭐⭐⭐',
        img:'pictures/location/amravati.png' },
    ],
    chennai: [
      { id:1501, name:'Kapaleeshwarar Temple', location:'Mylapore, Chennai', fee:'Free',
        timing:'5:30AM - 12:00PM, 4:00PM - 9:00PM', closed:'Open all days', rating:'⭐⭐⭐⭐⭐',
        img:`pictures/location/tour spots/tour spots/channai/kapaleeshwar-temple.jpg` },
      { id:1502, name:'Marina Beach', location:'Marina, Chennai', fee:'Free',
        timing:'Open 24 hrs', closed:'Open all days', rating:'⭐⭐⭐⭐⭐',
        img:`pictures/location/tour spots/tour spots/channai/marina beach.jpg` },
      { id:1503, name:'Government Museum', location:'Egmore, Chennai', fee:'₹50',
        timing:'9:30AM - 5:00PM', closed:'Friday', rating:'⭐⭐⭐⭐☆',
        img:`${P_WIKI}/d/d7/Government_Museum_Chennai.jpg/800px-  .jpg` },
      { id:1504, name:'Fort St. George', location:'Rajaji Salai, Chennai', fee:'₹25',
        timing:'9:00AM - 5:00PM', closed:'Friday', rating:'⭐⭐⭐⭐☆',
        img:`${P_WIKI}/b/b5/Fort_St_George_Chennai.jpg/800px-Fort_St_George_Chennai.jpg` },
      { id:1505, name:'Santhome Cathedral Basilica', location:'Mylapore, Chennai', fee:'Free',
        timing:'6:00AM - 9:00PM', closed:'Open all days', rating:'⭐⭐⭐⭐⭐',
        img:`${P_WIKI}/b/bb/Santhome_Basilica_Chennai.jpg/800px-Santhome_Basilica_Chennai.jpg` },
    ],
  };

  citySpots['new delhi'] = citySpots['delhi'];
  citySpots['channai'] = citySpots['chennai'];
  citySpots['chainnai'] = citySpots['chennai'];

  const key = destination.toLowerCase().trim();
  if (citySpots[key]) return citySpots[key];
  for (const [city, spots] of Object.entries(citySpots)) {
    if (spots && (key.includes(city) || city.includes(key))) return spots;
  }

  return [
    { id:9901, name:`${destination} City Tour`, location:destination, fee:'Varies',
      timing:'9:00AM - 6:00PM', closed:'Open all days', rating:'⭐⭐⭐⭐☆',
      img:'pictures/nature.jpeg' },
    { id:9902, name:`Local Markets of ${destination}`, location:destination, fee:'Free',
      timing:'10:00AM - 8:00PM', closed:'Open all days', rating:'⭐⭐⭐⭐☆',
      img:'pictures/nature2.jpeg' },
    { id:9903, name:`Heritage Walk in ${destination}`, location:destination, fee:'Free',
      timing:'Morning hours', closed:'Open all days', rating:'⭐⭐⭐⭐☆',
      img:'pictures/ref.jpg' },
  ];
}

// ── BUG 6: Dynamic hotels based on destination ────────────────────────────────
function getHotelsForDestination(destination) {
  const hotelDB = {
    mumbai: [
      { id:1, name:'Taj Mahal Palace', address:'Apollo Bunder, Colaba, Mumbai',
        rating:'⭐⭐⭐⭐⭐ 4.9', price:25000, img:'pictures/hotels/grandplace.png', stars:5 },
      { id:2, name:'The Oberoi Mumbai', address:'Nariman Point, Mumbai',
        rating:'⭐⭐⭐⭐⭐ 4.7', price:18000, img:'pictures/hotels/royalStay.png', stars:5 },
      { id:3, name:'Hotel Residency Fort', address:'Fort, Mumbai',
        rating:'⭐⭐⭐⭐☆ 4.2', price:4500, img:'pictures/hotels/comfortR.png', stars:4 },
    ],
    delhi: [
      { id:1, name:'The Imperial New Delhi', address:'Janpath, New Delhi',
        rating:'⭐⭐⭐⭐⭐ 4.8', price:20000, img:'pictures/hotels/grandplace.png', stars:5 },
      { id:2, name:'Radisson Blu Dwarka', address:'Dwarka, New Delhi',
        rating:'⭐⭐⭐⭐⭐ 4.5', price:7000, img:'pictures/hotels/royalStay.png', stars:5 },
      { id:3, name:'Hotel City Star', address:'Paharganj, New Delhi',
        rating:'⭐⭐⭐☆☆ 3.5', price:1800, img:'pictures/hotels/comfortR.png', stars:3 },
    ],
    jaipur: [
      { id:1, name:'Rambagh Palace', address:'Bhawani Singh Rd, Jaipur',
        rating:'⭐⭐⭐⭐⭐ 4.9', price:30000, img:'pictures/hotels/grandplace.png', stars:5 },
      { id:2, name:'Hilton Jaipur', address:'Near Malviya Nagar, Jaipur',
        rating:'⭐⭐⭐⭐⭐ 4.6', price:9000, img:'pictures/hotels/royalStay.png', stars:5 },
      { id:3, name:'Hotel Pearl Palace', address:'Hathroi Fort, Jaipur',
        rating:'⭐⭐⭐⭐☆ 4.3', price:2200, img:'pictures/hotels/comfortR.png', stars:3 },
    ],
    agra: [
      { id:1, name:'ITC Mughal', address:'Fatehabad Rd, Agra',
        rating:'⭐⭐⭐⭐⭐ 4.7', price:15000, img:'pictures/hotels/grandplace.png', stars:5 },
      { id:2, name:'Radisson Blu Agra', address:'Fatehabad Rd, Agra',
        rating:'⭐⭐⭐⭐⭐ 4.4', price:6500, img:'pictures/hotels/royalStay.png', stars:5 },
      { id:3, name:'Hotel Amar Vilas', address:'Near Taj Mahal, Agra',
        rating:'⭐⭐⭐⭐☆ 4.0', price:3000, img:'pictures/hotels/comfortR.png', stars:3 },
    ],
    varanasi: [
      { id:1, name:'Taj Nadesar Palace', address:'Raja Bazaar Rd, Varanasi',
        rating:'⭐⭐⭐⭐⭐ 4.8', price:22000, img:'pictures/hotels/grandplace.png', stars:5 },
      { id:2, name:'Radisson Hotel Varanasi', address:'The Mall, Varanasi',
        rating:'⭐⭐⭐⭐⭐ 4.5', price:6000, img:'pictures/hotels/royalStay.png', stars:5 },
      { id:3, name:'Hotel Surya', address:'Cantonment, Varanasi',
        rating:'⭐⭐⭐⭐☆ 4.0', price:2500, img:'pictures/hotels/comfortR.png', stars:3 },
    ],
    udaipur: [
      { id:1, name:'Taj Lake Palace', address:'Lake Pichola, Udaipur',
        rating:'⭐⭐⭐⭐⭐ 4.9', price:35000, img:'pictures/hotels/grandplace.png', stars:5 },
      { id:2, name:'Trident Udaipur', address:'Haridasji Ki Magri, Udaipur',
        rating:'⭐⭐⭐⭐⭐ 4.6', price:10000, img:'pictures/hotels/royalStay.png', stars:5 },
      { id:3, name:'Hotel Lakend', address:'Fateh Sagar, Udaipur',
        rating:'⭐⭐⭐⭐☆ 4.2', price:3500, img:'pictures/hotels/comfortR.png', stars:4 },
    ],
    jodhpur: [
      { id:1, name:'Umaid Bhawan Palace', address:'Circuit House Rd, Jodhpur',
        rating:'⭐⭐⭐⭐⭐ 4.9', price:40000, img:'pictures/hotels/grandplace.png', stars:5 },
      { id:2, name:'Vivanta Jodhpur', address:'Residency Rd, Jodhpur',
        rating:'⭐⭐⭐⭐⭐ 4.5', price:8000, img:'pictures/hotels/royalStay.png', stars:5 },
      { id:3, name:'Hotel Haveli', address:'Gulab Sagar, Jodhpur',
        rating:'⭐⭐⭐⭐☆ 4.1', price:2000, img:'pictures/hotels/comfortR.png', stars:3 },
    ],
    pune: [
      { id:1, name:'JW Marriott Pune', address:'SB Road, Pune',
        rating:'⭐⭐⭐⭐⭐ 4.7', price:12000, img:'pictures/hotels/grandplace.png', stars:5 },
      { id:2, name:'The Westin Pune', address:'Koregaon Park, Pune',
        rating:'⭐⭐⭐⭐⭐ 4.5', price:8000, img:'pictures/hotels/royalStay.png', stars:5 },
      { id:3, name:'Hotel Shree Panchratna', address:'FC Road, Pune',
        rating:'⭐⭐⭐⭐☆ 4.0', price:2500, img:'pictures/hotels/comfortR.png', stars:3 },
    ],
    chennai: [
      { id:1, name:'The Leela Palace Chennai', address:'Adyar Seaface, Chennai',
        rating:'⭐⭐⭐⭐⭐ 4.8', price:12000, img:'pictures/hotels/grandplace.png', stars:5 },
      { id:2, name:'Hyatt Regency Chennai', address:'365 Anna Salai, Chennai',
        rating:'⭐⭐⭐⭐⭐ 4.6', price:8500, img:'pictures/hotels/royalStay.png', stars:5 },
      { id:3, name:'Hotel Palmgrove', address:'Nungambakkam, Chennai',
        rating:'⭐⭐⭐⭐☆ 4.1', price:3200, img:'pictures/hotels/comfortR.png', stars:4 },
    ],
  };

  const key = destination.toLowerCase().trim();
  for (const [city, hotels] of Object.entries(hotelDB)) {
    if (key.includes(city) || city.includes(key)) return hotels;
  }

  // Generic fallback for any city
  return [
    { id:1, name:`Grand ${destination} Hotel`, address:`${destination} City Center`,
      rating:'⭐⭐⭐⭐☆ 4.3', price:4500, img:'pictures/hotels/grandplace.png', stars:4 },
    { id:2, name:`Royal Stay ${destination}`, address:`Near Railway Station, ${destination}`,
      rating:'⭐⭐⭐⭐⭐ 4.6', price:6000, img:'pictures/hotels/royalStay.png', stars:5 },
    { id:3, name:`Comfort Inn ${destination}`, address:`Main Market, ${destination}`,
      rating:'⭐⭐⭐⭐☆ 4.1', price:3800, img:'pictures/hotels/comfortR.png', stars:3 },
  ];
}

// ── Step 2: Spots (loads from backend, falls back to destination-aware data) ───
export async function renderSpot() {
  setStep(2);
  formContent.innerHTML = `<div style="text-align:center;padding:2rem">Loading spots...</div>`;

  let spots = [];

  // Try backend first
  try {
    spots = await fetchSpots(formState.destination);
  } catch { /* ignore */ }

  // If backend has nothing for this city, generate from destination name
  if (!spots || spots.length === 0) {
    spots = generateSpotsForDestination(formState.destination);
  }

  function spotsList() {
    return spots.map(spot => `
      <div class="spot-card">
        <div class="info">
          <h2>${spot.name}</h2>
          <p><strong>Location:</strong> ${spot.location}</p>
          <p><strong>Entry Fees:</strong> ₹${spot.fee}</p>
          <p><strong>Timing:</strong> ${spot.timing}</p>
          <p><strong>Closed:</strong> ${spot.closed}</p>
          <p><strong>Rating:</strong> ${spot.rating}</p>
        </div>
        <div class="image-box">
          <img src="${encodeURI(spot.img || '')}" alt="${spot.name}" onerror="this.src='pictures/nature.jpeg'">
          <button class="add-btn js-add-btn" data-id="${spot.id}">+ Add</button>
        </div>
      </div>
    `).join('');
  }

  function addedSpotsList() {
    return trip.map(spot => `
      <div class="added-card">
        <img src="${encodeURI(spot.img || '')}" alt="${spot.name}" onerror="this.src='pictures/nature.jpeg'">
        <div class="overlay">
          <h3>${spot.name}</h3>
          <button class="remove-btn" data-id="${spot.id}">✖</button>
        </div>
      </div>
    `).join('');
  }

  formContent.innerHTML = `
    <section class="header">
      <h1>Destination: ${formState.destination}</h1>
      <p class="subtitle">Discover beautiful places you shouldn't miss ✨</p>
    </section>
    <section class="spots-section">
      <div class="card-container js-card-container">${spotsList()}</div>
      <div class="dots"><span></span><span></span><span></span></div>
    </section>
    <section class="added-section">
      <h2>Added Spots</h2>
      <div class="added-container" id="added-container">${addedSpotsList()}</div>
      <div class="step-nav">
        <button class="back-btn js-back-step1">← Back</button>
        <button class="continue-btn js-continue-spots">Continue →</button>
      </div>
    </section>
  `;

  // Add spot
  formContent.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      const spot = spots.find(s => s.id === id);
      if (spot && !trip.find(s => s.id === id)) {
        addToTrip(spot);
        document.getElementById('added-container').innerHTML = addedSpotsList();
      }
    });
  });

  // Back to Step 1
  formContent.querySelector('.js-back-step1')?.addEventListener('click', () => {
    updateProgressBar(1);
    setStep(1);
    renderStep1();
  });

  // Remove spot / continue
  formContent.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-btn')) {
      removeFromTrip(Number(e.target.dataset.id));
      document.getElementById('added-container').innerHTML = addedSpotsList();
    }
    if (e.target.classList.contains('js-continue-spots')) {
      updateProgressBar(3);
      renderHotel();
    }
  });
}

// ── renderStep1: Re-render the original Step 1 form ──────────────────────────
function renderStep1() {
  formContent.innerHTML = `
    <h1>Plan your Travel ✈</h1>
    <div class="input-container">
      <div class="input-sub-container">
        <div><label for="start-location">From / Start</label>
          <input type="text" id="start-location" placeholder="Enter start location" value="${formState.startLocation}"></div>
        <div><label for="destination">To / Destination</label>
          <input type="text" id="destination" placeholder="Enter destination" value="${formState.destination}"></div>
      </div>
      <div class="input-2sub-container">
        <div><label for="start-date">Trip Start</label>
          <input type="date" id="start-date" value="${formState.startDate}"></div>
        <div><label for="end-date">Trip End</label>
          <input type="date" id="end-date" value="${formState.endDate}"></div>
        <div><label for="budget">Total budget ₹</label>
          <input type="number" id="budget" min="0" placeholder="e.g. 50000" value="${formState.budget||''}"></div>
        <div><label for="people">Travellers</label>
          <input type="number" id="people" min="1" max="20" value="${formState.people||1}"></div>
      </div>
    </div>
    <button class="continue-btn-form">Continue</button>
  `;
  // Re-attach the continue handler
  formContent.querySelector('.continue-btn-form').addEventListener('click', () => {
    const startLocation = document.getElementById('start-location').value.trim();
    const destination = document.getElementById('destination').value.trim();
    const sd = document.getElementById('start-date').value;
    const ed = document.getElementById('end-date').value;
    const budget = document.getElementById('budget').value;
    const people = Number(document.getElementById('people')?.value) || 1;
    if (!startLocation || !destination || !sd || !ed || !budget) {
      alert('Please fill in all fields before continuing.'); return;
    }
    const today2 = new Date().toISOString().split('T')[0];
    if (sd < today2) { alert('Start date cannot be in the past.'); return; }
    if (ed <= sd) { alert('End date must be after start date.'); return; }
    formState.startLocation = startLocation;
    formState.destination = destination;
    formState.startDate = sd;
    formState.endDate = ed;
    formState.budget = Number(budget);
    formState.people = people;
    updateProgressBar(2);
    renderSpot();
  });
}

// ── Step 3: Hotel selection ───────────────────────────────────────────────────
function renderHotel() {
  setStep(3);
  // BUG 6: Use dynamic hotels based on destination
  const hotels = getHotelsForDestination(formState.destination);

  formContent.innerHTML = `
    <section class="header">
      <h1>Stay Preference</h1>
      <p class="subtitle">Choose your perfect stay based on your comfort &amp; budget</p>
    </section>
    <section class="preferences">
      <div class="budget-box">
        <h3>Your Budget</h3>
        <p>₹${formState.budget.toLocaleString('en-IN')}</p>
      </div>
      <div class="star-selection">
        <h3>Select Hotel Type</h3>
        <div class="stars">
          <button data-stars="3">⭐ 3 Star</button>
          <button data-stars="4">⭐⭐ 4 Star</button>
          <button data-stars="5">⭐⭐⭐ 5 Star</button>
        </div>
      </div>
    </section>
    <section class="hotels">
      <h2>Recommended Hotels in ${formState.destination}</h2>
      <div class="hotel-container" id="hotel-container">
        ${hotels.map(h => `
          <div class="hotel-card">
            <img src="${h.img}" alt="${h.name}" onerror="this.src='pictures/hotels/grandplace.png'">
            <div class="hotel-info">
              <h3>${h.name}</h3>
              <p class="address">${h.address}</p>
              <p class="rating">${h.rating}</p>
              <p class="price">₹${h.price.toLocaleString('en-IN')} / night</p>
            </div>
            <button class="select-btn" data-hotel='${JSON.stringify(h)}'>Select</button>
          </div>
        `).join('')}
      </div>
      <p style="text-align:center;margin-top:16px;font-size:13px">
        <a href="https://www.google.com/maps/search/hotels+in+${encodeURIComponent(formState.destination)}"
           target="_blank" style="color:#2563eb">
          🗺 View more hotels on Google Maps →
        </a>
      </p>
      <div class="step-nav">
        <button class="back-btn js-back-spots">← Back</button>
        <button class="continue-btn bottom-btn" disabled id="hotel-continue">Select a hotel to continue →</button>
      </div>
    </section>
  `;

  let selectedHotel = null;

  // Star filter
  formContent.querySelectorAll('[data-stars]').forEach(btn => {
    btn.addEventListener('click', () => {
      const stars = Number(btn.dataset.stars);
      const filtered = stars ? hotels.filter(h => h.stars === stars) : hotels;
      document.getElementById('hotel-container').innerHTML = filtered.map(h => `
        <div class="hotel-card">
          <img src="${h.img}" alt="${h.name}" onerror="this.src='pictures/hotels/grandplace.png'">
          <div class="hotel-info">
            <h3>${h.name}</h3>
            <p class="address">${h.address}</p>
            <p class="rating">${h.rating}</p>
            <p class="price">₹${h.price.toLocaleString('en-IN')} / night</p>
          </div>
          <button class="select-btn" data-hotel='${JSON.stringify(h)}'>Select</button>
        </div>
      `).join('');
      attachSelectListeners();
    });
  });

  function attachSelectListeners() {
    const start = new Date(formState.startDate);
    const end   = new Date(formState.endDate);
    const tripDays = Math.max(1, Math.ceil((end - start) / 86400000));

    formContent.querySelectorAll('.select-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const hotel = JSON.parse(btn.dataset.hotel);
        const totalHotelCost = hotel.price * tripDays;

        // Budget validation
        if (totalHotelCost > formState.budget) {
          const ok = confirm(
            `⚠️ Budget Warning\n\n` +
            `This hotel costs ₹${hotel.price.toLocaleString('en-IN')}/night × ${tripDays} nights = ₹${totalHotelCost.toLocaleString('en-IN')} total.\n` +
            `Your total budget is ₹${formState.budget.toLocaleString('en-IN')}.\n\n` +
            `The hotel alone exceeds your budget by ₹${(totalHotelCost - formState.budget).toLocaleString('en-IN')}.\n` +
            `Continue anyway?`
          );
          if (!ok) return;
        }

        formContent.querySelectorAll('.select-btn').forEach(b => b.textContent = 'Select');
        btn.textContent = '✔ Selected';
        selectedHotel = hotel;
        document.getElementById('hotel-continue').disabled = false;
        document.getElementById('hotel-continue').textContent = 'Continue →';
      });
    });
  }
  attachSelectListeners();

  // Back to spots
  formContent.querySelector('.js-back-spots')?.addEventListener('click', () => {
    updateProgressBar(2);
    renderSpot();
  });

  document.getElementById('hotel-continue').addEventListener('click', () => {
    if (selectedHotel) {
      updateProgressBar(4);
      finishAndSave(selectedHotel);
    }
  });
}

// ── Step 4: Build full trip object, hit backend, redirect to plan.html ────────
async function finishAndSave(selectedHotel) {
  // Show full-screen loader immediately
  formContent.innerHTML = `
    <div style="text-align:center;padding:3rem 2rem">
      <div style="width:56px;height:56px;border:4px solid #e5e7eb;
                  border-top-color:#2563eb;border-radius:50%;
                  animation:spin 0.8s linear infinite;margin:0 auto 20px">
      </div>
      <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
      <h2 style="color:#1a1a2e;margin-bottom:8px">Building your trip...</h2>
      <p id="loading-status" style="color:#666;font-size:14px">
        Fetching weather for ${formState.destination}
      </p>
    </div>`;

  const setStatus = (msg) => {
    const el = document.getElementById('loading-status');
    if (el) el.textContent = msg;
  };

  const start = new Date(formState.startDate);
  const end   = new Date(formState.endDate);
  const days  = Math.max(1, Math.ceil((end - start) / 86400000));

  // Image
  setStatus(`Finding photos of ${formState.destination}...`);
  let destinationImage = '';
  try {
    const imgData = await fetchDestinationImage(formState.destination);
    destinationImage = imgData.image || '';
  } catch {}
  if (!destinationImage) destinationImage = getHeroImage(formState.destination);

  // Weather
  setStatus(`Checking weather in ${formState.destination}...`);
  let weather = null;
  try { weather = await fetchWeather(formState.destination); } catch {}

  // Budget — always calculated client-side using actual hotel cost
  setStatus('Calculating your budget breakdown...');
  const t = formState.budget;
  const hotelTotalCost = selectedHotel.price * days;
  const accommodation = Math.min(hotelTotalCost, t);
  const actualRemaining = Math.max(0, t - accommodation);
  const budgetBreakdown = {
    accommodation,
    food: Math.round(actualRemaining * 0.40),
    transport: Math.round(actualRemaining * 0.25),
    activities: Math.round(actualRemaining * 0.25),
    emergency: Math.round(actualRemaining * 0.10),
    perPersonPerDay: Math.round(t / (formState.people || 1) / days),
    perPerson: Math.round(t / (formState.people || 1)),
    totalBudget: t,
    hotelPricePerNight: selectedHotel.price,
    hotelNights: days,
    budgetLabel: t <= 4000 ? 'Low Budget (₹0–₹4K)'
      : t <= 10000 ? 'Medium Budget (₹4K–₹10K)'
      : t <= 30000 ? 'Comfortable (₹10K–₹30K)'
      : 'Luxury (₹30K+)',
  };

  // Gemini itinerary
  setStatus(`✨ Gemini AI is creating your ${days}-day itinerary...`);
  let aiItinerary = [];
  try {
    const result = await fetchItinerary({
      destination: formState.destination,
      days, budget: formState.budget,
      people: formState.people,
      selectedSpots: trip,
    });
    aiItinerary = result.itinerary || [];
    if (result.source === 'gemini') {
      setStatus('✅ Gemini itinerary ready! Saving your trip...');
    } else {
      setStatus('Saving your trip...');
    }
  } catch {
    setStatus('Saving your trip...');
  }

  const tripData = {
    ...formState, selectedSpots: trip, selectedHotel,
    budgetBreakdown, weather, destinationImage,
    itinerary: aiItinerary,
  };

  localStorage.setItem('guestTrip', JSON.stringify(tripData));
  localStorage.removeItem('currentTripId');

  if (isLoggedIn()) {
    try {
      const saved = await saveTrip(tripData);
      localStorage.setItem('currentTripId', saved.trip._id);
    } catch (err) {
      console.warn('Backend save failed — using localStorage:', err.message);
    }
  }

  clearTrip();
  window.location.href = 'plan.html';
}
