import { useState, useEffect, useCallback } from 'react';
import { Clock, Printer, Phone, CheckCircle, Edit, Trash2, Home } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function OrdiniAttivi() {
  const [ordini, setOrdini] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);

  const fetchOrdini = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/ordini/attivi`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setOrdini(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrdini();
    const interval = setInterval(fetchOrdini, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [fetchOrdini]);

  const handleEvaso = async (id: number) => {
    try {
      await fetch(`${API_BASE}/ordini/${id}/stato`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ stato: 'ritirato' })
      });
      fetchOrdini(); // Aggiorna lista
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Sei sicuro di voler eliminare definitivamente questo ordine?')) return;
    try {
      await fetch(`${API_BASE}/ordini/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchOrdini();
    } catch (e) { console.error(e); }
  };

  const handleEdit = (id: number) => {
    navigate(`/ordini/nuovo?edit=${id}`);
  };

  const handlePrint = (ordine: any, tipo: 'cucina' | 'cliente') => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const vociHtml = ordine.voci.map((voce: any) => `
      <div style="margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; font-weight: bold;">
          <span>${voce.posizione}x ${voce.nomePizzaSnapshot}</span>
          ${tipo === 'cliente' ? `<span>€${voce.prezzoTotaleVoce.toFixed(2)}</span>` : ''}
        </div>
        ${voce.aggiunteSelezionate.length > 0 ? `
          <div style="padding-left: 15px; font-size: 0.9em;">
            ${voce.aggiunteSelezionate.map((a: any) => `+ ${a.nomeAggiuntaSnapshot} ${tipo==='cliente'?`(€${a.prezzoAggiuntaSnapshot.toFixed(2)})`:''}`).join('<br>')}
          </div>
        ` : ''}
        ${voce.nomeImpastoSnapshot && voce.nomeImpastoSnapshot !== 'Classico' ? `
          <div style="padding-left: 15px; font-size: 0.9em;">Impasto: ${voce.nomeImpastoSnapshot}</div>
        ` : ''}
        ${voce.note ? `<div style="padding-left: 15px; font-style: italic; font-size: 0.9em; margin-top: 2px;">Note: ${voce.note}</div>` : ''}
      </div>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Stampa ${tipo === 'cucina' ? 'Comanda' : 'Scontrino'} #${ordine.numeroOrdine}</title>
        <style>
          body { font-family: monospace; width: 300px; margin: 0 auto; padding: 20px; color: #000; }
          .header { text-align: center; border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-b dark:border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-gray-700ottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
          .title { font-size: 1.5em; font-weight: bold; margin-bottom: 5px; }
          .info { margin-bottom: 10px; font-size: 1.1em; }
          .time { font-size: 1.5em; font-weight: bold; text-align: center; border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700: 2px solid #000; padding: 10px; margin: 15px 0; border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-radius: 5px;}
          .items { border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-b dark:border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-gray-700ottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
          .total { font-size: 1.5em; font-weight: bold; text-align: right; }
          .footer { text-align: center; margin-top: 20px; font-size: 0.9em; }
          @media print {
            body { width: 100%; margin: 0; padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">🍕 PIZZERIA</div>
          ${tipo === 'cucina' ? '<strong>COMANDA CUCINA</strong>' : '<strong>RICEVUTA NON FISCALE</strong>'}
        </div>

        <div class="info">
          <div>Ordine n°: <strong>${ordine.numeroOrdine}</strong></div>
          <div>Cliente: ${ordine.nomeCliente}</div>
          ${ordine.telefonoCliente ? `<div>Tel: ${ordine.telefonoCliente}</div>` : ''}
          ${ordine.tipoRitiro === 'domicilio' ? `<div style="margin-top: 5px; padding: 5px; border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700: 1px solid #000;"><strong>DOMICILIO:</strong><br/>${ordine.indirizzoConsegna}<br/>${ordine.noteCitofono ? `Note: ${ordine.noteCitofono}` : ''}</div>` : ''}
          <div style="font-size: 0.9em; margin-top: 5px; color: #000;">
            Data Ordine: ${format(new Date(ordine.orarioOrdine), 'dd/MM/yyyy')}<br/>
            Ora Ricezione: ${format(new Date(ordine.orarioOrdine), 'HH:mm')}
          </div>
        </div>

        <div class="time">
          ⏰ PRONTO ALLE: <br/> ${format(new Date(ordine.orarioConsegna), 'HH:mm')}
        </div>

        <div class="items">
          ${vociHtml}
        </div>

        ${ordine.noteGenerali ? `
          <div style="margin-bottom: 10px; padding: 5px; border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700: 1px solid #000;">
            <strong>Note Generali:</strong> ${ordine.noteGenerali}
          </div>
        ` : ''}

        ${tipo === 'cliente' ? `
          <div class="total">
            TOTALE: €${ordine.totaleOrdine.toFixed(2)}
          </div>
        ` : ''}

        <div class="footer">
          Grazie per averci scelto!
        </div>
        <script>
          window.onload = function() { window.print(); window.close(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400">Caricamento ordini...</div>;

  return (
    <div className="p-6 h-full overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Ordini Attivi</h2>
        <button onClick={fetchOrdini} className="text-sm bg-gray-100 dark:bg-gray-950 hover:bg-gray-200 px-3 py-1 rounded">
          Aggiorna
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ordini.map(ordine => {
          const isLate = ordine.minutiAllaConsegna < 0;
          const isUrgent = ordine.minutiAllaConsegna >= 0 && ordine.minutiAllaConsegna <= 15;

          return (
            <div
              key={ordine.id}
              className={`bg-white dark:bg-gray-800 dark:bg-gray-800 transition-colors dark:bg-gray-800 transition-colors dark:bg-gray-800 transition-colors rounded-xl border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-l-4 shadow-sm overflow-hidden flex flex-col ${
                isLate ? 'border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-l-red-600' : isUrgent ? 'border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-l-orange-500' : 'border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-l-green-500'
              }`}
            >
              {/* Card Header */}
              <div className="p-4 border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-b dark:border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-gray-700 bg-gray-50 dark:bg-gray-900 dark:bg-gray-700 dark:bg-gray-700/50 dark:bg-gray-700/50 flex justify-between items-start">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 mb-1">
                    Ordine #{ordine.numeroOrdine} • {ordine.voci.length} pizze
                  </div>
                  <h3 className="font-bold text-lg">{ordine.nomeCliente}</h3>
                  {ordine.telefonoCliente && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-300 dark:text-gray-300 flex items-center gap-1 mt-1">
                      <Phone className="w-3 h-3" /> {ordine.telefonoCliente}
                    </div>
                  )}
                  {ordine.tipoRitiro === 'domicilio' && (
                    <div className="text-xs text-blue-700 bg-blue-50 mt-2 p-1.5 rounded inline-flex items-center gap-1 font-medium">
                      <Home className="w-3 h-3"/> Domicilio: {ordine.indirizzoConsegna}
                    </div>
                  )}
                </div>
                <div className={`text-right ${isLate ? 'text-red-600' : isUrgent ? 'text-orange-600' : 'text-green-600'}`}>
                  <div className="text-2xl font-black flex items-center gap-1 justify-end">
                    <Clock className="w-5 h-5" />
                    {format(new Date(ordine.orarioConsegna), 'HH:mm')}
                  </div>
                  <div className="text-xs font-bold uppercase mt-1">
                    {isLate ? `Ritardo ${Math.abs(ordine.minutiAllaConsegna)}m` : `Tra ${ordine.minutiAllaConsegna} min`}
                  </div>
                </div>
              </div>

              {/* Card Body (Items) */}
              <div className="p-4 flex-1 text-sm bg-white dark:bg-gray-800 dark:bg-gray-800 transition-colors dark:bg-gray-800 transition-colors dark:bg-gray-800 transition-colors dark:bg-gray-800 transition-colors">
                <ul className="space-y-2">
                  {ordine.voci.map((voce: any) => (
                    <li key={voce.id} className="border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-b dark:border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-gray-700 last:border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-0 pb-2 last:pb-0">
                      <div className="font-semibold">{voce.posizione}. {voce.nomePizzaSnapshot}</div>
                      {voce.aggiunteSelezionate.length > 0 && (
                        <div className="text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 text-xs pl-3 mt-1">
                          {voce.aggiunteSelezionate.map((a: any) => `+ ${a.nomeAggiuntaSnapshot}`).join(', ')}
                        </div>
                      )}
                      {voce.note && (
                        <div className="text-red-500 text-xs pl-3 italic mt-1">Note: {voce.note}</div>
                      )}
                    </li>
                  ))}
                </ul>
                {ordine.noteGenerali && (
                  <div className="mt-3 p-2 bg-yellow-50 rounded text-yellow-800 text-xs border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-yellow-200">
                    <strong>Note:</strong> {ordine.noteGenerali}
                  </div>
                )}
              </div>

              {/* Card Footer (Actions) */}
              <div className="p-3 border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-t dark:border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-gray-700 bg-gray-50 dark:bg-gray-900 dark:bg-gray-700 dark:bg-gray-700/50 dark:bg-gray-700/50 flex flex-col gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePrint(ordine, 'cucina')}
                    className="flex-1 bg-white dark:bg-gray-800 dark:bg-gray-800 transition-colors dark:bg-gray-800 transition-colors dark:bg-gray-800 transition-colors dark:bg-gray-800 transition-colors border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-gray-300 text-gray-700 dark:text-gray-300 dark:text-gray-300 py-2 px-1 rounded flex items-center justify-center gap-1 hover:bg-gray-50 dark:bg-gray-900 dark:bg-gray-700 dark:bg-gray-700/50 dark:bg-gray-700/50 text-[11px] md:text-sm font-medium transition-colors"
                  >
                    <Printer className="w-3 h-3 md:w-4 md:h-4" /> Cucina
                  </button>
                  <button
                    onClick={() => handlePrint(ordine, 'cliente')}
                    className="flex-1 bg-gray-800 text-white py-2 px-1 rounded flex items-center justify-center gap-1 hover:bg-gray-900 text-[11px] md:text-sm font-medium transition-colors"
                  >
                    <Printer className="w-3 h-3 md:w-4 md:h-4" /> Scontrino
                  </button>
                  <button
                    onClick={() => handleEvaso(ordine.id)}
                    className="flex-1 bg-green-600 text-white py-2 px-1 rounded flex items-center justify-center gap-1 hover:bg-green-700 text-[11px] md:text-sm font-medium transition-colors"
                  >
                    <CheckCircle className="w-3 h-3 md:w-4 md:h-4" /> Evaso
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(ordine.id)}
                    className="flex-1 bg-blue-50 text-blue-700 border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-b dark:border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-gray-700lue-200 py-1.5 rounded flex items-center justify-center gap-1 hover:bg-blue-100 text-[11px] md:text-sm transition-colors font-medium"
                  >
                    <Edit className="w-3 h-3" /> Modifica
                  </button>
                  <button
                    onClick={() => handleDelete(ordine.id)}
                    className="flex-1 bg-red-50 text-red-700 border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-red-200 py-1.5 rounded flex items-center justify-center gap-1 hover:bg-red-100 text-[11px] md:text-sm transition-colors font-medium"
                  >
                    <Trash2 className="w-3 h-3" /> Annulla/Elimina
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {ordini.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-400 dark:text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 dark:bg-gray-800 transition-colors dark:bg-gray-800 transition-colors dark:bg-gray-800 transition-colors dark:bg-gray-800 transition-colors rounded-xl border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-dashed">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-lg">Nessun ordine attivo al momento</p>
          </div>
        )}
      </div>
    </div>
  );
}
