const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration MongoDB
const dbName = 's57_DBbilling';
const dbUser = 'u57_WN1hwAC0Pl';
const dbPassword = 'D^^JazSCHNB.4@HTmXmG!jCX';

// Script pour créer l'utilisateur et la base de données
const mongoScript = `
use ${dbName};
db.createUser({
  user: "${dbUser}",
  pwd: "${dbPassword}",
  roles: [
    { role: "readWrite", db: "${dbName}" },
    { role: "dbAdmin", db: "${dbName}" }
  ]
});
`;

// Écrire le script dans un fichier temporaire
const scriptPath = path.join(__dirname, 'temp-mongo-setup.js');
fs.writeFileSync(scriptPath, mongoScript);

console.log('Script MongoDB créé:', scriptPath);
console.log('Pour configurer la base de données:');
console.log('1. Installez MongoDB Community Server depuis https://www.mongodb.com/try/download/community');
console.log('2. Démarrez le service MongoDB');
console.log('3. Exécutez: mongo < temp-mongo-setup.js');
console.log('4. Ou utilisez Compass avec les identifiants fournis');

// Nettoyer le script après 10 secondes
setTimeout(() => {
  if (fs.existsSync(scriptPath)) {
    fs.unlinkSync(scriptPath);
    console.log('Script temporaire supprimé');
  }
}, 10000);
