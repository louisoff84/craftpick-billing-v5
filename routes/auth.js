const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Erreur de validation',
      errors: errors.array()
    });
  }
  next();
};

// Mode développement - utilisateurs factices
const devUsers = {
  'admin@craftpick-hosting.com': {
    id: 1,
    email: 'admin@craftpick-hosting.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm' // admin123
  },
  'user@craftpick-hosting.com': {
    id: 2,
    email: 'user@craftpick-hosting.com',
    firstName: 'User',
    lastName: 'Test',
    role: 'client',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm' // admin123
  }
};

// Register (API)
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  body('firstName').trim().notEmpty().withMessage('Le prénom est requis'),
  body('lastName').trim().notEmpty().withMessage('Le nom est requis')
], handleValidationErrors, async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    // En mode développement
    if (process.env.NODE_ENV !== 'production') {
      // Check if user already exists
      if (devUsers[email]) {
        return res.status(400).json({
          success: false,
          message: 'Cet email est déjà utilisé'
        });
      }

      // Create new user
      const hashedPassword = await bcrypt.hash(password, 12);
      const newUser = {
        id: Date.now(),
        email,
        firstName,
        lastName,
        phone: phone || '',
        role: 'client',
        password: hashedPassword
      };

      // Generate JWT token
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: newUser.role },
        process.env.JWT_SECRET || 'fallback-secret-key',
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      // Store in dev users
      devUsers[email] = newUser;

      return res.status(201).json({
        success: true,
        message: 'Inscription réussie',
        data: {
          user: {
            id: newUser.id,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            role: newUser.role
          },
          token
        }
      });
    }

    // En production (avec BDD)
    res.status(500).json({
      success: false,
      message: 'Mode production non configuré'
    });
  } catch (error) {
    console.error('Erreur d\'inscription:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Login (API)
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;

    // En mode développement
    if (process.env.NODE_ENV !== 'production') {
      const user = devUsers[email];
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Email ou mot de passe incorrect'
        });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Email ou mot de passe incorrect'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'fallback-secret-key',
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      return res.json({
        success: true,
        message: 'Connexion réussie',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
          },
          token
        }
      });
    }

    // En production (avec BDD)
    res.status(500).json({
      success: false,
      message: 'Mode production non configuré'
    });
  } catch (error) {
    console.error('Erreur de connexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Get current user (API)
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token non fourni'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    
    // En mode développement
    if (process.env.NODE_ENV !== 'production') {
      const user = Object.values(devUsers).find(u => u.id === decoded.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }

      return res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone || '',
            role: user.role
          }
        }
      });
    }

    // En production
    res.status(500).json({
      success: false,
      message: 'Mode production non configuré'
    });
  } catch (error) {
    console.error('Erreur get user:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Update profile (API)
router.put('/profile', [
  body('firstName').trim().notEmpty().withMessage('Le prénom est requis'),
  body('lastName').trim().notEmpty().withMessage('Le nom est requis'),
  body('email').isEmail().normalizeEmail()
], handleValidationErrors, async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const { firstName, lastName, phone } = req.body;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Non authentifié'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    
    // En mode développement
    if (process.env.NODE_ENV !== 'production') {
      const user = Object.values(devUsers).find(u => u.id === decoded.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }
      
      user.firstName = firstName;
      user.lastName = lastName;
      user.phone = phone || '';
      
      return res.json({
        success: true,
        message: 'Profil mis à jour',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            role: user.role
          }
        }
      });
    }

    // En production
    res.status(500).json({
      success: false,
      message: 'Mode production non configuré'
    });
  } catch (error) {
    console.error('Erreur update profile:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Logout (API)
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Déconnexion réussie'
  });
});

module.exports = router;
