const nodemailer = require('nodemailer');
const { AppSettings } = require('../models/AppSettings.js');
const { User } = require('../models/User.js'); // Pour récupérer l'email de l'utilisateur

const sendEmail = async (userId, subject, text, html) => {
  console.log(`[EmailSender] Tentative d'envoi d'email pour userId: ${userId}, Sujet: ${subject}`);
  try {
    // Récupérer les paramètres de l'application spécifiques à cet utilisateur
    const appSettings = await AppSettings.findOne({ userId }); 
    if (!appSettings) {
      console.warn(`[EmailSender] AppSettings non trouvés pour l'utilisateur ${userId}. L'envoi d'email est désactivé.`);
      return;
    }
    if (!appSettings.emailNotifications) {
      console.log(`[EmailSender] Notifications email désactivées pour l'utilisateur ${userId}.`);
      return;
    }

    const user = await User.findById(userId);
    if (!user || !user.email) {
      console.warn(`[EmailSender] Utilisateur ${userId} non trouvé ou n'a pas d'adresse email pour la notification.`);
      return;
    }

    const smtpHost = appSettings.smtpHost || process.env.SMTP_HOST;
    const smtpPort = appSettings.smtpPort || parseInt(process.env.SMTP_PORT || '587'); // Ensure port is a number
    const smtpUsername = appSettings.smtpUsername || process.env.SMTP_USERNAME;
    const smtpPassword = process.env.SMTP_PASSWORD; // Toujours depuis les variables d'environnement
    const useSsl = appSettings.useSsl ?? true; // Default to true if not set

    console.log(`[EmailSender] Paramètres SMTP: Host=${smtpHost}, Port=${smtpPort}, Username=${smtpUsername}, UseSSL=${useSsl}, Password_Defined=${!!smtpPassword}`);

    if (!smtpHost || !smtpPort || !smtpUsername || !smtpPassword) {
      console.error('[EmailSender] Les identifiants SMTP ne sont pas entièrement configurés dans AppSettings ou les variables d\'environnement.');
      console.error(`[EmailSender] Détails: Host=${smtpHost}, Port=${smtpPort}, Username=${smtpUsername}, Password_Defined=${!!smtpPassword}`);
      return;
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465 || (smtpPort === 443 && useSsl), // Use 'secure: true' for port 465 or if port 443 and useSsl is true
      requireTLS: smtpPort === 587, // Use STARTTLS for port 587
      auth: {
        user: smtpUsername,
        pass: smtpPassword,
      },
      tls: {
        // This is crucial for self-signed certs or non-standard setups.
        // For Office 365, it might not be strictly needed if certs are valid.
        // But if port 443 is used, it might be a custom setup.
        rejectUnauthorized: false, // Keep this for now as it helps with various server configurations
      },
    });

    const mailOptions = {
      from: `"${appSettings.companyName || 'AeroDoc'}" <${smtpUsername}>`,
      to: user.email,
      subject: subject,
      text: text,
      html: html,
    };

    console.log(`[EmailSender] Envoi de l'email à: ${user.email}, From: ${mailOptions.from}, Sujet: ${subject}`);
    await transporter.sendMail(mailOptions);
    console.log(`[EmailSender] Email envoyé avec succès à ${user.email} pour l'utilisateur ${userId}. Sujet: ${subject}`);
  } catch (error) {
    console.error(`[EmailSender] Erreur lors de l'envoi de l'email à l'utilisateur ${userId}:`, error.message);
    if (error.response) {
      console.error('[EmailSender] Réponse d\'erreur SMTP:', error.response);
    }
  }
};

module.exports = { sendEmail };