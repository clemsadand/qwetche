
// src/services/notificationService.js - Service de notifications
const { Notification } = require('../models');
const emailService = require('./emailService');
const smsService = require('./smsService');
const logger = require('../utils/logger');

class NotificationService {
  // Notification de bienvenue pour nouveau client
  async sendWelcomeMessage(client) {
    try {
      const message = `🎉 Bienvenue chez Qwetche ! Votre code client est : ${client.code_client}. Conservez-le précieusement pour suivre vos souscriptions.`;
      
      if (client.preferences_notification === 'sms' || client.preferences_notification === 'both') {
        await this.sendSMS(client.telephone, message);
      }
      
      if ((client.preferences_notification === 'email' || client.preferences_notification === 'both') && client.email) {
        await this.sendEmail(client.email, 'Bienvenue chez Qwetche !', message);
      }

      // Enregistrer la notification
      await Notification.create({
        client_id: client.id,
        type: 'welcome',
        channel: client.preferences_notification,
        title: 'Bienvenue',
        message,
        status: 'sent'
      });

      logger.info(`Notification de bienvenue envoyée au client: ${client.code_client}`);
    } catch (error) {
      logger.error('Erreur envoi notification bienvenue:', error);
    }
  }

  // Confirmation de cotisation marquée
  async sendCotisationConfirmation(client, cotisation) {
    try {
      const message = `✅ Votre cotisation du ${cotisation.date_prevue} (${cotisation.montant} FCFA) a été enregistrée avec succès. Code: ${client.code_client}`;
      
      await this.sendNotificationToClient(client, {
        type: 'cotisation_marked',
        title: 'Cotisation enregistrée',
        message,
        data: { cotisation_id: cotisation.id }
      });
    } catch (error) {
      logger.error('Erreur confirmation cotisation:', error);
    }
  }

  // Confirmation de cotisations multiples
  async sendMultipleCotisationsConfirmation(client, cotisations) {
    try {
      const total = cotisations.reduce((sum, c) => sum + parseFloat(c.montant), 0);
      const message = `✅ ${cotisations.length} cotisations enregistrées pour un total de ${total} FCFA. Code: ${client.code_client}`;
      
      await this.sendNotificationToClient(client, {
        type: 'cotisation_marked',
        title: 'Cotisations enregistrées',
        message,
        data: { cotisations_count: cotisations.length, total_amount: total }
      });
    } catch (error) {
      logger.error('Erreur confirmation cotisations multiples:', error);
    }
  }

  // Rapport hebdomadaire
  async sendWeeklyReport(client, subscriptions) {
    try {
      const weekNumber = this.getWeekNumber(new Date());
      let totalCotisationsWeek = 0;
      let totalExpectedWeek = 0;
      let status = '✅ À jour';
      let hasLatePayments = false;

      subscriptions.forEach(sub => {
        // Calculer les cotisations de la semaine
        const thisWeekCotisations = sub.cotisations.filter(c => {
          const cotisationDate = new Date(c.date_prevue);
          return this.isThisWeek(cotisationDate);
        });

        thisWeekCotisations.forEach(c => {
          totalExpectedWeek += parseFloat(c.montant);
          if (c.status === 'paid') {
            totalCotisationsWeek += parseFloat(c.montant);
          } else if (c.isLate()) {
            hasLatePayments = true;
          }
        });
      });

      if (hasLatePayments) {
        status = '⚠️ En retard';
      }

      const nextDue = this.getNextDueDate(subscriptions);
      
      const message = `📊 Rapport semaine ${weekNumber}
Bonjour ${client.nom_complet}, voici votre situation :
• Cotisations cette semaine : ${totalCotisationsWeek}/${totalExpectedWeek} FCFA
• Statut : ${status}
• Prochaine échéance : ${nextDue}
• Code client : ${client.code_client}`;

      await this.sendNotificationToClient(client, {
        type: 'weekly_report',
        title: `Rapport hebdomadaire - Semaine ${weekNumber}`,
        message,
        scheduled_for: this.getNextFriday()
      });
    } catch (error) {
      logger.error('Erreur rapport hebdomadaire:', error);
    }
  }

