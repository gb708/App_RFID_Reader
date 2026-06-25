import React, { useState } from 'react';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function ProductList({ products, onReset, onResetAll }) {
  const [confirmAll, setConfirmAll] = useState(false);

  const handleResetAll = () => {
    if (confirmAll) {
      onResetAll();
      setConfirmAll(false);
    } else {
      setConfirmAll(true);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">
          Produits scannés{' '}
          <span className="text-sm font-normal text-gray-400">
            ({products.length})
          </span>
        </h2>
        {products.length > 0 && (
          <button
            onClick={handleResetAll}
            onBlur={() => setConfirmAll(false)}
            className={`text-sm py-1.5 px-4 rounded-lg font-medium transition-colors ${
              confirmAll
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {confirmAll ? '⚠️ Confirmer la remise à zéro' : '🔄 Tout réinitialiser'}
          </button>
        )}
      </div>

      {products.length === 0 ? (
        <p className="text-center text-gray-400 py-8">Aucun produit scanné pour l&apos;instant.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-2 font-medium text-gray-500">ID RFID</th>
                <th className="text-center py-3 px-2 font-medium text-gray-500">Compteur</th>
                <th className="text-left py-3 px-2 font-medium text-gray-500">Dernière mise à jour</th>
                <th className="text-right py-3 px-2 font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.rfid_id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-2 font-mono text-gray-800">{product.rfid_id}</td>
                  <td className="py-3 px-2 text-center">
                    <span className="inline-block bg-indigo-100 text-indigo-800 font-bold rounded-full px-3 py-0.5 text-sm">
                      {product.count}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-gray-500">{formatDate(product.updated_at)}</td>
                  <td className="py-3 px-2 text-right">
                    <button
                      onClick={() => onReset(product.rfid_id)}
                      className="text-xs bg-gray-100 hover:bg-red-100 hover:text-red-600 text-gray-500 rounded-lg px-3 py-1.5 transition-colors"
                    >
                      Réinitialiser
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
