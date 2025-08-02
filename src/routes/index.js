// src/routes/index.js - Routes principales
const express = require('express');
const router = express.Router();

// Import des routes
const authRoutes = require('./auth');
const collecteurRoutes = require('./collecteurs');
const clientRoutes = require('./clients');
const subscriptionRoutes = require('./subscriptions');
const cotisationRoutes = require('./cotisations');
const paymentRoutes = require('./payments');
const dashboardRoutes = require('./dashboard');
const adminRoutes = require('./admin');

// Documentation Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../docs/swagger.json');

// Routes API
router.use('/auth', authRoutes);
router.use('/collecteurs', collecteurRoutes);
router.use('/clients', clientRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/cotisations', cotisationRoutes);
router.use('/payments', paymentRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/admin', adminRoutes);

// Documentation
router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check détaillé
router.get('/health', async (req, res) => {
  try {
    const { sequelize } = require('../models');
    const redisClient = require('../config/redis');
    
    // Test base de données
    await sequelize.authenticate();
    
    // Test Redis
    await redisClient.ping();
    
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      services: {
        database: 'Connected',
        redis: 'Connected',
        api: 'Running'
      },
      version: '1.0.0'
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

module.exports = router;

