// addSpot.js — trip cart (selected spots before saving)
// Works in both guest mode (localStorage) and logged-in mode

export let trip = JSON.parse(localStorage.getItem('pendingSpots')) || [];

export function addToTrip(spot) {
  if (!trip.find(s => s.id === spot.id)) {
    trip.push(spot);
    _persist();
  }
}

export function removeFromTrip(id) {
  trip = trip.filter(s => s.id !== id);
  _persist();
}

export function clearTrip() {
  trip = [];
  localStorage.removeItem('pendingSpots');
}

function _persist() {
  localStorage.setItem('pendingSpots', JSON.stringify(trip));
}
