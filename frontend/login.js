// Check if already logged in
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');
  if (token && userType === 'admin') {
    window.location.replace('admin.html');
  }
});

// Configuration
const API_BASE_URL = 'https://ims-ia4p.onrender.com';

let currentLoginType = 'user';
let isSignupMode = false;

// Tab switching
function switchTab(type) {
  if (isSignupMode) return; // Disable tab switching in signup mode
  currentLoginType = type;

  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.type === type);
  });

  document.getElementById('result').textContent = '';
  document.getElementById('result').className = 'message';
}

// Toggle between Login and Signup modes
function toggleAuthMode(event) {
  if (event) event.preventDefault();
  isSignupMode = !isSignupMode;

  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const toggleText = document.getElementById('toggleText');
  const tabs = document.querySelector('.tabs');
  const subtitle = document.querySelector('.subtitle');

  if (isSignupMode) {
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
    tabs.classList.add('hidden');
    subtitle.textContent = 'Create a new staff account';
    toggleText.innerHTML = 'Already have an account? <a href="#" onclick="toggleAuthMode(event)">Sign in</a>';
  } else {
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
    tabs.classList.remove('hidden');
    subtitle.textContent = 'Sign in to your account';
    toggleText.innerHTML = 'Don\'t have an account? <a href="#" onclick="toggleAuthMode(event)">Sign up</a>';
  }

  document.getElementById('result').textContent = '';
  document.getElementById('result').className = 'message';
}

// Show message helper
function showMessage(text, type) {
  const result = document.getElementById('result');
  result.textContent = text;
  result.className = 'message ' + type;
}

// Login handler
async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const btn = document.getElementById('loginBtn');
  const btnText = document.getElementById('loginBtnText');
  const btnLoader = document.getElementById('loginBtnLoader');
  const result = document.getElementById('result');

  // Loading state
  btn.disabled = true;
  btnText.classList.add('hidden');
  btnLoader.classList.remove('hidden');
  result.textContent = '';
  result.className = 'message';

  try {
    const response = await fetch(`${API_BASE_URL}/login/${currentLoginType}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok && data.access_token) {
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('userType', currentLoginType);
      showMessage(`Welcome! Redirecting to dashboard...`, 'success');

      // Redirect after short delay
      setTimeout(() => {
        if (currentLoginType === 'admin') {
          window.location.replace('admin.html');
        } else {
          window.location.replace('user.html');
        }
      }, 1000);
    } else {
      result.textContent = data.detail || 'Invalid credentials';
      result.className = 'message error';
    }
  } catch (error) {
    result.textContent = 'Connection error. Is the server running?';
    result.className = 'message error';
  } finally {
    btn.disabled = false;
    btnText.classList.remove('hidden');
    btnLoader.classList.add('hidden');
  }
}

// Signup handler
async function handleSignup(event) {
  event.preventDefault();

  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const employeeId = document.getElementById('employeeId').value.trim();
  const password = document.getElementById('signupPassword').value;

  const btn = document.getElementById('signupBtn');
  const btnText = document.getElementById('signupBtnText');
  const btnLoader = document.getElementById('signupBtnLoader');
  const result = document.getElementById('result');

  // Loading state
  btn.disabled = true;
  btnText.classList.add('hidden');
  btnLoader.classList.remove('hidden');
  result.textContent = '';
  result.className = 'message';

  try {
    const response = await fetch(`${API_BASE_URL}/create-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email: email,
        employee_id: employeeId,
        password: password,
        role: 'user' // Default role
      })
    });

    const data = await response.json();

    if (response.ok) {
      showMessage('Account created! Pending admin approval.', 'success');
      setTimeout(() => {
        toggleAuthMode();
      }, 3000);
    } else {
      result.textContent = data.detail || 'Signup failed';
      result.className = 'message error';
    }
  } catch (error) {
    result.textContent = 'Connection error. Is the server running?';
    result.className = 'message error';
  } finally {
    btn.disabled = false;
    btnText.classList.remove('hidden');
    btnLoader.classList.add('hidden');
  }
}
