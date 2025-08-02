// src/models/Cotisation.js - Modèle Cotisation
module.exports = (sequelize, DataTypes) => {
  const Cotisation = sequelize.define('Cotisation', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    subscription_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'subscriptions',
        key: 'id'
      }
    },
    jour_numero: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 365
      }
    },
    date_prevue: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    date_marquee: {
      type: DataTypes.DATE,
      allowNull: true
    },
    montant: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'paid', 'missed', 'late'),
      defaultValue: 'pending'
    },
    marked_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'cotisations',
    indexes: [
      {
        unique: true,
        fields: ['subscription_id', 'jour_numero']
      },
      {
        fields: ['date_prevue']
      },
      {
        fields: ['status']
      }
    ]
  });

  // Méthodes d'instance
  Cotisation.prototype.isLate = function() {
    if (this.status === 'paid') return false;
    return new Date() > new Date(this.date_prevue + 'T23:59:59');
  };

  Cotisation.prototype.getDaysLate = function() {
    if (!this.isLate()) return 0;
    const today = new Date();
    const dueDate = new Date(this.date_prevue + 'T23:59:59');
    const diffTime = today - dueDate;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Associations
  Cotisation.associate = function(models) {
    Cotisation.belongsTo(models.Subscription, {
      foreignKey: 'subscription_id',
      as: 'subscription'
    });
    Cotisation.belongsTo(models.User, {
      foreignKey: 'marked_by',
      as: 'marker'
    });
  };

  return Cotisation;
};
