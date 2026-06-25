import React from 'react';

export default function Header({ wsStatus, connectedClients }) {
  const statusInfo = {
    connected: { label: 'Connecté', color: 'bg-green-500' },
    reconnecting: { label: 'Reconnexion…', color: 'bg-yellow-400' },
    disconnected: { label: 'Déconnecté', color: 'bg-red-500' },
  };

  const status = statusInfo[wsStatus] || statusInfo.disconnected;

  return (
    <header className="bg-indigo-700 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📡</span>
          <h1 className="text-xl font-bold tracking-wide">RFID Scanner</h1>
        </div>

        <div className="flex items-center gap-6 text-sm">
          {/* Nombre d'utilisateurs */}
          <div className="flex items-center gap-2">
            <span className="text-indigo-200">👥 Utilisateurs :</span>
            <span className="font-semibold">{connectedClients}</span>
          </div>

          {/* Statut WebSocket */}
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${status.color} animate-pulse`} />
            <span>{status.label}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
