
// src/services/mobileMoneyService.js - Service Mobile Money
const axios = require('axios');
const crypto = require('crypto');
const { Payment } = require('../models');
const logger = require('../utils/logger');

class MobileMoneyService {
  constructor() {
    this.providers = {
      mtn: {
        baseUrl: process.env.MTN_API_URL,
        apiKey: process.env.MTN_API_KEY,
        apiSecret: process.env.MTN_API_SECRET,
        subscriptionKey: process.env.MTN_SUBSCRIPTION_KEY
      },
      moov: {
        baseUrl: process.env.MOOV_API_URL,
        apiKey: process.env.MOOV_API_KEY,
        apiSecret: process.env.MOOV_API_SECRET
      }
    };
  }

  // Initier un paiement
  async initiatePayment(paymentData) {
    try {
      const { provider, phoneNumber, amount, userId, commissionIds } = paymentData;
      
      // Générer un ID de transaction unique
      const transactionId = this.generateTransactionId();
      
      // Créer l'enregistrement de paiement
      const payment = await Payment.create({
        user_id: userId,
        transaction_id: transactionId,
        provider,
        phone_number: phoneNumber,
        amount,
        commission_ids: commissionIds || [],
        status: 'pending'
      });

      let result;
      switch (provider) {
        case 'mtn':
          result = await this.processMTNPayment(payment);
          break;
        case 'moov':
          result = await this.processMoovPayment(payment);
          break;
        default:
          throw new Error('Provider non supporté');
      }

      await payment.update({
        external_transaction_id: result.externalId,
        provider_response: result.response
      });

      logger.info(`Paiement initié: ${transactionId} - ${provider}`);
      
      return {
        success: true,
        transaction_id: transactionId,
        payment_id: payment.id,
        external_id: result.externalId,
        status: 'pending'
      };
    } catch (error) {
      logger.error('Erreur initiation paiement:', error);
      throw error;
    }
  }

  // Traitement MTN Mobile Money
  async processMTNPayment(payment) {
    const config = this.providers.mtn;
    const requestId = crypto.randomUUID();
    
    const requestBody = {
      amount: payment.amount.toString(),
      currency: 'XOF',
      externalId: payment.transaction_id,
      payer: {
        partyIdType: 'MSISDN',
        partyId: payment.phone_number.replace('+', '')
      },
      payerMessage: 'Paiement commission Qwetche',
      payeeNote: `Commission collecteur - ${payment.transaction_id}`
    };

    try {
      const response = await axios.post(
        `${config.baseUrl}/collection/v1_0/requesttopay`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${await this.getMTNToken()}`,
            'X-Reference-Id': requestId,
            'X-Target-Environment': process.env.MTN_ENVIRONMENT || 'sandbox',
            'Ocp-Apim-Subscription-Key': config.subscriptionKey,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        externalId: requestId,
        response: response.data
      };
    } catch (error) {
      logger.error('Erreur MTN Mobile Money:', error.response?.data || error.message);
      throw error;
    }
  }

  // Traitement Moov Money
  async processMoovPayment(payment) {
    const config = this.providers.moov;
    
    const requestBody = {
      amount: payment.amount,
      currency: 'XOF',
      reference: payment.transaction_id,
      subscriber: payment.phone_number,
      description: 'Paiement commission Qwetche'
    };

    try {
      const response = await axios.post(
        `${config.baseUrl}/payments/request`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${await this.getMoovToken()}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        externalId: response.data.transactionId,
        response: response.data
      };
    } catch (error) {
      logger.error('Erreur Moov Money:', error.response?.data || error.message);
      throw error;
    }
  }

  // Vérifier le statut d'un paiement
  async checkPaymentStatus(transactionId) {
    try {
      const payment = await Payment.findOne({
        where: { transaction_id: transactionId }
      });

      if (!payment) {
        throw new Error('Paiement non trouvé');
      }

      let status;
      switch (payment.provider) {
        case 'mtn':
          status = await this.checkMTNStatus(payment.external_transaction_id);
          break;
        case 'moov':
          status = await this.checkMoovStatus(payment.external_transaction_id);
          break;
        default:
          throw new Error('Provider non supporté');
      }

      // Mettre à jour le statut si nécessaire
      if (status.status !== payment.status) {
        await payment.update({
          status: status.status,
          failure_reason: status.reason,
          processed_at: status.status !== 'pending' ? new Date() : null
        });
      }

      return {
        transaction_id: transactionId,
        status: status.status,
        amount: payment.amount,
        provider: payment.provider
      };
    } catch (error) {
      logger.error('Erreur vérification statut:', error);
      throw error;
    }
  }

  // Webhook pour les notifications de paiement
  async handleWebhook(provider, payload) {
    try {
      let transactionData;
      
      switch (provider) {
        case 'mtn':
          transactionData = this.parseMTNWebhook(payload);
          break;
        case 'moov':
          transactionData = this.parseMoovWebhook(payload);
          break;
        default:
          throw new Error('Provider webhook non supporté');
      }

      const payment = await Payment.findOne({
        where: { external_transaction_id: transactionData.externalId }
      });

      if (!payment) {
        logger.warn(`Paiement non trouvé pour webhook: ${transactionData.externalId}`);
        return;
      }

      await payment.update({
        status: transactionData.status,
        webhook_received: true,
        processed_at: new Date(),
        provider_response: payload
      });

      // Si le paiement est réussi, marquer les commissions comme payées
      if (transactionData.status === 'successful' && payment.commission_ids.length > 0) {
        const { Commission } = require('../models');
        await Commission.update(
          { 
            status: 'paid', 
            paid_date: new Date(),
            payment_id: payment.id 
          },
          { where: { id: payment.commission_ids } }
        );
      }

      logger.info(`Webhook traité: ${payment.transaction_id} - ${transactionData.status}`);
    } catch (error) {
      logger.error('Erreur traitement webhook:', error);
      throw error;
    }
  }

  // Utilitaires
  generateTransactionId() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8);
    return `QWT${timestamp}${random}`.toUpperCase();
  }

  async getMTNToken() {
    // Implémentation de l'authentification MTN
    // Cache le token et le renouvelle automatiquement
    const cacheKey = 'mtn_token';
    const cachedToken = await redisClient.get(cacheKey);
    
    if (cachedToken) {
      return cachedToken;
    }

    const config = this.providers.mtn;
    const auth = Buffer.from(`${config.apiKey}:${config.apiSecret}`).toString('base64');
    
    const response = await axios.post(
      `${config.baseUrl}/collection/token/`,
      {},
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Ocp-Apim-Subscription-Key': config.subscriptionKey
        }
      }
    );

    const token = response.data.access_token;
    const expiresIn = response.data.expires_in || 3600;
    
    await redisClient.setEx(cacheKey, expiresIn - 60, token);
    return token;
  }

  async getMoovToken() {
    // Implémentation similaire pour Moov
    // ...
  }

  parseMTNWebhook(payload) {
    return {
      externalId: payload.referenceId,
      status: payload.status === 'SUCCESSFUL' ? 'successful' : 'failed',
      reason: payload.reason
    };
  }

  parseMoovWebhook(payload) {
    return {
      externalId: payload.transactionId,
      status: payload.status === 'SUCCESS' ? 'successful' : 'failed',
      reason: payload.message
    };
  }
}

module.exports = new MobileMoneyService();

