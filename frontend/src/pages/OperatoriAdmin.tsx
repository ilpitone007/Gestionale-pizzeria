import { useState, useEffect } from 'react';
import { UserPlus, Edit2, CheckCircle2, XCircle } from 'lucide-react';

const API_BASE = 'http://localhost:3001/api/admin';

export default function OperatoriAdmin() {
  const [operatori, setOperatori] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState<any>(null);
  const [formData, setFormData] = useState({ nome: '', cognome: '', pin: '', ruolo: 'operatore', attivo: true });

  const fetchOperatori = async () => {
    try {
      const res = await fetch(`${API_BASE}/operatori`);
      const data = await res.json();
      setOperatori(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchOperatori();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = isEditing ? `${API_BASE}/operatori/${isEditing.id}` : `${API_BASE}/operatori`;
      const method = isEditing ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      setFormData({ nome: '', cognome: '', pin: '', ruolo: 'operatore', attivo: true });
      setIsEditing(null);
      fetchOperatori();
    } catch (error) {
      console.error(error);
      alert('Errore durante il salvataggio');
    }
  };

  const handleEdit = (op: any) => {
    setIsEditing(op);
    setFormData({ nome: op.nome, cognome: op.cognome, pin: '', ruolo: op.ruolo, attivo: op.attivo });
  };

  return (
    <div className="p-6 h-full overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestione Operatori</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Lista */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-4 font-semibold text-gray-600">Nome</th>
                <th className="p-4 font-semibold text-gray-600">Ruolo</th>
                <th className="p-4 font-semibold text-gray-600">Stato</th>
                <th className="p-4 font-semibold text-gray-600">Oggi (Ordini/Incasso)</th>
                <th className="p-4 font-semibold text-gray-600 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {operatori.map(op => (
                <tr key={op.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-4 font-medium">{op.nome} {op.cognome}</td>
                  <td className="p-4 uppercase text-xs text-gray-500">{op.ruolo}</td>
                  <td className="p-4">
                    {op.attivo ? (
                      <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded text-sm"><CheckCircle2 className="w-4 h-4"/> Attivo</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded text-sm"><XCircle className="w-4 h-4"/> Disattivo</span>
                    )}
                  </td>
                  <td className="p-4 font-medium">{op.ordiniOggi} / €{op.incassoOggi?.toFixed(2) || '0.00'}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleEdit(op)} className="text-blue-600 hover:bg-blue-50 p-2 rounded transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border p-6 h-fit">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            {isEditing ? 'Modifica Operatore' : 'Nuovo Operatore'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input required type="text" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-red-500 outline-none" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cognome *</label>
                <input required type="text" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-red-500 outline-none" value={formData.cognome} onChange={e => setFormData({...formData, cognome: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PIN {isEditing && '(lascia vuoto per non modificare)'}</label>
              <input type="password" maxLength={4} inputMode="numeric" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-red-500 outline-none" value={formData.pin} onChange={e => setFormData({...formData, pin: e.target.value})} placeholder="Es. 1234" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ruolo</label>
              <select className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-red-500 outline-none bg-white" value={formData.ruolo} onChange={e => setFormData({...formData, ruolo: e.target.value})}>
                <option value="operatore">Operatore</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {isEditing && (
              <label className="flex items-center gap-2 cursor-pointer mt-4">
                <input type="checkbox" className="rounded text-red-600 focus:ring-red-500 w-4 h-4" checked={formData.attivo} onChange={e => setFormData({...formData, attivo: e.target.checked})} />
                <span className="font-medium text-gray-700">Operatore Attivo</span>
              </label>
            )}

            <div className="pt-4 flex gap-2">
              <button type="submit" className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700">
                Salva
              </button>
              {isEditing && (
                <button type="button" onClick={() => { setIsEditing(null); setFormData({ nome: '', cognome: '', pin: '', ruolo: 'operatore', attivo: true }); }} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200">
                  Annulla
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
