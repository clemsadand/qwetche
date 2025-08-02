
// src/controllers/clientController.js - Contrôleur des clients
const { Client, Subscription, Cotisation, User } = require('../models');
const { ApiError } = require('../utils/errors');
const notificationService = require('../services/notificationService');
const logger = require('../utils/logger');

class ClientController {
  // Créer un nouveau client
  async createClient(req, res, next) {
    try {
      const { nom_complet, telephone, email, preferences_notification } = req.body;
      const collecteur_id = req.user.id;

      // Vérifier si le numéro existe déjà
      let client = await Client.findOne({ where: { telephone } });
      
      if (client) {
        // Client existant - créer une nouvelle souscription
        return res.json({
          success: true,
          message: 'Client existant trouvé',
          data: {
            client,
            existing: true
          }
        });
      }

      // Créer un nouveau client
      client = await Client.create({
        nom_complet,
        telephone,
        email,
        collecteur_id,
        preferences_notification: preferences_notification || 'sms'
      });

      // Créer la commission pour le collecteur
      const { Commission } = require('../models');
      await Commission.create({
        collecteur_id,
        client_id: client.id,
        montant: 100.00
      });

      // Envoyer notification de bienvenue
      if (client.telephone && client.preferences_notification !== 'none') {
        await notificationService.sendWelcomeMessage(client);
      }

      logger.info(`Nouveau client créé: ${client.code_client} par collecteur ${collecteur_id}`);

      res.status(201).json({
        success: true,
        message: 'Client créé avec succès',
        data: { client }
      });
    } catch (error) {
      next(error);
    }
  }

  // Récupérer les clients du collecteur
  async getClients(req, res, next) {
    try {
      const collecteur_id = req.user.id;
      const { page = 1, limit = 20, search, status } = req.query;

      const whereClause = { collecteur_id };
      
      if (search) {
        whereClause[Op.or] = [
          { nom_complet: { [Op.iLike]: `%${search}%` } },
          { code_client: { [Op.iLike]: `%${search}%` } },
          { telephone: { [Op.iLike]: `%${search}%` } }
        ];
      }
      
      if (status) {
        whereClause.status = status;
      }

      const clients = await Client.findAndCountAll({
        where: whereClause,
        include: [{
          model: Subscription,
          as: 'subscriptions',
          include: [{
            model: Cotisation,
            as: 'cotisations'
          }]
        }],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          clients: clients.rows,
          pagination: {
            current_page: parseInt(page),
            total_pages: Math.ceil(clients.count / parseInt(limit)),
            total_items: clients.count,
            items_per_page: parseInt(limit)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Récupérer un client par son code
  async getClientByCode(req, res, next) {
    try {
      const { code } = req.params;

      const client = await Client.findOne({
        where: { code_client: code },
        include: [{
          model: Subscription,
          as: 'subscriptions',
          include: [{
            model: Cotisation,
            as: 'cotisations',
            order: [['jour_numero', 'ASC']]
          }]
        }, {
          model: User,
          as: 'collecteur',
          attributes: ['nom_entreprise', 'email']
        }]
      });

      if (!client) {
        throw new ApiError(404, 'Client non trouvé');
      }

      res.json({
        success: true,
        data: { client }
      });
    } catch (error) {
      next(error);
    }
  }

  // Mettre à jour un client
  async updateClient(req, res, next) {
    try {
      const { id } = req.params;
      const { nom_complet, email, preferences_notification } = req.body;
      const collecteur_id = req.user.id;

      const client = await Client.findOne({
        where: { id, collecteur_id }
      });

      if (!client) {
        throw new ApiError(404, 'Client non trouvé');
      }

      await client.update({
        nom_complet,
        email,
        preferences_notification
      });

      logger.info(`Client mis à jour: ${client.code_client}`);

      res.json({
        success: true,
        message: 'Client mis à jour avec succès',
        data: { client }
      });
    } catch (error) {
      next(error);
    }
  }

  // Dashboard client
  async getClientDashboard(req, res, next) {
    try {
      const { code } = req.params;

      const client = await Client.findOne({
        where: { code_client: code },
        include: [{
          model: Subscription,
          as: 'subscriptions',
          where: { status: 'active' },
          required: false,
          include: [{
            model: Cotisation,
            as: 'cotisations',
            order: [['jour_numero', 'ASC']]
          }]
        }]
      });

      if (!client) {
        throw new ApiError(404, 'Client non trouvé');
      }

      // Calculer les statistiques
      const stats = {
        total_subscriptions: client.subscriptions.length,
        total_cotisations: 0,
        total_amount: 0,
        late_payments: 0,
        current_progress: []
      };

      client.subscriptions.forEach(subscription => {
        const progress = subscription.calculateProgress();
        stats.current_progress.push({
          subscription_id: subscription.id,
          type_cycle: subscription.type_cycle,
          progress: progress
        });

        subscription.cotisations.forEach(cotisation => {
          if (cotisation.status === 'paid') {
            stats.total_cotisations++;
            stats.total_amount += parseFloat(cotisation.montant);
          } else if (cotisation.isLate()) {
            stats.late_payments++;
          }
        });
      });

      res.json({
        success: true,
        data: {
          client,
          stats
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ClientController();

