// src/models/User.js - Modèle Utilisateur (Admin/Collecteur)
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [8, 255]
      }
    },
    role: {
      type: DataTypes.ENUM('admin', 'collecteur'),
      allowNull: false,
      defaultValue: 'collecteur'
    },
    status: {
      type: DataTypes.ENUM('pending', 'active', 'blocked', 'rejected'),
      allowNull: false,
      defaultValue: 'pending'
    },
    // Champs spécifiques aux collecteurs
    nom_entreprise: {
      type: DataTypes.STRING,
      allowNull: true
    },
    numero_registre_commerce: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    emplacement_physique: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Verification
    email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    verification_token: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // 2FA
    two_factor_secret: {
      type: DataTypes.STRING,
      allowNull: true
    },
    two_factor_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    // Métadonnées
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    },
    login_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    locked_until: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Notes de vérification (pour admin)
    verification_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    verified_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'User',
        key: 'id'
      }
    },
    verified_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'users',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      }
    }
  });

  // Méthodes d'instance
  User.prototype.validatePassword = async function(password) {
    return bcrypt.compare(password, this.password);
  };

  User.prototype.isAccountLocked = function() {
    return this.locked_until && this.locked_until > Date.now();
  };

  User.prototype.incrementLoginAttempts = async function() {
    // Si le compte est déjà verrouillé et que la période est expirée
    if (this.locked_until && this.locked_until < Date.now()) {
      return this.update({
        login_attempts: 1,
        locked_until: null
      });
    }

    const updates = { login_attempts: this.login_attempts + 1 };

    // Verrouiller le compte après 5 tentatives
    if (this.login_attempts + 1 >= 5 && !this.isAccountLocked()) {
      updates.locked_until = Date.now() + 2 * 60 * 60 * 1000; // 2 heures
    }

    return this.update(updates);
  };

  // Associations
  User.associate = function(models) {
    User.hasMany(models.Client, {
      foreignKey: 'collecteur_id',
      as: 'clients'
    });
    User.hasMany(models.Commission, {
      foreignKey: 'collecteur_id',
      as: 'commissions'
    });
    User.hasMany(models.Payment, {
      foreignKey: 'user_id',
      as: 'payments'
    });
    User.hasMany(models.Notification, {
      foreignKey: 'user_id',
      as: 'notifications'
    });
  };

  return User;
};
