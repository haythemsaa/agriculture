# 📚 API Documentation - AgriTech Tunisia

## Base URL
```
Production: https://api.agritech.tn/api/v1
Development: http://localhost:8000/api/v1
```

## Authentication

Toutes les routes protégées nécessitent un token Bearer dans le header:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 🔐 Authentication Endpoints

### Register
Créer un nouveau compte utilisateur.

**Endpoint:** `POST /auth/register`

**Body:**
```json
{
  "role": "agriculteur", // ou "acheteur"
  "first_name": "Ahmed",
  "last_name": "Ben Ali",
  "email": "ahmed@example.tn",
  "phone": "+216 20 123 456",
  "password": "password",
  "password_confirmation": "password",
  "language": "fr", // optionnel: ar, fr, en

  // Si agriculteur:
  "farm_name": "Ferme Bio Ahmed",
  "governorate": "Nabeul",
  "delegation": "Hammamet",
  "farm_size": 5.5,
  "bio": "Description de la ferme",

  // Si acheteur:
  "buyer_type": "particulier", // ou restaurant, hotel, epicerie, autre
  "company_name": "Mon Entreprise" // optionnel
}
```

**Response:** `201 Created`
```json
{
  "message": "Registration successful",
  "user": { ... },
  "token": "eyJ0eXAiOiJKV1QiLCJh..."
}
```

### Login
Authentifier un utilisateur existant.

**Endpoint:** `POST /auth/login`

**Body:**
```json
{
  "email": "ahmed@example.tn",
  "password": "password"
}
```

**Response:** `200 OK`
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "role": "agriculteur",
    "first_name": "Ahmed",
    "last_name": "Ben Ali",
    "email": "ahmed@example.tn",
    "agriculteur": { ... }
  },
  "token": "eyJ0eXAiOiJKV1QiLCJh..."
}
```

### Logout
Déconnecter l'utilisateur (invalide le token).

**Endpoint:** `POST /auth/logout`
**Auth:** Required

**Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

### Get Current User
Récupérer les informations de l'utilisateur connecté.

**Endpoint:** `GET /auth/me`
**Auth:** Required

**Response:** `200 OK`
```json
{
  "user": { ... }
}
```

---

## 🛒 Products Endpoints

### Get Products
Récupérer la liste des produits avec filtres.

**Endpoint:** `GET /products`

**Query Parameters:**
- `search` - Recherche textuelle
- `category_id` - Filtrer par catégorie
- `governorate` - Filtrer par gouvernorat
- `min_price` - Prix minimum
- `max_price` - Prix maximum
- `is_organic` - true/false pour produits bio
- `certification` - Filtrer par certification (bio, aoc, halal)
- `sort_by` - created_at, price, rating, popularity
- `sort_order` - asc, desc
- `per_page` - Nombre d'éléments par page (défaut: 20)
- `page` - Numéro de page

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "name_fr": "Tomates Bio",
      "price_per_unit": 3.50,
      "unit": "kg",
      "stock_available": 100,
      "is_organic": true,
      "rating_average": 4.8,
      "agriculteur": { ... },
      "category": { ... }
    }
  ],
  "current_page": 1,
  "last_page": 5,
  "per_page": 20,
  "total": 95
}
```

### Get Single Product
Récupérer les détails d'un produit.

**Endpoint:** `GET /products/{id}`

**Response:** `200 OK`
```json
{
  "product": {
    "id": 1,
    "name_fr": "Tomates Bio",
    "description_fr": "Tomates fraîches...",
    "images": ["url1", "url2"],
    "price_per_unit": 3.50,
    "unit": "kg",
    "minimum_order": 2,
    "stock_available": 100,
    "harvest_date": "2025-11-10",
    "is_organic": true,
    "certifications": ["bio"],
    "origin": "Nabeul",
    "tags": ["fresh", "local"],
    "rating_average": 4.8,
    "rating_count": 24,
    "sales_count": 156,
    "agriculteur": { ... },
    "category": { ... },
    "reviews": [ ... ]
  }
}
```

### Create Product
Créer un nouveau produit (agriculteur uniquement).

