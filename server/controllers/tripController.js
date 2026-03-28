const Trip = require('../models/Trip');

// ─── POST /api/trips ─────────────────────────────────────────────────────────
// Called when user completes the multi-step form (index.html → plan.html)
// Saves: form inputs + selected spots + selected hotel + budget breakdown
exports.createTrip = async (req, res) => {
  try {
    const {
      startLocation,
      destination,
      startDate,
      endDate,
      budget,
      people,
      selectedSpots,
      selectedHotel,
      budgetBreakdown,
      weather,
      destinationImage,
    } = req.body;

    if (!startLocation || !destination || !startDate || !endDate || !budget) {
      return res.status(400).json({ message: 'Missing required trip fields' });
    }

    const trip = await Trip.create({
      user: req.user._id,
      startLocation,
      destination,
      startDate,
      endDate,
      budget: Number(budget),
      people: Number(people) || 1,
      selectedSpots: selectedSpots || [],
      selectedHotel: selectedHotel || null,
      budgetBreakdown: budgetBreakdown || null,
      weather: weather || null,
      destinationImage: destinationImage || '',
    });

    res.status(201).json({ message: 'Trip saved!', trip });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/trips ──────────────────────────────────────────────────────────
// Loads all trips for dashBoard.html "Your Trips" section
exports.getMyTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/trips/:id ──────────────────────────────────────────────────────
// Loads a single trip to populate plan.html (hero, hotels, itinerary, map)
exports.getTripById = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── PUT /api/trips/:id/itinerary ────────────────────────────────────────────
// Called from plan.html "Add activity" inputs (day-wise editing)
exports.updateItinerary = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    trip.itinerary = req.body.itinerary; // array of { day, activities[] }
    await trip.save();

    res.json({ message: 'Itinerary updated', itinerary: trip.itinerary });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── DELETE /api/trips/:id ───────────────────────────────────────────────────
// Trash icon on dashboard trip card
exports.deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json({ message: 'Trip deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── PUT /api/trips/:id/expenses ────────────────────────────────────────────
// Add or update expenses for a trip
exports.updateExpenses = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    trip.expenses = req.body.expenses; // array of { category, amount, note, date }
    await trip.save();

    res.json({ message: 'Expenses updated', expenses: trip.expenses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/trips/:id/share ───────────────────────────────────────────────
// Create a shareable link for a trip (no auth required to view)
exports.getShareLink = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    // Generate a unique share code if not already present
    if (!trip.shareLink) {
      trip.shareLink = `${req.params.id}-${Math.random().toString(36).substr(2, 9)}`;
      await trip.save();
    }

    res.json({ shareLink: trip.shareLink });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/trips/share/:shareLink ────────────────────────────────────────
// View a trip via share link (public, no auth required)
exports.getTripByShareLink = async (req, res) => {
  try {
    const trip = await Trip.findOne({ shareLink: req.params.shareLink });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
