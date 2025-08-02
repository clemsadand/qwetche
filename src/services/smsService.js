
// src/services/smsService.js - Service SMS
const axios = require('axios');
const logger = require('../utils/logger');

class SMSService {
  constructor() {
    this.providers = {
      default: {
        url: process.env.SMS_API_URL,
        key: process.env.SMS_API_KEY,
        from: process.env.SMS_FROM || 'Qwetche'
      }
    };
  }

  async send(phoneNumber, message) {
    try {
      // Normaliser le numéro de téléphone
      const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
      
      // Utiliser le provider par défaut
      const provider = this.providers.default;
      
      const response = await axios.post(provider.url, {
        from: provider.from,
        to: normalizedPhone,
        text: message
      }, {
        headers: {
          'Authorization': `Bearer ${provider.key}`,
          'Content-Type': 'application/json'
        }
      });

      logger.info(`SMS envoyé à ${normalizedPhone}: ${response.status}`);
      return { success: true, messageId: response.data.messageId };
    } catch (error) {
      logger.error(`Erreur envoi SMS à ${phoneNumber}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  normalizePhoneNumber(phone) {
    // Nettoyer et normaliser le numéro
    let normalized = phone.replace(/\D/g, '');
    
    // Ajouter le code pays si nécessaire (exemple pour le Bénin +229)
    if (normalized.length === 8) {
      normalized = '229' + normalized;
    }
    
    return '+' + normalized;
  }
}

module.exports = new SMSService();

