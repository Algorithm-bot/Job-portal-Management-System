// Jobs page JavaScript - for Job Seekers

const API_BASE_URL = 'http://localhost:8001/api';

// Check if user is logged in
let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
  // Get user from localStorage
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    alert('Please login first');
    window.location.href = 'login.html';
    return;
  }

  currentUser = JSON.parse(userStr);
  
  // Check if user is a job seeker
  if (currentUser.role !== 'job_seeker') {
    alert('This page is for job seekers only');
    window.location.href = currentUser.role === 'admin' ? 'admin.html' : 'employer.html';
    return;
  }

  displayUserInfo();
  loadJobs();
});

// Display current user info
function displayUserInfo() {
  const userInfoDiv = document.getElementById('userInfo');
  userInfoDiv.innerHTML = `
    <p><strong>Welcome, ${currentUser.name}!</strong></p>
    <p>Email: ${currentUser.email} | Role: Job Seeker</p>
  `;
}

// Load all available jobs
async function loadJobs() {
  const container = document.getElementById('jobsContainer');
  container.innerHTML = '<p>Loading jobs...</p>';

  try {
    const response = await fetch(`${API_BASE_URL}/jobs`);
    const data = await response.json();

    if (data.success && data.jobs.length > 0) {
      container.innerHTML = '';
      data.jobs.forEach(job => {
        const jobCard = createJobCard(job);
        container.appendChild(jobCard);
      });
    } else {
      container.innerHTML = '<p>No jobs available at the moment.</p>';
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
      <button onclick="applyForJob(${job.id})" class="btn btn-primary">Apply Now</button>
    </div>
  `;
  return card;
}

// Apply for a job
async function applyForJob(jobId) {
  if (!currentUser) {
    alert('Please login first');
    return;
  }

  if (!confirm('Are you sure you want to apply for this job?')) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        job_id: jobId,
        user_id: currentUser.id
      })
    });

    const data = await response.json();

    if (data.success) {
      alert('Application submitted successfully!');
      loadJobs(); // Refresh jobs list
    } else {
      alert(data.message || 'Failed to submit application');
    }
  } catch (error) {
    console.error('Error applying for job:', error);
    alert('Error submitting application. Make sure the server is running.');
  }
}

// View my applications
async function viewMyApplications() {
  if (!currentUser) {
    alert('Please login first');
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/applications/user/${currentUser.id}`);
    const data = await response.json();

    if (data.success && data.applications.length > 0) {
      let message = 'Your Applications:\n\n';
      data.applications.forEach((app, index) => {
        const date = new Date(app.applied_date).toLocaleDateString();
        message += `${index + 1}. ${app.title} at ${app.company}\n   Applied on: ${date}\n\n`;
      });
      alert(message);
    } else {
      alert('You have not applied for any jobs yet.');
    }
  } catch (error) {
    console.error('Error loading applications:', error);
    alert('Error loading applications. Make sure the server is running.');
  }
}

// Logout function
function logout() {
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}


