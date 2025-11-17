# 🌱 AgriTech Tunisia - Plateforme Agricole Intelligente

[![Laravel](https://img.shields.io/badge/Laravel-11.x-red.svg)](https://laravel.com)
[![Nuxt.js](https://img.shields.io/badge/Nuxt.js-3.x-00DC82.svg)](https://nuxt.com)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D.svg)](https://vuejs.org)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Marketplace agricole directe avec intelligence artificielle - Connectant agriculteurs et acheteurs en Tunisie.

## 📋 Table des Matières

- [À propos](#à-propos)
- [Fonctionnalités](#fonctionnalités)
- [Architecture Technique](#architecture-technique)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [API Documentation](#api-documentation)
- [Contribution](#contribution)
- [License](#license)

## 🎯 À propos

AgriTech Tunisia est une solution digitale innovante visant à révolutionner le secteur agricole tunisien en créant un pont direct entre producteurs et acheteurs. En éliminant les intermédiaires traditionnels et en intégrant des technologies d'intelligence artificielle, la plateforme permet aux agriculteurs d'obtenir des prix justes pour leurs produits tout en offrant aux acheteurs un accès direct à des produits frais et traçables.

### Proposition de Valeur

**Pour les agriculteurs:**
- ✅ Accès direct au marché sans intermédiaires
- ✅ Augmentation des revenus de 20-40%
- ✅ Conseils agronomiques personnalisés via IA
- ✅ Prévisions météorologiques hyper-localisées
- ✅ Visibilité en ligne et développement de leur marque

**Pour les acheteurs:**
- ✅ Produits frais directement de la ferme
- ✅ Prix compétitifs
- ✅ Traçabilité complète des produits
- ✅ Large sélection de produits locaux
- ✅ Soutien à l'agriculture locale

## ✨ Fonctionnalités

### Phase 1 - MVP (Implémentée)

- 🛒 **Marketplace**
  - Catalogue de produits avec recherche avancée
  - Filtres multi-critères (catégorie, prix, localisation, bio)
  - Système de notation et avis
  - Panier d'achat intelligent

- 👥 **Gestion Utilisateurs**
  - Inscription/Connexion multi-rôles (agriculteur/acheteur)
  - Profils personnalisés
  - Dashboard utilisateur

- 📦 **Gestion Commandes**
  - Création et suivi de commandes
  - Statuts en temps réel
  - Historique des transactions
  - Annulation de commandes

- 💳 **Paiements**
  - Intégration gateways tunisiens (Paymee, Flouci, D17)
  - Paiement par carte bancaire
  - Virement bancaire
  - Cash on Delivery

- 🌤️ **Météo**
  - Prévisions localisées
  - Alertes météorologiques
  - Historique climatique

### Phase 2 - Extensions (À venir)

- 🤖 IA Détection maladies des plantes
- 📊 IA Prévisions de rendement
- 💡 Système de recommandations intelligent
- 🚚 Module logistique avancé
- 📱 Application mobile Flutter
- 💬 Chat en temps réel (WebSocket)

### Phase 3 - Consolidation (Futur)

- 🔗 Blockchain pour traçabilité
- 📡 IoT et capteurs connectés
- 🏢 Marketplace B2B
- 🌍 Expansion régionale (Maghreb)

## 🏗️ Architecture Technique

### Stack Backend

- **Framework:** Laravel 11.x (PHP 8.3)
- **Bases de données:**
  - PostgreSQL 16 (données principales)
  - MongoDB 7.0 (logs et analytics)
  - Redis 7.2 (cache et sessions)
- **Search:** Elasticsearch 8.x
- **API:** RESTful avec Laravel Sanctum

### Stack Frontend

- **Framework:** Nuxt.js 3 (SSR)
- **UI Library:** Vue.js 3
- **Styling:** Tailwind CSS 3 + DaisyUI
- **State Management:** Pinia
- **HTTP Client:** Fetch API

### Infrastructure

- **Containerisation:** Docker + Docker Compose
- **Serveur Web:** Nginx (production)
- **Email Testing:** MailHog (dev)

## 🚀 Installation

### Prérequis

- Docker & Docker Compose
- Git
- Au moins 4GB RAM disponible

### Installation avec Docker (Recommandé)

1. **Cloner le repository**
```bash
git clone https://github.com/haythemsaa/agriculture.git
cd agriculture
```

2. **Lancer les conteneurs**
```bash
docker-compose up -d
```

3. **Installer les dépendances backend**
```bash
docker-compose exec backend composer install
docker-compose exec backend cp .env.example .env
docker-compose exec backend php artisan key:generate
```

4. **Configurer la base de données**
```bash
docker-compose exec backend php artisan migrate
docker-compose exec backend php artisan db:seed
```

5. **Installer les dépendances frontend**
```bash
docker-compose exec frontend npm install
```

6. **Accéder à l'application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- MailHog: http://localhost:8025

### Installation Manuelle

#### Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## ⚙️ Configuration

### Variables d'Environnement Backend

Créer un fichier `.env` dans le dossier `backend/`:

```env
APP_NAME="AgriTech Tunisia"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=agritech
DB_USERNAME=postgres
DB_PASSWORD=postgres

REDIS_HOST=redis
REDIS_PORT=6379

# Payment Gateways
PAYMEE_API_KEY=your_key
FLOUCI_API_KEY=your_key
D17_API_KEY=your_key

# Weather API
OPENWEATHER_API_KEY=your_key
```

### Variables d'Environnement Frontend

Les variables sont configurées dans `nuxt.config.ts`:

```typescript
runtimeConfig: {
  public: {
    apiBase: 'http://localhost:8000/api/v1'
  }
}
```

## 📚 Utilisation

### Créer un compte Agriculteur

1. Visitez http://localhost:3000/register
2. Sélectionnez "Agriculteur"
3. Remplissez vos informations:
   - Nom de la ferme
   - Localisation (gouvernorat/délégation)
   - Spécialisation
4. Soumettez le formulaire

### Ajouter un produit

1. Connectez-vous en tant qu'agriculteur
2. Allez sur votre Dashboard
3. Cliquez sur "Ajouter un produit"
4. Remplissez les informations:
   - Photos (minimum 1)
   - Catégorie
   - Prix et unité
   - Stock disponible
   - Description
5. Publiez le produit

### Passer une commande

1. Parcourez le marketplace
2. Ajoutez des produits au panier
3. Vérifiez votre panier
4. Choisissez le mode de livraison
5. Procédez au paiement

## 📖 API Documentation

### Authentication

#### Register
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "role": "agriculteur",
  "first_name": "Ahmed",
  "last_name": "Ben Ali",
  "email": "ahmed@example.com",
  "phone": "+216 20 123 456",
  "password": "password",
  "password_confirmation": "password",
  "farm_name": "Ferme Bio Ahmed",
  "governorate": "Nabeul",
  "delegation": "Hammamet"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "ahmed@example.com",
  "password": "password"
}
```

### Products

#### Get Products
```http
GET /api/v1/products?search=tomate&category_id=2&governorate=Nabeul
```

#### Create Product
```http
POST /api/v1/products
Authorization: Bearer {token}
Content-Type: application/json

{
  "category_id": 2,
  "name_fr": "Tomates Bio",
  "name_ar": "طماطم بيولوجية",
  "description_fr": "Tomates fraîches biologiques",
  "images": ["url1", "url2"],
  "price_per_unit": 3.50,
  "unit": "kg",
  "stock_available": 100,
  "is_organic": true
}
```

### Orders

#### Create Order
```http
POST /api/v1/orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "items": [
    {
      "product_id": 1,
      "quantity": 5
    }
  ],
  "delivery_type": "home_delivery",
  "delivery_address": {
    "street": "123 Avenue Habib Bourguiba",
    "city": "Tunis",
    "governorate": "Tunis",
    "postal_code": "1000"
  },
  "payment_method": "card"
}
```

## 📂 Structure du Projet

```
agriculture/
├── backend/                    # Laravel Backend
│   ├── app/
│   │   ├── Models/            # Eloquent Models
│   │   ├── Http/Controllers/  # API Controllers
│   │   └── Services/          # Business Logic
│   ├── database/
│   │   ├── migrations/        # Database Migrations
│   │   └── seeders/           # Data Seeders
│   ├── routes/
│   │   └── api.php           # API Routes
│   └── .env.example          # Environment Template
│
├── frontend/                   # Nuxt.js Frontend
│   ├── components/            # Vue Components
│   ├── pages/                 # Application Pages
│   ├── stores/                # Pinia Stores
│   ├── layouts/               # Page Layouts
│   ├── assets/                # Static Assets
│   └── nuxt.config.ts        # Nuxt Configuration
│
├── mobile/                     # Flutter Mobile (Phase 2)
├── docker/                     # Docker Configurations
├── docker-compose.yml          # Docker Compose File
└── README.md                   # This File
```

## 🧪 Tests

### Backend Tests

```bash
cd backend
php artisan test
```

### Frontend Tests

```bash
cd frontend
npm run test
```

## 🔒 Sécurité

- Authentification JWT avec Laravel Sanctum
- HTTPS TLS 1.3 en production
- Validation des données côté serveur
- Protection CSRF
- Rate limiting sur les APIs
- Chiffrement AES-256 des données sensibles

## 🌐 Internationalisation

L'application supporte 3 langues:
- 🇫🇷 Français (par défaut)
- 🇹🇳 Arabe
- 🇬🇧 Anglais

## 📊 Base de Données

### Tables Principales

- `users` - Utilisateurs
- `agriculteurs` - Profils agriculteurs
- `acheteurs` - Profils acheteurs
- `products` - Produits
- `categories` - Catégories de produits
- `orders` - Commandes
- `order_items` - Détails commandes
- `reviews` - Avis et notes
- `transactions` - Transactions financières
- `conversations` - Messagerie
- `messages` - Messages
- `weather_data` - Données météo
- `ai_recommendations` - Recommandations IA

## 🤝 Contribution

Les contributions sont les bienvenues! Suivez ces étapes:

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 Roadmap

- [x] Phase 1: MVP Marketplace
- [ ] Phase 2: IA et Extensions
- [ ] Phase 3: Blockchain et IoT
- [ ] Expansion régionale

## 📞 Contact

**Équipe AgriTech Tunisia**
- Email: contact@agritech.tn
- Website: https://agritech.tn
- GitHub: https://github.com/haythemsaa/agriculture

## 📄 License

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

**Développé avec ❤️ en Tunisie 🇹🇳**

*Révolutionnons l'agriculture ensemble!* 🌱
