
// src/config/redis.js - Configuration Redis
const redis = require('redis');
const logger = require('../utils/logger');

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB || 0
});

redisClient.on('error', (err) => {
  logger.error('Erreur Redis:', err);
});

redisClient.on('connect', () => {
  logger.info('Connexion à Redis établie');
});

module.exports = redisClient;

