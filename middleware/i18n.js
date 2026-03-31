const path = require('path');
const fs = require('fs');

// Cache des traductions
const translations = {};

// Charger les traductions
function loadTranslations(lang) {
  if (translations[lang]) {
    return translations[lang];
  }
  
  try {
    const filePath = path.join(__dirname, '..', 'locales', `${lang}.json`);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      translations[lang] = JSON.parse(content);
      return translations[lang];
    }
  } catch (error) {
    console.error(`Error loading translations for ${lang}:`, error);
  }
  
  return {};
}

// Middleware de localisation
function localization(req, res, next) {
  // Langue par défaut : français
  const lang = req.query.lang || req.cookies?.lang || 'fr';
  
  // Charger les traductions
  const locale = loadTranslations(lang);
  
  // Fonction de traduction
  res.locals.t = function(key, defaultValue = '') {
    const keys = key.split('.');
    let value = locale;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue || key;
      }
    }
    
    return value || defaultValue || key;
  };
  
  // Helper pour le template
  res.locals.__ = res.locals.t;
  
  // Langue actuelle
  res.locals.currentLang = lang;
  
  next();
}

// Middleware pour changer la langue
function setLanguage(req, res, next) {
  if (req.query.lang) {
    res.cookie('lang', req.query.lang, { maxAge: 365 * 24 * 60 * 60 * 1000 });
  }
  next();
}

module.exports = { localization, setLanguage };
