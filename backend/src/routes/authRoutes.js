const { Router } = require('express');
const { User } = require('../models/User'); // Assuming User model is defined
const bcrypt = require('bcryptjs'); // Import bcryptjs

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare provided password with hashed password in DB
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // In a real app, generate a JWT token here
    const userResponse = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      airport: user.airport,
      profilePhoto: user.profilePhoto,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      isActive: user.isActive,
      phone: user.phone,
      department: user.department,
      lastLogin: user.lastLogin,
    };

    res.json({ user: userResponse, token: 'mock-jwt-token' }); // Return a mock token
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  // In a real application, you would invalidate the user's session/token here.
  // For this mock backend, we simply send a success response.
  res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;