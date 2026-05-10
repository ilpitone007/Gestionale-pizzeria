import { useState, useEffect } from 'react';
import { useOrderStore } from '../store/orderStore';
import { Plus, Trash2, ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function NuovoOrdine() {
  const [menu, setMenu] = useState<{ pizze: any[], categorieAggiunta: any[] }>({ pizze: [], categorieAggiunta: [] });
  const [selectedCategoria, setSelectedCategoria] = useState('Tutte');
  const [pizzaToCustomize, setPizzaToCustomize] = useState<any>(null);
  const [tempAggiunte, setTempAggiunte] = useState<any[]>([]);
  const [tempNote, setTempNote] = useState('');

  const {
    nomeCliente, setNomeCliente,
    telefonoCliente, setTelefonoCliente,
    orarioConsegna, setOrarioConsegna,
    noteGenerali, setNoteGenerali,
    voci, addVoce, removeVoce, clearOrdine
  } = useOrderStore();

  useEffect(() => {
    fetch(`${API_BASE}/menu`)
      .then(res => res.json())
      .then(data => setMenu(data))
      .catch(err => console.error(err));

    // Default time: now + 30 mins, rounded to next 5 mins
    if (!orarioConsegna) {
      const date = new Date();
      date.setMinutes(date.getMinutes() + 30);
      const coeff = 1000 * 60 * 5;
      const rounded = new Date(Math.round(date.getTime() / coeff) * coeff);
      setOrarioConsegna(format(rounded, "yyyy-MM-dd'T'HH:mm"));
    }
  }, []);

  const categorie = ['Tutte', ...Array.from(new Set(menu.pizze.map(p => p.categoria)))];
  const pizzeFiltrate = selectedCategoria === 'Tutte'
    ? menu.pizze
    : menu.pizze.filter(p => p.categoria === selectedCategoria);

  const handleOpenCustomize = (pizza: any) => {
    setPizzaToCustomize(pizza);
    setTempAggiunte([]);
    setTempNote('');
  };

  const handleConfirmAdd = () => {
    addVoce({
      pizzaId: pizzaToCustomize.id,
      nomePizza: pizzaToCustomize.nome,
      prezzoBase: pizzaToCustomize.prezzoBase,
      aggiunte: tempAggiunte,
      note: tempNote
    });
    setPizzaToCustomize(null);
  };

  const calculateTotal = () => {
    return voci.reduce((sum, voce) => {
      const aggiunteTotal = voce.aggiunte.reduce((a, b) => a + b.prezzo, 0);
      return sum + voce.prezzoBase + aggiunteTotal;
    }, 0);
  };

  const handleSubmit = async () => {
    if (!nomeCliente) return alert('Inserisci il nome del cliente');
    if (!orarioConsegna) return alert('Inserisci l\'orario di consegna');
    if (voci.length === 0) return alert('Aggiungi almeno una pizza');

    try {
      const res = await fetch(`${API_BASE}/ordini`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomeCliente,
          telefonoCliente,
          orarioConsegna: new Date(orarioConsegna).toISOString(),
          noteGenerali,
          voci
        })
      });

      if (res.ok) {
        alert('Ordine creato con successo!');
        clearOrdine();
      } else {
        alert('Errore durante la creazione');
      }
    } catch (e) {
      console.error(e);
      alert('Errore di connessione');
    }
  };

  return (
    <div className="flex h-full">
      {/* Left Column: Menu */}
      <div className="flex-1 p-6 flex flex-col gap-6 overflow-auto">
        <h2 className="text-2xl font-bold">Menu</h2>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categorie.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategoria(cat)}
              className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors ${
                selectedCategoria === cat ? 'bg-red-600 text-white' : 'bg-white text-gray-700 border hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Pizza Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {pizzeFiltrate.map(pizza => (
            <div
              key={pizza.id}
              className="bg-white p-4 rounded-xl border hover:border-red-500 cursor-pointer transition-all shadow-sm flex flex-col justify-between h-full"
              onClick={() => handleOpenCustomize(pizza)}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{pizza.nome}</h3>
                  <span className="font-bold text-red-600">€{pizza.prezzoBase.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2">{pizza.descrizione}</p>
              </div>
              <button className="mt-4 w-full bg-red-50 text-red-600 font-medium py-2 rounded-lg hover:bg-red-100 flex justify-center items-center gap-2">
                <Plus className="w-4 h-4" /> Aggiungi
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Cart */}
      <div className="w-96 bg-white border-l flex flex-col h-full shadow-lg">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" /> Nuovo Ordine
          </h2>
        </div>

        {/* Customer Details */}
        <div className="p-4 border-b space-y-3 bg-white">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Nome Cliente *</label>
            <input
              type="text"
              className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              value={nomeCliente}
              onChange={e => setNomeCliente(e.target.value)}
              placeholder="Mario Rossi"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Telefono</label>
              <input
                type="text"
                className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                value={telefonoCliente}
                onChange={e => setTelefonoCliente(e.target.value)}
                placeholder="333 1234567"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Orario Ritiro *</label>
              <input
                type="datetime-local"
                className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                value={orarioConsegna}
                onChange={e => setOrarioConsegna(e.target.value)}
                step="300"
              />
            </div>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-auto p-4 space-y-3 bg-gray-50">
          {voci.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <ShoppingCart className="w-12 h-12 mb-2 opacity-20" />
              <p>Nessuna pizza aggiunta</p>
            </div>
          ) : (
            voci.map((voce, idx) => {
              const voceTotal = voce.prezzoBase + voce.aggiunte.reduce((a, b) => a + b.prezzo, 0);
              return (
                <div key={voce.id} className="bg-white p-3 rounded-lg border shadow-sm">
                  <div className="flex justify-between font-bold mb-1">
                    <span>{idx + 1}. {voce.nomePizza}</span>
                    <span>€{voceTotal.toFixed(2)}</span>
                  </div>
                  {voce.aggiunte.length > 0 && (
                    <div className="text-sm text-gray-600 mb-1">
                      {voce.aggiunte.map(a => `+ ${a.nome}`).join(', ')}
                    </div>
                  )}
                  {voce.note && (
                    <div className="text-sm text-red-500 mb-2 italic">
                      Note: {voce.note}
                    </div>
                  )}
                  <button
                    onClick={() => removeVoce(voce.id)}
                    className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 mt-2"
                  >
                    <Trash2 className="w-3 h-3" /> Rimuovi
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Total & Submit */}
        <div className="p-4 border-t bg-white">
          <div className="mb-2">
            <input
              type="text"
              placeholder="Note generali (es. allergie)"
              className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              value={noteGenerali}
              onChange={e => setNoteGenerali(e.target.value)}
            />
          </div>
          <div className="flex justify-between items-end mb-4">
            <span className="text-gray-500 font-medium">Totale</span>
            <span className="text-2xl font-bold text-gray-900">€{calculateTotal().toFixed(2)}</span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={voci.length === 0 || !nomeCliente}
            className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Conferma Ordine
          </button>
        </div>
      </div>

      {/* Customize Modal */}
      {pizzaToCustomize && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
              <h3 className="text-xl font-bold">Personalizza {pizzaToCustomize.nome}</h3>
              <button onClick={() => setPizzaToCustomize(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <div className="p-4 overflow-auto flex-1">
              {menu.categorieAggiunta.map(cat => (
                <div key={cat.id} className="mb-6">
                  <h4 className="font-bold text-gray-700 mb-2 border-b pb-1">{cat.nome}</h4>
                  <div className="space-y-2">
                    {cat.aggiunte.map((agg: any) => {
                      const isSelected = tempAggiunte.some(a => a.id === agg.id);
                      return (
                        <label key={agg.id} className={`flex items-center justify-between p-2 rounded cursor-pointer border transition-colors ${isSelected ? 'bg-red-50 border-red-200' : 'hover:bg-gray-50 border-transparent'}`}>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setTempAggiunte([...tempAggiunte, agg]);
                                } else {
                                  setTempAggiunte(tempAggiunte.filter(a => a.id !== agg.id));
                                }
                              }}
                            />
                            <span>{agg.nome}</span>
                          </div>
                          <span className="text-gray-500 text-sm">+€{agg.prezzo.toFixed(2)}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="mt-4">
                <label className="font-bold text-gray-700 mb-2 block">Note (es. senza basilico)</label>
                <textarea
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
                  rows={2}
                  value={tempNote}
                  onChange={e => setTempNote(e.target.value)}
                />
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 rounded-b-xl flex justify-between items-center">
              <div>
                <span className="text-sm text-gray-500 block">Totale pizza</span>
                <span className="text-xl font-bold">
                  €{(pizzaToCustomize.prezzoBase + tempAggiunte.reduce((a, b) => a + b.prezzo, 0)).toFixed(2)}
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
