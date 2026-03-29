const sequelize = require('../config/database');
const User = require('./User');
const Service = require('./Service');
const Subscription = require('./Subscription');
const Invoice = require('./Invoice');
const Page = require('./Page');

// Définir les associations
User.hasMany(Subscription, { foreignKey: 'userId', as: 'subscriptions' });
Subscription.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Service.hasMany(Subscription, { foreignKey: 'serviceId', as: 'subscriptions' });
Subscription.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });

User.hasMany(Invoice, { foreignKey: 'userId', as: 'invoices' });
Invoice.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Subscription.hasMany(Invoice, { foreignKey: 'subscriptionId', as: 'invoices' });
Invoice.belongsTo(Subscription, { foreignKey: 'subscriptionId', as: 'subscription' });

User.hasMany(Page, { foreignKey: 'authorId', as: 'pages' });
Page.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

// Synchroniser la base de données
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Base de données synchronisée avec succès');
  } catch (error) {
    console.error('Erreur de synchronisation de la base de données:', error);
  }
};

module.exports = {
  sequelize,
  User,
  Service,
  Subscription,
  Invoice,
  Page,
  syncDatabase
};
