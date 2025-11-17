# 🚀 Guide de Démarrage Rapide - AgriTech Tunisia

## Installation en 5 Minutes avec Docker

### Prérequis
- Docker & Docker Compose installés
- Au moins 4GB RAM disponible

### Étape 1: Cloner le Repository
```bash
git clone https://github.com/haythemsaa/agriculture.git
cd agriculture
```

### Étape 2: Lancer avec Docker
```bash
docker-compose up -d
```

Cette commande va démarrer:
- ✅ PostgreSQL (Base de données)
- ✅ MongoDB (Logs)
- ✅ Redis (Cache)
- ✅ Elasticsearch (Recherche)
- ✅ Backend Laravel
- ✅ Frontend Nuxt.js
- ✅ MailHog (Email testing)

### Étape 3: Configurer le Backend
```bash
# Installer les dépendances
docker-compose exec backend composer install

# Copier et configurer .env
docker-compose exec backend cp .env.example .env

# Générer la clé d'application
docker-compose exec backend php artisan key:generate

# Exécuter les migrations
docker-compose exec backend php artisan migrate

# Charger les données de démonstration
docker-compose exec backend php artisan db:seed
```

### Étape 4: Configurer le Frontend
```bash
# Installer les dépendances
docker-compose exec frontend npm install
```

### Étape 5: Accéder à l'Application

🌐 **URLs d'accès:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Health: http://localhost:8000/api/health
- MailHog (Emails): http://localhost:8025

## 👤 Comptes de Test

### Agriculteurs
```
Email: ahmed@agritech.tn
Password: password
Rôle: Agriculteur (Fruits & Légumes Bio)

Email: fatma@agritech.tn
Password: password
Rôle: Agriculteur (Huile d'olive)

Email: mohamed@agritech.tn
Password: password
Rôle: Agriculteur (Dattes)
```

### Acheteurs
```
Email: sarah@example.tn
Password: password
Rôle: Acheteur particulier

Email: riadh@example.tn
Password: password
Rôle: Restaurant
```

### Admin
```
Email: admin@agritech.tn
Password: admin123
Rôle: Administrateur
```

## 📊 Données de Démonstration

Le seeder a créé:
- ✅ 5 Agriculteurs vérifiés
- ✅ 3 Acheteurs
- ✅ 10+ Catégories de produits
- ✅ 15+ Produits (fruits, légumes, huile d'olive, dattes, miel, produits laitiers)

## 🧪 Tester l'API

### 1. Health Check
```bash
curl http://localhost:8000/api/health
```

### 2. Voir les Produits
```bash
curl http://localhost:8000/api/v1/products
```

### 3. Login
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ahmed@agritech.tn",
    "password": "password"
  }'
```

### 4. Créer un Produit (avec token)
```bash
curl -X POST http://localhost:8000/api/v1/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "category_id": 1,
    "name_fr": "Tomates Bio",
    "name_ar": "طماطم عضوية",
    "description_fr": "Tomates fraîches biologiques",
    "images": ["https://example.com/image.jpg"],
    "price_per_unit": 3.50,
    "unit": "kg",
    "stock_available": 100,
    "is_organic": true
  }'
```

## 🎯 Fonctionnalités à Tester

### Frontend (http://localhost:3000)
1. **Page d'accueil** - Vue d'ensemble de la plateforme
2. **Marketplace** - Parcourir les produits avec filtres
3. **Détails Produit** - Voir un produit spécifique
4. **Inscription** - Créer un compte agriculteur ou acheteur
5. **Login** - Se connecter
6. **Panier** - Ajouter des produits au panier
7. **Checkout** - Finaliser une commande
8. **Dashboard** - Voir ses commandes et statistiques

### API Backend (http://localhost:8000/api/v1)
- ✅ Authentication (register, login, logout)
- ✅ Products (CRUD, search, filters)
- ✅ Categories (list, tree)
- ✅ Orders (create, list, update status)
- ✅ Weather (current, forecast, alerts)

## 📝 Commandes Utiles

### Backend
```bash
# Voir les logs
docker-compose logs -f backend

# Entrer dans le conteneur
docker-compose exec backend sh

# Exécuter des commandes Artisan
docker-compose exec backend php artisan [command]

# Nettoyer le cache
docker-compose exec backend php artisan cache:clear

# Créer un nouveau modèle
docker-compose exec backend php artisan make:model ModelName
```

### Frontend
```bash
# Voir les logs
docker-compose logs -f frontend

# Entrer dans le conteneur
docker-compose exec frontend sh

# Ajouter un package npm
docker-compose exec frontend npm install package-name
```

### Base de Données
```bash
# Accéder à PostgreSQL
docker-compose exec postgres psql -U postgres -d agritech

# Exécuter les migrations
docker-compose exec backend php artisan migrate

# Reset et reseed la base de données
docker-compose exec backend php artisan migrate:fresh --seed
```

## 🛑 Arrêter l'Application
```bash
# Arrêter tous les conteneurs
docker-compose down

# Arrêter et supprimer les volumes (⚠️ Efface les données)
docker-compose down -v
```

## 🔧 Troubleshooting

### Le port 3000 ou 8000 est déjà utilisé
```bash
# Changer les ports dans docker-compose.yml
# Ex: "3001:3000" au lieu de "3000:3000"
```

### Permission denied
```bash
# Donner les permissions sur le dossier backend
sudo chown -R $USER:$USER backend/storage
sudo chmod -R 775 backend/storage
```

### Les containers ne démarrent pas
```bash
# Voir les logs détaillés
docker-compose logs

# Rebuild les images
docker-compose up --build
```

### Base de données vide
```bash
# Re-exécuter les seeders
docker-compose exec backend php artisan db:seed
```

## 📚 Documentation Complète

Pour plus d'informations, consultez:
- [README.md](README.md) - Documentation complète
- [API Documentation](docs/API.md) - Documentation API détaillée
- [Contributing](CONTRIBUTING.md) - Guide de contribution

## 🆘 Support

- **Email**: contact@agritech.tn
- **GitHub Issues**: https://github.com/haythemsaa/agriculture/issues

---

**Bon développement! 🌱🚜📱**
