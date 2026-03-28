const mongoose = require('mongoose');

// This replaces the hardcoded spots array in frontend data/backend.js
const spotSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  location: { type: String, required: true },
  fee: { type: String, default: 'Free' },
  timing: { type: String, default: '9:00 AM - 6:00 PM' },
  closed: { type: String, default: 'Open all days' },
  rating: { type: String, default: '⭐⭐⭐⭐☆' },
  img: { type: String, default: '' },
  // For filtering by destination
  city: { type: String, required: true, lowercase: true },
});

module.exports = mongoose.model('Spot', spotSchema);
