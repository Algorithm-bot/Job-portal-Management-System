// Admin dashboard JavaScript

const API_BASE_URL = 'http://localhost:8001/api';

// Check if user is logged in
let currentUser = null;
let adminUsers = [];
let adminJobs = [];

document.addEventListener('DOMContentLoaded', () => {
  // Get user from localStorage
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    alert('Please login first');
    window.location.href = 'login.html';
    return;
  }

  currentUser = JSON.parse(userStr);
  
  // Check if user is admin
  if (currentUser.role !== 'admin') {
    alert('This page is for admins only');
    window.location.href = currentUser.role === 'employer' ? 'employer.html' : 'jobs.html';
    return;
  }

  displayUserInfo();
  loadAllData();
});

// Display current user info
function displayUserInfo() {
  const userInfoDiv = document.getElementById('userInfo');
  userInfoDiv.innerHTML = `
    <p><strong>Welcome, ${currentUser.name}!</strong></p>
    <p>Email: ${currentUser.email} | Role: Administrator</p>
  `;
}

// Load all data (users and jobs)
async function loadAllData() {
  await Promise.all([loadUsers(), loadJobs()]);
}

// Load all users
async function loadUsers() {
  const container = document.getElementById('usersContainer');
  container.innerHTML = '<p>Loading users...</p>';

  try {
    const response = await fetch(`${API_BASE_URL}/users`);
    const data = await response.json();

    if (data.success && data.users.length > 0) {
      adminUsers = data.users;
      let html = `
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
      `;

      data.users.forEach(user => {
        const date = new Date(user.created_at).toLocaleDateString();
        html += `
          <tr>
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>${date}</td>
            <td>
              <button onclick="editUser(${user.id})" class="btn btn-secondary" style="padding: 5px 10px; font-size: 14px;">Edit</button>
              <button onclick="deleteUser(${user.id}, '${user.name}')" class="btn btn-danger" style="padding: 5px 10px; font-size: 14px;">Delete</button>
            </td>
          </tr>
        `;
      });

      html += `
          </tbody>
        </table>
      `;
      container.innerHTML = html;
    } else {
      adminUsers = [];
      container.innerHTML = '<p>No users found.</p>';
    }
  } catch (error) {
    console.error('Error loading users:', error);
    container.innerHTML = '<p class="message error">Error loading users. Make sure the server is running.</p>';
  }
}

// Load all jobs
async function loadJobs() {
  const container = document.getElementById('jobsContainer');
  container.innerHTML = '<p>Loading jobs...</p>';

  try {
    const response = await fetch(`${API_BASE_URL}/jobs`);
    const data = await response.json();

    if (data.success && data.jobs.length > 0) {
      container.innerHTML = '';
      adminJobs = data.jobs;
      data.jobs.forEach(job => {
        const jobCard = createJobCard(job);
        container.appendChild(jobCard);
      });
    } else {
      adminJobs = [];
      container.innerHTML = '<p>No jobs found.</p>';
    }
  } catch (error) {
    console.error('Error loading jobs:', error);
    container.innerHTML = '<p class="message error">Error loading jobs. Make sure the server is running.</p>';
  }
}

// Create job card element
function createJobCard(job) {
  const card = document.createElement('div');
  card.className = 'job-card';
  card.innerHTML = `
    <h3>${job.title}</h3>
    <div class="job-meta">
      <strong>Company:</strong> ${job.company} | 
      <strong>Location:</strong> ${job.location} |
      <strong>Posted by:</strong> ${job.employer_name}
    </div>
    <div class="job-description">${job.description}</div>
    <div class="job-actions">
      <button onclick="editJob(${job.id})" class="btn btn-secondary">Edit Job</button>
      <button onclick="deleteJob(${job.id}, '${job.title}')" class="btn btn-danger">Delete Job</button>
    </div>
  `;
  return card;
}

// Edit a job using simple prompts
async function editJob(jobId) {
  const job = adminJobs.find(j => j.id === jobId);
  if (!job) {
    alert('Job not found for editing.');
    return;
  }

  const title = prompt('Job Title:', job.title);
  if (!title) return;
  const company = prompt('Company:', job.company);
  if (!company) return;
  const location = prompt('Location:', job.location);
  if (!location) return;
  const description = prompt('Description:', job.description);
  if (!description) return;

  try {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        company,
        location,
        description,
        employer_id: job.employer_id,
      }),
    });

    const data = await response.json();
    if (data.success) {
      alert('Job updated.');
      loadJobs();
    } else {
      alert(data.message || 'Failed to update job');
    }
  } catch (error) {
    console.error('Error updating job:', error);
    alert('Error updating job.');
  }
}

// Edit a user using prompts
async function editUser(userId) {
  const user = adminUsers.find(u => u.id === userId);
  if (!user) {
    alert('User not found for editing.');
    return;
  }

  const name = prompt('Name:', user.name);
  if (!name) return;
  const email = prompt('Email:', user.email);
  if (!email) return;
  const password = prompt('Password (plain text):', user.password || '');
  if (!password) return;
  const role = prompt("Role (admin/employer/job_seeker):", user.role);
  if (!role) return;

  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await response.json();
    if (data.success) {
      alert('User updated.');
      loadUsers();
    } else {
      alert(data.message || 'Failed to update user');
    }
  } catch (error) {
    console.error('Error updating user:', error);
    alert('Error updating user.');
  }
}

// Delete user
async function deleteUser(userId, userName) {
  if (!confirm(`Are you sure you want to delete user "${userName}"? This will also delete all their jobs and applications.`)) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (data.success) {
      alert('User deleted successfully!');
      loadUsers(); // Refresh users list
    } else {
      alert(data.message || 'Failed to delete user');
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    alert('Error deleting user. Make sure the server is running.');
  }
}

// Delete job
async function deleteJob(jobId, jobTitle) {
  if (!confirm(`Are you sure you want to delete job "${jobTitle}"?`)) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (data.success) {
      alert('Job deleted successfully!');
      loadJobs(); // Refresh jobs list
    } else {
      alert(data.message || 'Failed to delete job');
    }
  } catch (error) {
    console.error('Error deleting job:', error);
    alert('Error deleting job. Make sure the server is running.');
  }
}

// Show users section
function showUsers() {
  document.getElementById('usersSection').style.display = 'block';
  document.getElementById('jobsSection').style.display = 'none';
  loadUsers();
}

// Show jobs section
function showJobs() {
  document.getElementById('usersSection').style.display = 'none';
  document.getElementById('jobsSection').style.display = 'block';
  loadJobs();
}

// Logout function
function logout() {
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}


