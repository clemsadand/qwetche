
// src/controllers/authController.js - Contrôleur d'authentification
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');
const { User } = require('../models');
const redisClient = require('../config/redis');
const { generateToken } = require('../middleware/auth');
const { ApiError } = require('../utils/errors');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

class AuthController {
  // Inscription des collecteurs
  async register(req, res, next) {
    try {
      const {
        email,
        password,
        nom_entreprise,
        numero_registre_commerce,
        emplacement_physique,
        phone
      } = req.body;

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new ApiError(400, 'Un compte avec cet email existe déjà');
      }

      // Vérifier l'unicité du registre de commerce
      if (numero_registre_commerce) {
        const existingRegistre = await User.findOne({
          where: { numero_registre_commerce }
        });
        if (existingRegistre) {
          throw new ApiError(400, 'Ce numéro de registre de commerce est déjà utilisé');
        }
      }

      // Générer un token de vérification
      const verificationToken = crypto.randomBytes(32).toString('hex');

      // Créer l'utilisateur
      const user = await User.create({
        email,
        password,
        nom_entreprise,
        numero_registre_commerce,
        emplacement_physique,
        phone,
        role: 'collecteur',
        status: 'pending',
        verification_token: verificationToken
      });

      // Envoyer l'email de vérification
      await emailService.sendVerificationEmail(user.email, verificationToken);

      logger.info(`Nouvelle demande d'inscription collecteur: ${email}`);

      res.status(201).json({
        success: true,
        message: 'Demande d\'inscription soumise avec succès. Vérifiez votre email.',
        data: {
          user_id: user.id,
          email: user.email,
          status: user.status
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Connexion
  async login(req, res, next) {
    try {
      const { email, password, otp } = req.body;

      // Trouver l'utilisateur
      const user = await User.findOne({ where: { email } });
      if (!user) {
        throw new ApiError(401, 'Email ou mot de passe incorrect');
      }

      // Vérifier si le compte est verrouillé
      if (user.isAccountLocked()) {
        throw new ApiError(423, 'Compte temporairement verrouillé. Réessayez plus tard.');
      }

      // Vérifier le mot de passe
      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        await user.incrementLoginAttempts();
        throw new ApiError(401, 'Email ou mot de passe incorrect');
      }

      // Vérifier le statut du compte
      if (user.status === 'pending') {
        throw new ApiError(403, 'Compte en attente de validation');
      }
      if (user.status === 'rejected') {
        throw new ApiError(403, 'Demande d\'inscription rejetée');
      }
      if (user.status === 'blocked') {
        throw new ApiError(403, 'Compte bloqué pour commissions impayées');
      }

      // Vérifier l'email
      if (!user.email_verified) {
        throw new ApiError(403, 'Veuillez vérifier votre email avant de vous connecter');
      }

      // Vérification 2FA si activée
      if (user.two_factor_enabled) {
        if (!otp) {
          return res.status(200).json({
            success: true,
            requires_2fa: true,
            message: 'Code OTP requis'
          });
        }

        const verified = speakeasy.totp.verify({
          secret: user.two_factor_secret,
          encoding: 'base32',
          token: otp,
          window: 2
        });

        if (!verified) {
          throw new ApiError(401, 'Code OTP invalide');
        }
      }

      // Réinitialiser les tentatives de connexion
      await user.update({
        login_attempts: 0,
        locked_until: null,
        last_login: new Date()
      });

      // Générer le token
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role
      });

      // Sauvegarder le token en Redis (pour la session)
      await redisClient.setEx(`user_session:${user.id}`, 86400, token);

      logger.info(`Connexion réussie: ${email}`);

      res.json({
        success: true,
        message: 'Connexion réussie',
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            nom_entreprise: user.nom_entreprise,
            status: user.status,
            two_factor_enabled: user.two_factor_enabled
          },
          token,
          expires_in: '24h'
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Déconnexion
  async logout(req, res, next) {
    try {
      const { user, token } = req;

      // Blacklister le token
      await redisClient.setEx(`blacklist_token:${token}`, 86400, 'true');

      // Supprimer la session
      await redisClient.del(`user_session:${user.id}`);

      logger.info(`Déconnexion: ${user.email}`);

      res.json({
        success: true,
        message: 'Déconnexion réussie'
      });
    } catch (error) {
      next(error);
    }
  }

  // Vérification de l'email
  async verifyEmail(req, res, next) {
    try {
      const { token } = req.body;

      if (!token) {
        throw new ApiError(400, 'Token de vérification requis');
      }

      const user = await User.findOne({
        where: { verification_token: token }
      });

      if (!user) {
        throw new ApiError(400, 'Token de vérification invalide ou expiré');
      }

      await user.update({
        email_verified: true,
        verification_token: null
      });

      logger.info(`Email vérifié: ${user.email}`);

      res.json({
        success: true,
        message: 'Email vérifié avec succès'
      });
    } catch (error) {
      next(error);
    }
  }

  // Activation de la 2FA
  async enable2FA(req, res, next) {
    try {
      const { user } = req;

      if (user.two_factor_enabled) {
        throw new ApiError(400, '2FA déjà activée');
      }

      // Générer un secret
      const secret = speakeasy.generateSecret({
        name: `Qwetche (${user.email})`,
        issuer: 'Qwetche'
      });

      // Générer le QR code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

      // Sauvegarder temporairement le secret
      await redisClient.setEx(`temp_2fa_secret:${user.id}`, 300, secret.base32);

      res.json({
        success: true,
        data: {
          secret: secret.base32,
          qr_code: qrCodeUrl,
          manual_entry_key: secret.base32
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Vérification 2FA
  async verify2FA(req, res, next) {
    try {
      const { user_id, token } = req.body;

      if (!user_id || !token) {
        throw new ApiError(400, 'ID utilisateur et token requis');
      }

      // Récupérer le secret temporaire
      const secret = await redisClient.get(`temp_2fa_secret:${user_id}`);
      if (!secret) {
        throw new ApiError(400, 'Session 2FA expirée');
      }

      // Vérifier le token
      const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 2
      });

      if (!verified) {
        throw new ApiError(400, 'Code invalide');
      }

      // Activer la 2FA
      await User.update(
        {
          two_factor_enabled: true,
          two_factor_secret: secret
        },
        { where: { id: user_id } }
      );

      // Supprimer le secret temporaire
      await redisClient.del(`temp_2fa_secret:${user_id}`);

      res.json({
        success: true,
        message: '2FA activée avec succès'
      });
    } catch (error) {
      next(error);
    }
  }

  // Mot de passe oublié
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        // Pour la sécurité, on ne révèle pas si l'email existe
        return res.json({
          success: true,
          message: 'Si cet email existe, vous recevrez un lien de réinitialisation'
        });
      }

      // Générer un token de réinitialisation
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // Sauvegarder le token avec expiration (1 heure)
      await redisClient.setEx(`reset_token:${resetToken}`, 3600, user.id);

      // Envoyer l'email
      await emailService.sendPasswordResetEmail(user.email, resetToken);

      logger.info(`Demande de réinitialisation mot de passe: ${email}`);

      res.json({
        success: true,
        message: 'Si cet email existe, vous recevrez un lien de réinitialisation'
      });
    } catch (error) {
      next(error);
    }
  }

  // Réinitialisation du mot de passe
  async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        throw new ApiError(400, 'Token et nouveau mot de passe requis');
      }

      // Vérifier le token
      const userId = await redisClient.get(`reset_token:${token}`);
      if (!userId) {
        throw new ApiError(400, 'Token invalide ou expiré');
      }

      // Mettre à jour le mot de passe
      await User.update(
        { password },
        { where: { id: userId } }
      );

      // Supprimer le token
      await redisClient.del(`reset_token:${token}`);

      // Invalider toutes les sessions de l'utilisateur
      await redisClient.del(`user_session:${userId}`);

      logger.info(`Mot de passe réinitialisé pour l'utilisateur: ${userId}`);

      res.json({
        success: true,
        message: 'Mot de passe réinitialisé avec succès'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();

