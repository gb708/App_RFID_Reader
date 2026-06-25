import React from 'react';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  return d.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function ScanHistory({ history }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">
        Historique des scans{' '}
        <span className="text-sm font-normal text-gray-400">
          (100 derniers)
        </span>
      </h2>

      {history.length === 0 ? (
        <p className="text-center text-gray-400 py-8">Aucun scan enregistré.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-2 font-medium text-gray-500">#</th>
                <th className="text-left py-3 px-2 font-medium text-gray-500">ID RFID</th>
                <th className="text-left py-3 px-2 font-medium text-gray-500">Date</th>
                <th className="text-left py-3 px-2 font-medium text-gray-500">Heure</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry, idx) => (
                <tr
                  key={entry.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-2.5 px-2 text-gray-400">{idx + 1}</td>
                  <td className="py-2.5 px-2 font-mono text-gray-800">{entry.rfid_id}</td>
                  <td className="py-2.5 px-2 text-gray-600">{formatDate(entry.scanned_at)}</td>
                  <td className="py-2.5 px-2 text-gray-600">{formatTime(entry.scanned_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
