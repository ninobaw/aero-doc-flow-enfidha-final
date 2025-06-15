const nodemailer = require('nodemailer');
const { AppSettings } = require('../models/AppSettings.js');
const { User } = require('../models/User.js'); // Pour récupérer l'email de l'utilisateur

const sendEmail = async (userId, subject, text, html) => {
  try {
    const appSettings = await AppSettings.findOne({ userId });
    if (!appSettings || !appSettings.emailNotifications) {
      console.log(`Email notifications are disabled for user ${userId} or settings not found.`);
      return;
    }

    const user = await User.findById(userId);
    if (!user || !user.email) {
      console.warn(`User ${userId} not found or has no email for notification.`);
      return;
    }

    const smtpHost = appSettings.smtpHost || process.env.SMTP_HOST;
    const smtpPort = appSettings.smtpPort || process.env.SMTP_PORT;
    const smtpUsername = appSettings.smtpUsername || process.env.SMTP_USERNAME;
    const smtpPassword = process.env.SMTP_PASSWORD; // Always from environment variable for security
    const useSsl = appSettings.useSsl ?? true;

    if (!smtpHost || !smtpPort || !smtpUsername || !smtpPassword) {
      console.error('SMTP credentials are not fully configured in AppSettings or environment variables.');
      return;
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: useSsl, // true for 465, false for other ports like 587
      auth: {
        user: smtpUsername,
        pass: smtpPassword,
      },
      tls: {
        // Do not fail on invalid certs, useful for self-signed certs in dev
        // In production, you should remove this or set to true if you have valid certs
        rejectUnauthorized: false, 
      },
    });

    const mailOptions = {
      from: `"${appSettings.companyName || 'AeroDoc'}" <${smtpUsername}>`,
      to: user.email,
      subject: subject,
      text: text,
      html: html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${user.email} for user ${userId}. Subject: ${subject}`);
  } catch (error) {
    console.error(`Error sending email to user ${userId}:`, error.message);
  }
};

module.exports = { sendEmail };