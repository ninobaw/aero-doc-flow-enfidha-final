import { Router } from 'express';
import { AppSettings } from '../models/AppSettings';
import { v4 as uuidv4 } from 'uuid';

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

  // Map frontend field names to backend schema names
  const mappedUpdates: any = {};
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

  try {
    const settings = await AppSettings.findOneAndUpdate(
      { userId },
      { $set: mappedUpdates },
      { new: true, upsert: true } // upsert: true creates the document if it doesn't exist
    );

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
    });
  } catch (error) {
    console.error('Error updating app settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;