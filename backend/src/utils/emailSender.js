const nodemailer = require('nodemailer');
const { AppSettings } = require('../models/AppSettings.js');
const { User } = require('../models/User.js'); // Pour récupérer l'email de l'utilisateur

const sendEmail = async (recipientUserId, subject, text, html) => {
  console.log(`[EmailSender] Tentative d'envoi d'email pour userId: ${recipientUserId}, Sujet: ${subject}`);
  try {
    // 1. Récupérer les détails de l'utilisateur destinataire
    const recipientUser = await User.findById(recipientUserId);
    if (!recipientUser || !recipientUser.email) {
      console.warn(`[EmailSender] Utilisateur destinataire ${recipientUserId} non trouvé ou n'a pas d'adresse email pour la notification.`);
      return;
    }

    // 2. Récupérer les préférences de notification personnelles du destinataire
    const recipientAppSettings = await AppSettings.findOne({ userId: recipientUserId });
    if (recipientAppSettings && !recipientAppSettings.emailNotifications) {
      console.log(`[EmailSender] Notifications email désactivées pour l'utilisateur destinataire ${recipientUserId}.`);
      return;
    }

    // 3. Trouver la configuration SMTP globale/administrateur
    // Chercher les AppSettings d'un SUPER_ADMIN ou ADMINISTRATOR pour obtenir la configuration SMTP
    let senderAppSettings = null;
    const adminUsers = await User.find({ role: { $in: ['SUPER_ADMIN', 'ADMINISTRATOR'] } });
    for (const adminUser of adminUsers) {
      const settings = await AppSettings.findOne({ userId: adminUser._id });
      if (settings && settings.smtpHost && settings.smtpUsername && settings.smtpPort) {
        senderAppSettings = settings;
        break; // On a trouvé une configuration d'expéditeur valide
      }
    }

    // Utiliser les paramètres trouvés ou les variables d'environnement comme fallback
    const smtpHost = senderAppSettings?.smtpHost || process.env.SMTP_HOST;
    const smtpPort = senderAppSettings?.smtpPort || parseInt(process.env.SMTP_PORT || '587'); // S'assurer que le port est un nombre
    const smtpUsername = senderAppSettings?.smtpUsername || process.env.SMTP_USERNAME;
    const useSsl = senderAppSettings?.useSsl ?? true; // Par défaut à true si non défini

    const smtpPassword = process.env.SMTP_PASSWORD; // Toujours depuis les variables d'environnement pour la sécurité

    console.log(`[EmailSender] Paramètres SMTP utilisés: Host=${smtpHost}, Port=${smtpPort}, Username=${smtpUsername}, UseSSL=${useSsl}, Password_Defined=${!!smtpPassword}`);

    if (!smtpHost || !smtpPort || !smtpUsername || !smtpPassword) {
      console.error('[EmailSender] Les identifiants SMTP ne sont pas entièrement configurés dans les AppSettings d\'un administrateur ou dans les variables d\'environnement.');
      console.error(`[EmailSender] Détails: Host=${smtpHost}, Port=${smtpPort}, Username=${smtpUsername}, Password_Defined=${!!smtpPassword}`);
      return;
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465 || (smtpPort === 443 && useSsl), // Utiliser 'secure: true' pour le port 465 ou si port 443 et useSsl est true
      requireTLS: smtpPort === 587, // Utiliser STARTTLS pour le port 587
      auth: {
        user: smtpUsername,
        pass: smtpPassword,
      },
      tls: {
        rejectUnauthorized: false, // Utile pour les certificats auto-signés ou configurations non standard
      },
    });

    // Utiliser le nom de l'entreprise configuré par l'expéditeur (admin) ou un nom par défaut
    const fromName = senderAppSettings?.companyName || 'AeroDoc';
    const fromEmail = smtpUsername; // L'utilisateur SMTP est généralement l'adresse d'envoi

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: recipientUser.email,
      subject: subject,
      text: text,
      html: html,
    };

    console.log(`[EmailSender] Envoi de l'email à: ${recipientUser.email}, From: ${mailOptions.from}, Sujet: ${subject}`);
    await transporter.sendMail(mailOptions);
    console.log(`[EmailSender] Email envoyé avec succès à ${recipientUser.email} pour l'utilisateur ${recipientUserId}. Sujet: ${subject}`);
  } catch (error) {
    console.error(`[EmailSender] Erreur lors de l'envoi de l'email à l'utilisateur ${recipientUserId}:`, error.message);
    if (error.response) {
      console.error('[EmailSender] Réponse d\'erreur SMTP:', error.response);
    }
  }
};

module.exports = { sendEmail };