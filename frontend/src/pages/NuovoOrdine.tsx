import { useState, useEffect } from 'react';
import { useOrderStore } from '../store/orderStore';
import { ShoppingCart, Plus, Package } from 'lucide-react';
import { format } from 'date-fns';
import { useSearchParams, useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function NuovoOrdine() {
  const [menu, setMenu] = useState<{ pizze: any[], categorieAggiunta: any[], impasti: any[] }>({ pizze: [], categorieAggiunta: [], impasti: [] });
  const [selectedCategoria, setSelectedCategoria] = useState('Tutte');
  const [pizzaToCustomize, setPizzaToCustomize] = useState<any>(null);
  const [tempAggiunte, setTempAggiunte] = useState<any[]>([]);
  const [tempImpasto, setTempImpasto] = useState<any>(null);
  const [tempNote, setTempNote] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const {
    orarioConsegna, setOrarioConsegna,
    editOrderId,
    voci, addVoce, loadOrdine
  } = useOrderStore();

  useEffect(() => {
    fetch(`${API_BASE}/menu`)
      .then(res => res.json())
      .then(data => setMenu(data))
      .catch(err => console.error(err));

    const editId = searchParams.get('edit');
    if (editId) {
      fetch(`${API_BASE}/ordini/${editId}`)
        .then(res => res.json())
        .then(data => { if (data && !data.error) loadOrdine(data); });
    } else {
      if (!editOrderId && !orarioConsegna) {
        const date = new Date();
        date.setMinutes(date.getMinutes() + 30);
        const coeff = 1000 * 60 * 5;
        const rounded = new Date(Math.round(date.getTime() / coeff) * coeff);
        setOrarioConsegna(format(rounded, "yyyy-MM-dd'T'HH:mm"));
      }
    }
  }, []);

  const categorie = ['Tutte', ...Array.from(new Set(menu.pizze.map(p => p.categoria)))];
  const pizzeFiltrate = selectedCategoria === 'Tutte'
    ? menu.pizze
    : menu.pizze.filter(p => p.categoria === selectedCategoria);

  const handleOpenCustomize = (pizza: any) => {
    setPizzaToCustomize(pizza);
    setTempAggiunte([]);
    setTempImpasto(menu.impasti?.find((i: any) => i.nome === 'Classico') || null);
    setTempNote('');
  };

  const handleQuickAdd = (pizza: any) => {
    addVoce({
      pizzaId: pizza.id,
      nomePizza: pizza.nome,
      prezzoBase: pizza.prezzoBase,
      impasto: menu.impasti?.find((i: any) => i.nome === 'Classico') || null,
      aggiunte: [],
      note: ''
    });
  };

  const handleConfirmAdd = () => {
    addVoce({
      pizzaId: pizzaToCustomize.id,
      nomePizza: pizzaToCustomize.nome,
      prezzoBase: pizzaToCustomize.prezzoBase,
      impasto: tempImpasto,
      aggiunte: tempAggiunte,
      note: tempNote
    });
    setPizzaToCustomize(null);
  };

  const calculateTotal = () => {
    return voci.reduce((total, voce) => {
      let voceTotal = voce.prezzoBase;
      if (voce.impasto) voceTotal += voce.impasto.sovrapprezzo;
      voceTotal += voce.aggiunte.reduce((acc: number, a: any) => acc + a.prezzo, 0);
      return total + voceTotal;
    }, 0);
  };

  const handleProceed = () => {
    if (voci.length === 0) return alert('Aggiungi almeno una pizza prima di procedere.');
    const url = editOrderId ? `/ordini/conferma?edit=${editOrderId}` : '/ordini/conferma';
    navigate(url);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-full bg-gray-50 dark:bg-gray-900 relative">
      {/* Top action bar */}
      <div className="sticky top-0 z-20 bg-white dark:bg-gray-800 p-4 border-b dark:border-gray-700 shadow-sm flex justify-between items-center gap-4">
          <div className="flex flex-col">
            <span className="font-medium text-gray-700 dark:text-gray-300">Carrello ({voci.length})</span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">€{calculateTotal().toFixed(2)}</span>
          </div>
          <button
            onClick={handleProceed}
            disabled={voci.length === 0}
            className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            Procedi
            <ShoppingCart className="w-5 h-5" />
          </button>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-6 flex flex-col gap-6 w-full max-w-7xl mx-auto pb-24">
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categorie.map(cat => (
            <button
              key={cat}
              className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors border ${selectedCategoria === cat ? 'bg-red-600 text-white border-red-600 shadow-md' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700'}`}
              onClick={() => setSelectedCategoria(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Pizza Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {pizzeFiltrate.map(pizza => (
            <div
              key={pizza.id}
              className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-red-500 transition-all shadow-sm flex flex-col justify-between h-full"
            >
              <div className="cursor-pointer" onClick={() => handleQuickAdd(pizza)}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">{pizza.nome}</h3>
                  <span className="font-bold text-red-600">€{pizza.prezzoBase.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{pizza.descrizione}</p>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleQuickAdd(pizza)}
                  className="flex-1 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-medium py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 flex justify-center items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Aggiungi
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleOpenCustomize(pizza); }}
                  className="px-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex justify-center items-center"
                  title="Personalizza"
                >
                  ⚙️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customize Modal */}
      {pizzaToCustomize && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900 rounded-t-xl">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Personalizza {pizzaToCustomize.nome}</h3>
              <button onClick={() => setPizzaToCustomize(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
            </div>

            <div className="p-4 overflow-auto flex-1">

              {menu.impasti && menu.impasti.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-2 border-b border-gray-200 dark:border-gray-700 pb-1 flex items-center gap-1"><Package className="w-4 h-4"/> Scegli Impasto</h4>
                  <div className="space-y-2">
                    <select
                      className="w-full border border-gray-200 dark:border-gray-700 rounded p-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none dark:bg-gray-800 dark:text-white"
                      value={tempImpasto?.id || ''}
                      onChange={(e) => setTempImpasto(menu.impasti.find((i: any) => i.id === parseInt(e.target.value)))}
                    >
                      {menu.impasti.map(imp => (
                        <option key={imp.id} value={imp.id}>{imp.nome} {imp.sovrapprezzo > 0 ? `(+€${imp.sovrapprezzo.toFixed(2)})` : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {menu.categorieAggiunta.map(cat => (
                <div key={cat.id} className="mb-6">
                  <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-2 border-b border-gray-200 dark:border-gray-700 pb-1">{cat.nome}</h4>
                  <div className="space-y-2">
                    {cat.aggiunte.map((agg: any) => {
                      const isSelected = tempAggiunte.some(a => a.id === agg.id);
                      return (
                        <label key={agg.id} className={`flex items-center justify-between p-2 rounded cursor-pointer border transition-colors ${isSelected ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-700 border-transparent'}`}>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="rounded text-red-600 focus:ring-red-500 w-4 h-4 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setTempAggiunte([...tempAggiunte, agg]);
                                } else {
                                  setTempAggiunte(tempAggiunte.filter(a => a.id !== agg.id));
                                }
                              }}
                            />
                            <span className="text-gray-900 dark:text-gray-200">{agg.nome}</span>
                          </div>
                          <span className="text-gray-500 dark:text-gray-400 text-sm">+€{agg.prezzo.toFixed(2)}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="mt-4">
                <label className="font-bold text-gray-700 dark:text-gray-300 mb-2 block">Note (es. senza basilico)</label>
                <textarea
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:outline-none dark:bg-gray-800 dark:text-white"
                  rows={2}
                  value={tempNote}
                  onChange={e => setTempNote(e.target.value)}
                />
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-xl flex justify-between items-center">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400 block">Totale pizza</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  €{(pizzaToCustomize.prezzoBase + (tempImpasto ? tempImpasto.sovrapprezzo : 0) + tempAggiunte.reduce((a, b) => a + b.prezzo, 0)).toFixed(2)}
                </span>
              </div>
              <button
                onClick={handleConfirmAdd}
                className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700"
              >
                Aggiungi all'ordine
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
