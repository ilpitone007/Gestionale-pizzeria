import { useState, useEffect, useCallback } from 'react';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import OrdineCard from '../components/OrdineCard';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function OrdiniAttivi() {
  const [ordini, setOrdini] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchOrdini = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/ordini/attivi`);
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stato: 'ritirato' })
      });
      fetchOrdini(); // Aggiorna lista
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Sei sicuro di voler eliminare definitivamente questo ordine?')) return;
    try {
      await fetch(`${API_BASE}/ordini/${id}`, {
        method: 'DELETE'
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
        {ordini.map((ordine) => (
          <OrdineCard
            key={ordine.id}
            ordine={ordine}
            onPrint={handlePrint}
            onEvaso={handleEvaso}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}

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
