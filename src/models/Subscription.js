// src/models/Subscription.js - Modèle Souscription
module.exports = (sequelize, DataTypes) => {
  const Subscription = sequelize.define('Subscription', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    client_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'clients',
        key: 'id'
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
    type_cycle: {
      type: DataTypes.ENUM('31_jours', '90_jours', '180_jours', '365_jours'),
      allowNull: false,
      defaultValue: '31_jours'
    },
    montant_journalier: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 200.00
      }
    },
    date_debut: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    date_fin: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'completed', 'suspended', 'cancelled'),
      defaultValue: 'active'
    },
    // Calculs automatiques
    nombre_jours_total: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    montant_total_prevu: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    montant_cotise: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    jours_cotises: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    // Prêts
    pret_disponible: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    pret_accorde: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    }
  }, {
    tableName: 'subscriptions',
    hooks: {
      beforeCreate: (subscription) => {
        // Calcul automatique des valeurs
        const cycleMap = {
          '31_jours': 31,
          '90_jours': 90,
          '180_jours': 180,
          '365_jours': 365
        };
        
        subscription.nombre_jours_total = cycleMap[subscription.type_cycle];
        subscription.montant_total_prevu = subscription.montant_journalier * subscription.nombre_jours_total;
        
        // Calcul de la date de fin
        const dateDebut = new Date(subscription.date_debut);
        const dateFin = new Date(dateDebut);
        dateFin.setDate(dateFin.getDate() + subscription.nombre_jours_total - 1);
        subscription.date_fin = dateFin.toISOString().split('T')[0];
      }
    }
  });

  // Méthodes d'instance
  Subscription.prototype.calculateProgress = function() {
    const progressPercent = (this.jours_cotises / this.nombre_jours_total) * 100;
    const amountPercent = (parseFloat(this.montant_cotise) / parseFloat(this.montant_total_prevu)) * 100;
    
    return {
      jours: {
        cotises: this.jours_cotises,
        total: this.nombre_jours_total,
        percent: Math.round(progressPercent)
      },
      montant: {
        cotise: parseFloat(this.montant_cotise),
        total: parseFloat(this.montant_total_prevu),
        percent: Math.round(amountPercent)
      }
    };
  };

  Subscription.prototype.isCompleted = function() {
    return this.jours_cotises >= this.nombre_jours_total;
  };

  Subscription.prototype.getDaysRemaining = function() {
    return Math.max(0, this.nombre_jours_total - this.jours_cotises);
  };

  // Associations
  Subscription.associate = function(models) {
    Subscription.belongsTo(models.Client, {
      foreignKey: 'client_id',
      as: 'client'
    });
    Subscription.belongsTo(models.User, {
      foreignKey: 'collecteur_id',
      as: 'collecteur'
    });
    Subscription.hasMany(models.Cotisation, {
      foreignKey: 'subscription_id',
      as: 'cotisations'
    });
  };

  return Subscription;
};

