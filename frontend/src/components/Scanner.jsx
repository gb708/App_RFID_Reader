import React, { useState, useCallback } from 'react';
import { useSerialReader } from '../hooks/useSerialReader';

export default function Scanner({ onScanSent }) {
  const [lastTag, setLastTag] = useState(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);

  const handleScan = useCallback(
    async (rfidId) => {
      setLastTag(rfidId);
      setSending(true);
      setSendError(null);
      try {
        const res = await fetch('/api/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rfid_id: rfidId }),
        });
        if (!res.ok) {
          const data = await res.json();
          setSendError(data.error || 'Erreur lors de l\'envoi du scan');
        } else if (onScanSent) {
          const data = await res.json();
          onScanSent(data);
        }
      } catch (err) {
        setSendError(`Erreur réseau : ${err.message}`);
      } finally {
        setSending(false);
      }
    },
    [onScanSent]
  );

  const { isConnected, error, connect, disconnect } = useSerialReader({
    onScan: handleScan,
  });

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 space-y-5">
      <h2 className="text-lg font-semibold text-gray-800">Lecteur NFC USB</h2>

      {/* Bouton connexion */}
      <button
        onClick={isConnected ? disconnect : connect}
        className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-colors ${
          isConnected
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-indigo-600 hover:bg-indigo-700'
        }`}
      >
        {isConnected ? '⏹ Déconnecter le lecteur NFC' : '▶ Connecter le lecteur NFC'}
      </button>

      {/* Indicateur statut */}
      <div className="flex items-center gap-2 text-sm">
        <span
          className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-gray-300'
          }`}
        />
        <span className={isConnected ? 'text-green-700 font-medium' : 'text-gray-500'}>
          {isConnected ? 'Lecteur connecté — en attente de scan…' : 'Lecteur déconnecté'}
        </span>
      </div>

      {/* Erreur Web Serial */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Erreur envoi */}
      {sendError && (
        <div className="bg-orange-50 border border-orange-200 text-orange-700 rounded-lg px-4 py-3 text-sm">
          ⚠️ {sendError}
        </div>
      )}

      {/* Dernier tag scanné */}
      {lastTag && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
          <p className="text-xs text-indigo-500 mb-1">Dernier tag RFID scanné</p>
          <p className="text-xl font-mono font-bold text-indigo-800">
            {sending ? <span className="animate-pulse">Envoi en cours…</span> : lastTag}
          </p>
        </div>
      )}
    </div>
  );
}
