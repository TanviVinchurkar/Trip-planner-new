const router = require('express').Router();
const protect = require('../middleware/authMiddleware');
const {
  getWeather,
  getDestinationImage,
  generateBudgetPlan,
  getSpots,
  addSpot,
  generateItinerary,
  getCheckList,
  getHotels,
  addHotel,
} = require('../controllers/planController');

// Public routes (no login needed)
router.get('/weather', getWeather);              // GET /api/plan/weather?city=Amravati
router.get('/image', getDestinationImage);       // GET /api/plan/image?query=Amravati
router.post('/budget', generateBudgetPlan);      // POST /api/plan/budget
router.get('/spots', getSpots);                  // GET /api/plan/spots?city=amravati
router.post('/itinerary', generateItinerary);    // POST /api/plan/itinerary (AI generator)
router.get('/checklist', getCheckList);          // GET /api/plan/checklist?destination=&weather=&days=
router.get('/hotels', getHotels);                // GET /api/plan/hotels?city=Amravati

// Protected - only logged-in admin can add spots/hotels
router.post('/spots', protect, addSpot);
router.post('/hotels', protect, addHotel);

module.exports = router;
