// Application-related routes
const express = require('express');
const router = express.Router();
const db = require('../db');

// Apply for a job (Job Seeker)
// POST /api/applications
router.post('/', async (req, res) => {
  try {
    const { job_id, user_id } = req.body;

    // Validate input
    if (!job_id || !user_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Job ID and User ID are required' 
      });
    }

    // Check if job exists
    const [jobs] = await db.execute('SELECT * FROM jobs WHERE id = ?', [job_id]);
    if (jobs.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Job not found' 
      });
    }

    // Check if already applied
    const [existing] = await db.execute(
      'SELECT * FROM applications WHERE job_id = ? AND user_id = ?',
      [job_id, user_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already applied for this job' 
      });
    }

    // Insert application
    const [result] = await db.execute(
      'INSERT INTO applications (job_id, user_id) VALUES (?, ?)',
      [job_id, user_id]
    );

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      applicationId: result.insertId
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error submitting application' 
    });
  }
});

// Get applications by user ID (Job Seeker - view their applications)
// GET /api/applications/user/:userId
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const [applications] = await db.execute(
      `SELECT a.*, j.title, j.company, j.location, j.description, u.name as employer_name
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       JOIN users u ON j.employer_id = u.id
       WHERE a.user_id = ?
       ORDER BY a.applied_date DESC`,
      [userId]
    );

    res.json({
      success: true,
      applications: applications
    });
  } catch (error) {
    console.error('Error fetching user applications:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching applications' 
    });
  }
});

// Get applicants for a specific job (Employer)
// GET /api/applications/job/:jobId
router.get('/job/:jobId', async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const [applications] = await db.execute(
      `SELECT a.*, u.name, u.email, u.id as user_id
       FROM applications a
       JOIN users u ON a.user_id = u.id
       WHERE a.job_id = ?
       ORDER BY a.applied_date DESC`,
      [jobId]
    );

    res.json({
      success: true,
      applicants: applications
    });
  } catch (error) {
    console.error('Error fetching job applicants:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching applicants' 
    });
  }
});

module.exports = router;


