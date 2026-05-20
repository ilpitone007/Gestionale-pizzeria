import { Printer } from 'lucide-react';

export default function TestStampante() {
  const handlePrintTest = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test Stampante</title>
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
          <div class="title">🍕 PIZZERIA TEST</div>
          <strong>SCONTRINO DI PROVA</strong>
        </div>

        <div class="info">
          <div>Ordine n°: <strong>999</strong></div>
          <div>Cliente: Mario Rossi Test</div>
          <div style="font-size: 0.8em; margin-top: 5px; color: #666;">
            Ricevuto: 01/01/2026 18:30
          </div>
        </div>

        <div class="time">
          ⏰ PRONTO ALLE: <br/> 19:00
        </div>

        <div class="items">
          <div style="margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; font-weight: bold;">
              <span>1x Margherita Lunga</span>
              <span>€7.50</span>
            </div>
            <div style="padding-left: 15px; font-size: 0.9em;">
              + Mozzarella extra (€1.00)<br>
              + Prosciutto crudo DOP (€2.00)
            </div>
            <div style="padding-left: 15px; font-style: italic; font-size: 0.9em; margin-top: 2px;">Note: ben cotta, tagliare a spicchi</div>
          </div>
          <div style="margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; font-weight: bold;">
              <span>1x Patatine Grandi</span>
              <span>€5.00</span>
            </div>
          </div>
        </div>

        <div class="total">
          TOTALE: €15.50
        </div>

        <div class="footer">
          Questo è un test di stampa.<br>
          Larghezza 80mm.
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

  return (
    <div className="p-4 md:p-8 h-full flex flex-col items-center justify-center bg-gray-50 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Printer className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Test Stampante Termica</h2>
        <p className="text-gray-500 mb-8">
          Usa questa sezione per verificare che i margini, i caratteri e la larghezza della carta della tua stampante termica (es. 80mm) siano configurati correttamente.
        </p>

        <button
          onClick={handlePrintTest}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <Printer className="w-5 h-5" /> Genera Scontrino di Prova
        </button>
      </div>
    </div>
  );
}
