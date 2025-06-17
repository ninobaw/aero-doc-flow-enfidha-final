const { Router } = require('express');
const { AppSettings } = require('../models/AppSettings.js');
const { v4: uuidv4 } = require('uuid');

const router = Router();

// GET /api/settings/:userId
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    let settings = await AppSettings.findOne({ userId });

    if (!settings) {
      // If no settings found, create default ones
      const defaultSettings = {
        _id: uuidv4(),
        userId: userId,
        companyName: 'AeroDoc - Gestion Documentaire',
        defaultAirport: 'ENFIDHA',
        language: 'fr',
        theme: 'light',
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        sessionTimeout: 60,
        requireTwoFactor: false,
        passwordExpiry: 90,
        documentRetention: 365,
        autoArchive: true,
        maxFileSize: 10,
        smtpHost: '',
        smtpPort: 587,
        smtpUsername: '',
        useSsl: true,
        twilioAccountSid: '', // Default empty
        twilioAuthToken: '',  // Default empty
        twilioPhoneNumber: '', // Default empty
      };
      settings = new AppSettings(defaultSettings);
      await settings.save();
    }

    res.json({
      ...settings.toObject(),
      id: settings._id,
      email_notifications: settings.emailNotifications,
      sms_notifications: settings.smsNotifications,
      push_notifications: settings.pushNotifications,
      session_timeout: settings.sessionTimeout,
      require_two_factor: settings.requireTwoFactor,
      password_expiry: settings.passwordExpiry,
      document_retention: settings.documentRetention,
      auto_archive: settings.autoArchive,
      max_file_size: settings.maxFileSize,
      smtp_host: settings.smtpHost,
      smtp_port: settings.smtpPort,
      smtp_username: settings.smtpUsername,
      use_ssl: settings.useSsl,
      default_airport: settings.defaultAirport,
      company_name: settings.companyName,
      twilio_account_sid: settings.twilioAccountSid, // Map for frontend
      twilio_auth_token: settings.twilioAuthToken,   // Map for frontend
      twilio_phone_number: settings.twilioPhoneNumber, // Map for frontend
    });
  } catch (error) {
    console.error('Error fetching app settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/settings/:userId
router.put('/:userId', async (req, res) => {
  const { userId } = req.params;
  const updates = req.body;

  console.log('Backend: Requête PUT /api/settings/:userId reçue.'); // Nouveau log
  console.log('Backend: userId:', userId); // Nouveau log
  console.log('Backend: Données reçues (req.body):', updates); // Nouveau log

  // Map frontend field names to backend schema names
  const mappedUpdates = {};
  if (updates.company_name !== undefined) mappedUpdates.companyName = updates.company_name;
  if (updates.default_airport !== undefined) mappedUpdates.defaultAirport = updates.default_airport;
  if (updates.language !== undefined) mappedUpdates.language = updates.language;
  if (updates.theme !== undefined) mappedUpdates.theme = updates.theme;
  if (updates.email_notifications !== undefined) mappedUpdates.emailNotifications = updates.email_notifications;
  if (updates.sms_notifications !== undefined) mappedUpdates.smsNotifications = updates.sms_notifications;
  if (updates.push_notifications !== undefined) mappedUpdates.pushNotifications = updates.push_notifications;
  if (updates.session_timeout !== undefined) mappedUpdates.sessionTimeout = updates.session_timeout;
  if (updates.require_two_factor !== undefined) mappedUpdates.requireTwoFactor = updates.require_two_factor;
  if (updates.password_expiry !== undefined) mappedUpdates.passwordExpiry = updates.password_expiry;
  if (updates.document_retention !== undefined) mappedUpdates.documentRetention = updates.document_retention;
  if (updates.auto_archive !== undefined) mappedUpdates.autoArchive = updates.auto_archive;
  if (updates.max_file_size !== undefined) mappedUpdates.maxFileSize = updates.max_file_size;
  if (updates.smtp_host !== undefined) mappedUpdates.smtpHost = updates.smtp_host;
  if (updates.smtp_port !== undefined) mappedUpdates.smtpPort = updates.smtp_port;
  if (updates.smtp_username !== undefined) mappedUpdates.smtpUsername = updates.smtp_username;
  if (updates.use_ssl !== undefined) mappedUpdates.useSsl = updates.use_ssl;
  // Nouveaux champs SMS
  if (updates.twilio_account_sid !== undefined) mappedUpdates.twilioAccountSid = updates.twilio_account_sid;
  if (updates.twilio_auth_token !== undefined) mappedUpdates.twilioAuthToken = updates.twilio_auth_token;
  if (updates.twilio_phone_number !== undefined) mappedUpdates.twilioPhoneNumber = updates.twilio_phone_number;

  console.log('Backend: Données mappées pour la mise à jour:', mappedUpdates); // Nouveau log

  try {
    const settings = await AppSettings.findOneAndUpdate(
      { userId },
      { $set: mappedUpdates },
      { new: true, upsert: true } // upsert: true creates the document if it doesn't exist
    );

    if (!settings) {
      console.error('Backend: Erreur: Paramètres non trouvés ou non mis à jour.'); // Nouveau log
      return res.status(404).json({ message: 'Settings not found or could not be updated.' });
    }

    console.log('Backend: Paramètres mis à jour avec succès:', settings); // Nouveau log

    res.json({
      ...settings.toObject(),
      id: settings._id,
      email_notifications: settings.emailNotifications,
      sms_notifications: settings.smsNotifications,
      push_notifications: settings.pushNotifications,
      session_timeout: settings.sessionTimeout,
      require_two_factor: settings.requireTwoFactor,
      password_expiry: settings.passwordExpiry,
      document_retention: settings.documentRetention,
      auto_archive: settings.autoArchive,
      max_file_size: settings.maxFileSize,
      smtp_host: settings.smtpHost,
      smtp_port: settings.smtpPort,
      smtp_username: settings.smtpUsername,
      use_ssl: settings.useSsl,
      default_airport: settings.defaultAirport,
      company_name: settings.companyName,
      twilio_account_sid: settings.twilioAccountSid,
      twilio_auth_token: settings.twilioAuthToken,
      twilio_phone_number: settings.twilioPhoneNumber,
    });
  } catch (error) {
    console.error('Backend: Erreur lors de la mise à jour des paramètres de l\'application:', error); // Nouveau log
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;