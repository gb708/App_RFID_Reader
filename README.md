# App RFID Reader

Application web de scan de produits RFID avec compteur, historique et support multi-utilisateurs en temps réel.

## Description

Cette application permet de scanner des produits via un lecteur NFC USB, d'afficher leur compteur de passages, de consulter l'historique des scans et de partager les données en temps réel entre plusieurs utilisateurs connectés.

## Architecture

```
App_RFID_Reader/
├── backend/
│   ├── server.js        # Serveur Express + WebSocket (port 3001)
│   ├── database.js      # Initialisation et requêtes SQLite
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── Scanner.jsx      # Connexion NFC Reader USB via Web Serial API
│   │   │   ├── ProductList.jsx  # Liste des produits avec compteurs
│   │   │   ├── ScanHistory.jsx  # Historique des scans avec date/heure
│   │   │   └── Header.jsx       # En-tête avec statut connexion
│   │   ├── hooks/
│   │   │   ├── useWebSocket.js    # Connexion WebSocket avec reconnexion auto
│   │   │   └── useSerialReader.js # Lecture NFC USB via Web Serial API
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
├── .gitignore
└── README.md
```

## Prérequis

- **Node.js** v18 ou supérieur
- **Navigateur compatible Web Serial API** : Google Chrome ou Microsoft Edge (la Web Serial API n'est pas supportée par Firefox ou Safari)
- Un **lecteur NFC/RFID USB** communicant via port série (baud rate 9600)

## Installation

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd frontend
npm install
```

## Démarrage

Ouvrez deux terminaux :

**Terminal 1 — Backend :**
```bash
cd backend
npm run dev
```
Le serveur démarre sur `http://localhost:3001`

**Terminal 2 — Frontend :**
```bash
cd frontend
npm run dev
```
L'application est accessible sur `http://localhost:5173`

## Utilisation

1. Ouvrez `http://localhost:5173` dans Chrome ou Edge
2. Dans l'onglet **Scanner**, cliquez sur **"Connecter le lecteur NFC"**
3. Sélectionnez le port série de votre lecteur dans la boîte de dialogue du navigateur
4. Approchez un tag RFID du lecteur — le scan est automatiquement enregistré
5. Consultez les compteurs dans l'onglet **Produits**
6. Consultez l'historique dans l'onglet **Historique**

## API Backend

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/products` | Liste tous les produits avec compteur |
| POST | `/api/scan` | Enregistre un scan `{ rfid_id }` |
| DELETE | `/api/products/:rfid_id/reset` | Remet le compteur d'un produit à 0 |
| DELETE | `/api/products/reset-all` | Remet tous les compteurs à 0 |
| GET | `/api/history` | Retourne les 100 derniers scans |

## Stack technique

- **Frontend** : React 18 + Vite + TailwindCSS
- **Backend** : Node.js + Express + WebSocket (`ws`)
- **Base de données** : SQLite via `better-sqlite3`
- **RFID** : Web Serial API (natif au navigateur)
