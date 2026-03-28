const mongoose = require('mongoose');

// Store hotels per city for real hotel options instead of hardcoded ones
const hotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    city: { type: String, required: true, lowercase: true },
    address: String,
    rating: String,           // "⭐ 4.2"
    pricePerNight: Number,    // in INR
    stars: { type: Number, min: 1, max: 5 },
    img: String,              // Hotel image URL
    description: String,
  },
  { timestamps: true }
);

// Index for fast lookup by city
hotelSchema.index({ city: 1 });

module.exports = mongoose.model('Hotel', hotelSchema);
