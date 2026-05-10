import { create } from 'zustand';

export interface Aggiunta {
  id: number;
  nome: string;
  prezzo: number;
  categoriaId: number;
}

export interface Pizza {
  id: number;
  nome: string;
  descrizione: string;
  prezzoBase: number;
  categoria: { id: number; nome: string };
  ingredienti: string[];
}

export interface VoceOrdine {
  id?: number;
  pizzaId: number;
  nomePizzaSnapshot: string;
  prezzoBaseSnapshot: number;
  note: string;
  aggiunte: {
    aggiuntaId: number;
    nomeAggiuntaSnapshot: string;
    prezzoAggiuntaSnapshot: number;
  }[];
  prezzoTotaleVoce: number;
}

interface CartState {
  voci: VoceOrdine[];
  addVoce: (voce: VoceOrdine) => void;
  removeVoce: (index: number) => void;
  clearCart: () => void;
  totale: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  voci: [],
  addVoce: (voce) => set((state) => ({ voci: [...state.voci, voce] })),
  removeVoce: (index) => set((state) => ({
    voci: state.voci.filter((_, i) => i !== index)
  })),
  clearCart: () => set({ voci: [] }),
  totale: () => get().voci.reduce((sum, voce) => sum + voce.prezzoTotaleVoce, 0)
}));
