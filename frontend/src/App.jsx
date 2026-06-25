import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import Scanner from './components/Scanner.jsx';
import ProductList from './components/ProductList.jsx';
import ScanHistory from './components/ScanHistory.jsx';
import { useWebSocket } from './hooks/useWebSocket.js';

const TABS = [
  { id: 'scanner', label: '📡 Scanner' },
  { id: 'products', label: '📦 Produits' },
  { id: 'history', label: '🕑 Historique' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('scanner');
  const [history, setHistory] = useState([]);
  const { products, setProducts, lastScan, connectedClients, wsStatus } = useWebSocket();

  // Chargement initial des données
  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => setProducts(data))
      .catch(console.error);

    fetch('/api/history')
      .then((r) => r.json())
      .then((data) => setHistory(data))
      .catch(console.error);
  }, [setProducts]);

  // Rafraîchir l'historique à chaque nouveau scan (via WebSocket)
  useEffect(() => {
    if (lastScan) {
      fetch('/api/history')
        .then((r) => r.json())
        .then((data) => setHistory(data))
        .catch(console.error);
    }
  }, [lastScan]);

  const handleReset = async (rfidId) => {
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(rfidId)}/reset`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Erreur réinitialisation :', err);
    }
  };

  const handleResetAll = async () => {
    try {
      const res = await fetch('/api/products/reset-all', { method: 'DELETE' });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Erreur réinitialisation globale :', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header wsStatus={wsStatus} connectedClients={connectedClients} />

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Onglets */}
        <div className="flex gap-2 bg-white rounded-xl shadow-sm p-1.5">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenu */}
        {activeTab === 'scanner' && (
          <Scanner onScanSent={() => {}} />
        )}

        {activeTab === 'products' && (
          <ProductList
            products={products}
            onReset={handleReset}
            onResetAll={handleResetAll}
          />
        )}

        {activeTab === 'history' && (
          <ScanHistory history={history} />
        )}
      </div>
    </div>
  );
}
