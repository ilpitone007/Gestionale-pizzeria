import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function MenuAdmin() {
  const [impostazioni, setImpostazioni] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/impostazioni`)
      .then(res => res.json())
      .then(data => {
        setImpostazioni({
          numero_massimo_tavoli: data.numero_massimo_tavoli || '20',
          ...data
        });
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e: any) => {
    setImpostazioni({
      ...impostazioni,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/impostazioni`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(impostazioni)
      });
      if (res.ok) {
        alert('Impostazioni salvate con successo!');
      } else {
        alert('Errore durante il salvataggio');
      }
    } catch (e) {
      console.error(e);
      alert('Errore di connessione');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Caricamento impostazioni...</div>;

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-2xl font-bold mb-6">Impostazioni & Menu Admin</h2>

      <div className="bg-white p-6 rounded-xl shadow-sm border max-w-lg">
        <h3 className="text-lg font-bold mb-4 border-b pb-2">Impostazioni Generali</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numero Massimo Tavoli
            </label>
            <input
              type="number"
              name="numero_massimo_tavoli"
              value={impostazioni.numero_massimo_tavoli}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Imposta il numero massimo di tavoli disponibili per la selezione durante la creazione dell'ordine.
            </p>
          </div>

          {/* Altre impostazioni future possono essere aggiunte qui */}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 w-full bg-gray-800 text-white font-medium py-2 rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50"
        >
          {saving ? 'Salvataggio...' : 'Salva Impostazioni'}
        </button>
      </div>

      <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border max-w-lg">
        <h3 className="text-lg font-bold mb-4 border-b pb-2">Gestione Menu</h3>
        <p className="text-gray-600 text-sm">Modulo per l'amministrazione avanzata del menu (Pizze e Aggiunte). Da implementare secondo requisiti futuri.</p>
      </div>
    </div>
  );
}
