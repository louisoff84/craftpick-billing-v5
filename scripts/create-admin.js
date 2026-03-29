const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

async function createAdmin() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connecté à MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@hostpro.com' });
    if (existingAdmin) {
      console.log('Un administrateur existe déjà avec cet email');
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const admin = new User({
      email: 'admin@hostpro.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true,
      emailVerified: true
    });

    await admin.save();
    console.log('Administrateur créé avec succès !');
    console.log('Email: admin@hostpro.com');
    console.log('Mot de passe: admin123');
    console.log('IMPORTANT: Changez ce mot de passe après la première connexion !');

  } catch (error) {
    console.error('Erreur lors de la création de l\'administrateur:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createAdmin();
