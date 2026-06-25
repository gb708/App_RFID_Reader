const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'rfid.db');

const db = new Database(DB_PATH);

// Activer les clés étrangères et le mode WAL pour de meilleures performances
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Création des tables
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rfid_id TEXT UNIQUE NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS scan_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rfid_id TEXT NOT NULL,
    scanned_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// --- Requêtes produits ---

function getAllProducts() {
  return db.prepare(`
    SELECT id, rfid_id, count, created_at, updated_at
    FROM products
    ORDER BY count DESC
  `).all();
}

function upsertProduct(rfidId) {
  const existing = db.prepare('SELECT id FROM products WHERE rfid_id = ?').get(rfidId);
  if (existing) {
    db.prepare(`
      UPDATE products
      SET count = count + 1, updated_at = datetime('now')
      WHERE rfid_id = ?
    `).run(rfidId);
  } else {
    db.prepare(`
      INSERT INTO products (rfid_id, count, created_at, updated_at)
      VALUES (?, 1, datetime('now'), datetime('now'))
    `).run(rfidId);
  }
  return db.prepare('SELECT * FROM products WHERE rfid_id = ?').get(rfidId);
}

function resetProduct(rfidId) {
  return db.prepare(`
    UPDATE products
    SET count = 0, updated_at = datetime('now')
    WHERE rfid_id = ?
  `).run(rfidId);
}

function resetAllProducts() {
  return db.prepare(`
    UPDATE products
    SET count = 0, updated_at = datetime('now')
  `).run();
}

// --- Requêtes historique ---

function addScanHistory(rfidId) {
  return db.prepare(`
    INSERT INTO scan_history (rfid_id, scanned_at)
    VALUES (?, datetime('now'))
  `).run(rfidId);
}

function getHistory(limit = 100) {
  return db.prepare(`
    SELECT id, rfid_id, scanned_at
    FROM scan_history
    ORDER BY scanned_at DESC
    LIMIT ?
  `).all(limit);
}

module.exports = {
  getAllProducts,
  upsertProduct,
  resetProduct,
  resetAllProducts,
  addScanHistory,
  getHistory,
};
