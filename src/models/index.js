
// src/models/index.js - Configuration des modèles Sequelize
const { Sequelize } = require('sequelize');
const { sequelize } = require('../config/database');

// Import des modèles
const User = require('./User');
const Client = require('./Client');
const Subscription = require('./Subscription');
const Cotisation = require('./Cotisation');
const Commission = require('./Commission');
const Payment = require('./Payment');
const Notification = require('./Notification');

// Initialisation des modèles
const models = {
  User: User(sequelize, Sequelize.DataTypes),
  Client: Client(sequelize, Sequelize.DataTypes),
  Subscription: Subscription(sequelize, Sequelize.DataTypes),
  Cotisation: Cotisation(sequelize, Sequelize.DataTypes),
  Commission: Commission(sequelize, Sequelize.DataTypes),
  Payment: Payment(sequelize, Sequelize.DataTypes),
  Notification: Notification(sequelize, Sequelize.DataTypes)
};

// Association des modèles
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;

