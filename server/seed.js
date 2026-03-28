// ─────────────────────────────────────────────────────────────────────────────
//  seed.js — Run once to populate spots into MongoDB
//  Usage: cd server && node seed.js
// ─────────────────────────────────────────────────────────────────────────────

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Spot = require('./models/Spot');
const Hotel = require('./models/Hotel');

const spots = [
  // ── Amravati ────────────────────────────────────────────────────────────────
  {
    id: 1,
    name: 'Chikhaldara Hill Station',
    location: 'Amravati, Maharashtra',
    fee: '50',
    timing: '9:00 AM to 6:00 PM',
    closed: 'Open all days',
    rating: '⭐⭐⭐⭐☆',
    img: 'pictures/location/chilkharldara.png',
    city: 'amravati',
  },
  {
    id: 2,
    name: 'Gavilgad Fort',
    location: 'Satpura Range, Amravati',
    fee: 'Free',
    timing: '8:00 AM - 5:30 PM',
    closed: 'Monday',
    rating: '⭐⭐⭐⭐☆',
    img: 'pictures/location/govilghadport.png',
    city: 'amravati',
  },
  {
    id: 3,
    name: 'Ambadevi Temple',
    location: 'Amravati City',
    fee: 'Free',
    timing: '6:00 AM - 9:00 PM',
    closed: 'Open all days',
    rating: '⭐⭐⭐⭐⭐',
    img: 'pictures/location/amravati.png',
    city: 'amravati',
  },
  {
    id: 4,
    name: 'Wan Wildlife Sanctuary',
    location: 'Amravati District',
    fee: '100',
    timing: '7:00 AM - 5:00 PM',
    closed: 'Tuesday',
    rating: '⭐⭐⭐⭐☆',
    img: 'pictures/location/chilkharldara.png',
    city: 'amravati',
  },

  // ── Pune ────────────────────────────────────────────────────────────────────
  {
    id: 5,
    name: 'Shaniwar Wada',
    location: 'Pune City',
    fee: '25',
    timing: '8:00 AM - 6:30 PM',
    closed: 'Open all days',
    rating: '⭐⭐⭐⭐☆',
    img: 'pictures/location/tour spots/tour spots/maharashtra/pune/shaniwarwada.jpg',
    city: 'pune',
  },
  {
    id: 6,
    name: 'Sinhagad Fort',
    location: '25km from Pune',
    fee: '50',
    timing: 'Open all day',
    closed: 'Open all days',
    rating: '⭐⭐⭐⭐⭐',
    img: 'pictures/location/tour spots/tour spots/maharashtra/pune/sinhagad fort.jpg',
    city: 'pune',
  },

  // ── Mumbai ──────────────────────────────────────────────────────────────────
  {
    id: 7,
    name: 'Gateway of India',
    location: 'Apollo Bunder, Mumbai',
    fee: 'Free',
    timing: 'Open 24 hrs',
    closed: 'Open all days',
    rating: '⭐⭐⭐⭐⭐',
    img: 'pictures/location/tour spots/tour spots/maharashtra/mumbai/gateway of india.jpg',
    city: 'mumbai',
  },
  {
    id: 8,
    name: 'Elephanta Caves',
    location: 'Elephanta Island, Mumbai',
    fee: '40',
    timing: '9:00 AM - 5:30 PM',
    closed: 'Monday',
    rating: '⭐⭐⭐⭐☆',
    img: 'pictures/location/tour spots/tour spots/maharashtra/mumbai/elephant caves.jpg',
    city: 'mumbai',
  },

  // ── Chennai ─────────────────────────────────────────────────────────────────
  {
    id: 9,
    name: 'Kapaleeshwarar Temple',
    location: 'Mylapore, Chennai',
    fee: 'Free',
    timing: '5:00 AM - 12:00 PM, 4:00 PM - 9:00 PM',
    closed: 'Open all days',
    rating: '⭐⭐⭐⭐⭐',
    img: 'pictures/location/tour spots/tour spots/channai/kapaleeshwar-temple.jpg',
    city: 'chennai',
  },
  {
    id: 10,
    name: 'Marina Beach',
    location: 'Chennai Coast',
    fee: 'Free',
    timing: 'Open 24 hrs',
    closed: 'Open all days',
    rating: '⭐⭐⭐⭐☆',
    img: 'pictures/location/tour spots/tour spots/channai/marina beach.jpg',
    city: 'chennai',
  },
  {
    id: 11,
    name: 'Chennai Rail Museum',
    location: 'ICF, Chennai',
    fee: '50',
    timing: '10:00 AM - 6:00 PM',
    closed: 'Monday',
    rating: '⭐⭐⭐⭐☆',
    img: 'pictures/location/tour spots/tour spots/channai/chennai rail museum.jpg',
    city: 'chennai',
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Seed Spots
    await Spot.deleteMany({});
    console.log('🗑  Cleared existing spots');

    await Spot.insertMany(spots);
    console.log(`🌱 Seeded ${spots.length} spots successfully`);

    // Seed Hotels
    const hotels = [
      // Amravati hotels
      { name: 'Grand Samrat Hotel Amravati', city: 'amravati', address: 'City Center, Amravati', rating: '⭐ 4.3', pricePerNight: 3500, stars: 4, img: 'pictures/hotels/grandplace.png', description: 'Comfortable 4-star hotel with AC rooms' },
      { name: 'Hotel Shree', city: 'amravati', address: 'Railway Station Road', rating: '⭐ 4.0', pricePerNight: 2200, stars: 3, img: 'pictures/hotels/comfortR.png', description: 'Budget-friendly option near station' },
      { name: 'Amar Resort', city: 'amravati', address: 'Chikhaldara Road', rating: '⭐ 4.5', pricePerNight: 5000, stars: 5, img: 'pictures/hotels/royalStay.png', description: 'Luxury resort with hill views' },
      { name: 'Hotel Anurag', city: 'amravati', address: 'Khamla Road', rating: '⭐ 3.8', pricePerNight: 1800, stars: 2, img: 'pictures/hotels/grandplace.png', description: 'Good value hotel' },
      { name: 'Midtown Hotel', city: 'amravati', address: 'Main Bazaar', rating: '⭐ 4.1', pricePerNight: 2800, stars: 3, img: 'pictures/hotels/royalStay.png', description: '3-star hotel in city center' },

      // Pune hotels
      { name: 'Taj Blue Diamond', city: 'pune', address: 'Koregaon Park', rating: '⭐ 4.6', pricePerNight: 8000, stars: 5, img: 'pictures/hotels/royalStay.png', description: 'Premium 5-star luxury hotel' },
      { name: 'Hotel Sinha', city: 'pune', address: 'Camp, Pune', rating: '⭐ 4.2', pricePerNight: 3500, stars: 4, img: 'pictures/hotels/grandplace.png', description: '4-star comfort hotel' },
      { name: 'Stay Inn Pune', city: 'pune', address: 'FC Road', rating: '⭐ 3.9', pricePerNight: 2000, stars: 3, img: 'pictures/hotels/comfortR.png', description: 'Budget hotel near Osho Ashram' },
      { name: 'Lotus Hotel', city: 'pune', address: 'Shivaji Nagar', rating: '⭐ 4.0', pricePerNight: 2500, stars: 3, img: 'pictures/hotels/royalStay.png', description: '3-star with good amenities' },
      { name: 'Pune Residency', city: 'pune', address: 'Viman Nagar', rating: '⭐ 4.3', pricePerNight: 4200, stars: 4, img: 'pictures/hotels/grandplace.png', description: 'Business hotel with conference facilities' },

      // Mumbai hotels
      { name: 'Taj Mahal Palace', city: 'mumbai', address: 'Colaba', rating: '⭐ 4.9', pricePerNight: 15000, stars: 5, img: 'pictures/hotels/royalStay.png', description: 'Iconic 5-star luxury hotel' },
      { name: 'The Oberoi Mumbai', city: 'mumbai', address: 'Nariman Point', rating: '⭐ 4.7', pricePerNight: 12000, stars: 5, img: 'pictures/hotels/grandplace.png', description: 'Premium beachfront property' },
      { name: 'Hotel Sahara Star', city: 'mumbai', address: 'Vile Parle', rating: '⭐ 4.4', pricePerNight: 5500, stars: 4, img: 'pictures/hotels/comfortR.png', description: 'Modern 4-star near airport' },
      { name: 'Residency Hotel', city: 'mumbai', address: 'Fort, Mumbai', rating: '⭐ 4.1', pricePerNight: 3200, stars: 3, img: 'pictures/hotels/royalStay.png', description: 'Good budget option in Fort' },
      { name: 'Hotel Pearl', city: 'mumbai', address: 'Bandra', rating: '⭐ 4.2', pricePerNight: 4000, stars: 4, img: 'pictures/hotels/grandplace.png', description: '4-star in trendy Bandra' },

      // Nagpur hotels
      { name: 'Orange City Hotel', city: 'nagpur', address: 'South Ambazari Road', rating: '⭐ 4.3', pricePerNight: 3800, stars: 4, img: 'pictures/hotels/royalStay.png', description: '4-star hotel in Nagpur' },
      { name: 'The Retreat', city: 'nagpur', address: 'Ramdaspeth', rating: '⭐ 4.0', pricePerNight: 2300, stars: 3, img: 'pictures/hotels/comfortR.png', description: 'Good value 3-star hotel' },
      { name: 'Sapna Hotel', city: 'nagpur', address: 'Itwari', rating: '⭐ 4.1', pricePerNight: 2600, stars: 3, img: 'pictures/hotels/grandplace.png', description: 'Central location 3-star' },
      { name: 'Nagpur Grand', city: 'nagpur', address: 'Civil Lines', rating: '⭐ 4.4', pricePerNight: 4500, stars: 4, img: 'pictures/hotels/royalStay.png', description: 'Premium 4-star property' },
      { name: 'Budget Inn Nagpur', city: 'nagpur', address: 'Sitabuldi', rating: '⭐ 3.7', pricePerNight: 1500, stars: 2, img: 'pictures/hotels/comfortR.png', description: 'Economy option near station' },

      // Nashik hotels
      { name: 'Sula Vineyards', city: 'nashik', address: 'Nashik Wine Country', rating: '⭐ 4.6', pricePerNight: 7000, stars: 5, img: 'pictures/hotels/royalStay.png', description: 'Luxury resort in wine region' },
      { name: 'Sterling Hotel', city: 'nashik', address: 'Nashik Road', rating: '⭐ 4.2', pricePerNight: 3000, stars: 4, img: 'pictures/hotels/grandplace.png', description: '4-star hotel with vineyard views' },
      { name: 'Hotel Tara', city: 'nashik', address: 'Grand Road', rating: '⭐ 3.9', pricePerNight: 1900, stars: 3, img: 'pictures/hotels/comfortR.png', description: 'Budget hotel in city center' },
      { name: 'Nashik Pride', city: 'nashik', address: 'Nashik City', rating: '⭐ 4.0', pricePerNight: 2400, stars: 3, img: 'pictures/hotels/royalStay.png', description: '3-star with good facilities' },
      { name: 'Valley View Resort', city: 'nashik', address: 'Godavari Valley', rating: '⭐ 4.3', pricePerNight: 4500, stars: 4, img: 'pictures/hotels/grandplace.png', description: '4-star with valley views' },
    ];

    await Hotel.deleteMany({});
    console.log('🗑  Cleared existing hotels');

    await Hotel.insertMany(hotels);
    console.log(`🌱 Seeded ${hotels.length} hotels successfully`);

    await mongoose.disconnect();
    console.log('✅ Done — you can now start the server');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
