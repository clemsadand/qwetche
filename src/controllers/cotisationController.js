
// src/controllers/cotisationController.js - Contrôleur des cotisations
const { Cotisation, Subscription, Client } = require('../models');
const { ApiError } = require('../utils/errors');
const notificationService = require('../services/notificationService');
const logger = require('../utils/logger');

class CotisationController {
  // Marquer des cotisations
  async markCotisations(req, res, next) {
    try {
      const { subscription_id, jours } = req.body; // jours = array des numéros de jours
      const collecteur_id = req.user.id;

      // Vérifier la souscription
      const subscription = await Subscription.findOne({
        where: { id: subscription_id, collecteur_id },
        include: [{ model: Client, as: 'client' }]
      });

      if (!subscription) {
        throw new ApiError(404, 'Souscription non trouvée');
      }

      // Récupérer les cotisations à marquer
      const cotisations = await Cotisation.findAll({
        where: {
          subscription_id,
          jour_numero: jours,
          status: 'pending'
        }
      });

      if (cotisations.length === 0) {
        throw new ApiError(400, 'Aucune cotisation en attente trouvée pour ces jours');
      }

      // Marquer les cotisations
      const now = new Date();
      await Promise.all(cotisations.map(cotisation => 
        cotisation.update({
          status: 'paid',
          date_marquee: now,
          marked_by: collecteur_id
        })
      ));

      // Mettre à jour les statistiques de la souscription
      const totalPaid = await Cotisation.count({
        where: { subscription_id, status: 'paid' }
      });

      const totalAmount = await Cotisation.sum('montant', {
        where: { subscription_id, status: 'paid' }
      });

      await subscription.update({
        jours_cotises: totalPaid,
        montant_cotise: totalAmount || 0
      });

      // Vérifier si la souscription est complète
      if (subscription.isCompleted()) {
        await subscription.update({ status: 'completed' });
        
        // Envoyer notification de félicitations
        await notificationService.sendCompletionNotification(subscription.client);
      }

      // Envoyer notifications
      if (cotisations.length === 1) {
        await notificationService.sendCotisationConfirmation(
          subscription.client,
          cotisations[0]
        );
      } else {
        await notificationService.sendMultipleCotisationsConfirmation(
          subscription.client,
          cotisations
        );
      }

      logger.info(`Cotisations marquées: ${cotisations.length} pour souscription ${subscription_id}`);

      res.json({
        success: true,
        message: `${cotisations.length} cotisation(s) marquée(s) avec succès`,
        data: {
          marked_cotisations: cotisations.length,
          subscription_progress: subscription.calculateProgress()
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Récupérer les cotisations d'une souscription
  async getCotisationsBySubscription(req, res, next) {
    try {
      const { subscription_id } = req.params;
      const collecteur_id = req.user.id;

      // Vérifier l'accès
      const subscription = await Subscription.findOne({
        where: { id: subscription_id, collecteur_id }
      });

      if (!subscription) {
        throw new ApiError(404, 'Souscription non trouvée');
      }

      const cotisations = await Cotisation.findAll({
        where: { subscription_id },
        order: [['jour_numero', 'ASC']]
      });

      // Calculer les statistiques
      const stats = {
        total: cotisations.length,
        paid: cotisations.filter(c => c.status === 'paid').length,
        pending: cotisations.filter(c => c.status === 'pending').length,
        late: cotisations.filter(c => c.isLate()).length,
        total_amount: cotisations
          .filter(c => c.status === 'paid')
          .reduce((sum, c) => sum + parseFloat(c.montant), 0)
      };

      res.json({
        success: true,
        data: {
          cotisations,
          stats
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Récupérer les cotisations en retard
  async getLateCotisations(req, res, next) {
    try {
      const collecteur_id = req.user.id;
      const { page = 1, limit = 20 } = req.query;

      const today = new Date().toISOString().split('T')[0];

      const lateCotisations = await Cotisation.findAndCountAll({
        where: {
          status: 'pending',
          date_prevue: { [Op.lt]: today }
        },
        include: [{
          model: Subscription,
          as: 'subscription',
          where: { collecteur_id },
          include: [{
            model: Client,
            as: 'client',
            attributes: ['code_client', 'nom_complet', 'telephone']
          }]
        }],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        order: [['date_prevue', 'ASC']]
      });

      // Ajouter le nombre de jours de retard
      const cotisationsWithDelay = lateCotisations.rows.map(cotisation => ({
        ...cotisation.toJSON(),
        days_late: cotisation.getDaysLate()
      }));

      res.json({
        success: true,
        data: {
          late_cotisations: cotisationsWithDelay,
          pagination: {
            current_page: parseInt(page),
            total_pages: Math.ceil(lateCotisations.count / parseInt(limit)),
            total_items: lateCotisations.count
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Annuler une cotisation marquée
  async unmarkCotisation(req, res, next) {
    try {
      const { id } = req.params;
      const collecteur_id = req.user.id;

      const cotisation = await Cotisation.findOne({
        where: { id },
        include: [{
          model: Subscription,
          as: 'subscription',
          where: { collecteur_id }
        }]
      });

      if (!cotisation) {
        throw new ApiError(404, 'Cotisation non trouvée');
      }

      if (cotisation.status !== 'paid') {
        throw new ApiError(400, 'Cette cotisation n\'est pas marquée comme payée');
      }

      // Annuler le marquage
      await cotisation.update({
        status: 'pending',
        date_marquee: null,
        marked_by: null
      });

      // Mettre à jour les statistiques de la souscription
      const subscription = cotisation.subscription;
      const totalPaid = await Cotisation.count({
        where: { subscription_id: subscription.id, status: 'paid' }
      });

      const totalAmount = await Cotisation.sum('montant', {
        where: { subscription_id: subscription.id, status: 'paid' }
      });

      await subscription.update({
        jours_cotises: totalPaid,
        montant_cotise: totalAmount || 0,
        status: 'active' // Remettre en actif si c'était complété
      });

      logger.info(`Cotisation annulée: ${id}`);

      res.json({
        success: true,
        message: 'Cotisation annulée avec succès'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CotisationController();
