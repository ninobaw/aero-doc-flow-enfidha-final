const nodemailer = require('nodemailer');
const { AppSettings } = require('../models/AppSettings.js');
const { User } = require('../models/User.js'); // Pour récupérer l'email de l'utilisateur

const sendEmail = async (userId, subject, text, html) => {
  console.log(`[EmailSender] Tentative d'envoi d'email pour userId: ${userId}, Sujet: ${subject}`);
  try {
    // Récupérer les paramètres globaux de l'application (le premier trouvé)
    const appSettings = await AppSettings.findOne({}); 
    if (!appSettings) {
      console.warn(`[EmailSender] AppSettings globaux non trouvés. L'envoi d'email est désactivé.`);
      return;
    }
    if (!appSettings.emailNotifications) {
      console.log(`[EmailSender] Notifications email désactivées dans les paramètres globaux.`);
      return;
    }

    const user = await User.findById(userId);
    if (!user || !user.email) {
      console.warn(`[EmailSender] Utilisateur ${userId} non trouvé ou n'a pas d'adresse email pour la notification.`);
      return;
    }

    const smtpHost = appSettings.smtpHost || process.env.SMTP_HOST;
    const smtpPort = appSettings.smtpPort || process.env.SMTP_PORT;
    const smtpUsername = appSettings.smtpUsername || process.env.SMTP_USERNAME;
    const smtpPassword = process.env.SMTP_PASSWORD; // Toujours depuis les variables d'environnement
    const useSsl = appSettings.useSsl ?? true;

    console.log(`[EmailSender] Paramètres SMTP: Host=${smtpHost}, Port=${smtpPort}, Username=${smtpUsername}, UseSSL=${useSsl}, Password_Defined=${!!smtpPassword}`);

    if (!smtpHost || !smtpPort || !smtpUsername || !smtpPassword) {
      console.error('[EmailSender] Les identifiants SMTP ne sont pas entièrement configurés dans AppSettings ou les variables d\'environnement.');
      return;
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: useSsl,
      auth: {
        user: smtpUsername,
        pass: smtpPassword,
      },
      tls: {
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