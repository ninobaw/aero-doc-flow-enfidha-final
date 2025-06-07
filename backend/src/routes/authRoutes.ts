import { Router } from 'express';
import { User } from '../models/User'; // Assuming User model is defined

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // In a real application, you would hash passwords and compare them securely.
    // For migration purposes, we'll simulate a check against a hardcoded password or a simple match.
    // IMPORTANT: This is NOT secure for production.
    const user = await User.findOne({ email });

    if (!user || user.email !== email || password !== 'admin123' && password !== 'user123') { // Simplified check
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

export default router;