import { loginUser, registerUser, saveToken, saveUser, isLoggedIn } from './api.js';

// Redirect if already logged in
if (isLoggedIn()) window.location.href = 'dashBoard.html';

const loginBtn  = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const loginForm = document.getElementById('loginForm');
const signupForm= document.getElementById('signupForm');

// ── Tab toggle ────────────────────────────────────────────────────────────────
loginBtn.onclick = () => {
  loginForm.classList.add('active');   signupForm.classList.remove('active');
  loginBtn.classList.add('active');    signupBtn.classList.remove('active');
  clearError();
};
signupBtn.onclick = () => {
  signupForm.classList.add('active');  loginForm.classList.remove('active');
  signupBtn.classList.add('active');   loginBtn.classList.remove('active');
  clearError();
};

document.querySelector('.explore-btn').addEventListener('click', () => {
  window.location.href = 'index.html';
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function showError(formEl, message) {
  let err = formEl.querySelector('.error-msg');
  if (!err) {
    err = document.createElement('p');
    err.className = 'error-msg';
    err.style.cssText = 'color:#e74c3c;font-size:13px;margin:4px 0 8px;text-align:center';
    formEl.querySelector('.primary-btn').before(err);
  }
  err.textContent = message;
}
function clearError() {
  document.querySelectorAll('.error-msg').forEach(el => el.remove());
}
function setLoading(btn, loading) {
  btn.disabled = loading;
  btn.textContent = loading ? 'Please wait...' : btn.dataset.label;
}

// ── Login submit ──────────────────────────────────────────────────────────────
loginForm.querySelector('.primary-btn').addEventListener('click', async () => {
  clearError();
  const [emailInput, passwordInput] = loginForm.querySelectorAll('input');
  const btn = loginForm.querySelector('.primary-btn');
  btn.dataset.label = 'Login';

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  if (!email || !password) return showError(loginForm, 'Please fill in all fields');

  setLoading(btn, true);
  try {
    const data = await loginUser(email, password);
    saveToken(data.token);
    saveUser(data.user);
    window.location.href = 'dashBoard.html';
  } catch (err) {
    showError(loginForm, err.message);
  } finally {
    setLoading(btn, false);
  }
});

// ── Signup submit ─────────────────────────────────────────────────────────────
signupForm.querySelector('.primary-btn').addEventListener('click', async () => {
  clearError();
  const [nameInput, emailInput, passwordInput] = signupForm.querySelectorAll('input');
  const btn = signupForm.querySelector('.primary-btn');
  btn.dataset.label = 'Sign Up';

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  if (!name || !email || !password) return showError(signupForm, 'Please fill in all fields');
  if (password.length < 6) return showError(signupForm, 'Password must be at least 6 characters');

  setLoading(btn, true);
  try {
    const data = await registerUser(name, email, password);
    saveToken(data.token);
    saveUser(data.user);
    window.location.href = 'dashBoard.html';
  } catch (err) {
    showError(signupForm, err.message);
  } finally {
    setLoading(btn, false);
  }
});
