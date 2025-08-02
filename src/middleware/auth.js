
// src/middleware/auth.js - Middleware d'authentification
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const redisClient = require('../config/redis');
const { ApiError } = require('../utils/errors');

const JWT_SECRET = process.env.JWT_SECRET || 'qwetche_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Génération du token JWT
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Middleware de vérification du token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw new ApiError(401, 'Token d\'accès requis');
    }

    // Vérifier si le token est blacklisté
    const isBlacklisted = await redisClient.get(`blacklist_token:${token}`);
    if (isBlacklisted) {
      throw new ApiError(401, 'Token invalide');
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      throw new ApiError(401, 'Utilisateur non trouvé');
    }

    if (user.status === 'blocked' || user.status === 'suspended') {
      throw new ApiError(403, 'Compte suspendu');
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new ApiError(401, 'Token invalide'));
    }
    next(error);
  }
};


// Middleware de vérification des rôles
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentification requise'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Permissions insuffisantes'));
    }

    next();
  };
};

// Middleware de blocage automatique des collecteurs
const checkCollecteurStatus = async (req, res, next) => {
  try {
    if (req.user.role === 'collecteur') {
      const collecteur = await User.findByPk(req.user.id, {
        include: ['commissions']
      });

      // Vérifier les commissions en retard
      const now = new Date();
      const overdueCommissions = collecteur.commissions.filter(commission => {
        const dueDate = new Date(commission.due_date);
        return !commission.paid && now > dueDate;
      });

      if (overdueCommissions.length > 0) {
        // Bloquer le collecteur
        await collecteur.update({ status: 'blocked' });
        throw new ApiError(403, 'Compte bloqué pour commissions impayées');
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateToken,
  authenticateToken,
  requireRole,
  checkCollecteurStatus
};


