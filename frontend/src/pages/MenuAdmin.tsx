import { useState, useEffect, useCallback } from 'react';
import { Settings, EyeOff, Eye } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function MenuAdmin() {
  const [activeTab, setActiveTab] = useState<'menu' | 'impostazioni' | 'audit'>('menu');
  const [pizze, setPizze] = useState<any[]>([]);
  const [aggiunte, setAggiunte] = useState<any[]>([]);
  const [impasti, setImpasti] = useState<any[]>([]);
  const [impostazioni, setImpostazioni] = useState<any>({});
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore((state) => state.token);

  const fetchData = useCallback(async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      if (activeTab === 'menu') {
        const resPizze = await fetch(`${API_BASE}/admin/pizze`, { headers });
        const dataPizze = await resPizze.json();
        setPizze(dataPizze);

        const resAggiunte = await fetch(`${API_BASE}/admin/aggiunte`, { headers });
        const dataAggiunte = await resAggiunte.json();
        setAggiunte(dataAggiunte);

        const resImpasti = await fetch(`${API_BASE}/admin/impasti`, { headers });
        const dataImpasti = await resImpasti.json();
        setImpasti(dataImpasti);
      } else if (activeTab === 'impostazioni') {
        const resImp = await fetch(`${API_BASE}/admin/impostazioni`, { headers });
        setImpostazioni(await resImp.json());
      } else if (activeTab === 'audit') {
        const resAudit = await fetch(`${API_BASE}/admin/audit`, { headers });
        setAuditLogs(await resAudit.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [activeTab, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData, activeTab]);

  const salvaImpostazione = async (id: string, valore: string) => {
    try {
      await fetch(`${API_BASE}/admin/impostazioni/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ valore })
      });
      alert('Salvato!');
    } catch (e) {
      console.error(e);
      alert('Errore');
    }
  };

  const togglePizza = async (id: number, currentStatus: boolean) => {
    await fetch(`${API_BASE}/admin/pizze/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ disponibile: !currentStatus })
    });
    fetchData();
  };

  const toggleImpasto = async (id: number, currentStatus: boolean) => {
    await fetch(`${API_BASE}/admin/impasti/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ disponibile: !currentStatus })
    });
    fetchData();
  };

  const toggleAggiunta = async (id: number, currentStatus: boolean) => {
    await fetch(`${API_BASE}/admin/aggiunte/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ disponibile: !currentStatus })
    });
    fetchData();
  };

  if (loading && pizze.length === 0) return <div className="p-8 text-center text-gray-500">Caricamento admin...</div>;

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      <div className="p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Settings className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Pannello Amministratore</h1>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          <button onClick={() => setActiveTab('menu')} className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'menu' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>Menu</button>
          <button onClick={() => setActiveTab('impostazioni')} className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'impostazioni' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>Impostazioni</button>
          <button onClick={() => setActiveTab('audit')} className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'audit' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>Audit Logs</button>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-8 overflow-auto">

        {activeTab === 'impostazioni' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden max-w-2xl">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Impostazioni Sistema</h2>
            </div>
            <div className="p-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Limite ordini per fascia oraria (15 minuti)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={impostazioni.limite_ordini_fascia || ''}
                    onChange={e => setImpostazioni({...impostazioni, limite_ordini_fascia: e.target.value})}
                    className="flex-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => salvaImpostazione('limite_ordini_fascia', impostazioni.limite_ordini_fascia)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                  >
                    Salva
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Superato questo limite, non sarà possibile accettare nuovi ordini per l'orario richiesto.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Registro Azioni (Audit Logs)</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 uppercase border-b dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 font-medium">Data e Ora</th>
                    <th className="px-6 py-3 font-medium">Utente</th>
                    <th className="px-6 py-3 font-medium">Azione</th>
                    <th className="px-6 py-3 font-medium">Dettagli</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {auditLogs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-300">
                        {new Date(log.creatoIl).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white capitalize">
                        {log.utente?.username || 'Sistema'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2.5 py-1 rounded-md text-xs font-semibold">
                          {log.azione}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {log.dettagli}
                      </td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        Nessun log disponibile.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'menu' && (
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
      )}
      </div>
    </div>
  );
}
