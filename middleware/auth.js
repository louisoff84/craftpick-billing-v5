const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.session?.token;

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Accès non autorisé - Token manquant' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Accès non autorisé - Utilisateur invalide' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Accès non autorisé - Token invalide' 
    });
  }
};

// Middleware to check admin role
const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          success: false, 
          message: 'Accès refusé - Droits administratifs requis' 
        });
      }
      next();
    });
  } catch (error) {
    console.error('Erreur d\'authentification admin:', error);
    res.status(403).json({ 
      success: false, 
      message: 'Accès refusé' 
    });
  }
};

// Middleware for web views (session-based)
const webAuth = async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.redirect('/auth/login');
    }

    const user = await User.findById(req.session.userId).select('-password');
    
    if (!user || !user.isActive) {
      req.session.destroy();
      return res.redirect('/auth/login');
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Erreur d\'authentification web:', error);
    req.session.destroy();
    res.redirect('/auth/login');
  }
};

// Middleware for admin web views
const webAdminAuth = async (req, res, next) => {
  try {
    await webAuth(req, res, () => {
      if (req.user.role !== 'admin') {
        return res.redirect('/client/dashboard');
      }
      next();
    });
  } catch (error) {
    console.error('Erreur d\'authentification admin web:', error);
    res.redirect('/auth/login');
  }
};

module.exports = {
  auth,
  adminAuth,
  webAuth,
  webAdminAuth
};
