const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Service = require('../models/Service');
const Subscription = require('../models/Subscription');
const Invoice = require('../models/Invoice');
const Page = require('../models/Page');
const { webAdminAuth } = require('../middleware/auth');

// Apply webAdminAuth middleware to all admin routes
router.use(webAdminAuth);

// Dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const stats = {
      totalUsers: await User.countDocuments({ role: 'client' }),
      totalServices: await Service.countDocuments(),
      activeSubscriptions: await Subscription.countDocuments({ status: 'active' }),
      totalRevenue: await Invoice.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      pendingInvoices: await Invoice.countDocuments({ status: 'pending' }),
      newUsersThisMonth: await User.countDocuments({
        role: 'client',
        createdAt: { $gte: new Date(new Date().setDate(1)) }
      })
    };

    const recentUsers = await User.find({ role: 'client' })
      .sort({ createdAt: -1 })
      .limit(5);

    const recentSubscriptions = await Subscription.find()
      .populate('user')
      .populate('service')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentInvoices = await Invoice.find()
      .populate('user')
      .sort({ createdAt: -1 })
      .limit(5);

    res.render('admin/dashboard', {
      title: 'Tableau de bord Admin',
      user: req.user,
      stats,
      recentUsers,
      recentSubscriptions,
      recentInvoices
    });
  } catch (error) {
    console.error('Erreur admin dashboard:', error);
    res.status(500).render('error', { message: 'Erreur serveur' });
  }
});

// Users management
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const users = await User.find({ role: 'client' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments({ role: 'client' });
    const totalPages = Math.ceil(total / limit);

    res.render('admin/users', {
      title: 'Gestion des Utilisateurs',
      user: req.user,
      users,
      pagination: {
        current: page,
        total: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Erreur admin users:', error);
    res.status(500).render('error', { message: 'Erreur serveur' });
  }
});

// User details
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).render('404', { message: 'Utilisateur non trouvé' });
    }

    const subscriptions = await Subscription.find({ user: user._id })
      .populate('service')
      .sort({ createdAt: -1 });

    const invoices = await Invoice.find({ user: user._id })
      .sort({ createdAt: -1 });

    res.render('admin/user-details', {
      title: `Détails de ${user.fullName}`,
      user: req.user,
      targetUser: user,
      subscriptions,
      invoices
    });
  } catch (error) {
    console.error('Erreur admin user details:', error);
    res.status(500).render('error', { message: 'Erreur serveur' });
  }
});

// Services management
router.get('/services', async (req, res) => {
  try {
    const services = await Service.find().sort({ sortOrder: 1 });
    res.render('admin/services', {
      title: 'Gestion des Services',
      user: req.user,
      services
    });
  } catch (error) {
    console.error('Erreur admin services:', error);
    res.status(500).render('error', { message: 'Erreur serveur' });
  }
});

// Create service
router.get('/services/create', (req, res) => {
  res.render('admin/service-form', {
    title: 'Créer un Service',
    user: req.user,
    service: null
  });
});

// Edit service
router.get('/services/:id/edit', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).render('404', { message: 'Service non trouvé' });
    }

    res.render('admin/service-form', {
      title: `Modifier ${service.name}`,
      user: req.user,
      service
    });
  } catch (error) {
    console.error('Erreur admin edit service:', error);
    res.status(500).render('error', { message: 'Erreur serveur' });
  }
});

// Save service
router.post('/services', [
  body('name').trim().notEmpty().withMessage('Le nom est requis'),
  body('type').isIn(['web_hosting', 'vps', 'dedicated', 'domain', 'ssl', 'email', 'other']),
  body('description').trim().notEmpty().withMessage('La description est requise'),
  body('price.monthly').isNumeric().withMessage('Le prix mensuel doit être un nombre'),
  body('price.yearly').optional().isNumeric()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('admin/service-form', {
        title: req.body.id ? 'Modifier le Service' : 'Créer un Service',
        user: req.user,
        service: req.body.id ? req.body : null,
        errors: errors.array(),
        formData: req.body
      });
    }

    const serviceData = {
      name: req.body.name,
      type: req.body.type,
      description: req.body.description,
      price: {
        monthly: parseFloat(req.body.price.monthly),
        yearly: req.body.price.yearly ? parseFloat(req.body.price.yearly) : undefined
      },
      features: req.body.features || [],
      specifications: req.body.specifications || {},
      isActive: req.body.isActive === 'on',
      isPopular: req.body.isPopular === 'on',
      sortOrder: parseInt(req.body.sortOrder) || 0
    };

    let service;
    if (req.body.id) {
      service = await Service.findByIdAndUpdate(req.body.id, serviceData, { new: true });
    } else {
      service = new Service(serviceData);
      await service.save();
    }

    res.redirect('/admin/services?success=Service enregistré avec succès');
  } catch (error) {
    console.error('Erreur save service:', error);
    res.status(500).render('error', { message: 'Erreur serveur' });
  }
});

