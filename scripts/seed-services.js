const mongoose = require('mongoose');
const Service = require('../models/Service');
require('dotenv').config();

const services = [
  {
    name: 'Hébergement Starter',
    type: 'web_hosting',
    description: 'Idéal pour les sites personnels et petits projets',
    price: {
      monthly: 4.99,
      yearly: 49.99
    },
    features: [
      { name: '1 Site Web', value: '1', included: true },
      { name: '10 GB Stockage SSD', value: '10GB', included: true },
      { name: '100 GB Bande passante', value: '100GB', included: true },
      { name: '5 Bases de données', value: '5', included: true },
      { name: 'Certificat SSL Gratuit', value: 'Let\'s Encrypt', included: true },
      { name: 'Sauvegarde quotidienne', value: 'Daily', included: true },
      { name: 'Email Pro', value: 'Unlimited', included: false }
    ],
    specifications: {
      cpu: '1 vCore',
      ram: '2 GB',
      storage: '10 GB SSD NVMe',
      bandwidth: '100 GB/mois',
      domains: 1,
      emails: 0,
      databases: 5,
      ssl: true,
      backup: true,
      support: 'Email'
    },
    isActive: true,
    isPopular: false,
    sortOrder: 1
  },
  {
    name: 'Hébergement Professionnel',
    type: 'web_hosting',
    description: 'Parfait pour les sites d\'entreprise et e-commerce',
    price: {
      monthly: 9.99,
      yearly: 99.99
    },
    features: [
      { name: '5 Sites Web', value: '5', included: true },
      { name: '50 GB Stockage SSD', value: '50GB', included: true },
      { name: '500 GB Bande passante', value: '500GB', included: true },
      { name: 'Bases de données illimitées', value: 'Unlimited', included: true },
      { name: 'Certificat SSL Wildcard', value: 'Wildcard', included: true },
      { name: 'Sauvegarde quotidienne', value: 'Daily', included: true },
      { name: 'Email Pro', value: '50', included: true }
    ],
    specifications: {
      cpu: '2 vCores',
      ram: '4 GB',
      storage: '50 GB SSD NVMe',
      bandwidth: '500 GB/mois',
      domains: 5,
      emails: 50,
      databases: -1,
      ssl: true,
      backup: true,
      support: '24/7 Email & Chat'
    },
    isActive: true,
    isPopular: true,
    sortOrder: 2
  },
  {
    name: 'Hébergement Enterprise',
    type: 'web_hosting',
    description: 'Solution complète pour les grandes entreprises',
    price: {
      monthly: 19.99,
      yearly: 199.99
    },
    features: [
      { name: 'Sites Web illimités', value: 'Unlimited', included: true },
      { name: '200 GB Stockage SSD', value: '200GB', included: true },
      { name: 'Bande passante illimitée', value: 'Unlimited', included: true },
      { name: 'Bases de données illimitées', value: 'Unlimited', included: true },
      { name: 'Certificats SSL Premium', value: 'Premium', included: true },
      { name: 'Sauvegarde temps réel', value: 'Real-time', included: true },
      { name: 'Email Pro illimité', value: 'Unlimited', included: true }
    ],
    specifications: {
      cpu: '4 vCores',
      ram: '8 GB',
      storage: '200 GB SSD NVMe',
      bandwidth: 'Unlimited',
      domains: -1,
      emails: -1,
      databases: -1,
      ssl: true,
      backup: true,
      support: '24/7 Phone & Priority'
    },
    isActive: true,
    isPopular: false,
    sortOrder: 3
  },
  {
    name: 'VPS Basic',
    type: 'vps',
    description: 'Serveur virtuel avec contrôle total',
    price: {
      monthly: 14.99,
      yearly: 149.99
    },
    features: [
      { name: '1 vCore CPU', value: '1', included: true },
      { name: '2 GB RAM', value: '2GB', included: true },
      { name: '40 GB Stockage SSD', value: '40GB', included: true },
      { name: '2 TB Bande passante', value: '2TB', included: true },
      { name: 'Accès root complet', value: 'Full', included: true },
      { name: 'IP dédiée', value: '1', included: true },
      { name: 'Panneau de contrôle', value: 'Optional', included: false }
    ],
    specifications: {
      cpu: '1 vCore',
      ram: '2 GB',
      storage: '40 GB SSD',
      bandwidth: '2 TB/mois',
      domains: -1,
      emails: -1,
      databases: -1,
      ssl: false,
      backup: false,
      support: 'Email'
    },
    isActive: true,
    isPopular: false,
    sortOrder: 4
  },
  {
    name: 'VPS Pro',
    type: 'vps',
    description: 'Performance et flexibilité pour vos applications',
    price: {
      monthly: 29.99,
      yearly: 299.99
    },
    features: [
      { name: '2 vCores CPU', value: '2', included: true },
      { name: '4 GB RAM', value: '4GB', included: true },
      { name: '80 GB Stockage SSD', value: '80GB', included: true },
      { name: '4 TB Bande passante', value: '4TB', included: true },
      { name: 'Accès root complet', value: 'Full', included: true },
      { name: 'IP dédiée', value: '1', included: true },
      { name: 'Panneau de contrôle', value: 'Free', included: true }
    ],
    specifications: {
      cpu: '2 vCores',
      ram: '4 GB',
      storage: '80 GB SSD',
      bandwidth: '4 TB/mois',
      domains: -1,
      emails: -1,
      databases: -1,
      ssl: false,
      backup: true,
      support: '24/7 Email & Chat'
    },
    isActive: true,
    isPopular: true,
    sortOrder: 5
  },
  {
    name: 'Nom de Domaine',
    type: 'domain',
    description: 'Enregistrement et gestion de noms de domaine',
    price: {
      monthly: 0,
      yearly: 14.99
    },
    features: [
      { name: 'Enregistrement .com/.net/.org', value: 'Popular', included: true },
      { name: 'DNS gratuit', value: 'Free', included: true },
      { name: 'Transfert gratuit', value: 'Free', included: true },
      { name: 'Protection WHOIS', value: 'Premium', included: false },
      { name: 'Email forwarding', value: 'Free', included: true }
    ],
    specifications: {
      domains: 1,
      support: 'Email'
    },
    isActive: true,
    isPopular: false,
    sortOrder: 6
  },
  {
    name: 'Certificat SSL Standard',
    type: 'ssl',
    description: 'Sécurisation de votre site web',
    price: {
      monthly: 0,
      yearly: 39.99
    },
    features: [
      { name: 'Validation Domaine (DV)', value: 'DV', included: true },
      { name: '1 domaine principal', value: '1', included: true },
      { name: 'WWW sous-domaine', value: 'www', included: true },
      { name: 'Garantie $10,000', value: '$10K', included: true },
      { name: 'Support technique', value: 'Email', included: true }
    ],
    specifications: {
      ssl: true,
      support: 'Email'
    },
    isActive: true,
    isPopular: false,
    sortOrder: 7
  }
];

async function seedServices() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connecté à MongoDB');

    // Clear existing services
    await Service.deleteMany({});
    console.log('Services existants supprimés');

    // Insert new services
    const insertedServices = await Service.insertMany(services);
    console.log(`${insertedServices.length} services créés avec succès !`);

    insertedServices.forEach(service => {
      console.log(`- ${service.name} (${service.type})`);
    });

  } catch (error) {
    console.error('Erreur lors de l\'insertion des services:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedServices();
