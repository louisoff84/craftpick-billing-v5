const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Service = require('../models/Service');
const Subscription = require('../models/Subscription');
const Invoice = require('../models/Invoice');
const { validateSession } = require('../middleware/auth');

// Apply session validation middleware to all client routes
router.use(validateSession);

// Minecraft Servers Page
router.get('/minecraft-servers', (req, res) => {
  res.render('client/minecraft-servers', {
    title: 'Serveurs Minecraft',
    metaDescription: 'Gérez vos serveurs Minecraft avec Pterodactyl',
    user: req.session.user || { firstName: 'User' }
  });
});

// Web Hosting Page
router.get('/web-hosting', (req, res) => {
  res.render('client/web-hosting', {
    title: 'Hébergement Web',
    metaDescription: 'Gérez vos hébergements web avec Plesk',
    user: req.session.user || { firstName: 'User' }
  });
});

// Dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user._id })
      .populate('service')
      .sort({ createdAt: -1 });
    
    const invoices = await Invoice.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5);
    
    const activeServices = subscriptions.filter(sub => sub.status === 'active').length;
    const pendingInvoices = invoices.filter(inv => inv.status === 'pending').length;
    const totalMonthlyCost = subscriptions
      .filter(sub => sub.status === 'active')
      .reduce((total, sub) => total + sub.price, 0);

    res.render('client/dashboard', {
      title: 'Tableau de bord',
      user: req.user,
      subscriptions,
      invoices,
      stats: {
        activeServices,
        pendingInvoices,
        totalMonthlyCost
      }
    });
  } catch (error) {
    console.error('Erreur dashboard:', error);
    res.status(500).render('error', { message: 'Erreur serveur' });
  }
});

// Profile
router.get('/profile', async (req, res) => {
  try {
    res.render('client/profile', {
      title: 'Mon Profil',
      user: req.user
    });
  } catch (error) {
    console.error('Erreur profile:', error);
    res.status(500).render('error', { message: 'Erreur serveur' });
  }
});

// Update profile
router.post('/profile', [
  body('firstName').trim().notEmpty().withMessage('Le prénom est requis'),
  body('lastName').trim().notEmpty().withMessage('Le nom est requis'),
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('client/profile', {
        title: 'Mon Profil',
        user: req.user,
        errors: errors.array()
      });
    }

    const { firstName, lastName, phone, address } = req.body;
    
    const user = await User.findById(req.user._id);
    user.firstName = firstName;
    user.lastName = lastName;
    user.phone = phone;
    if (address) user.address = address;
    
    await user.save();

    req.session.user = user;
    
    res.render('client/profile', {
      title: 'Mon Profil',
      user: user,
      success: 'Profil mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur update profile:', error);
    res.status(500).render('error', { message: 'Erreur serveur' });
  }
});

// Services
router.get('/services', async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user._id })
      .populate('service')
      .sort({ createdAt: -1 });

    res.render('client/services', {
      title: 'Mes Services',
      user: req.user,
      subscriptions
    });
  } catch (error) {
    console.error('Erreur services:', error);
    res.status(500).render('error', { message: 'Erreur serveur' });
  }
});

// Service details
router.get('/services/:id', async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    }).populate('service');

    if (!subscription) {
      return res.status(404).render('404', { message: 'Service non trouvé' });
    }

    const invoices = await Invoice.find({ 
      subscription: subscription._id 
    }).sort({ createdAt: -1 });

    res.render('client/service-details', {
      title: subscription.service.name,
      user: req.user,
      subscription,
      invoices
    });
  } catch (error) {
    console.error('Erreur service details:', error);
    res.status(500).render('error', { message: 'Erreur serveur' });
  }
});

// Order new service
router.get('/order', async (req, res) => {
  try {
    const services = await Service.find({ isActive: true }).sort({ sortOrder: 1 });
    
    res.render('client/order', {
      title: 'Commander un Service',
      user: req.user,
      services
    });
  } catch (error) {
    console.error('Erreur order:', error);
    res.status(500).render('error', { message: 'Erreur serveur' });
  }
});

// Process order
router.post('/order', [
  body('service').notEmpty().withMessage('Le service est requis'),
  body('billingCycle').isIn(['monthly', 'yearly']).withMessage('Cycle de facturation invalide'),
  body('domain').optional().isURL().withMessage('Domaine invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const services = await Service.find({ isActive: true }).sort({ sortOrder: 1 });
      return res.render('client/order', {
        title: 'Commander un Service',
        user: req.user,
        services,
        errors: errors.array(),
        formData: req.body
      });
    }

    const { service: serviceId, billingCycle, domain } = req.body;
    
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(400).render('error', { message: 'Service invalide' });
    }

    const price = billingCycle === 'yearly' ? service.price.yearly : service.price.monthly;
    const startDate = new Date();
    const endDate = new Date(startDate);
    
    if (billingCycle === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const subscription = new Subscription({
      user: req.user._id,
      service: serviceId,
      domain,
      billingCycle,
      status: 'pending',
      startDate,
      endDate,
      price,
      nextBillingDate: endDate
    });

    await subscription.save();

    res.redirect(`/client/services/${subscription._id}?success=Service commandé avec succès`);
  } catch (error) {
    console.error('Erreur process order:', error);
    res.status(500).render('error', { message: 'Erreur serveur' });
  }
});

// Invoices
router.get('/invoices', async (req, res) => {
  try {
    const invoices = await Invoice.find({ user: req.user._id })
      .populate('subscription')
      .sort({ createdAt: -1 });

    res.render('client/invoices', {
      title: 'Mes Factures',
      user: req.user,
      invoices
    });
  } catch (error) {
    console.error('Erreur invoices:', error);
    res.status(500).render('error', { message: 'Erreur serveur' });
  }
});

// Invoice details
router.get('/invoices/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    }).populate('subscription').populate('subscription.service');

    if (!invoice) {
      return res.status(404).render('404', { message: 'Facture non trouvée' });
    }

    res.render('client/invoice-details', {
      title: `Facture ${invoice.invoiceNumber}`,
      user: req.user,
      invoice
    });
  } catch (error) {
    console.error('Erreur invoice details:', error);
    res.status(500).render('error', { message: 'Erreur serveur' });
  }
});

// Settings
router.get('/settings', async (req, res) => {
  try {
    res.render('client/settings', {
      title: 'Paramètres',
      user: req.user
    });
  } catch (error) {
    console.error('Erreur settings:', error);
    res.status(500).render('error', { message: 'Erreur serveur' });
  }
});

// Change password
router.post('/password', [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }).withMessage('Le nouveau mot de passe doit contenir au moins 6 caractères'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Les mots de passe ne correspondent pas');
    }
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('client/settings', {
        title: 'Paramètres',
        user: req.user,
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.render('client/settings', {
        title: 'Paramètres',
        user: req.user,
        errors: [{ msg: 'Mot de passe actuel incorrect' }]
      });
    }
    
    user.password = newPassword;
    await user.save();

    res.render('client/settings', {
      title: 'Paramètres',
      user: req.user,
      success: 'Mot de passe changé avec succès'
    });
  } catch (error) {
    console.error('Erreur change password:', error);
    res.status(500).render('error', { message: 'Erreur serveur' });
  }
});

module.exports = router;
