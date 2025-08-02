
// src/controllers/dashboardController.js - Contrôleurs des dashboards
const { User, Client, Subscription, Cotisation, Commission, Payment } = require('../models');
const { Op } = require('sequelize');
const { ApiError } = require('../utils/errors');

class DashboardController {
  // Dashboard Collecteur
  async getCollecteurDashboard(req, res, next) {
    try {
      const collecteur_id = req.user.id;
      const { period = '30' } = req.query; // Période en jours
      
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - parseInt(period));

      // Statistiques de base
      const totalClients = await Client.count({
        where: { collecteur_id, status: 'active' }
      });

      const totalSubscriptions = await Subscription.count({
        where: { collecteur_id, status: 'active' }
      });

      // Commissions
      const commissions = await Commission.findAll({
        where: { collecteur_id },
        include: [{ model: Client, as: 'client', attributes: ['nom_complet', 'code_client'] }]
      });

      const commissionStats = {
        total: commissions.length,
        paid: commissions.filter(c => c.status === 'paid').length,
        pending: commissions.filter(c => c.status === 'pending').length,
        overdue: commissions.filter(c => c.isOverdue()).length,
        total_amount_due: commissions
          .filter(c => c.status !== 'paid')
          .reduce((sum, c) => sum + parseFloat(c.montant), 0)
      };

      // Cotisations récentes
      const recentCotisations = await Cotisation.findAll({
        where: {
          date_marquee: { [Op.gte]: dateFrom }
        },
        include: [{
          model: Subscription,
          as: 'subscription',
          where: { collecteur_id },
          include: [{
            model: Client,
            as: 'client',
            attributes: ['nom_complet', 'code_client']
          }]
        }],
        order: [['date_marquee', 'DESC']],
        limit: 10
      });

      // Clients en retard
      const lateClients = await this.getClientsWithLatePayments(collecteur_id);

      // Évolution mensuelle
      const monthlyEvolution = await this.getMonthlyEvolution(collecteur_id);

      res.json({
        success: true,
        data: {
          stats: {
            total_clients: totalClients,
            total_subscriptions: totalSubscriptions,
            commissions: commissionStats
          },
          recent_cotisations: recentCotisations,
          late_clients: lateClients.slice(0, 5),
          monthly_evolution: monthlyEvolution
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Dashboard Administrateur
  async getAdminDashboard(req, res, next) {
    try {
      const { period = '30' } = req.query;
      
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - parseInt(period));

      // Statistiques globales
      const totalCollecteurs = await User.count({
        where: { role: 'collecteur', status: 'active' }
      });

      const pendingCollecteurs = await User.count({
        where: { role: 'collecteur', status: 'pending' }
      });

      const totalClients = await Client.count({
        where: { status: 'active' }
      });

      const totalSubscriptions = await Subscription.count();

      // Revenus
      const totalCommissions = await Commission.sum('montant');
      const paidCommissions = await Commission.sum('montant', {
        where: { status: 'paid' }
      });

      // Activité récente
      const recentSignups = await User.findAll({
        where: {
          role: 'collecteur',
          created_at: { [Op.gte]: dateFrom }
        },
        attributes: ['nom_entreprise', 'email', 'status', 'created_at'],
        order: [['created_at', 'DESC']],
        limit: 10
      });

      // Top collecteurs
      const topCollecteurs = await this.getTopCollecteurs();

      // Statistiques par région/ville
      const regionStats = await this.getRegionStats();

      res.json({
        success: true,
        data: {
          stats: {
            total_collecteurs: totalCollecteurs,
            pending_collecteurs: pendingCollecteurs,
            total_clients: totalClients,
            total_subscriptions: totalSubscriptions,
            revenue: {
              total_commissions: totalCommissions || 0,
              paid_commissions: paidCommissions || 0,
              pending_commissions: (totalCommissions || 0) - (paidCommissions || 0)
            }
          },
          recent_signups: recentSignups,
          top_collecteurs: topCollecteurs,
          region_stats: regionStats
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Méthodes utilitaires
  async getClientsWithLatePayments(collecteur_id) {
    const today = new Date().toISOString().split('T')[0];

    return await Client.findAll({
      where: { collecteur_id },
      include: [{
        model: Subscription,
        as: 'subscriptions',
        where: { status: 'active' },
        include: [{
          model: Cotisation,
          as: 'cotisations',
          where: {
            status: 'pending',
            date_prevue: { [Op.lt]: today }
          }
        }]
      }],
      limit: 10
    });
  }

  async getMonthlyEvolution(collecteur_id) {
    // Évolution des 12 derniers mois
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const clientsCount = await Client.count({
        where: {
          collecteur_id,
          created_at: {
            [Op.between]: [monthStart, monthEnd]
          }
        }
      });

      const cotisationsSum = await Cotisation.sum('montant', {
        where: {
          status: 'paid',
          date_marquee: {
            [Op.between]: [monthStart, monthEnd]
          }
        },
        include: [{
          model: Subscription,
          as: 'subscription',
          where: { collecteur_id }
        }]
      });

      months.push({
        month: date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        clients: clientsCount,
        cotisations: cotisationsSum || 0
      });
    }

    return months;
  }

  async getTopCollecteurs() {
    return await User.findAll({
      where: { role: 'collecteur', status: 'active' },
      attributes: [
        'nom_entreprise',
        'email',
        [sequelize.fn('COUNT', sequelize.col('clients.id')), 'client_count'],
        [sequelize.fn('SUM', sequelize.col('commissions.montant')), 'total_commissions']
      ],
      include: [
        { model: Client, as: 'clients', attributes: [] },
        { model: Commission, as: 'commissions', attributes: [] }
      ],
      group: ['User.id'],
      order: [[sequelize.literal('client_count'), 'DESC']],
      limit: 10
    });
  }

  async getRegionStats() {
    // Analyser les emplacements physiques pour extraire les régions
    const collecteurs = await User.findAll({
      where: { role: 'collecteur', status: 'active' },
      attributes: ['emplacement_physique'],
      include: [{
        model: Client,
        as: 'clients',
        attributes: []
      }]
    });

    // Logique d'extraction des régions à partir des emplacements
    // Simplifiée pour l'exemple
    const regionMap = new Map();
    collecteurs.forEach(c => {
      const region = this.extractRegion(c.emplacement_physique);
      regionMap.set(region, (regionMap.get(region) || 0) + 1);
    });

    return Array.from(regionMap.entries()).map(([region, count]) => ({
      region,
      collecteurs_count: count
    }));
  }

  extractRegion(emplacement) {
    // Logique simplifiée d'extraction de région
    if (!emplacement) return 'Non spécifié';
    
    const emplacementLower = emplacement.toLowerCase();
    if (emplacementLower.includes('cotonou')) return 'Cotonou';
    if (emplacementLower.includes('porto-novo')) return 'Porto-Novo';
    if (emplacementLower.includes('parakou')) return 'Parakou';
    if (emplacementLower.includes('abomey')) return 'Abomey';
    
    return 'Autre';
  }
}

module.exports = new DashboardController();