  // Alerte de retard
  async sendLatePaymentAlert(client, lateCotisations) {
    try {
      const totalLate = lateCotisations.reduce((sum, c) => sum + parseFloat(c.montant), 0);
      const daysLate = Math.max(...lateCotisations.map(c => c.getDaysLate()));
      
      const message = `⚠️ RAPPEL : Vous avez ${lateCotisations.length} cotisation(s) en retard (${totalLate} FCFA) depuis ${daysLate} jour(s). Veuillez régulariser rapidement. Code: ${client.code_client}`;
      
      await this.sendNotificationToClient(client, {
        type: 'late_payment_alert',
        title: 'Cotisations en retard',
        message,
        data: { 
          late_count: lateCotisations.length, 
          total_amount: totalLate,
          days_late: daysLate 
        }
      });
    } catch (error) {
      logger.error('Erreur alerte retard:', error);
    }
  }

  // Notification de souscription complétée
  async sendCompletionNotification(client) {
    try {
      const message = `🎉 Félicitations ! Vous avez terminé une souscription avec succès. Votre montant est disponible pour retrait. Code: ${client.code_client}`;
      
      await this.sendNotificationToClient(client, {
        type: 'subscription_completed',
        title: 'Souscription terminée !',
        message
      });
    } catch (error) {
      logger.error('Erreur notification completion:', error);
    }
  }

  // Notification commission due (collecteur)
  async sendCommissionDueNotification(collecteur, commission) {
    try {
      const daysRemaining = Math.ceil((commission.due_date - new Date()) / (1000 * 60 * 60 * 24));
      const message = `💰 Commission de ${commission.montant} FCFA due pour le client ${commission.client.nom_complet}. Délai : ${daysRemaining} jours.`;
      
      await Notification.create({
        user_id: collecteur.id,
        type: 'commission_due',
        channel: 'email',
        title: 'Commission à régler',
        message,
        data: { commission_id: commission.id, days_remaining: daysRemaining }
      });

      if (collecteur.email) {
        await emailService.sendEmail(
          collecteur.email,
          'Commission à régler - Qwetche',
          message
        );
      }
    } catch (error) {
      logger.error('Erreur notification commission:', error);
    }
  }

  // Méthode générique pour envoyer une notification à un client
  async sendNotificationToClient(client, notificationData) {
    try {
      const notification = await Notification.create({
        client_id: client.id,
        ...notificationData
      });

      // Envoyer selon les préférences
      if (client.preferences_notification === 'sms' || client.preferences_notification === 'both') {
        await this.sendSMS(client.telephone, notificationData.message);
      }
      
      if ((client.preferences_notification === 'email' || client.preferences_notification === 'both') && client.email) {
        await emailService.sendEmail(client.email, notificationData.title, notificationData.message);
      }

      await notification.markAsSent();
    } catch (error) {
      logger.error('Erreur envoi notification client:', error);
    }
  }

  // Envoyer SMS
  async sendSMS(phoneNumber, message) {
    try {
      await smsService.send(phoneNumber, message);
    } catch (error) {
      logger.error('Erreur envoi SMS:', error);
    }
  }

  // Utilitaires
  getWeekNumber(date) {
    const onejan = new Date(date.getFullYear(), 0, 1);
    return Math.ceil((((date - onejan) / 86400000) + onejan.getDay() + 1) / 7);
  }

  isThisWeek(date) {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 6));
    return date >= weekStart && date <= weekEnd;
  }

  getNextFriday() {
    const now = new Date();
    const friday = new Date(now);
    friday.setDate(now.getDate() + (5 - now.getDay()));
    friday.setHours(9, 0, 0, 0); // 9h du matin
    return friday;
  }

  getNextDueDate(subscriptions) {
    let nextDate = null;
    subscriptions.forEach(sub => {
      sub.cotisations.forEach(c => {
        if (c.status === 'pending') {
          const cotisationDate = new Date(c.date_prevue);
          if (!nextDate || cotisationDate < nextDate) {
            nextDate = cotisationDate;
          }
        }
      });
    });
    return nextDate ? nextDate.toLocaleDateString('fr-FR') : 'Aucune';
  }
}

module.exports = new NotificationService();

