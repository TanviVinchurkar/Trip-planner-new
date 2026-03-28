// ─────────────────────────────────────────────────────────────────────────────
//  api.js  —  single place for all backend calls
//  Import what you need: import { loginUser, saveTrip } from './api.js'
// ─────────────────────────────────────────────────────────────────────────────

const BASE = 'http://localhost:5000/api';

// ── Token helpers (stored in localStorage) ───────────────────────────────────
export const saveToken = (token) => localStorage.setItem('token', token);
export const getToken = () => localStorage.getItem('token');
export const removeToken = () => localStorage.removeItem('token');
export const saveUser = (user) => localStorage.setItem('user', JSON.stringify(user));
export const getUser = () => JSON.parse(localStorage.getItem('user') || 'null');
export const isLoggedIn = () => !!getToken();

// ── Reusable fetch wrapper ────────────────────────────────────────────────────
async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(`${BASE}${endpoint}`, { ...options, headers });
    const data = await res.json().catch(() => ({ message: 'Invalid server response' }));
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  } catch (err) {
    // If it's a network error (server down), throw a recognizable error
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('SERVER_OFFLINE');
    }
    throw err;
  }
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const registerUser = (name, email, password) =>
  request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });

export const loginUser = (email, password) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

export const getMe = () =>
  request('/auth/me');

export const updateProfile = (data) =>
  request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) });

// ── Trips ─────────────────────────────────────────────────────────────────────
export const saveTrip = (tripData) =>
  request('/trips', { method: 'POST', body: JSON.stringify(tripData) });

export const getMyTrips = () =>
  request('/trips');

export const getTripById = (id) =>
  request(`/trips/${id}`);

export const updateItinerary = (id, itinerary) =>
  request(`/trips/${id}/itinerary`, { method: 'PUT', body: JSON.stringify({ itinerary }) });

export const deleteTrip = (id) =>
  request(`/trips/${id}`, { method: 'DELETE' });

// ── Plan helpers ──────────────────────────────────────────────────────────────
export const fetchWeather = (city) =>
  request(`/plan/weather?city=${encodeURIComponent(city)}`);

export const fetchDestinationImage = (query) =>
  request(`/plan/image?query=${encodeURIComponent(query)}`);

export const getBudgetBreakdown = (budget, days, people) =>
  request('/plan/budget', { method: 'POST', body: JSON.stringify({ budget, people, days }) });

export const fetchSpots = (city) =>
  request(`/plan/spots?city=${encodeURIComponent(city.toLowerCase())}`);

// ── New plan endpoints ────────────────────────────────────────────────────────
export const fetchItinerary = (data) =>
  request('/plan/itinerary', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const getChecklist = (destination, weather, days) =>
  request(`/plan/checklist?destination=${encodeURIComponent(destination)}&weather=${encodeURIComponent(weather)}&days=${days}`);

export const getHotels = (city) =>
  request(`/plan/hotels?city=${encodeURIComponent(city.toLowerCase())}`);

// ── Expenses ──────────────────────────────────────────────────────────────────
export const updateExpenses = (id, expenses) =>
  request(`/trips/${id}/expenses`, { method: 'PUT', body: JSON.stringify({ expenses }) });

// ── Share trip ────────────────────────────────────────────────────────────────
export const getShareLink = (id) =>
  request(`/trips/${id}/share`);

export const getTripByShareLink = (shareLink) =>
  request(`/trips/share/${shareLink}`);
