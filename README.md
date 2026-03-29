# Service d'Hébergement Web - HostPro

Une application web complète pour la gestion de services d'hébergement avec espace client et panneau d'administration.

## 🚀 Fonctionnalités

### Pour les Clients
- **Inscription et Connexion** : Système d'authentification sécurisé avec JWT
- **Tableau de bord** : Vue d'ensemble des services et factures
- **Gestion des Services** : Commande et gestion des abonnements
- **Facturation** : Consultation et paiement des factures
- **Profil** : Gestion des informations personnelles

### Pour les Administrateurs
- **Panneau d'Administration** : Interface complète de gestion
- **Gestion des Utilisateurs** : Consultation et gestion des comptes clients
- **Gestion des Services** : Création et modification des offres d'hébergement
- **Gestion des Abonnements** : Suivi et gestion des abonnements actifs
- **Gestion des Factures** : Émission et suivi des paiements
- **Gestion des Pages** : Éditeur de contenu pour le site public

### Interface Publique
- **Page d'Accueil** : Présentation des services et appel à l'action
- **Catalogue de Services** : Liste détaillée des offres disponibles
- **Pages Dynamiques** : Gestion CMS pour les pages institutionnelles
- **Design Responsive** : Compatible mobile et desktop

## 🛠️ Stack Technique

### Backend
- **Node.js** : Runtime JavaScript
- **Express.js** : Framework web
- **MongoDB** : Base de données NoSQL
- **Mongoose** : ODM MongoDB
- **JWT** : Authentification
- **bcryptjs** : Hashage des mots de passe
- **Handlebars** : Moteur de templates

### Frontend
- **HTML5 / CSS3** : Structure et style
- **JavaScript (ES6+)** : Logique client
- **Font Awesome** : Icônes
- **CSS Grid / Flexbox** : Layout responsive

### Sécurité
- **Helmet** : Sécurité des headers
- **CORS** : Gestion des cross-origin
- **express-validator** : Validation des entrées
- **Rate limiting** : Protection contre les attaques

## 📋 Prérequis

- Node.js 16.x ou supérieur
- MongoDB 4.4 ou supérieur
- npm ou yarn

## 🚀 Installation

### 1. Cloner le projet
```bash
git clone <repository-url>
cd hosting-service
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configurer les variables d'environnement
Copiez le fichier `.env` et modifiez les valeurs :
```bash
cp .env.example .env
```

Variables à configurer :
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/hosting_service
JWT_SECRET=votre_jwt_secret_key_tres_securisee
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre_email@gmail.com
EMAIL_PASS=votre_mot_de_passe_app
```

### 4. Démarrer MongoDB
```bash
# Sur Windows avec service MongoDB
net start MongoDB

# Ou avec Docker
docker run -d -p 27017:27017 --name mongodb mongo
```

### 5. Importer les données initiales (optionnel)
```bash
# Créer un administrateur par défaut
node scripts/create-admin.js
```

### 6. Démarrer l'application
```bash
# Mode développement
npm run dev

# Mode production
npm start
```

L'application sera accessible sur `http://localhost:3000`

## 📁 Structure du Projet

```
hosting-service/
├── config/                 # Fichiers de configuration
├── middleware/             # Middlewares Express
│   └── auth.js            # Middleware d'authentification
├── models/                # Modèles Mongoose
│   ├── User.js           # Modèle utilisateur
│   ├── Service.js        # Modèle service
│   ├── Subscription.js   # Modèle abonnement
│   ├── Invoice.js        # Modèle facture
│   └── Page.js           # Modèle page CMS
├── routes/                # Routes Express
│   ├── auth.js           # Routes d'authentification
│   ├── public.js         # Routes publiques
│   ├── client.js         # Routes client
│   └── admin.js          # Routes admin
├── views/                 # Templates Handlebars
│   ├── layouts/          # Layouts principaux
│   ├── auth/             # Pages d'authentification
│   ├── client/           # Pages client
│   ├── admin/            # Pages admin
│   └── partials/         # Partials réutilisables
├── public/                # Fichiers statiques
│   ├── css/              # Feuilles de style
│   ├── js/               # Scripts JavaScript
│   └── images/           # Images
├── uploads/               # Fichiers uploadés
├── scripts/               # Scripts utilitaires
├── .env                   # Variables d'environnement
├── package.json           # Dépendances et scripts
├── server.js              # Point d'entrée de l'application
└── README.md              # Documentation
```

