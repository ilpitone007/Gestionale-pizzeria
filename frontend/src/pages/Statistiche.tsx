import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { BarChart2, TrendingUp, CheckCircle, Package, Download } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function Statistiche() {
  const [dataCorrente, setDataCorrente] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [stats, setStats] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/statistiche?data=${dataCorrente}`);
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [dataCorrente]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);


  const exportCSV = () => {
    if (!stats || !stats.ordiniDettaglio) return;

    const headers = ['Numero Ordine', 'Cliente', 'Telefono', 'Tipo Ritiro', 'Orario Consegna', 'Stato', 'Totale', 'Articoli'];
    const rows = stats.ordiniDettaglio.map((o: any) => [
      o.numeroOrdine,
      `"${o.nomeCliente}"`,
      o.telefonoCliente || '',
      o.tipoRitiro,
      format(new Date(o.orarioConsegna), 'HH:mm'),
      o.stato,
      o.totaleOrdine.toFixed(2),
      `"${o.voci.map((v: any) => `${v.nomePizzaSnapshot} ${v.nomeImpastoSnapshot && v.nomeImpastoSnapshot !== 'Classico' ? `(${v.nomeImpastoSnapshot})` : ''}`).join(', ')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `ordini_${dataCorrente}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Caricamento statistiche...</div>;
  }

  return (
    <div className="p-4 md:p-8 h-full overflow-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart2 className="w-6 h-6" /> Storico Giornaliero
        </h2>

        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm w-full md:w-auto">
          <label className="text-sm font-medium text-gray-600">Seleziona Data:</label>
          <input
            type="date"
            className="border-none focus:ring-0 p-1 font-bold text-red-600 bg-transparent flex-1 md:flex-none cursor-pointer"
            value={dataCorrente}
            onChange={(e) => setDataCorrente(e.target.value)}
          />
        </div>

        {stats && stats.ordiniDettaglio && (
          <button onClick={exportCSV} className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        )}
      </div>

      {!stats ? (
        <div className="text-center text-gray-500 mt-10">Dati non disponibili</div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <div className="text-gray-500 text-sm mb-1 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Ordini Evasi
              </div>
              <div className="text-3xl font-black text-green-600">
                {stats.ordiniEvasi} <span className="text-sm font-normal text-gray-400">/ {stats.ordiniTotali}</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <div className="text-gray-500 text-sm mb-1 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" /> Incasso Reale
              </div>
              <div className="text-3xl font-black text-gray-900">
                €{stats.incassoTotale.toFixed(2)}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <div className="text-gray-500 text-sm mb-1 flex items-center gap-1">
                <Package className="w-4 h-4" /> Articoli Venduti
              </div>
              <div className="text-3xl font-black text-blue-600">
                {String(Object.values(stats.pizzeFatte).reduce((a: any, b: any) => a + b, 0))}
              </div>
            </div>
          </div>

          {/* Dettaglio Prodotti */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-bold text-lg">Dettaglio Articoli Fatti</h3>
            </div>
            <div className="p-0">
              {Object.keys(stats.pizzeFatte).length === 0 ? (
                <div className="p-8 text-center text-gray-400">Nessun articolo prodotto in questa data</div>
              ) : (
                <ul className="divide-y">
                  {Object.entries(stats.pizzeFatte)
                    .sort(([, a]: any, [, b]: any) => b - a)
                    .map(([nome, quantita]: [string, any]) => (
                    <li key={nome} className="flex justify-between items-center p-4 hover:bg-gray-50">
                      <span className="font-medium text-gray-700">{nome}</span>
                      <span className="bg-red-100 text-red-800 font-bold py-1 px-3 rounded-full">
                        {String(quantita)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
