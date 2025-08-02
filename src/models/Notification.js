
// src/models/Notification.js - Modèle Notification
module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    client_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'clients',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM(
        'cotisation_marked', 
        'commission_due', 
        'account_blocked', 
        'weekly_report',
        'payment_success',
        'payment_failed',
        'subscription_completed',
        'late_payment_alert'
      ),
      allowNull: false
    },
    channel: {
      type: DataTypes.ENUM('email', 'sms', 'in_app', 'push'),
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    data: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'sent', 'delivered', 'failed'),
      defaultValue: 'pending'
    },
    scheduled_for: {
      type: DataTypes.DATE,
      allowNull: true
    },
    sent_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    delivered_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    failure_reason: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'notifications'
  });

  // Méthodes d'instance
  Notification.prototype.markAsSent = async function() {
    return this.update({
      status: 'sent',
      sent_at: new Date()
    });
  };

  Notification.prototype.markAsDelivered = async function() {
    return this.update({
      status: 'delivered',
      delivered_at: new Date()
    });
  };

  Notification.prototype.markAsRead = async function() {
    return this.update({
      read_at: new Date()
    });
  };

  Notification.prototype.markAsFailed = async function(reason) {
    return this.update({
      status: 'failed',
      failure_reason: reason
    });
  };

  // Associations
  Notification.associate = function(models) {
    Notification.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    Notification.belongsTo(models.Client, {
      foreignKey: 'client_id',
      as: 'client'
    });
  };

  return Notification;
};
