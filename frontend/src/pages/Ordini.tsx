import React, { useEffect, useState } from 'react';
import { getOrdini } from '../api';

export default function Ordini() {
  const [ordini, setOrdini] = useState<any[]>([]);

  const fetchOrdini = () => {
    getOrdini().then(setOrdini);
  };

  useEffect(() => {
    fetchOrdini();
    const interval = setInterval(fetchOrdini, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (stato: string) => {
    switch (stato) {
      case 'in_corso': return 'bg-yellow-100 text-yellow-800';
      case 'confermato': return 'bg-blue-100 text-blue-800';
      case 'pronto': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePrintScontrino = (ordine: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
      <head>
        <title>Stampa Scontrino #${ordine.numeroOrdine}</title>
        <style>
          body { font-family: monospace; padding: 20px; max-width: 300px; margin: 0 auto; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .large { font-size: 1.2em; }
          .xlarge { font-size: 1.5em; }
          .divider { border-top: 1px dashed #000; margin: 10px 0; }
          .flex { display: flex; justify-content: space-between; }
          .items { margin-top: 15px; }
          .item-line { display: flex; justify-content: space-between; margin-bottom: 5px; }
          .item-meta { padding-left: 20px; font-size: 0.9em; display: flex; justify-content: space-between; }
          .item-note { padding-left: 20px; font-size: 0.9em; font-style: italic; }
        </style>
      </head>
      <body>
        <div class="center">
          <div class="large bold">🍕 PIZZERIA</div>
          <div>========================</div>
        </div>

        <div>Ordine n: <span class="bold">${ordine.numeroOrdine}</span></div>
        <div>Cliente: ${ordine.nomeCliente}</div>
        ${ordine.telefonoCliente ? `<div>Tel: ${ordine.telefonoCliente}</div>` : ''}

        <div class="divider"></div>
        <div class="center bold xlarge" style="padding: 10px 0;">
          ⏰ PRONTO: ${new Date(ordine.orarioConsegna).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </div>
        <div class="divider"></div>

        <div class="items">
          ${ordine.voci.map((voce: any) => `
            <div class="item-line">
              <span>1x ${voce.nomePizzaSnapshot}</span>
              <span>€${voce.prezzoTotaleVoce.toFixed(2)}</span>
            </div>
            ${voce.aggiunteSelezionate.map((agg: any) => `
              <div class="item-meta">
                <span>+ ${agg.nomeAggiuntaSnapshot}</span>
              </div>
            `).join('')}
            ${voce.note ? `<div class="item-note">Note: ${voce.note}</div>` : ''}
          `).join('')}
        </div>

        <div class="divider"></div>
        ${ordine.noteGenerali ? `<div>Note: ${ordine.noteGenerali}</div><div class="divider"></div>` : ''}

        <div class="flex bold large" style="margin-top: 10px;">
          <span>TOTALE</span>
          <span>€${ordine.totaleOrdine.toFixed(2)}</span>
        </div>
      </body>
      <script>
        window.onload = function() { window.print(); window.close(); }
      </script>
      </html>
    `);
    printWindow.document.close();
  };


  const handlePrintComandaCucina = (ordine: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
      <head>
        <title>Stampa Comanda Cucina #${ordine.numeroOrdine}</title>
        <style>
          body { font-family: monospace; padding: 20px; max-width: 300px; margin: 0 auto; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .large { font-size: 1.2em; }
          .xlarge { font-size: 1.5em; }
          .divider { border-top: 1px dashed #000; margin: 10px 0; }
          .items { margin-top: 15px; font-size: 1.2em; }
          .item-line { margin-bottom: 5px; font-weight: bold; }
          .item-meta { padding-left: 20px; font-size: 0.9em; }
          .item-note { padding-left: 20px; font-size: 0.9em; font-style: italic; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="center">
          <div class="large bold">COMANDA CUCINA</div>
          <div>Ordine n: <span class="xlarge bold">${ordine.numeroOrdine}</span></div>
        </div>

        <div class="divider"></div>
        <div class="center bold xlarge" style="padding: 10px 0; font-size: 2em; border: 2px solid black;">
          ⏰ ${new Date(ordine.orarioConsegna).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </div>
        <div class="divider"></div>

        <div class="items">
          ${ordine.voci.map((voce: any) => `
            <div class="item-line">1x ${voce.nomePizzaSnapshot}</div>
            ${voce.aggiunteSelezionate.map((agg: any) => `
              <div class="item-meta">+ ${agg.nomeAggiuntaSnapshot}</div>
            `).join('')}
            ${voce.note ? `<div class="item-note">*** Note: ${voce.note} ***</div>` : ''}
            <div style="margin-bottom: 10px;"></div>
          `).join('')}
        </div>

        <div class="divider"></div>
        ${ordine.noteGenerali ? `<div class="bold">Note Generali: ${ordine.noteGenerali}</div><div class="divider"></div>` : ''}
      </body>
      <script>
        window.onload = function() { window.print(); window.close(); }
      </script>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow min-h-[calc(100vh-100px)]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Ordini Attivi</h2>
        <button onClick={fetchOrdini} className="text-blue-600 hover:underline">Aggiorna</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ordini.map((ordine) => {
          const tConsegna = new Date(ordine.orarioConsegna);
          const isRitardo = tConsegna < new Date();

          return (
            <div key={ordine.id} className={`border-2 rounded-lg p-4 flex flex-col ${isRitardo ? 'border-red-500' : 'border-gray-200'}`}>
              <div className="flex justify-between items-start mb-3 border-b pb-2">
                <div>
                  <span className="text-2xl font-black">#{ordine.numeroOrdine}</span>
                  <div className="text-sm font-semibold mt-1">{ordine.nomeCliente}</div>
                </div>
                <div className="text-right">
                  <div className={`text-xl font-bold ${isRitardo ? 'text-red-600' : ''}`}>
                    {tConsegna.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full uppercase font-bold mt-1 inline-block ${getStatusColor(ordine.stato)}`}>
                    {ordine.stato}
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto mb-4 text-sm max-h-48 pr-2">
                {ordine.voci.map((v: any) => (
                  <div key={v.id} className="mb-2">
                    <div className="font-semibold">{v.posizione}. {v.nomePizzaSnapshot}</div>
                    {v.aggiunteSelezionate.length > 0 && (
                      <div className="text-gray-500 pl-3">
                        {v.aggiunteSelezionate.map((a:any) => `+${a.nomeAggiuntaSnapshot}`).join(', ')}
                      </div>
                    )}
                    {v.note && <div className="text-red-500 pl-3 font-medium">Nota: {v.note}</div>}
                  </div>
                ))}
                {ordine.noteGenerali && (
                  <div className="mt-3 pt-2 border-t text-red-600 font-bold">
                    Note Gen: {ordine.noteGenerali}
                  </div>
                )}
              </div>

              <div className="mt-auto border-t pt-3 flex gap-2">
                <button
                  onClick={() => handlePrintComandaCucina(ordine)}
                  className="flex-1 bg-yellow-500 text-white font-bold py-2 rounded hover:bg-yellow-600 text-sm"
                >
                  Cucina
                </button>
                <button
                  onClick={() => handlePrintScontrino(ordine)}
                  className="flex-1 bg-gray-800 text-white font-bold py-2 rounded hover:bg-gray-900 text-sm"
                >
                  Scontrino
                </button>
              </div>
            </div>
          );
        })}
        {ordini.length === 0 && <div className="text-gray-500 col-span-full text-center py-10">Nessun ordine attivo al momento.</div>}
      </div>
    </div>
  );
}
