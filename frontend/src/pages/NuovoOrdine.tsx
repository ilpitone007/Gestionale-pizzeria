import { useState, useEffect } from 'react';
import { useOrderStore } from '../store/orderStore';
import { ShoppingCart, Plus, Trash2, Home, Package } from 'lucide-react';
import { format } from 'date-fns';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function NuovoOrdine() {
  const [menu, setMenu] = useState<{ pizze: any[], categorieAggiunta: any[], impasti: any[] }>({ pizze: [], categorieAggiunta: [], impasti: [] });
  const [selectedCategoria, setSelectedCategoria] = useState('Tutte');
  const [pizzaToCustomize, setPizzaToCustomize] = useState<any>(null);
  const [tempAggiunte, setTempAggiunte] = useState<any[]>([]);
  const [tempImpasto, setTempImpasto] = useState<any>(null);
  const [tempNote, setTempNote] = useState('');
  const [consensoGDPR, setConsensoGDPR] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = useAuthStore((state) => state.token);

  const {
    nomeCliente, setNomeCliente,
    telefonoCliente, setTelefonoCliente,
    orarioConsegna, setOrarioConsegna,
    noteGenerali, setNoteGenerali,
    tipoRitiro, setTipoRitiro,
    indirizzoConsegna, setIndirizzoConsegna,
    noteCitofono, setNoteCitofono,
    editOrderId,
    voci, addVoce, removeVoce, clearOrdine, loadOrdine
  } = useOrderStore();

  useEffect(() => {
    fetch(`${API_BASE}/menu`)
      .then(res => res.json())
      .then(data => setMenu(data))
      .catch(err => console.error(err));

    const editId = searchParams.get('edit');
    if (editId && token) {
      fetch(`${API_BASE}/ordini/${editId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
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
  }, [editOrderId, loadOrdine, orarioConsegna, searchParams, setOrarioConsegna, token]);

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

  const handleConfirmAdd = () => {
    addVoce({
      pizzaId: pizzaToCustomize.id,
      nomePizza: pizzaToCustomize.nome,
      prezzoBase: pizzaToCustomize.prezzoBase,
      aggiunte: tempAggiunte,
      impasto: tempImpasto,
      note: tempNote
    });
    setPizzaToCustomize(null);
  };

  const calculateTotal = () => {
    return voci.reduce((sum, voce) => {
      const aggiunteTotal = voce.aggiunte.reduce((a, b) => a + b.prezzo, 0);
      const impastoTotal = voce.impasto ? voce.impasto.sovrapprezzo : 0;
      return sum + voce.prezzoBase + aggiunteTotal + impastoTotal;
    }, 0);
  };

  const {
    metodoPagamento, setMetodoPagamento,
    scontoFisso, setScontoFisso,
    scontoPercentuale, setScontoPercentuale,
    importoRicevuto, setImportoRicevuto,
  } = useOrderStore();

  const handleSubmit = async () => {
    if (!nomeCliente) return alert('Inserisci il nome del cliente');
    if (!orarioConsegna) return alert('Inserisci l\'orario di consegna');
    if (voci.length === 0) return alert('Aggiungi almeno una pizza');
    if (tipoRitiro === 'domicilio' && !indirizzoConsegna) return alert('Inserisci l\'indirizzo di consegna');
    if (!consensoGDPR) return alert('È necessario spuntare la casella di consenso GDPR per proseguire.');

    try {
      const method = editOrderId ? 'PUT' : 'POST';
      const url = editOrderId ? `${API_BASE}/ordini/${editOrderId}` : `${API_BASE}/ordini`;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nomeCliente,
          telefonoCliente,
          orarioConsegna: new Date(orarioConsegna).toISOString(),
          noteGenerali,
          tipoRitiro,
          indirizzoConsegna,
          noteCitofono,
          voci
        })
      });

      if (res.ok) {
        alert(`Ordine ${editOrderId ? 'aggiornato' : 'creato'} con successo!`);
        clearOrdine();
        navigate('/ordini');
      } else {
        alert(`Errore durante ${editOrderId ? 'l\'aggiornamento' : 'la creazione'}`);
      }
    } catch (e) {
      console.error(e);
      alert('Errore di connessione');
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full">
      {/* Left Column: Menu */}
      <div className="flex-1 p-4 md:p-6 flex flex-col gap-4 md:gap-6 overflow-auto">
        <h2 className="text-2xl font-bold">Menu</h2>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categorie.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategoria(cat)}
              className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors ${
                selectedCategoria === cat ? 'bg-red-600 text-white' : 'bg-white dark:bg-gray-800 dark:bg-gray-800 transition-colors dark:bg-gray-800 transition-colors dark:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300 dark:text-gray-300 border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:bg-gray-700 dark:bg-gray-700/50 dark:bg-gray-700/50'
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
              className="bg-white dark:bg-gray-800 dark:bg-gray-800 transition-colors dark:bg-gray-800 transition-colors dark:bg-gray-800 transition-colors dark:bg-gray-800 transition-colors p-4 rounded-xl border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 hover:border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-red-500 cursor-pointer transition-all shadow-sm flex flex-col justify-between h-full"
              onClick={() => handleOpenCustomize(pizza)}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{pizza.nome}</h3>
                  <span className="font-bold text-red-600">€{pizza.prezzoBase.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 line-clamp-2">{pizza.descrizione}</p>
              </div>
              <button className="mt-4 w-full bg-red-50 text-red-600 font-medium py-2 rounded-lg hover:bg-red-100 flex justify-center items-center gap-2">
                <Plus className="w-4 h-4" /> Aggiungi
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Cart */}
      <div className="w-full md:w-96 bg-white dark:bg-gray-800 dark:bg-gray-800 transition-colors dark:bg-gray-800 transition-colors dark:bg-gray-800 transition-colors dark:bg-gray-800 transition-colors border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-t dark:border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-gray-700-2 md:border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-t dark:border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-gray-700-0 md:border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-l flex flex-col h-auto md:min-h-0 md:h-full shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:shadow-lg">
        <div className="p-4 border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-b dark:border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-gray-700 bg-gray-50 dark:bg-gray-900 dark:bg-gray-700 dark:bg-gray-700/50 dark:bg-gray-700/50">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" /> {editOrderId ? `Modifica Ordine #${editOrderId}` : 'Nuovo Ordine'}
            {editOrderId && (
              <button onClick={() => { clearOrdine(); navigate('/ordini/nuovo'); }} className="ml-auto text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded">Annulla</button>
            )}
          </h2>
        </div>

        {/* Customer Details */}
        <div className="p-4 border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-b dark:border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-gray-700 space-y-3 bg-white dark:bg-gray-800 dark:bg-gray-800 transition-colors dark:bg-gray-800 transition-colors dark:bg-gray-800 transition-colors dark:bg-gray-800 transition-colors">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 mb-1">Nome Cliente *</label>
            <input
              type="text"
              className="w-full border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 rounded p-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              value={nomeCliente}
              onChange={e => setNomeCliente(e.target.value)}
              placeholder="Mario Rossi"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 mb-1">Telefono</label>
              <input
                type="text"
                className="w-full border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 rounded p-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                value={telefonoCliente}
                onChange={e => setTelefonoCliente(e.target.value)}
                placeholder="333 1234567"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 mb-1">Orario Ritiro *</label>
              <input
                type="datetime-local"
                className="w-full border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 rounded p-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                value={orarioConsegna}
                onChange={e => setOrarioConsegna(e.target.value)}
                step="300"
              />
            </div>
          </div>

          {/* Toggle Ritiro/Domicilio */}
          <div className="flex bg-gray-100 dark:bg-gray-950 p-1 rounded-lg">
            <button className={`flex-1 text-sm py-1.5 rounded-md font-medium transition-colors ${tipoRitiro === 'asporto' ? 'bg-white dark:bg-gray-800 dark:bg-gray-800 transition-colors dark:bg-gray-800 transition-colors dark:bg-gray-800 transition-colors shadow-sm' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 dark:text-gray-300'}`} onClick={() => setTipoRitiro('asporto')}>Asporto</button>
            <button className={`flex-1 text-sm py-1.5 rounded-md font-medium transition-colors ${tipoRitiro === 'domicilio' ? 'bg-white dark:bg-gray-800 dark:bg-gray-800 transition-colors dark:bg-gray-800 transition-colors dark:bg-gray-800 transition-colors shadow-sm' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 dark:text-gray-300'}`} onClick={() => setTipoRitiro('domicilio')}>Domicilio</button>
          </div>

          {tipoRitiro === 'domicilio' && (
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1"><Home className="w-3 h-3"/> Indirizzo *</label>
                <input
                  type="text"
                  className="w-full border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 rounded p-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  value={indirizzoConsegna}
                  onChange={e => setIndirizzoConsegna(e.target.value)}
                  placeholder="Via Roma 10"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 mb-1">Citofono / Note</label>
                <input
                  type="text"
                  className="w-full border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 rounded p-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  value={noteCitofono}
                  onChange={e => setNoteCitofono(e.target.value)}
                  placeholder="Rossi (Scala B)"
                />
              </div>
            </div>
          )}

        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900 dark:bg-gray-700 dark:bg-gray-700/50 dark:bg-gray-700/50 min-h-[150px] md:min-h-0 max-h-[40vh] md:max-h-full">
          {voci.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 dark:text-gray-400">
              <ShoppingCart className="w-12 h-12 mb-2 opacity-20" />
              <p>Nessuna pizza aggiunta</p>
            </div>
          ) : (
            voci.map((voce, idx) => {
              const voceTotal = voce.prezzoBase + (voce.impasto ? voce.impasto.sovrapprezzo : 0) + voce.aggiunte.reduce((a, b) => a + b.prezzo, 0);
              return (
                <div key={voce.id} className="bg-white dark:bg-gray-800 dark:bg-gray-800 transition-colors dark:bg-gray-800 transition-colors dark:bg-gray-800 transition-colors dark:bg-gray-800 transition-colors p-3 rounded-lg border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 shadow-sm">
                  <div className="flex justify-between font-bold mb-1">
                    <span>{idx + 1}. {voce.nomePizza}</span>
                    <span>€{voceTotal.toFixed(2)}</span>
                  </div>
                  {voce.impasto && voce.impasto.nome !== 'Classico' && (
                    <div className="text-sm text-yellow-700 mb-1">
                      Impasto: {voce.impasto.nome} (+€{voce.impasto.sovrapprezzo.toFixed(2)})
                    </div>
                  )}
                  {voce.aggiunte.length > 0 && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-300 dark:text-gray-300 mb-1">
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

        {/* Sconti e Pagamenti */}
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-b dark:border-gray-700 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Metodo Pagamento</label>
              <select
                className="w-full border dark:border-gray-700 rounded p-2 text-sm focus:outline-none dark:bg-gray-700"
                value={metodoPagamento}
                onChange={e => setMetodoPagamento(e.target.value)}
              >
                <option value="contanti">Contanti</option>
                <option value="carta">Carta di Credito/POS</option>
                <option value="buoni">Buoni Pasto</option>
              </select>
            </div>
            {metodoPagamento === 'contanti' && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Contante Ricevuto (€)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full border dark:border-gray-700 rounded p-2 text-sm focus:outline-none dark:bg-gray-700"
                  value={importoRicevuto || ''}
                  onChange={e => setImportoRicevuto(e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="Es: 50.00"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Sconto Fisso (€)</label>
              <input
                type="number"
                step="0.01"
                className="w-full border dark:border-gray-700 rounded p-2 text-sm focus:outline-none dark:bg-gray-700"
                value={scontoFisso || ''}
                onChange={e => setScontoFisso(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Sconto %</label>
              <input
                type="number"
                className="w-full border dark:border-gray-700 rounded p-2 text-sm focus:outline-none dark:bg-gray-700"
                value={scontoPercentuale || ''}
                onChange={e => setScontoPercentuale(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>

        {/* Total & Submit */}
        <div className="p-4 border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-t dark:border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-gray-700 bg-white dark:bg-gray-800 dark:bg-gray-800 transition-colors dark:bg-gray-800 transition-colors dark:bg-gray-800 transition-colors dark:bg-gray-800 transition-colors">
          <div className="mb-2">
            <input
              type="text"
              placeholder="Note generali (es. allergie)"
              className="w-full border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 rounded p-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              value={noteGenerali}
              onChange={e => setNoteGenerali(e.target.value)}
            />
          </div>
          <div className="mb-4 flex items-start gap-2">
            <input
              type="checkbox"
              id="gdpr"
              checked={consensoGDPR}
              onChange={e => setConsensoGDPR(e.target.checked)}
              className="mt-1"
            />
            <label htmlFor="gdpr" className="text-xs text-gray-500 dark:text-gray-400">
              Confermo di aver informato il cliente riguardo l'uso e la conservazione dei suoi dati (GDPR) e di averne ottenuto il consenso.
            </label>
          </div>
          <div className="flex flex-col mb-4">
            <div className="flex justify-between items-end mb-1">
              <span className="text-gray-500 font-medium">Subtotale</span>
              <span className="text-lg text-gray-500">€{calculateTotal().toFixed(2)}</span>
            </div>
            {(scontoFisso > 0 || scontoPercentuale > 0) && (
              <div className="flex justify-between items-end mb-1 text-green-600">
                <span className="font-medium text-sm">Sconto</span>
                <span className="text-sm">-€{(scontoFisso + (calculateTotal() * (scontoPercentuale / 100))).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-end pt-2 border-t dark:border-gray-700">
              <span className="text-gray-900 dark:text-white font-bold">Totale Finale</span>
              <span className="text-3xl font-bold text-gray-900 dark:text-white">€{Math.max(0, calculateTotal() - scontoFisso - (calculateTotal() * (scontoPercentuale / 100))).toFixed(2)}</span>
            </div>
            {metodoPagamento === 'contanti' && importoRicevuto && importoRicevuto > Math.max(0, calculateTotal() - scontoFisso - (calculateTotal() * (scontoPercentuale / 100))) && (
               <div className="flex justify-between items-end mt-1 text-orange-600">
                 <span className="font-medium text-sm">Resto da dare</span>
                 <span className="text-sm font-bold">€{(importoRicevuto - Math.max(0, calculateTotal() - scontoFisso - (calculateTotal() * (scontoPercentuale / 100)))).toFixed(2)}</span>
               </div>
            )}
          </div>
          <button
            onClick={handleSubmit}
            disabled={voci.length === 0 || !nomeCliente || !consensoGDPR}
            className={`w-full text-white font-bold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${editOrderId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {editOrderId ? 'Salva Modifiche' : 'Conferma Ordine'}
          </button>
        </div>
      </div>

      {/* Customize Modal */}
      {pizzaToCustomize && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 transition-colors dark:bg-gray-800 transition-colors dark:bg-gray-800 transition-colors dark:bg-gray-800 transition-colors rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
            <div className="p-4 border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-b dark:border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900 dark:bg-gray-700 dark:bg-gray-700/50 dark:bg-gray-700/50 rounded-t-xl">
              <h3 className="text-xl font-bold">Personalizza {pizzaToCustomize.nome}</h3>
              <button onClick={() => setPizzaToCustomize(null)} className="text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 dark:text-gray-300">✕</button>
            </div>

            <div className="p-4 overflow-auto flex-1">

              {menu.impasti && menu.impasti.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-bold text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-2 border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-b dark:border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-gray-700 pb-1 flex items-center gap-1"><Package className="w-4 h-4"/> Scegli Impasto</h4>
                  <div className="space-y-2">
                    <select
                      className="w-full border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 rounded p-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
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
                  <h4 className="font-bold text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-2 border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-b dark:border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-gray-700 pb-1">{cat.nome}</h4>
                  <div className="space-y-2">
                    {cat.aggiunte.map((agg: any) => {
                      const isSelected = tempAggiunte.some(a => a.id === agg.id);
                      return (
                        <label key={agg.id} className={`flex items-center justify-between p-2 rounded cursor-pointer border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 transition-colors ${isSelected ? 'bg-red-50 border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-red-200' : 'hover:bg-gray-50 dark:bg-gray-900 dark:bg-gray-700 dark:bg-gray-700/50 dark:bg-gray-700/50 border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-t dark:border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-gray-700ransparent'}`}>
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
                          <span className="text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 text-sm">+€{agg.prezzo.toFixed(2)}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="mt-4">
                <label className="font-bold text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-2 block">Note (es. senza basilico)</label>
                <textarea
                  className="w-full border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
                  rows={2}
                  value={tempNote}
                  onChange={e => setTempNote(e.target.value)}
                />
              </div>
            </div>

            <div className="p-4 border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-t dark:border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-gray-700 bg-gray-50 dark:bg-gray-900 dark:bg-gray-700 dark:bg-gray-700/50 dark:bg-gray-700/50 rounded-b-xl flex justify-between items-center">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 block">Totale pizza</span>
                <span className="text-xl font-bold">
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
