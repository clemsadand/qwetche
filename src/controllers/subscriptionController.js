
// src/controllers/subscriptionController.js - Contrôleur des souscriptions
const { Subscription, Client, Cotisation, Commission } = require('../models');
const { ApiError } = require('../utils/errors');
const logger = require('../utils/logger');

class SubscriptionController {
  // Créer une nouvelle souscription
  async createSubscription(req, res, next) {
    try {
      const {
        client_id,
        type_cycle,
        montant_journalier,
        date_debut
      } = req.body;
      const collecteur_id = req.user.id;

      // Vérifier que le client appartient au collecteur
      const client = await Client.findOne({
        where: { id: client_id, collecteur_id }
      });

      if (!client) {
        throw new ApiError(404, 'Client non trouvé');
      }

      // Créer la souscription
      const subscription = await Subscription.create({
        client_id,
        collecteur_id,
        type_cycle,
        montant_journalier,
        date_debut: date_debut || new Date().toISOString().split('T')[0]
      });

      // Créer les cotisations pour tous les jours du cycle
      const cotisations = [];
      const dateDebut = new Date(subscription.date_debut);
      
      for (let i = 1; i <= subscription.nombre_jours_total; i++) {
        const datePrevue = new Date(dateDebut);
        datePrevue.setDate(datePrevue.getDate() + i - 1);
        
        cotisations.push({
          subscription_id: subscription.id,
          jour_numero: i,
          date_prevue: datePrevue.toISOString().split('T')[0],
          montant: subscription.montant_journalier
        });
      }

      await Cotisation.bulkCreate(cotisations);

      // Créer la commission si c'est une nouvelle inscription
      const existingCommission = await Commission.findOne({
        where: { collecteur_id, client_id }
      });

      if (!existingCommission) {
        await Commission.create({
          collecteur_id,
          client_id,
          subscription_id: subscription.id,
          montant: 100.00
        });
      }

      logger.info(`Nouvelle souscription créée: ${subscription.id}`);

      res.status(201).json({
        success: true,
        message: 'Souscription créée avec succès',
        data: { subscription }
      });
    } catch (error) {
      next(error);
    }
  }

  // Récupérer les souscriptions
  async getSubscriptions(req, res, next) {
    try {
      const collecteur_id = req.user.id;
      const { client_id, status, page = 1, limit = 20 } = req.query;

      const whereClause = { collecteur_id };
      if (client_id) whereClause.client_id = client_id;
      if (status) whereClause.status = status;

      const subscriptions = await Subscription.findAndCountAll({
        where: whereClause,
        include: [{
          model: Client,
          as: 'client',
          attributes: ['code_client', 'nom_complet', 'telephone']
        }, {
          model: Cotisation,
          as: 'cotisations',
          attributes: ['status', 'montant'],
          required: false
        }],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        order: [['created_at', 'DESC']]
      });

      // Calculer les statistiques pour chaque souscription
      const subscriptionsWithStats = subscriptions.rows.map(sub => {
        const progress = sub.calculateProgress();
        return {
          ...sub.toJSON(),
          progress
        };
      });

      res.json({
        success: true,
        data: {
          subscriptions: subscriptionsWithStats,
          pagination: {
            current_page: parseInt(page),
            total_pages: Math.ceil(subscriptions.count / parseInt(limit)),
            total_items: subscriptions.count
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Récupérer une souscription par ID
  async getSubscriptionById(req, res, next) {
    try {
      const { id } = req.params;
      const collecteur_id = req.user.id;

      const subscription = await Subscription.findOne({
        where: { id, collecteur_id },
        include: [{
          model: Client,
          as: 'client'
        }, {
          model: Cotisation,
          as: 'cotisations',
          order: [['jour_numero', 'ASC']]
        }]
      });

      if (!subscription) {
        throw new ApiError(404, 'Souscription non trouvée');
      }

      // Ajouter les statistiques
      const progress = subscription.calculateProgress();
      const subscriptionData = {
        ...subscription.toJSON(),
        progress
      };

      res.json({
        success: true,
        data: { subscription: subscriptionData }
      });
    } catch (error) {
      next(error);
    }
  }

  // Mettre à jour une souscription
  async updateSubscription(req, res, next) {
    try {
      const { id } = req.params;
      const { montant_journalier, status } = req.body;
      const collecteur_id = req.user.id;

      const subscription = await Subscription.findOne({
        where: { id, collecteur_id }
      });

      if (!subscription) {
        throw new ApiError(404, 'Souscription non trouvée');
      }

      // Mise à jour
      const updates = {};
      if (montant_journalier !== undefined) {
        updates.montant_journalier = montant_journalier;
        updates.montant_total_prevu = montant_journalier * subscription.nombre_jours_total;
      }
      if (status !== undefined) updates.status = status;

      await subscription.update(updates);

      // Si le montant journalier a changé, mettre à jour les cotisations
      if (montant_journalier !== undefined) {
        await Cotisation.update(
          { montant: montant_journalier },
          { where: { subscription_id: id, status: 'pending' } }
        );
      }

      logger.info(`Souscription mise à jour: ${id}`);

      res.json({
        success: true,
        message: 'Souscription mise à jour avec succès',
        data: { subscription }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SubscriptionController();

