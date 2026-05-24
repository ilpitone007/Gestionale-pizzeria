import { Clock, Printer, Phone, CheckCircle, Edit, Trash2, Home } from 'lucide-react';
import { format } from 'date-fns';

export interface OrdineCardProps {
  ordine: any;
  onPrint: (ordine: any, tipo: 'cucina' | 'cliente') => void;
  onEvaso: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function OrdineCard({
  ordine,
  onPrint,
  onEvaso,
  onEdit,
  onDelete,
}: OrdineCardProps) {
  const isLate = ordine.minutiAllaConsegna < 0;
  const isUrgent = ordine.minutiAllaConsegna >= 0 && ordine.minutiAllaConsegna <= 15;

  return (
    <div
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
            onClick={() => onPrint(ordine, 'cucina')}
            className="flex-1 bg-white dark:bg-gray-800 dark:bg-gray-800 transition-colors dark:bg-gray-800 transition-colors dark:bg-gray-800 transition-colors dark:bg-gray-800 transition-colors border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-gray-300 text-gray-700 dark:text-gray-300 dark:text-gray-300 py-2 px-1 rounded flex items-center justify-center gap-1 hover:bg-gray-50 dark:bg-gray-900 dark:bg-gray-700 dark:bg-gray-700/50 dark:bg-gray-700/50 text-[11px] md:text-sm font-medium transition-colors"
          >
            <Printer className="w-3 h-3 md:w-4 md:h-4" /> Cucina
          </button>
          <button
            onClick={() => onPrint(ordine, 'cliente')}
            className="flex-1 bg-gray-800 text-white py-2 px-1 rounded flex items-center justify-center gap-1 hover:bg-gray-900 text-[11px] md:text-sm font-medium transition-colors"
          >
            <Printer className="w-3 h-3 md:w-4 md:h-4" /> Scontrino
          </button>
          <button
            onClick={() => onEvaso(ordine.id)}
            className="flex-1 bg-green-600 text-white py-2 px-1 rounded flex items-center justify-center gap-1 hover:bg-green-700 text-[11px] md:text-sm font-medium transition-colors"
          >
            <CheckCircle className="w-3 h-3 md:w-4 md:h-4" /> Evaso
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(ordine.id)}
            className="flex-1 bg-blue-50 text-blue-700 border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-b dark:border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-gray-700lue-200 py-1.5 rounded flex items-center justify-center gap-1 hover:bg-blue-100 text-[11px] md:text-sm transition-colors font-medium"
          >
            <Edit className="w-3 h-3" /> Modifica
          </button>
          <button
            onClick={() => onDelete(ordine.id)}
            className="flex-1 bg-red-50 text-red-700 border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 border dark:border-gray-700 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700-red-200 py-1.5 rounded flex items-center justify-center gap-1 hover:bg-red-100 text-[11px] md:text-sm transition-colors font-medium"
          >
            <Trash2 className="w-3 h-3" /> Annulla/Elimina
          </button>
        </div>
      </div>
    </div>
  );
}