**Endpoint:** `POST /products`
**Auth:** Required (agriculteur)

**Body:**
```json
{
  "category_id": 1,
  "name_ar": "طماطم عضوية",
  "name_fr": "Tomates Bio",
  "name_en": "Organic Tomatoes",
  "description_fr": "Tomates fraîches biologiques",
  "images": ["url1", "url2"],
  "price_per_unit": 3.50,
  "unit": "kg",
  "stock_available": 100,
  "minimum_order": 2,
  "harvest_date": "2025-11-15",
  "is_organic": true,
  "certifications": ["bio"],
  "tags": ["fresh", "local"]
}
```

**Response:** `201 Created`
```json
{
  "message": "Product created successfully",
  "product": { ... }
}
```

### Update Product
Mettre à jour un produit.

**Endpoint:** `PUT /products/{id}`
**Auth:** Required (propriétaire)

**Body:** (tous champs optionnels)
```json
{
  "name_fr": "Tomates Bio Premium",
  "price_per_unit": 4.00,
  "stock_available": 150,
  "status": "active"
}
```

**Response:** `200 OK`
```json
{
  "message": "Product updated successfully",
  "product": { ... }
}
```

### Delete Product
Supprimer un produit.

**Endpoint:** `DELETE /products/{id}`
**Auth:** Required (propriétaire)

**Response:** `200 OK`
```json
{
  "message": "Product deleted successfully"
}
```

### Get Similar Products
Récupérer des produits similaires.

**Endpoint:** `GET /products/{id}/similar`

**Response:** `200 OK`
```json
{
  "products": [ ... ]
}
```

---

## 📦 Orders Endpoints

### Get Orders
Récupérer les commandes de l'utilisateur.

**Endpoint:** `GET /orders`
**Auth:** Required

