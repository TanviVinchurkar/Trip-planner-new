const mongoose = require('mongoose');

// Store cached destination images to avoid Unsplash rate limits (50/hour)
const destinationImageSchema = new mongoose.Schema(
  {
    city: { type: String, required: true, unique: true, lowercase: true },
    image: String,           // URL from Unsplash
    thumb: String,           // Thumbnail URL
    photographer: String,
    profileLink: String,
    lastFetched: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DestinationImage', destinationImageSchema);
