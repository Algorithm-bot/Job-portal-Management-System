// Authentication JavaScript - handles login and registration

const API_BASE_URL = 'http://localhost:8001/api';

// Handle login form submission
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
});

// Login function
async function handleLogin(e) {
  e.preventDefault();
  const messageDiv = document.getElementById('message');
  messageDiv.className = 'message';
  messageDiv.textContent = '';

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.success) {
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      
      messageDiv.className = 'message success';
      messageDiv.textContent = 'Login successful! Redirecting...';

      // Redirect based on role
      setTimeout(() => {
        if (data.user.role === 'admin') {
          window.location.href = 'admin.html';
        } else if (data.user.role === 'employer') {
          window.location.href = 'employer.html';
        } else {
          window.location.href = 'jobs.html';
        }
      }, 1500);
    } else {
      messageDiv.className = 'message error';
      messageDiv.textContent = data.message || 'Login failed';
    }
  } catch (error) {
    console.error('Login error:', error);
    messageDiv.className = 'message error';
    messageDiv.textContent = 'Error connecting to server. Make sure the server is running.';
  }
}

// Registration function
async function handleRegister(e) {
  e.preventDefault();
  const messageDiv = document.getElementById('message');
  messageDiv.className = 'message';
  messageDiv.textContent = '';

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value;

  if (!role) {
    messageDiv.className = 'message error';
    messageDiv.textContent = 'Please select a role';
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password, role })
    });

    const data = await response.json();

    if (data.success) {
      messageDiv.className = 'message success';
      messageDiv.textContent = 'Registration successful! Redirecting to login...';

      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
    } else {
      messageDiv.className = 'message error';
      messageDiv.textContent = data.message || 'Registration failed';
    }
  } catch (error) {
    console.error('Registration error:', error);
    messageDiv.className = 'message error';
    messageDiv.textContent = 'Error connecting to server. Make sure the server is running.';
  }
}

// Logout function (used by other pages)
function logout() {
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}
