import { useState } from 'react';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useOrderStore } from '../store/orderStore';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function ConfermaOrdine() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editOrderId = searchParams.get('edit');
  const [consensoGDPR, setConsensoGDPR] = useState(false);

  const {
    nomeCliente, setNomeCliente,
    telefonoCliente, setTelefonoCliente,
    orarioConsegna, setOrarioConsegna,
    tipoRitiro, setTipoRitiro,
    indirizzoConsegna, setIndirizzoConsegna,
    noteCitofono, setNoteCitofono,
    voci, removeVoce,
    noteGenerali, setNoteGenerali,
    clearOrdine
  } = useOrderStore();

  const calculateTotal = () => {
    return voci.reduce((total, voce) => {
      let voceTotal = voce.prezzoBase;
      if (voce.impasto) voceTotal += voce.impasto.sovrapprezzo;
      voceTotal += voce.aggiunte.reduce((acc: number, a: any) => acc + a.prezzo, 0);
      return total + voceTotal;
    }, 0);
  };

  const handleSubmit = async () => {
    if (!nomeCliente) return alert('Inserisci il nome del cliente');
    if (!consensoGDPR) return alert('È necessario il consenso GDPR per proseguire.');
    if (voci.length === 0) return alert('Aggiungi almeno una pizza');

    // Validazione base del telefono per domicilio
    if (tipoRitiro === 'domicilio' && (!telefonoCliente || telefonoCliente.length < 5)) {
        return alert('Per le consegne a domicilio è obbligatorio un numero di telefono valido.');
    }

    const payload = {
      nomeCliente,
      telefonoCliente,
      orarioConsegna: orarioConsegna ? new Date(orarioConsegna).toISOString() : null,
      tipoRitiro,
      indirizzoConsegna: tipoRitiro === 'domicilio' ? indirizzoConsegna : null,
      noteCitofono: tipoRitiro === 'domicilio' ? noteCitofono : null,
      noteGenerali,
      totale: calculateTotal(),
      voci: voci.map(v => ({
        pizzaId: v.pizzaId,
        nomePizza: v.nomePizza, // Inviamo anche il nome per lo storico
        prezzoBase: v.prezzoBase, // Inviamo anche il prezzo base storico
        impastoId: v.impasto?.id,
        note: v.note,
        aggiunte: v.aggiunte.map(a => a.id)
      }))
    };

    try {
      let res;
      if (editOrderId) {
        // Update existing order
        res = await fetch(`${API_BASE}/ordini/${editOrderId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        // Create new order
        res = await fetch(`${API_BASE}/ordini`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) throw new Error('Failed to save order');

      clearOrdine();
      navigate('/ordini');
    } catch (err) {
      console.error(err);
      alert('Errore durante il salvataggio dell\'ordine');
    }
  };

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 flex justify-center p-4 md:p-8 overflow-auto">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl flex flex-col h-fit shadow-[0_0_15px_rgba(0,0,0,0.05)] z-10 overflow-hidden">
        <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700 font-bold text-xl px-2">←</button>
          <div className="flex items-center gap-2 text-xl font-bold flex-1">
            <ShoppingCart className="w-6 h-6" /> Conferma Ordine
          </div>
          {editOrderId && (
              <button onClick={() => { clearOrdine(); navigate('/ordini/nuovo'); }} className="ml-auto text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded">Annulla</button>
          )}
        </div>

        <div className="p-4 flex-1 overflow-auto flex flex-col gap-4">
          {/* Form Cliente */}
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nome Cliente *</label>
              <input
                type="text"
                className="w-full border dark:border-gray-700 rounded p-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                placeholder="Mario Rossi"
                value={nomeCliente}
                onChange={e => setNomeCliente(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Telefono</label>
              <input
                type="text"
                className="w-full border dark:border-gray-700 rounded p-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                placeholder="333 1234567"
                value={telefonoCliente}
                onChange={e => setTelefonoCliente(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Orario Ritiro/Consegna *</label>
              <input
                type="datetime-local"
                className="w-full border dark:border-gray-700 rounded p-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                value={orarioConsegna}
                onChange={e => setOrarioConsegna(e.target.value)}
              />
            </div>
          </div>

          {/* Toggle Ritiro/Domicilio */}
          <div className="flex p-1 bg-gray-100 dark:bg-gray-900 rounded-lg mt-2">
            <button className={`flex-1 text-sm py-1.5 rounded-md font-medium transition-colors ${tipoRitiro === 'asporto' ? 'bg-white dark:bg-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-300'}`} onClick={() => setTipoRitiro('asporto')}>Asporto</button>
            <button className={`flex-1 text-sm py-1.5 rounded-md font-medium transition-colors ${tipoRitiro === 'domicilio' ? 'bg-white dark:bg-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-300'}`} onClick={() => setTipoRitiro('domicilio')}>Domicilio</button>
          </div>

          {tipoRitiro === 'domicilio' && (
            <div className="grid grid-cols-1 gap-3 mt-2 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Indirizzo di Consegna *</label>
                <input
                  type="text"
                  className="w-full border dark:border-gray-700 rounded p-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none dark:bg-gray-800 dark:text-white"
                  placeholder="Via Roma 1, Milano"
                  value={indirizzoConsegna}
                  onChange={e => setIndirizzoConsegna(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Note Citofono</label>
                <input
                  type="text"
                  className="w-full border dark:border-gray-700 rounded p-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none dark:bg-gray-800 dark:text-white"
                  placeholder="Cognome sul citofono, scala, piano..."
                  value={noteCitofono}
                  onChange={e => setNoteCitofono(e.target.value)}
                />
              </div>
            </div>
          )}

          <hr className="my-2 border-gray-200 dark:border-gray-700" />

          {/* Voci Ordine */}
          <div className="flex-1">
            {voci.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <ShoppingCart className="w-12 h-12 mb-2 opacity-50" />
                <p>Nessuna pizza aggiunta</p>
              </div>
            ) : (
              voci.map((voce) => {
                const totaleVoce = voce.prezzoBase +
                  (voce.impasto ? voce.impasto.sovrapprezzo : 0) +
                  voce.aggiunte.reduce((acc: number, a: any) => acc + a.prezzo, 0);

                return (
                  <div key={voce.id} className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border dark:border-gray-700 mb-3 relative">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold">{voce.nomePizza}</span>
                      <span className="font-bold text-red-600">€{totaleVoce.toFixed(2)}</span>
                    </div>
                    {voce.impasto && <div className="text-sm text-gray-600 dark:text-gray-400">Impasto: {voce.impasto.nome}</div>}
                    {voce.aggiunte.length > 0 && (
                      <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
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
        </div>

        {/* Total & Submit */}
        <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="mb-2">
            <input
              type="text"
              placeholder="Note generali (es. allergie)"
              className="w-full border dark:border-gray-700 rounded p-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
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
          <div className="flex justify-between items-end mb-4">
            <span className="text-gray-500 font-medium">Totale</span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">€{calculateTotal().toFixed(2)}</span>
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
    </div>
  );
}
