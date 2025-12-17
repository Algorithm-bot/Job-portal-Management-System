// Employer dashboard JavaScript

const API_BASE_URL = 'http://localhost:8001/api';

// Check if user is logged in
let currentUser = null;
let editingJobId = null; // track job being edited
let currentJobs = []; // cache jobs for editing

document.addEventListener('DOMContentLoaded', () => {
  // Get user from localStorage
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    alert('Please login first');
    window.location.href = 'login.html';
    return;
  }

  currentUser = JSON.parse(userStr);
  
  // Check if user is an employer
  if (currentUser.role !== 'employer') {
    alert('This page is for employers only');
    window.location.href = currentUser.role === 'admin' ? 'admin.html' : 'jobs.html';
    return;
  }

  displayUserInfo();
  loadMyJobs();

  // Handle job form submission
  const jobForm = document.getElementById('jobForm');
  if (jobForm) {
    jobForm.addEventListener('submit', handlePostJob);
  }
});

// Display current user info
function displayUserInfo() {
  const userInfoDiv = document.getElementById('userInfo');
  userInfoDiv.innerHTML = `
    <p><strong>Welcome, ${currentUser.name}!</strong></p>
    <p>Email: ${currentUser.email} | Role: Employer</p>
  `;
}

// Load jobs posted by this employer
async function loadMyJobs() {
  const container = document.getElementById('jobsContainer');
  container.innerHTML = '<p>Loading your jobs...</p>';

  try {
    const response = await fetch(`${API_BASE_URL}/jobs/employer/${currentUser.id}`);
    const data = await response.json();

    if (data.success && data.jobs.length > 0) {
      container.innerHTML = '';
      currentJobs = data.jobs;
      data.jobs.forEach(job => {
        const jobCard = createJobCard(job);
        container.appendChild(jobCard);
      });
    } else {
      currentJobs = [];
      container.innerHTML = '<p>You have not posted any jobs yet. Click "Post New Job" to get started!</p>';
    }
  } catch (error) {
    console.error('Error loading jobs:', error);
    container.innerHTML = '<p class="message error">Error loading jobs. Make sure the server is running.</p>';
  }
}

// Create job card element with applicants
function createJobCard(job) {
  const card = document.createElement('div');
  card.className = 'job-card';
  card.innerHTML = `
    <h3>${job.title}</h3>
    <div class="job-meta">
      <strong>Company:</strong> ${job.company} | 
      <strong>Location:</strong> ${job.location}
    </div>
    <div class="job-description">${job.description}</div>
    <div class="job-actions">
      <button onclick="viewApplicants(${job.id})" class="btn btn-info">View Applicants</button>
      <button onclick="startEditJob(${job.id})" class="btn btn-secondary">Edit</button>
      <button onclick="deleteJob(${job.id}, '${job.title}')" class="btn btn-danger">Delete</button>
    </div>
    <div id="applicants-${job.id}" class="applicants-list" style="display: none;"></div>
  `;
  return card;
}

// Show post job form
function showPostJobForm() {
  document.getElementById('postJobForm').style.display = 'block';
  document.getElementById('jobsContainer').style.display = 'none';
}

// Start a fresh form for creating a job
function startNewJob() {
  editingJobId = null;
  document.getElementById('formTitle').textContent = 'Post New Job';
  document.getElementById('submitBtn').textContent = 'Post Job';
  document.getElementById('jobForm').reset();
  showPostJobForm();
}

// Hide post job form
function hidePostJobForm() {
  document.getElementById('postJobForm').style.display = 'none';
  document.getElementById('jobsContainer').style.display = 'block';
  document.getElementById('jobForm').reset();
  editingJobId = null;
}

// Handle job posting
async function handlePostJob(e) {
  e.preventDefault();
  
  const title = document.getElementById('title').value;
  const company = document.getElementById('company').value;
  const location = document.getElementById('location').value;
  const description = document.getElementById('description').value;

  try {
    const isEdit = !!editingJobId;
    const url = isEdit ? `${API_BASE_URL}/jobs/${editingJobId}` : `${API_BASE_URL}/jobs`;
    const method = isEdit ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title,
        company,
        location,
        description,
        employer_id: currentUser.id
      })
    });

    const data = await response.json();

    if (data.success) {
      alert(isEdit ? 'Job updated successfully!' : 'Job posted successfully!');
      hidePostJobForm();
      loadMyJobs(); // Refresh jobs list
    } else {
      alert(data.message || 'Failed to save job');
    }
  } catch (error) {
    console.error('Error saving job:', error);
    alert('Error saving job. Make sure the server is running.');
  }
}

// View applicants for a job
async function viewApplicants(jobId) {
  const applicantsDiv = document.getElementById(`applicants-${jobId}`);
  
  // Toggle display
  if (applicantsDiv.style.display === 'none') {
    applicantsDiv.innerHTML = '<p>Loading applicants...</p>';
    applicantsDiv.style.display = 'block';

    try {
      const response = await fetch(`${API_BASE_URL}/applications/job/${jobId}`);
      const data = await response.json();

      if (data.success && data.applicants.length > 0) {
        let html = '<h4>Applicants:</h4>';
        data.applicants.forEach((applicant, index) => {
          const date = new Date(applicant.applied_date).toLocaleDateString();
          html += `
            <div class="applicant-item">
              <p><strong>${index + 1}. ${applicant.name}</strong></p>
              <p>Email: ${applicant.email}</p>
              <p>Applied on: ${date}</p>
            </div>
          `;
        });
        applicantsDiv.innerHTML = html;
      } else {
        applicantsDiv.innerHTML = '<p>No applicants yet for this job.</p>';
      }
    } catch (error) {
      console.error('Error loading applicants:', error);
      applicantsDiv.innerHTML = '<p class="message error">Error loading applicants.</p>';
    }
  } else {
    applicantsDiv.style.display = 'none';
  }
}

// Start editing a job: fill form and show it
function startEditJob(jobId) {
  const job = currentJobs.find(j => j.id === jobId);
  if (!job) {
    alert('Unable to find job to edit.');
    return;
  }

  editingJobId = jobId;
  document.getElementById('formTitle').textContent = 'Edit Job';
  document.getElementById('submitBtn').textContent = 'Update Job';
  document.getElementById('title').value = job.title;
  document.getElementById('company').value = job.company;
  document.getElementById('location').value = job.location;
  document.getElementById('description').value = job.description;
  showPostJobForm();
}

// Delete a job
async function deleteJob(jobId, jobTitle) {
  if (!confirm(`Delete job "${jobTitle}"?`)) return;

  try {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, { method: 'DELETE' });
    const data = await response.json();
    if (data.success) {
      alert('Job deleted.');
      loadMyJobs();
    } else {
      alert(data.message || 'Failed to delete job');
    }
  } catch (error) {
    console.error('Error deleting job:', error);
    alert('Error deleting job. Make sure the server is running.');
  }
}

// Logout function
function logout() {
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}