**Query Parameters:**
- `status` - Filtrer par statut
- `per_page` - Nombre d'éléments par page
- `page` - Numéro de page

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "order_number": "AGR-XYZ123",
      "status": "confirmed",
      "payment_status": "paid",
      "total_amount": 45.50,
      "created_at": "2025-11-17T10:30:00Z",
      "buyer": { ... },
      "agriculteur": { ... },
      "items": [ ... ]
    }
  ]
}
```

### Get Single Order
Récupérer les détails d'une commande.

**Endpoint:** `GET /orders/{id}`
**Auth:** Required

**Response:** `200 OK`
```json
{
  "order": {
    "id": 1,
    "order_number": "AGR-XYZ123",
    "status": "in_delivery",
    "payment_status": "paid",
    "delivery_type": "home_delivery",
    "delivery_address": { ... },
    "delivery_date": "2025-11-20",
    "subtotal": 40.00,
    "commission": 4.00,
    "delivery_fee": 5.00,
    "total_amount": 45.00,
    "payment_method": "card",
    "status_history": [ ... ],
    "buyer": { ... },
    "agriculteur": { ... },
    "items": [ ... ],
    "reviews": [ ... ]
  }
}
```

### Create Order
Créer une nouvelle commande.

**Endpoint:** `POST /orders`
**Auth:** Required (acheteur)

**Body:**
```json
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
  "delivery_date": "2025-11-20",
  "delivery_notes": "Appeler avant de livrer",
  "payment_method": "card"
}
```

**Response:** `201 Created`
```json
{
  "message": "Order created successfully",
  "order": { ... }
}
```

### Update Order Status
Mettre à jour le statut d'une commande (agriculteur/admin).

**Endpoint:** `PUT /orders/{id}/status`
**Auth:** Required (agriculteur ou admin)

**Body:**
```json
{
  "status": "confirmed",
  "note": "Commande confirmée, prête demain"
}
```

**Statuts possibles:**
- `pending` - En attente
- `confirmed` - Confirmée
- `preparing` - En préparation
- `ready` - Prête
- `in_delivery` - En livraison
- `delivered` - Livrée
- `cancelled` - Annulée

**Response:** `200 OK`
```json
{
  "message": "Order status updated successfully",
  "order": { ... }
}
```

### Cancel Order
Annuler une commande.

**Endpoint:** `POST /orders/{id}/cancel`
**Auth:** Required

**Body:**
```json
{
  "reason": "Changement de plans"
}
```

**Response:** `200 OK`
```json
{
  "message": "Order cancelled successfully"
}
```

---

## 📂 Categories Endpoints

### Get Categories
Récupérer toutes les catégories.

**Endpoint:** `GET /categories`

**Query Parameters:**
- `parent_id` - Filtrer par parent
- `root_only` - true pour ne récupérer que les catégories racines

**Response:** `200 OK`
```json
{
  "categories": [
    {
      "id": 1,
      "name_fr": "Fruits",
      "slug": "fruits",
      "icon": "🍎",
      "children": [ ... ]
    }
  ]
}
```

### Get Category Tree
Récupérer l'arbre complet des catégories.

**Endpoint:** `GET /categories/tree`

**Response:** `200 OK`
```json
{
  "categories": [
    {
      "id": 1,
      "name_fr": "Fruits",
      "children": [
        {
          "id": 2,
          "name_fr": "Agrumes",
          "parent_id": 1
        }
      ]
    }
  ]
}
```

---

## 🌤️ Weather Endpoints

### Get Current Weather
Récupérer la météo actuelle pour une localisation.

**Endpoint:** `GET /weather/current`

**Query Parameters:**
- `governorate` (required) - Gouvernorat

**Response:** `200 OK`
```json
{
  "governorate": "Nabeul",
  "weather": {
    "temperature": 22.5,
    "feels_like": 21.0,
    "humidity": 65,
    "precipitation": 0,
    "wind_speed": 15.5,
    "condition": "clear",
    "is_alert": false
  }
}
```

### Get Weather Forecast
Récupérer les prévisions météo.

**Endpoint:** `GET /weather/forecast`

**Query Parameters:**
- `governorate` (required) - Gouvernorat
- `days` - Nombre de jours (1-14, défaut: 7)

**Response:** `200 OK`
```json
{
  "governorate": "Nabeul",
  "forecast": [
    {
      "forecast_time": "2025-11-18T12:00:00Z",
      "temperature": 23.0,
      "humidity": 60,
      "precipitation": 0.5,
      "wind_speed": 12.0,
      "condition": "cloudy"
    }
  ]
}
```

### Get Weather Alerts
Récupérer les alertes météo.

**Endpoint:** `GET /weather/alerts`

**Query Parameters:**
- `governorate` (optionnel) - Filtrer par gouvernorat

**Response:** `200 OK`
```json
{
  "alerts": [
    {
      "governorate": "Nabeul",
      "alert_type": "Gelées",
      "alert_message": "Risque de gelées cette nuit, protégez vos cultures",
      "forecast_time": "2025-11-18T23:00:00Z"
    }
  ]
}
```

---

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": {
    "field_name": ["Error details"]
  }
}
```

### Pagination Format
```json
{
  "data": [ ... ],
  "pagination": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 20,
    "total": 95,
    "from": 1,
    "to": 20
  }
}
```

---

## 🔢 HTTP Status Codes

- `200 OK` - Requête réussie
- `201 Created` - Ressource créée avec succès
- `400 Bad Request` - Données invalides
- `401 Unauthorized` - Non authentifié
- `403 Forbidden` - Non autorisé
- `404 Not Found` - Ressource introuvable
- `422 Unprocessable Entity` - Erreur de validation
- `500 Internal Server Error` - Erreur serveur

---

## 🔒 Rate Limiting

- **Limite:** 60 requêtes par minute
- **Header de réponse:** `X-RateLimit-Remaining`

---

## 📝 Notes

1. Toutes les dates sont au format ISO 8601 (UTC)
2. Les montants sont en TND (Dinars Tunisiens)
3. L'API supporte l'internationalisation (AR/FR/EN)
4. Les images doivent être des URLs valides
5. Le champ `status` des produits et commandes suit un workflow défini

---

**Version:** 1.0
**Dernière mise à jour:** 17 Novembre 2025
