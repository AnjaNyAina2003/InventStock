# InventStockManaging

Application web de gestion de stock et d'inventaire.

## Description

Ce projet permet de gérer les produits, les fournisseurs, les commandes et les mouvements de stock d'une entreprise. Il propose :

- une **interface web** avec tableau de bord, graphiques statistiques et alertes de réapprovisionnement ;
- une **API REST** construite avec Django REST Framework, consommée par un frontend React/Vite.

Les imports/exports CSV sont compatibles avec Excel (format français, séparateur point-virgule).

## Fonctionnalités

### Authentification
- Connexion par email avec token JWT
- Accès par rôle via une permission personnalisée (`IsAdminRole`)

### Gestion
- **Produits** : CRUD complet, catégories et unités (avec relation en cascade)
- **Fournisseurs** : CRUD complet
- **Commandes** : CRUD avec lignes de commande imbriquées (`LigneCommande`)
- **Entrées/Sorties** : suivi des mouvements de stock
- **Paramètres** : gestion des catégories et unités, accordéon selon le rôle

### Interface utilisateur
- Tableau de bord avec cartes statistiques et graphiques
- Tableau paginé réutilisable, recherche côté serveur avec debounce
- Support multi-devises (MGA, EUR, USD, GBP)
- Alerte automatique de seuil de réapprovisionnement
- Import / export CSV (compatible Excel FR)

## Technologies utilisées

**Backend**
- Python
- Django / Django REST Framework
- JWT (authentification)
- PostgreSQL

**Frontend**
- React (Vite)
- CSS plain-file (thème glassmorphism sombre)

## Installation

### Backend

1. **Cloner le dépôt**

   ```bash
   git clone https://github.com/AnjaNyAina2003/InventStockManaging.git
   cd InventStockManaging/Backend/stock_api
   ```

2. **Créer et activer un environnement virtuel**

   ```bash
   python -m venv venv
   source venv/bin/activate   # Linux / macOS
   venv\Scripts\activate      # Windows
   ```

3. **Installer les dépendances**

   ```bash
   pip install -r requirements.txt
   ```

4. **Créer la base de données PostgreSQL**, puis le fichier `.env` (voir la section suivante).

5. **Appliquer les migrations**

   ```bash
   python manage.py migrate
   ```

6. **Créer le premier administrateur**

   ```bash
   python manage.py createsuperuser
   ```

7. **Lancer le serveur**

   ```bash
   python manage.py runserver
   ```

### Frontend

1. **Se placer dans le dossier Frontend**

   ```bash
   cd InventStockManaging/Frontend
   ```

2. **Installer les dépendances**

   ```bash
   npm install
   ```

3. **Configurer l'URL de l'API** dans le fichier `.env` (voir ci-dessous).

4. **Lancer le serveur de développement**

   ```bash
   npm run dev
   ```

## Configuration du fichier `.env`

### Backend

Crée un fichier `.env` à côté de `manage.py`. Ne le publie jamais sur GitHub.

```env
# Base de données
DB_NAME=
DB_USER=
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=5432

# Clé secrète Django (valeur longue et aléatoire)
SECRET_KEY=

# Mode debug (True en développement uniquement)
DEBUG=True
```

Pour générer une clé :

```bash
python -c "import secrets; print(secrets.token_urlsafe(50))"
```

### Frontend

Crée un fichier `.env` à la racine du dossier `Frontend` :

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

## Structure du projet

```
InventStockManaging/
│
├── Backend/
│   └── stock_api/
│       ├── authentification/   # Authentification JWT, rôles
│       ├── produit/            # Produits, catégories, unités
│       ├── fournisseur/        # Fournisseurs
│       ├── commande/           # Commandes et lignes de commande
│       ├── stock_api/          # Paramètres Django principaux
│       ├── requirements.txt
│       └── manage.py
│
└── Frontend/
    ├── src/
    │   ├── components/         # PaginatedTable, CustomSelect, StatCards...
    │   ├── hooks/              # useSubmitState, useProduitOptions, useCurrency...
    │   └── context/            # CurrencyProvider
    ├── public/
    └── package.json
```
