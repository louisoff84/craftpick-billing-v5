const express = require('express');
const router = express.Router();

// Home page
router.get('/', async (req, res) => {
  try {
    // Données de test pour le développement
    const services = [
      {
        name: 'Hébergement Starter',
        type: 'web_hosting',
        description: 'Idéal pour les sites personnels et petits projets',
        price: { monthly: 4.99, yearly: 49.99 },
        isPopular: false,
        slug: 'hosting-starter'
      },
      {
        name: 'Hébergement Professionnel',
        type: 'web_hosting',
        description: 'Parfait pour les sites d\'entreprise et e-commerce',
        price: { monthly: 9.99, yearly: 99.99 },
        isPopular: true,
        slug: 'hosting-professional'
      },
      {
        name: 'VPS Pro',
        type: 'vps',
        description: 'Performance et flexibilité pour vos applications',
        price: { monthly: 29.99, yearly: 299.99 },
        isPopular: false,
        slug: 'vps-pro'
      }
    ];
    
    res.render('home', {
      title: 'CraftPick Hosting',
      services,
      homePage: {
        title: 'Hébergement Web Fiable et Performant',
        content: 'Des solutions d\'hébergement adaptées à tous les besoins, du site personnel aux applications d\'entreprise',
        excerpt: 'Des solutions d\'hébergement adaptées à tous vos besoins, du site personnel aux applications d\'entreprise'
      }
    });
  } catch (error) {
    console.error('Erreur home page:', error);
    res.status(500).render('error', { message: 'Erreur serveur' });
  }
});

// Services page
router.get('/services', async (req, res) => {
  try {
    // Données de test
    const services = [
      {
        name: 'Hébergement Starter',
        type: 'web_hosting',
        description: 'Idéal pour les sites personnels et petits projets',
        price: { monthly: 4.99, yearly: 49.99 },
        isPopular: false,
        slug: 'hosting-starter',
        features: [
          { name: '1 Site Web', included: true },
          { name: '10 GB Stockage SSD', included: true },
          { name: '100 GB Bande passante', included: true },
          { name: 'Certificat SSL Gratuit', included: true }
        ],
        specifications: {
          cpu: '1 vCore',
          ram: '2 GB',
          storage: '10 GB SSD',
          bandwidth: '100 GB/mois'
        }
      },
      {
        name: 'Hébergement Professionnel',
        type: 'web_hosting',
        description: 'Parfait pour les sites d\'entreprise et e-commerce',
        price: { monthly: 9.99, yearly: 99.99 },
        isPopular: true,
        slug: 'hosting-professional',
        features: [
          { name: '5 Sites Web', included: true },
          { name: '50 GB Stockage SSD', included: true },
          { name: '500 GB Bande passante', included: true },
          { name: 'Certificat SSL Wildcard', included: true }
        ],
        specifications: {
          cpu: '2 vCores',
          ram: '4 GB',
          storage: '50 GB SSD',
          bandwidth: '500 GB/mois'
        }
      }
    ];
    
    res.render('services', {
      title: 'Nos Services',
      services
    });
  } catch (error) {
    console.error('Erreur services page:', error);
    res.status(500).render('error', { message: 'Erreur serveur' });
  }
});

// Contact page
router.get('/contact', (req, res) => {
  res.render('contact', {
    title: 'Contact'
  });
});

// About page
router.get('/about', (req, res) => {
  res.render('about', {
    title: 'À Propos',
    aboutPage: {
      title: 'À Propos de CraftPick Hosting',
      content: 'Votre partenaire de confiance pour tous vos besoins d\'hébergement web depuis 2024.'
    }
  });
});

// Login page
router.get('/login', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/client/dashboard');
  }
  
  res.render('auth/login', {
    title: 'Connexion',
    layout: 'auth'
  });
});

// Register page
router.get('/register', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/client/dashboard');
  }
  
  res.render('auth/register', {
    title: 'Inscription',
    layout: 'auth'
  });
});

// Forgot password page
router.get('/forgot-password', (req, res) => {
  res.render('auth/forgot-password', {
    title: 'Mot de passe oublié',
    layout: 'auth'
  });
});

module.exports = router;
