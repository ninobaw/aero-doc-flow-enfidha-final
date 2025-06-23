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

// POST /api/auth/request-password-reset
router.post('/request-password-reset', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      // Pour des raisons de sécurité, ne pas révéler si l'utilisateur existe ou non.
      // Toujours renvoyer un succès pour éviter l'énumération des utilisateurs.
      console.log(`Demande de réinitialisation pour email non trouvé: ${email}`);
      return res.status(200).json({ message: 'If a matching account is found, an email will be sent.' });
    }

    // Générer un jeton aléatoire
    const token = crypto.randomBytes(20).toString('hex');
    
    // Définir le jeton et sa date d'expiration (ex: 1 heure)
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 heure
    await user.save();

    // Construire le lien de réinitialisation
    // Assurez-vous que VITE_FRONTEND_URL est défini dans votre .env.development.local ou .env
    const resetUrl = `${process.env.VITE_FRONTEND_URL || 'http://localhost:8080'}/reset-password?token=${token}`;

    // Envoyer l'email
    const emailSubject = 'Réinitialisation de votre mot de passe AeroDoc';
    const emailText = `Vous recevez cet email car vous (ou quelqu'un d'autre) avez demandé la réinitialisation du mot de passe de votre compte.\n\n` +
                      `Veuillez cliquer sur le lien suivant, ou le coller dans votre navigateur pour compléter le processus :\n\n` +
                      `${resetUrl}\n\n` +
                      `Si vous n'avez pas demandé cela, veuillez ignorer cet email et votre mot de passe restera inchangé. Ce lien expirera dans 1 heure.`;
    const emailHtml = `<p>Vous recevez cet email car vous (ou quelqu'un d'autre) avez demandé la réinitialisation du mot de passe de votre compte.</p>` +
                      `<p>Veuillez cliquer sur le lien suivant, ou le coller dans votre navigateur pour compléter le processus :</p>` +
                      `<p><a href="${resetUrl}">${resetUrl}</a></p>` +
                      `<p>Si vous n'avez pas demandé cela, veuillez ignorer cet email et votre mot de passe restera inchangé. Ce lien expirera dans 1 heure.</p>`;

    await sendEmail(user._id, emailSubject, emailText, emailHtml);

    console.log(`Email de réinitialisation envoyé à: ${email}`);
    res.status(200).json({ message: 'If a matching account is found, an email will be sent.' });

  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).json({ message: 'Server error during password reset request.' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token and new password are required.' });
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() } // Token non expiré
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
    }

    // Hasher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // Effacer le jeton et sa date d'expiration
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Optionnel: Envoyer une notification à l'utilisateur que son mot de passe a été changé
    await sendEmail(user._id, 'Votre mot de passe AeroDoc a été réinitialisé', 
                    'Votre mot de passe pour AeroDoc a été réinitialisé avec succès. Si vous n\'êtes pas à l\'origine de ce changement, veuillez contacter l\'administrateur.',
                    '<p>Votre mot de passe pour AeroDoc a été réinitialisé avec succès.</p><p>Si vous n\'êtes pas à l\'origine de ce changement, veuillez contacter l\'administrateur.</p>');

    console.log(`Mot de passe réinitialisé pour l'utilisateur: ${user.email}`);
    res.status(200).json({ message: 'Password has been reset successfully.' });

  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Server error during password reset.' });
  }
});

module.exports = router;