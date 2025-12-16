// Job-related routes for CRUD operations
const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all jobs
// GET /api/jobs
router.get('/', async (req, res) => {
  try {
    const [jobs] = await db.execute(
      `SELECT j.*, u.name as employer_name 
       FROM jobs j 
       JOIN users u ON j.employer_id = u.id 
       ORDER BY j.created_at DESC`
    );

    res.json({
      success: true,
      jobs: jobs
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching jobs' 
    });
  }
});

// Get single job by ID
// GET /api/jobs/:id
router.get('/:id', async (req, res) => {
  try {
    const jobId = req.params.id;
    const [jobs] = await db.execute(
      `SELECT j.*, u.name as employer_name 
       FROM jobs j 
       JOIN users u ON j.employer_id = u.id 
       WHERE j.id = ?`,
      [jobId]
    );

    if (jobs.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Job not found' 
      });
    }

    res.json({
      success: true,
      job: jobs[0]
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching job' 
    });
  }
});

// Create new job (Employer only)
// POST /api/jobs
router.post('/', async (req, res) => {
  try {
    const { title, description, company, location, employer_id } = req.body;

    // Validate input
    if (!title || !description || !company || !location || !employer_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Insert new job
    const [result] = await db.execute(
      'INSERT INTO jobs (title, description, company, location, employer_id) VALUES (?, ?, ?, ?, ?)',
      [title, description, company, location, employer_id]
    );

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      jobId: result.insertId
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating job' 
    });
  }
});

// Get jobs by employer ID
// GET /api/jobs/employer/:employerId
router.get('/employer/:employerId', async (req, res) => {
  try {
    const employerId = req.params.employerId;
    const [jobs] = await db.execute(
      'SELECT * FROM jobs WHERE employer_id = ? ORDER BY created_at DESC',
      [employerId]
    );

    res.json({
      success: true,
      jobs: jobs
    });
  } catch (error) {
    console.error('Error fetching employer jobs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching jobs' 
    });
  }
});

// Delete job (Admin or Employer)
// DELETE /api/jobs/:id
router.delete('/:id', async (req, res) => {
  try {
    const jobId = req.params.id;

    // Check if job exists
    const [jobs] = await db.execute('SELECT * FROM jobs WHERE id = ?', [jobId]);
    
    if (jobs.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Job not found' 
      });
    }

    // Delete job (cascade will delete applications)
    await db.execute('DELETE FROM jobs WHERE id = ?', [jobId]);

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting job' 
    });
  }
});

module.exports = router;
