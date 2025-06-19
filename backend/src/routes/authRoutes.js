const { Router } = require('express');
const { User } = require('../models/User'); // Assuming User model is defined
const bcrypt = require('bcryptjs'); // Import bcryptjs

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  console.log('*** Tentative de connexion reçue ! ***'); // <-- NOUVEAU LOG TEMPORAIRE
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    console.log('Email ou mot de passe manquant.'); // Log pour le débogage
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`Utilisateur non trouvé pour l'email: ${email}`); // Log pour le débogage
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare provided password with hashed password in DB
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log(`Mot de passe incorrect pour l'email: ${email}`); // Log pour le débogage
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

    console.log(`Connexion réussie pour l'utilisateur: ${email}`); // Log pour le débogage
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
  console.log('Déconnexion réussie.'); // Log pour le débogage
  res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;