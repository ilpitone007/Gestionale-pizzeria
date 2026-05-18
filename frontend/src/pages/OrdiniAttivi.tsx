import { useState, useEffect } from 'react';
import { Clock, Printer, Phone, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useOrderStore } from '../store/orderStore';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function OrdiniAttivi() {
  const [ordini, setOrdini] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const loadOrder = useOrderStore(state => state.loadOrder);

  const fetchOrdini = async () => {
    try {
      const res = await fetch(`${API_BASE}/ordini/attivi`);
      const data = await res.json();
      setOrdini(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdini();
    const interval = setInterval(fetchOrdini, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

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
          .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
          .title { font-size: 1.5em; font-weight: bold; margin-bottom: 5px; }
          .info { margin-bottom: 10px; font-size: 1.1em; }
          .time { font-size: 1.5em; font-weight: bold; text-align: center; border: 2px solid #000; padding: 10px; margin: 15px 0; border-radius: 5px;}
          .items { border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
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
          <div style="font-size: 0.8em; margin-top: 5px; color: #666;">
            Ricevuto: ${format(new Date(ordine.orarioOrdine), 'dd/MM/yyyy HH:mm')}
          </div>
        </div>

        <div class="time">
          ⏰ PRONTO ALLE: <br/> ${format(new Date(ordine.orarioConsegna), 'HH:mm')}
        </div>

        <div class="items">
          ${vociHtml}
        </div>

        ${ordine.noteGenerali ? `
          <div style="margin-bottom: 10px; padding: 5px; border: 1px solid #000;">
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

  if (loading) return <div className="p-8 text-center text-gray-500">Caricamento ordini...</div>;

  return (
    <div className="p-6 h-full overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Ordini Attivi</h2>
        <button onClick={fetchOrdini} className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded">
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
              className={`bg-white rounded-xl border-l-4 shadow-sm overflow-hidden flex flex-col ${
                isLate ? 'border-l-red-600' : isUrgent ? 'border-l-orange-500' : 'border-l-green-500'
              }`}
            >
              {/* Card Header */}
              <div className="p-4 border-b bg-gray-50 flex justify-between items-start">
                <div>
                  <div className="text-sm text-gray-500 mb-1">
                    Ordine #{ordine.numeroOrdine} • {ordine.voci.length} pizze
                  </div>
                  <h3 className="font-bold text-lg">{ordine.nomeCliente}</h3>
                  {ordine.telefonoCliente && (
                    <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <Phone className="w-3 h-3" /> {ordine.telefonoCliente}
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
              <div className="p-4 flex-1 text-sm bg-white">
                <ul className="space-y-2">
                  {ordine.voci.map((voce: any) => (
                    <li key={voce.id} className="border-b last:border-0 pb-2 last:pb-0">
                      <div className="font-semibold">{voce.posizione}. {voce.nomePizzaSnapshot}</div>
                      {voce.aggiunteSelezionate.length > 0 && (
                        <div className="text-gray-500 text-xs pl-3 mt-1">
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
                  <div className="mt-3 p-2 bg-yellow-50 rounded text-yellow-800 text-xs border border-yellow-200">
                    <strong>Note:</strong> {ordine.noteGenerali}
                  </div>
                )}
              </div>

              {/* Card Footer (Actions) */}
              <div className="p-3 border-t bg-gray-50 flex flex-col gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePrint(ordine, 'cucina')}
                    className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 rounded flex items-center justify-center gap-2 hover:bg-gray-50 text-sm font-medium transition-colors"
                  >
                    <Printer className="w-4 h-4" /> Cucina
                  </button>
                  <button
                    onClick={() => handlePrint(ordine, 'cliente')}
                    className="flex-1 bg-gray-800 text-white py-2 rounded flex items-center justify-center gap-2 hover:bg-gray-900 text-sm font-medium transition-colors"
                  >
                    <Printer className="w-4 h-4" /> Scontrino
                  </button>
                </div>
                <button
                  onClick={() => {
                    loadOrder(ordine);
                    navigate('/ordini/nuovo');
                  }}
                  className="w-full bg-blue-50 text-blue-700 border border-blue-200 py-2 rounded flex items-center justify-center gap-2 hover:bg-blue-100 text-sm font-medium transition-colors"
                >
                  <Edit className="w-4 h-4" /> Modifica Ordine
                </button>
              </div>
            </div>
          );
        })}

        {ordini.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-xl border border-dashed">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-lg">Nessun ordine attivo al momento</p>
          </div>
        )}
      </div>
    </div>
  );
}
