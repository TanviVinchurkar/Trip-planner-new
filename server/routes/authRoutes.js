const router = require('express').Router();
const protect = require('../middleware/authMiddleware');
const {
  register,
  login,
  getMe,
  updateProfile,
} = require('../controllers/authController');

// Public routes
router.post('/register', register);   // signup form in login.html
router.post('/login', login);         // login form in login.html

// Protected routes (need token)
router.get('/me', protect, getMe);                   // populate dashBoard.html
router.put('/profile', protect, updateProfile);      // Edit Profile button

module.exports = router;
