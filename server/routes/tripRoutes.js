const router = require('express').Router();
const protect = require('../middleware/authMiddleware');
const {
  createTrip,
  getMyTrips,
  getTripById,
  updateItinerary,
  deleteTrip,
  updateExpenses,
  getShareLink,
  getTripByShareLink,
} = require('../controllers/tripController');

// All trip routes require login EXCEPT share viewing
// Public route - no auth needed (must be before protect)
router.get('/share/:shareLink', getTripByShareLink);

router.use(protect);

router.post('/', createTrip);                           // save trip after form complete
router.get('/', getMyTrips);                            // "Your Trips" in dashBoard.html
router.get('/:id', getTripById);                        // "View Trip" button → plan.html
router.put('/:id/itinerary', updateItinerary);          // "Add activity" in plan.html
router.put('/:id/expenses', updateExpenses);            // update expenses
router.get('/:id/share', getShareLink);                 // create shareable link
router.delete('/:id', deleteTrip);                      // delete a trip

module.exports = router;
