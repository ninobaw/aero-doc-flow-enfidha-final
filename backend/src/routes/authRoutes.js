const { Router } = require('express');
const { User } = require('../models/User');
const { AppSettings } = require('../models/AppSettings'); // Import AppSettings model
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendEmail } = require('../utils/emailSender.js');

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

    // Fetch user-specific app settings to get sessionTimeout
    const userSettings = await AppSettings.findOne({ userId: user._id });
    const sessionTimeoutMinutes = userSettings ? userSettings.sessionTimeout : 60; // Default to 60 minutes if no settings found

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
      sessionTimeout: sessionTimeoutMinutes, // Include sessionTimeout in the response
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

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      // Send a generic success message to prevent email enumeration
      return res.status(200).json({ message: 'If a user with that email exists, a password reset link has been sent.' });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
    await user.save();

    // Construct the reset URL (frontend URL)
    // Use FRONTEND_BASE_URL from environment variables
    const frontendBaseUrl = process.env.FRONTEND_BASE_URL || `${req.protocol}://${req.get('host')}`;
    const resetUrl = `${frontendBaseUrl}/reset-password?token=${resetToken}`;

    // Send email
    await sendEmail(
      user._id,
      'Réinitialisation de votre mot de passe AeroDoc',
      `Vous recevez ceci car vous (ou quelqu'un d'autre) avez demandé la réinitialisation du mot de passe pour votre compte.\n\n` +
      `Veuillez cliquer sur le lien suivant, ou le coller dans votre navigateur pour compléter le processus :\n\n` +
      `${resetUrl}\n\n` +
      `Si vous n'avez pas demandé cela, veuillez ignorer cet e-mail et votre mot de passe restera inchangé.\n`,
      `<p>Vous recevez ceci car vous (ou quelqu'un d'autre) avez demandé la réinitialisation du mot de passe pour votre compte.</p>` +
      `<p>Veuillez cliquer sur le lien suivant, ou le coller dans votre navigateur pour compléter le processus :</p>` +
      `<p><a href="${resetUrl}">${resetUrl}</a></p>` +
      `<p>Si vous n'avez pas demandé cela, veuillez ignorer cet e-mail et votre mot de passe restera inchangé.</p>`
    );

    res.status(200).json({ message: 'If a user with that email exists, a password reset link has been sent.' });
  } catch (error) {
    console.error('Error in forgot-password:', error);
    res.status(500).json({ message: 'Server error during password reset request.' });
  }
});

// POST /api/auth/reset-password/:token
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'New password is required and must be at least 6 characters long.' });
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Token must not be expired
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined; // Clear token
    user.resetPasswordExpires = undefined; // Clear expiry
    await user.save();

    res.status(200).json({ message: 'Your password has been updated.' });
  } catch (error) {
    console.error('Error in reset-password:', error);
    res.status(500).json({ message: 'Server error during password reset.' });
  }
});

module.exports = router;