## 🔧 Configuration

### Base de données
L'application utilise MongoDB. Assurez-vous que MongoDB est en cours d'exécution et accessible via l'URI configuré dans `.env`.

### Email
Pour l'envoi d'emails (vérification de compte, factures), configurez les paramètres SMTP dans `.env`.

### Sécurité
- Changez `JWT_SECRET` avec une chaîne sécurisée et unique
- En production, utilisez HTTPS et configurez `NODE_ENV=production`
- Activez les headers de sécurité avec Helmet

## 👤 Utilisateurs

### Créer un administrateur
```bash
node scripts/create-admin.js
```

Ou manuellement dans MongoDB :
```javascript
db.users.insertOne({
  email: "admin@example.com",
  password: "$2a$12$...", // hash bcrypt
  firstName: "Admin",
  lastName: "User",
  role: "admin",
  isActive: true,
  emailVerified: true
});
```

### Accès par défaut
- **Client** : `http://localhost:3000/login`
- **Admin** : `http://localhost:3000/admin/dashboard`

## 🚀 Déploiement

### Déploiement sur VPS/Cloud

1. **Préparation du serveur**
```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installer MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Démarrer MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

2. **Déployer l'application**
```bash
# Cloner le projet
git clone <repository-url>
cd hosting-service

# Installer les dépendances
npm install --production

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec les valeurs de production

# Démarrer avec PM2
npm install -g pm2
pm2 start server.js --name "hosting-service"
pm2 startup
pm2 save
```

3. **Configuration Nginx (recommandé)**
```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Déploiement Docker

1. **Créer le Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

USER node

CMD ["node", "server.js"]
```

2. **Créer docker-compose.yml**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/hosting_service
    depends_on:
      - mongo
    volumes:
      - ./uploads:/app/uploads

  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

3. **Démarrer**
```bash
docker-compose up -d
```

## 🔍 Monitoring et Logs

### Logs avec PM2
```bash
# Voir les logs
pm2 logs hosting-service

# Monitorer
pm2 monit

# Redémarrer
pm2 restart hosting-service
```

### Monitoring
- Utilisez des outils comme New Relic, Datadog ou PM2 Monitoring
- Configurez des alertes pour les erreurs et performance
- Surveillez l'utilisation CPU, mémoire et disque

## 🛡️ Sécurité en Production

1. **Mettre à jour régulièrement**
```bash
npm audit fix
npm update
```

2. **Configurer le firewall**
```bash
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

3. **Utiliser HTTPS**
```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx

# Obtenir un certificat SSL
sudo certbot --nginx -d votre-domaine.com
```

4. **Sauvegardes**
```bash
# Script de sauvegarde MongoDB
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --out /backup/mongodb_$DATE
```

## 🐛 Dépannage

### Problèmes courants

1. **Erreur de connexion MongoDB**
   - Vérifiez que MongoDB est en cours d'exécution
   - Vérifiez l'URI dans `.env`
   - Vérifiez les permissions réseau

2. **Erreur JWT**
   - Vérifiez que `JWT_SECRET` est défini dans `.env`
   - Assurez-vous que le secret est le même sur tous les serveurs

3. **Permissions de fichiers**
   - Assurez-vous que le dossier `uploads` a les bonnes permissions
   - Vérifiez que l'utilisateur du processus peut écrire dans les logs

### Logs de débogage
```bash
# Activer le mode debug
DEBUG=* npm start

# Logs spécifiques
DEBUG=express:* npm start
```

## 📞 Support

Pour toute question ou problème :
- Documentation : [Wiki du projet]
- Issues : [GitHub Issues]
- Email : support@votre-domaine.com

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🤝 Contribuer

Les contributions sont les bienvenues ! Veuillez suivre ces étapes :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commiter vos changements (`git commit -am 'Ajout nouvelle fonctionnalité'`)
4. Pusher sur la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Créer une Pull Request

---

**Développé avec ❤️ pour les besoins d'hébergement web modernes**
