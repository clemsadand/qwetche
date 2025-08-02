// src/server.js - Point d'entrée principal
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { sequelize } = require('./models');
const redisClient = require('./config/redis');
const logger = require('./utils/logger');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration CORS pour Qwetche
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware de sécurité
app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // max 100 requests par IP
});
app.use('/api/', limiter);

// Parsing des données
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes API
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Qwetche API',
    version: '1.0.0'
  });
});

// Middleware de gestion d'erreurs
app.use(errorHandler);

// Démarrage du serveur
async function startServer() {
  try {
    // Test connexion PostgreSQL
    await sequelize.authenticate();
    logger.info('Connexion PostgreSQL établie avec succès');

    // Test connexion Redis
    await redisClient.ping();
    logger.info('Connexion Redis établie avec succès');

    // Synchronisation de la base de données
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('Synchronisation base de données effectuée');
    }

    app.listen(PORT, () => {
      logger.info(`🚀 Serveur Qwetche démarré sur le port ${PORT}`);
      logger.info(`📚 Documentation API: http://localhost:${PORT}/api/docs`);
    });
  } catch (error) {
    logger.error('Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

// Gestion des arrêts propres
process.on('SIGTERM', async () => {
  logger.info('SIGTERM reçu, arrêt en cours...');
  await sequelize.close();
  await redisClient.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT reçu, arrêt en cours...');
  await sequelize.close();
  await redisClient.disconnect();
  process.exit(0);
});

startServer();
