
// src/models/Client.js - Modèle Client
module.exports = (sequelize, DataTypes) => {
  const Client = sequelize.define('Client', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    code_client: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    nom_complet: {
      type: DataTypes.STRING,
      allowNull: false
    },
    telephone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true // Unicité pour éviter les doublons
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    collecteur_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended'),
      defaultValue: 'active'
    },
    preferences_notification: {
      type: DataTypes.ENUM('sms', 'email', 'both', 'none'),
      defaultValue: 'sms'
    },
    // Métadonnées
    total_cotisations: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    derniere_cotisation: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'clients',
    hooks: {
      beforeCreate: async (client) => {
        // Génération automatique du code client
        if (!client.code_client) {
          const count = await sequelize.models.Client.count();
          client.code_client = `CLT-${String(count + 1).padStart(6, '0')}`;
        }
      }
    }
  });

  // Méthodes d'instance
  Client.prototype.getTotalCotisations = async function() {
    const subscriptions = await this.getSubscriptions({
      include: ['cotisations']
    });
    
    let total = 0;
    subscriptions.forEach(sub => {
      sub.cotisations.forEach(cot => {
        if (cot.status === 'paid') {
          total += parseFloat(cot.montant);
        }
      });
    });
    
    return total;
  };

  Client.prototype.getAvailableLoanAmount = async function() {
    const totalCotisations = await this.getTotalCotisations();
    return totalCotisations * 0.8; // 80% du total cotisé
  };

  // Associations
  Client.associate = function(models) {
    Client.belongsTo(models.User, {
      foreignKey: 'collecteur_id',
      as: 'collecteur'
    });
    Client.hasMany(models.Subscription, {
      foreignKey: 'client_id',
      as: 'subscriptions'
    });
    Client.hasMany(models.Notification, {
      foreignKey: 'client_id',
      as: 'notifications'
    });
  };

  return Client;
};

