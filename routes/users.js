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

// Update user (Admin)
// PUT /api/users/:id
router.put('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    // Ensure user exists
    const [existing] = await db.execute('SELECT * FROM users WHERE id = ?', [userId]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check for email uniqueness (excluding current user)
    const [emailCheck] = await db.execute(
      'SELECT id FROM users WHERE email = ? AND id <> ?',
      [email, userId]
    );
    if (emailCheck.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use by another user',
      });
    }

    await db.execute(
      'UPDATE users SET name = ?, email = ?, password = ?, role = ? WHERE id = ?',
      [name, email, password, role, userId]
    );

    res.json({
      success: true,
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
    });
  }
});

module.exports = router;


