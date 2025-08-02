// src/services/emailService.js - Service d'envoi d'emails
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendVerificationEmail(email, token) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    const mailOptions = {
      from: `"Qwetche" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Vérification de votre compte Qwetche',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1F2937;">Bienvenue sur Qwetche ! 🎉</h2>
          <p>Merci de vous être inscrit sur notre plateforme de gestion des souscriptions tontine.</p>
          <p>Pour activer votre compte, veuillez cliquer sur le lien ci-dessous :</p>
          <a href="${verificationUrl}" 
             style="display: inline-block; background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
            Vérifier mon compte
          </a>
          <p>Ce lien expire dans 24 heures.</p>
          <p>Si vous n'avez pas créé de compte, ignorez cet email.</p>
          <hr>
          <p style="color: #6B7280; font-size: 12px;">© 2024 Qwetche - Plateforme de gestion des souscriptions</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Email de vérification envoyé à: ${email}`);
    } catch (error) {
      logger.error('Erreur envoi email de vérification:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email, token) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    const mailOptions = {
      from: `"Qwetche" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Réinitialisation de votre mot de passe',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1F2937;">Réinitialisation de mot de passe</h2>
          <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
          <p>Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :</p>
          <a href="${resetUrl}" 
             style="display: inline-block; background-color: #EF4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
            Réinitialiser mon mot de passe
          </a>
          <p>Ce lien expire dans 1 heure.</p>
          <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Email de réinitialisation envoyé à: ${email}`);
    } catch (error) {
      logger.error('Erreur envoi email de réinitialisation:', error);
      throw error;
    }
  }

  async sendAccountValidatedEmail(email, nomEntreprise) {
    const mailOptions = {
      from: `"Qwetche" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Votre compte collecteur a été validé ! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10B981;">Félicitations ! Votre compte est activé</h2>
          <p>Bonjour,</p>
          <p>Nous avons le plaisir de vous informer que votre demande d'inscription en tant que collecteur pour <strong>${nomEntreprise}</strong> a été approuvée.</p>
          <p>Vous pouvez maintenant :</p>
          <ul>
            <li>✅ Vous connecter à votre tableau de bord</li>
            <li>✅ Enregistrer vos premiers clients</li>
            <li>✅ Commencer à gérer les souscriptions</li>
          </ul>
          <a href="${process.env.FRONTEND_URL}/login" 
             style="display: inline-block; background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
            Accéder à mon tableau de bord
          </a>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Email de validation envoyé à: ${email}`);
    } catch (error) {
      logger.error('Erreur envoi email de validation:', error);
    }
  }
}

module.exports = new EmailService();

