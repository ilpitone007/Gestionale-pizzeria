import { useState, useEffect, useCallback } from 'react';
import { Settings, EyeOff, Eye } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function MenuAdmin() {
  const [pizze, setPizze] = useState<any[]>([]);
  const [aggiunte, setAggiunte] = useState<any[]>([]);
  const [impasti, setImpasti] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [resPizze, resAggiunte, resImpasti] = await Promise.all([
        fetch(`${API_BASE}/admin/pizze`),
        fetch(`${API_BASE}/admin/aggiunte`),
        fetch(`${API_BASE}/admin/impasti`)
      ]);

      const [dataPizze, dataAggiunte, dataImpasti] = await Promise.all([
        resPizze.json(),
        resAggiunte.json(),
        resImpasti.json()
      ]);

      setPizze(dataPizze);
      setAggiunte(dataAggiunte);
      setImpasti(dataImpasti);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const togglePizza = async (id: number, currentStatus: boolean) => {
    await fetch(`${API_BASE}/admin/pizze/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disponibile: !currentStatus })
    });
    fetchData();
  };

  const toggleImpasto = async (id: number, currentStatus: boolean) => {
    await fetch(`${API_BASE}/admin/impasti/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disponibile: !currentStatus })
    });
    fetchData();
  };

  const toggleAggiunta = async (id: number, currentStatus: boolean) => {
    await fetch(`${API_BASE}/admin/aggiunte/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disponibile: !currentStatus })
    });
    fetchData();
  };

  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400">Caricamento menu admin...</div>;

  return (
    <div className="p-4 md:p-8 h-full overflow-auto bg-gray-50 dark:bg-gray-900 dark:bg-gray-700 dark:bg-gray-700/50 dark:bg-gray-700/50">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Settings className="w-6 h-6" /> Gestione Menu e Disponibilità
      </h2>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Pizze & Articoli */}
        <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 transition-colors dark:bg-gray-800 transition-colors dark:bg-gray-800 transition-colors dark:bg-gray-800 transition-colors rounded-xl shadow-sm border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 overflow-hidden">
          <div className="p-4 bg-gray-100 dark:bg-gray-950 border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-b dark:border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-gray-700">
            <h3 className="font-bold text-lg">Pizze, Fritti e Bevande</h3>
          </div>
          <ul className="divide-y max-h-[60vh] overflow-y-auto">
            {pizze.map((p) => (
              <li key={p.id} className={`p-4 flex justify-between items-center transition-colors ${!p.disponibile ? 'bg-red-50 opacity-75' : 'hover:bg-gray-50 dark:bg-gray-900 dark:bg-gray-700 dark:bg-gray-700/50 dark:bg-gray-700/50'}`}>
                <div>
                  <div className={`font-bold ${!p.disponibile && 'line-through text-red-800'}`}>{p.nome}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400">{p.categoria.nome} • €{p.prezzoBase.toFixed(2)}</div>
                </div>
                <button
                  onClick={() => togglePizza(p.id, p.disponibile)}
                  className={`p-2 rounded-full ${p.disponibile ? 'bg-gray-100 dark:bg-gray-950 hover:bg-red-100 text-gray-600 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-300 dark:text-gray-300 hover:text-red-600' : 'bg-red-600 text-white shadow-md'}`}
                  title={p.disponibile ? "Nascondi dal menu" : "Rendi disponibile"}
                >
                  {p.disponibile ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Aggiunte & Extra */}
        <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 transition-colors dark:bg-gray-800 transition-colors dark:bg-gray-800 transition-colors dark:bg-gray-800 transition-colors rounded-xl shadow-sm border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 overflow-hidden">
          <div className="p-4 bg-gray-100 dark:bg-gray-950 border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-b dark:border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-gray-700">
            <h3 className="font-bold text-lg">Ingredienti Extra e Impasti</h3>
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            <ul className="divide-y">
              {aggiunte.map((a: any) => (
                <li key={a.id as number} className={`p-4 flex justify-between items-center transition-colors ${!a.disponibile ? 'bg-red-50 opacity-75' : 'hover:bg-gray-50 dark:bg-gray-900 dark:bg-gray-700 dark:bg-gray-700/50 dark:bg-gray-700/50'}`}>
                  <div>
                    <div className={`font-bold ${!a.disponibile && 'line-through text-red-800'}`}>{a.nome}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400">{a.categoria?.nome || 'Extra'} • +€{a.prezzo.toFixed(2)}</div>
                  </div>
                  <button
                    onClick={() => toggleAggiunta(a.id as number, a.disponibile as boolean)}
                    className={`p-2 rounded-full ${a.disponibile ? 'bg-gray-100 dark:bg-gray-950 hover:bg-red-100 text-gray-600 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-300 dark:text-gray-300 hover:text-red-600' : 'bg-red-600 text-white shadow-md'}`}
                    title={a.disponibile ? "Nascondi dal menu" : "Rendi disponibile"}
                  >
                    {a.disponibile ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </li>
              ))}
            </ul>
            <div className="p-4 bg-gray-100 dark:bg-gray-950 border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-y mt-2">
              <h3 className="font-bold text-lg">Impasti Alternativi</h3>
            </div>
            <ul className="divide-y">
              {impasti.map((i: any) => (
                <li key={i.id as number} className={`p-4 flex justify-between items-center transition-colors ${!i.disponibile ? 'bg-red-50 opacity-75' : 'hover:bg-gray-50 dark:bg-gray-900 dark:bg-gray-700 dark:bg-gray-700/50 dark:bg-gray-700/50'}`}>
                  <div>
                    <div className={`font-bold ${!i.disponibile && 'line-through text-red-800'}`}>{i.nome}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400">Impasto base • {i.sovrapprezzo > 0 ? `+€${i.sovrapprezzo.toFixed(2)}` : 'Senza sovrapprezzo'}</div>
                  </div>
                  <button
                    onClick={() => toggleImpasto(i.id as number, i.disponibile as boolean)}
                    className={`p-2 rounded-full ${i.disponibile ? 'bg-gray-100 dark:bg-gray-950 hover:bg-red-100 text-gray-600 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-300 dark:text-gray-300 hover:text-red-600' : 'bg-red-600 text-white shadow-md'}`}
                    title={i.disponibile ? "Nascondi dal menu" : "Rendi disponibile"}
                  >
                    {i.disponibile ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
