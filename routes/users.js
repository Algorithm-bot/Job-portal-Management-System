// User management routes (Admin only)
const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all users
// GET /api/users
router.get('/', async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );

    res.json({
      success: true,
      users: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching users' 
    });
  }
});

// Delete user (Admin)
// DELETE /api/users/:id
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if user exists
    const [users] = await db.execute('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Delete user (cascade will delete related jobs and applications)
    await db.execute('DELETE FROM users WHERE id = ?', [userId]);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting user' 
    });
  }
});

module.exports = router;
