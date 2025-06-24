const { Router } = require('express');
const { User } = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // Importation du module crypto
const { sendEmail } = require('../utils/emailSender.js'); // Importation de la fonction d'envoi d'email

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  console.log('*** Tentative de connexion reçue ! ***');
  const { email, password } = req.body;

  if (!email || !password) {
    console.log('Email ou mot de passe manquant.');
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`Utilisateur non trouvé pour l'email: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log(`Mot de passe incorrect pour l'email: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

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

    console.log(`Connexion réussie pour l'utilisateur: ${email}`);
    res.json({ user: userResponse, token: 'mock-jwt-token' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  console.log('Déconnexion réussie.');
  res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;