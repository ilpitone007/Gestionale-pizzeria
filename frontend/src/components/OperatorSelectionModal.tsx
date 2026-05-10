import { useEffect, useState } from 'react';
import { useOperatoreStore } from '../store/operatoreStore';
import { Lock, X } from 'lucide-react';

interface Operator {
  id: number;
  nome: string;
  cognome: string;
  ruolo: string;
  richiedePin: boolean;
}

export default function OperatorSelectionModal() {
  const { operatore, setOperatore } = useOperatoreStore();
  const [operatori, setOperatori] = useState<Operator[]>([]);
  const [selectedOp, setSelectedOp] = useState<Operator | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:3001/api/operatori')
      .then(res => res.json())
      .then(data => setOperatori(data))
      .catch(err => console.error(err));
  }, []);

  if (operatore) return null; // Already selected

  const handleSelect = (op: Operator) => {
    if (op.richiedePin) {
      setSelectedOp(op);
      setPin('');
      setError('');
    } else {
      // Direct login if no PIN required (backend doesn't require PIN validation if it has no PIN)
      fetch('http://localhost:3001/api/operatori/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operatoreId: op.id, pin: '' })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) setOperatore(data.operatore);
      });
    }
  };

  const handlePinSubmit = () => {
    if (!selectedOp) return;

    fetch('http://localhost:3001/api/operatori/verify-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operatoreId: selectedOp.id, pin })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setOperatore(data.operatore);
        setSelectedOp(null);
      } else {
        setError(data.error || 'PIN errato');
        setPin('');
      }
    })
    .catch(() => setError('Errore di connessione'));
  };

  const handlePinDigit = (digit: string) => {
    setPin(prev => {
      const next = prev + digit;
      return next;
    });
    setError('');
  };

  useEffect(() => {
    if (pin.length === 4) {
      handlePinSubmit();
    }
  }, [pin]);

  return (
    <div className="fixed inset-0 z-[100] bg-gray-900 bg-opacity-95 flex flex-col items-center justify-center p-4">
      {!selectedOp ? (
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden p-6">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Seleziona Operatore</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {operatori.map((op) => (
              <button
                key={op.id}
                onClick={() => handleSelect(op)}
                className="flex flex-col items-center p-6 bg-gray-50 border-2 border-gray-100 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all group"
              >
                <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-3xl font-bold mb-4 group-hover:scale-110 transition-transform">
                  {op.nome[0]}{op.cognome[0]}
                </div>
                <span className="text-xl font-semibold text-gray-800">{op.nome}</span>
                {op.richiedePin && <Lock className="w-4 h-4 text-gray-400 mt-2" />}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden p-6 flex flex-col items-center">
          <button
            className="self-end text-gray-400 hover:text-gray-800"
            onClick={() => setSelectedOp(null)}
          >
            <X className="w-6 h-6" />
          </button>

          <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-3xl font-bold mb-4">
            {selectedOp.nome[0]}{selectedOp.cognome[0]}
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedOp.nome}</h2>
          <p className="text-gray-500 mb-6">Inserisci il tuo PIN</p>

          <div className="flex gap-4 mb-8">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-2xl font-bold
                  ${pin.length > i ? 'border-gray-800 bg-gray-800 text-white' : 'border-gray-200'}
                  ${error ? 'border-red-500 bg-red-50 text-red-500' : ''}`}
              >
                {pin.length > i ? '•' : ''}
              </div>
            ))}
          </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <div className="grid grid-cols-3 gap-4 w-full">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handlePinDigit(num.toString())}
                disabled={pin.length >= 4}
                className="h-16 text-2xl font-bold rounded-xl bg-gray-50 hover:bg-gray-100 active:bg-gray-200"
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => setPin(prev => prev.slice(0, -1))}
              className="h-16 text-xl font-bold rounded-xl bg-gray-50 hover:bg-gray-100 active:bg-gray-200"
            >
              CANC
            </button>
            <button
              onClick={() => handlePinDigit('0')}
              disabled={pin.length >= 4}
              className="h-16 text-2xl font-bold rounded-xl bg-gray-50 hover:bg-gray-100 active:bg-gray-200"
            >
              0
            </button>
            <button
              onClick={handlePinSubmit}
              disabled={pin.length < 4}
              className="h-16 text-xl font-bold rounded-xl bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:opacity-50 disabled:bg-gray-300"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
