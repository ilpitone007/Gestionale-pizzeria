import React, { useEffect, useState } from 'react';
import { getPizze, getAggiunte, creaOrdine } from '../api';
import { useCartStore } from '../store/cartStore';
import type { Pizza, Aggiunta } from '../store/cartStore';

export default function Menu() {
  const [pizze, setPizze] = useState<Pizza[]>([]);
  const [aggiunte, setAggiunte] = useState<Aggiunta[]>([]);
  const cart = useCartStore();
  const [selectedPizza, setSelectedPizza] = useState<Pizza | null>(null);
  const [selectedAggiunte, setSelectedAggiunte] = useState<Aggiunta[]>([]);
  const [note, setNote] = useState('');

  // Checkout form
  const [nomeCliente, setNomeCliente] = useState('');
  const [telefonoCliente, setTelefonoCliente] = useState('');
  const [orarioConsegna, setOrarioConsegna] = useState('');
  const [noteGenerali, setNoteGenerali] = useState('');

  useEffect(() => {
    getPizze().then(setPizze);
    getAggiunte().then(setAggiunte);

    // Default time 30 mins from now
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    setOrarioConsegna(now.toISOString().slice(0, 16));
  }, []);

  const categorie = Array.from(new Set(pizze.map(p => p.categoria.nome)));

  const handleAddPizza = (pizza: Pizza) => {
    setSelectedPizza(pizza);
    setSelectedAggiunte([]);
    setNote('');
  };

  const handleConfirmAdd = () => {
    if (!selectedPizza) return;

    const prezzoTotaleAggiunte = selectedAggiunte.reduce((sum, a) => sum + a.prezzo, 0);

    cart.addVoce({
      pizzaId: selectedPizza.id,
      nomePizzaSnapshot: selectedPizza.nome,
      prezzoBaseSnapshot: selectedPizza.prezzoBase,
      note,
      aggiunte: selectedAggiunte.map(a => ({
        aggiuntaId: a.id,
        nomeAggiuntaSnapshot: a.nome,
        prezzoAggiuntaSnapshot: a.prezzo
      })),
      prezzoTotaleVoce: selectedPizza.prezzoBase + prezzoTotaleAggiunte
    });

    setSelectedPizza(null);
  };

  const handleCheckout = async () => {
    if (!nomeCliente || !orarioConsegna) {
      alert("Nome e orario consegna obbligatori");
      return;
    }

    if (cart.voci.length === 0) {
      alert("Aggiungi almeno una pizza all'ordine");
      return;
    }

    try {
      await creaOrdine({
        nomeCliente,
        telefonoCliente,
        orarioConsegna: new Date(orarioConsegna).toISOString(),
        noteGenerali,
        voci: cart.voci
      });
      alert('Ordine creato con successo!');
      cart.clearCart();
      setNomeCliente('');
      setTelefonoCliente('');
      setNoteGenerali('');
    } catch (e) {
      alert('Errore creazione ordine');
    }
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-100px)]">
      {/* Menu / Seleziona Pizze */}
      <div className="flex-1 overflow-y-auto bg-white p-4 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Menu</h2>

        {categorie.map(cat => (
          <div key={cat} className="mb-6">
            <h3 className="text-xl font-semibold mb-3 border-b pb-1 text-red-600">{cat}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {pizze.filter(p => p.categoria.nome === cat).map(pizza => (
                <div
                  key={pizza.id}
                  className="border rounded p-3 cursor-pointer hover:border-red-500 hover:shadow-md transition"
                  onClick={() => handleAddPizza(pizza)}
                >
                  <div className="flex justify-between font-bold">
                    <span>{pizza.nome}</span>
                    <span>€{pizza.prezzoBase.toFixed(2)}</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{pizza.ingredienti.join(', ')}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Cart & Checkout */}
      <div className="w-1/3 min-w-[300px] flex flex-col bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <h2 className="text-xl font-bold">Nuovo Ordine</h2>
          <div className="mt-3 space-y-2">
            <input
              type="text"
              placeholder="Nome Cliente *"
              className="w-full p-2 border rounded"
              value={nomeCliente}
              onChange={e => setNomeCliente(e.target.value)}
            />
            <input
              type="tel"
              placeholder="Telefono"
              className="w-full p-2 border rounded"
              value={telefonoCliente}
              onChange={e => setTelefonoCliente(e.target.value)}
            />
            <input
              type="datetime-local"
              className="w-full p-2 border rounded font-bold text-red-600"
              value={orarioConsegna}
              onChange={e => setOrarioConsegna(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cart.voci.length === 0 ? (
            <div className="text-gray-500 text-center mt-10">Ordine vuoto</div>
          ) : (
            <ul className="space-y-3">
              {cart.voci.map((voce, idx) => (
                <li key={idx} className="border-b pb-2">
                  <div className="flex justify-between font-semibold">
                    <span>1x {voce.nomePizzaSnapshot}</span>
                    <span>€{voce.prezzoTotaleVoce.toFixed(2)}</span>
                  </div>
                  {voce.aggiunte.length > 0 && (
                    <div className="text-sm text-gray-600 pl-4">
                      {voce.aggiunte.map(a => `+ ${a.nomeAggiuntaSnapshot}`).join(', ')}
                    </div>
                  )}
                  {voce.note && <div className="text-sm text-red-500 pl-4">Note: {voce.note}</div>}
                  <button onClick={() => cart.removeVoce(idx)} className="text-xs text-red-500 hover:underline mt-1">Rimuovi</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-4 bg-gray-100 border-t">
          <textarea
            placeholder="Note generali ordine"
            className="w-full p-2 border rounded text-sm mb-3"
            value={noteGenerali}
            onChange={e => setNoteGenerali(e.target.value)}
          ></textarea>
          <div className="flex justify-between text-xl font-bold mb-4">
            <span>Totale:</span>
            <span>€{cart.totale().toFixed(2)}</span>
          </div>
          <button
            className="w-full bg-red-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-red-700 disabled:opacity-50"
            disabled={cart.voci.length === 0 || !nomeCliente}
            onClick={handleCheckout}
          >
            Conferma Ordine
          </button>
        </div>
      </div>

      {/* Modal Personalizzazione Pizza */}
      {selectedPizza && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{selectedPizza.nome}</h3>
              <button onClick={() => setSelectedPizza(null)} className="text-gray-500 hover:text-black">✕</button>
            </div>

            <div className="mb-4 text-sm text-gray-600">
              Ingredienti: {selectedPizza.ingredienti.join(', ')}
            </div>

            <div className="mb-6">
              <h4 className="font-semibold mb-2">Aggiunte:</h4>
              <div className="grid grid-cols-2 gap-2">
                {aggiunte.map(agg => (
                  <label key={agg.id} className="flex items-center space-x-2 text-sm border p-2 rounded cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedAggiunte.some(a => a.id === agg.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAggiunte([...selectedAggiunte, agg]);
                        } else {
                          setSelectedAggiunte(selectedAggiunte.filter(a => a.id !== agg.id));
                        }
                      }}
                    />
                    <span className="flex-1">{agg.nome}</span>
                    <span className="text-gray-500">+€{agg.prezzo.toFixed(2)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="font-semibold block mb-2">Note (es. senza aglio, ben cotta):</label>
              <textarea
                className="w-full border rounded p-2 text-sm"
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={2}
              ></textarea>
            </div>

            <button
              className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700"
              onClick={handleConfirmAdd}
            >
              Aggiungi (Totale: €{(selectedPizza.prezzoBase + selectedAggiunte.reduce((s, a) => s + a.prezzo, 0)).toFixed(2)})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
