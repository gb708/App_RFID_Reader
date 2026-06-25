const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const cors = require('cors');
const db = require('./database');

const PORT = 3001;

const app = express();
app.use(cors());
app.use(express.json());

// --- Serveur HTTP ---
const server = http.createServer(app);

// --- Serveur WebSocket ---
const wss = new WebSocketServer({ server });

let connectedClients = 0;

wss.on('connection', (ws) => {
  connectedClients++;
  broadcastClientCount();

  ws.on('close', () => {
    connectedClients--;
    broadcastClientCount();
  });

  ws.on('error', (err) => {
    console.error('Erreur WebSocket client :', err.message);
  });
});

function broadcastAll(data) {
  const message = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
}

function broadcastClientCount() {
  broadcastAll({ type: 'CLIENTS', count: connectedClients });
}

// --- Routes API ---

// GET /api/products
app.get('/api/products', (req, res) => {
  try {
    const products = db.getAllProducts();
    res.json(products);
  } catch (err) {
    console.error('GET /api/products :', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/scan
app.post('/api/scan', (req, res) => {
  const { rfid_id } = req.body;
  if (!rfid_id || typeof rfid_id !== 'string' || rfid_id.trim() === '') {
    return res.status(400).json({ error: 'rfid_id est requis' });
  }

  try {
    const trimmedId = rfid_id.trim();
    const product = db.upsertProduct(trimmedId);
    db.addScanHistory(trimmedId);
    const products = db.getAllProducts();
    const history = db.getHistory(100);

    broadcastAll({
      type: 'UPDATE',
      products,
      lastScan: { rfid_id: trimmedId, scanned_at: new Date().toISOString() },
    });

    res.json({ product, products, history });
  } catch (err) {
    console.error('POST /api/scan :', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/products/reset-all  (doit être avant /:rfid_id/reset)
app.delete('/api/products/reset-all', (req, res) => {
  try {
    db.resetAllProducts();
    const products = db.getAllProducts();
    broadcastAll({ type: 'UPDATE', products, lastScan: null });
    res.json({ success: true, products });
  } catch (err) {
    console.error('DELETE /api/products/reset-all :', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/products/:rfid_id/reset
app.delete('/api/products/:rfid_id/reset', (req, res) => {
  const { rfid_id } = req.params;
  try {
    const result = db.resetProduct(rfid_id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    const products = db.getAllProducts();
    broadcastAll({ type: 'UPDATE', products, lastScan: null });
    res.json({ success: true, products });
  } catch (err) {
    console.error('DELETE /api/products/:rfid_id/reset :', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/history
app.get('/api/history', (req, res) => {
  try {
    const history = db.getHistory(100);
    res.json(history);
  } catch (err) {
    console.error('GET /api/history :', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// --- Démarrage ---
server.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
  console.log(`✅ WebSocket disponible sur ws://localhost:${PORT}`);
});