// Delete service
router.post('/services/:id/delete', async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.redirect('/admin/services?success=Service supprimé avec succès');
  } catch (error) {
    console.error('Erreur delete service:', error);
    res.redirect('/admin/services?error=Erreur lors de la suppression');
  }
});

// Subscriptions management
router.get('/subscriptions', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const subscriptions = await Subscription.find()
      .populate('user')
      .populate('service')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Subscription.countDocuments();
    const totalPages = Math.ceil(total / limit);

    res.render('admin/subscriptions', {
      title: 'Gestion des Abonnements',
      user: req.user,
      subscriptions,
      pagination: {
        current: page,
        total: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Erreur admin subscriptions:', error);
    res.status(500).render('error', { message: 'Erreur serveur' });
  }
});

// Update subscription status
router.post('/subscriptions/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    await Subscription.findByIdAndUpdate(req.params.id, { status });
    res.redirect('/admin/subscriptions?success=Statut mis à jour');
  } catch (error) {
    console.error('Erreur update subscription status:', error);
    res.redirect('/admin/subscriptions?error=Erreur lors de la mise à jour');
  }
});

// Invoices management
router.get('/invoices', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const invoices = await Invoice.find()
      .populate('user')
      .populate('subscription')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Invoice.countDocuments();
    const totalPages = Math.ceil(total / limit);

    res.render('admin/invoices', {
      title: 'Gestion des Factures',
      user: req.user,
      invoices,
      pagination: {
        current: page,
        total: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Erreur admin invoices:', error);
    res.status(500).render('error', { message: 'Erreur serveur' });
  }
});

// Pages management
router.get('/pages', async (req, res) => {
  try {
    const pages = await Page.find().sort({ createdAt: -1 });
    res.render('admin/pages', {
      title: 'Gestion des Pages',
      user: req.user,
      pages
    });
  } catch (error) {
    console.error('Erreur admin pages:', error);
    res.status(500).render('error', { message: 'Erreur serveur' });
  }
});

// Create page
router.get('/pages/create', (req, res) => {
  res.render('admin/page-form', {
    title: 'Créer une Page',
    user: req.user,
    page: null
  });
});

// Edit page
router.get('/pages/:id/edit', async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) {
      return res.status(404).render('404', { message: 'Page non trouvée' });
    }

    res.render('admin/page-form', {
      title: `Modifier ${page.title}`,
      user: req.user,
      page
    });
  } catch (error) {
    console.error('Erreur admin edit page:', error);
    res.status(500).render('error', { message: 'Erreur serveur' });
  }
});

// Save page
router.post('/pages', [
  body('title').trim().notEmpty().withMessage('Le titre est requis'),
  body('content').trim().notEmpty().withMessage('Le contenu est requis'),
  body('slug').trim().notEmpty().withMessage('Le slug est requis')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('admin/page-form', {
        title: req.body.id ? 'Modifier la Page' : 'Créer une Page',
        user: req.user,
        page: req.body.id ? req.body : null,
        errors: errors.array(),
        formData: req.body
      });
    }

    const pageData = {
      title: req.body.title,
      slug: req.body.slug,
      content: req.body.content,
      excerpt: req.body.excerpt,
      metaTitle: req.body.metaTitle,
      metaDescription: req.body.metaDescription,
      status: req.body.status || 'draft',
      isHomePage: req.body.isHomePage === 'on',
      template: req.body.template || 'default',
      featuredImage: req.body.featuredImage,
      author: req.user._id
    };

    let page;
    if (req.body.id) {
      page = await Page.findByIdAndUpdate(req.body.id, pageData, { new: true });
    } else {
      page = new Page(pageData);
      await page.save();
    }

    res.redirect('/admin/pages?success=Page enregistrée avec succès');
  } catch (error) {
    console.error('Erreur save page:', error);
    res.status(500).render('error', { message: 'Erreur serveur' });
  }
});

module.exports = router;
