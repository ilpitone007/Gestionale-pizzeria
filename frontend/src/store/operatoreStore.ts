import { create } from 'zustand';

export interface Operatore {
  id: number;
  nome: string;
  cognome: string;
  ruolo: string;
}

interface OperatoreState {
  operatore: Operatore | null;
  setOperatore: (operatore: Operatore | null) => void;
  loadFromSession: () => void;
  logout: () => void;
}

export const useOperatoreStore = create<OperatoreState>((set) => ({
  operatore: null,
  setOperatore: (operatore) => {
    if (operatore) {
      sessionStorage.setItem('operatore', JSON.stringify(operatore));
    } else {
      sessionStorage.removeItem('operatore');
    }
    set({ operatore });
  },
  loadFromSession: () => {
    const stored = sessionStorage.getItem('operatore');
    if (stored) {
      try {
        set({ operatore: JSON.parse(stored) });
      } catch (e) {
        sessionStorage.removeItem('operatore');
      }
    }
  },
  logout: () => {
    sessionStorage.removeItem('operatore');
    set({ operatore: null });
  }
}));
