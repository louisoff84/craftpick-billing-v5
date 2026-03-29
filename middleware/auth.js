const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

// Rate limiting for authentication
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required',
      code: 'TOKEN_REQUIRED'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token',
        code: 'TOKEN_INVALID'
      });
    }

    req.user = user;
    next();
  });
};

// Role-based access control
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();
  };
};

// Admin access middleware
const requireAdmin = requireRole(['admin']);

// Client access middleware
const requireClient = requireRole(['client', 'admin']);

// API key authentication for external services
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'API key required',
      code: 'API_KEY_REQUIRED'
    });
  }

  // In production, validate against database
  const validApiKeys = [
    process.env.API_KEY,
    'test-api-key-for-development'
  ];

  if (!validApiKeys.includes(apiKey)) {
    return res.status(403).json({
      success: false,
      message: 'Invalid API key',
      code: 'INVALID_API_KEY'
    });
  }

  next();
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key', (err, user) => {
      if (!err) {
        req.user = user;
      }
    });
  }

  next();
};

// Check if user owns the resource
const checkResourceOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id || req.params.serviceId || req.params.invoiceId;
      const userId = req.user.id;

      // In production, check database
      // For now, we'll simulate ownership check
      const userResources = {
        services: ['1', '2', '3'], // User's service IDs
        invoices: ['1', '2', '3'], // User's invoice IDs
        tickets: ['1', '2', '3']  // User's ticket IDs
      };

      const userResourceIds = userResources[resourceType] || [];
      
      if (!userResourceIds.includes(resourceId) && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this resource',
          code: 'RESOURCE_ACCESS_DENIED'
        });
      }

      next();
    } catch (error) {
      console.error('Resource ownership check error:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking resource ownership',
        code: 'OWNERSHIP_CHECK_ERROR'
      });
    }
  };
};

// Validate session for web routes
const validateSession = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.redirect('/login');
  }
  next();
};

// CSRF protection
const csrfProtection = (req, res, next) => {
  if (req.method === 'GET') {
    return next();
  }

  const csrfToken = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionToken = req.session.csrfToken;

  if (!csrfToken || !sessionToken || csrfToken !== sessionToken) {
    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token',
      code: 'CSRF_INVALID'
    });
  }

  next();
};

// Generate CSRF token
const generateCsrfToken = (req, res, next) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = require('crypto').randomBytes(32).toString('hex');
  }
  res.locals.csrfToken = req.session.csrfToken;
  next();
};

module.exports = {
  authLimiter,
  authenticateToken,
  requireRole,
  requireAdmin,
  requireClient,
  authenticateApiKey,
  optionalAuth,
  checkResourceOwnership,
  validateSession,
  csrfProtection,
  generateCsrfToken
};
