import { create } from 'zustand';

export interface Aggiunta {
  id: number;
  nome: string;
  prezzo: number;
  categoriaId: number;
}

export interface VoceOrdine {
  id: string; // temp id for frontend
  pizzaId: number;
  nomePizza: string;
  prezzoBase: number;
  aggiunte: Aggiunta[];
  note: string;
}

interface OrderState {
  nomeCliente: string;
  telefonoCliente: string;
  orarioConsegna: string;
  noteGenerali: string;
  voci: VoceOrdine[];

  setNomeCliente: (nome: string) => void;
  setTelefonoCliente: (tel: string) => void;
  setOrarioConsegna: (orario: string) => void;
  setNoteGenerali: (note: string) => void;

  addVoce: (voce: Omit<VoceOrdine, 'id'>) => void;
  removeVoce: (id: string) => void;
  updateVoce: (id: string, voce: Partial<VoceOrdine>) => void;
  clearOrdine: () => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  nomeCliente: '',
  telefonoCliente: '',
  orarioConsegna: '',
  noteGenerali: '',
  voci: [],

  setNomeCliente: (nome) => set({ nomeCliente: nome }),
  setTelefonoCliente: (tel) => set({ telefonoCliente: tel }),
  setOrarioConsegna: (orario) => set({ orarioConsegna: orario }),
  setNoteGenerali: (note) => set({ noteGenerali: note }),

  addVoce: (voce) => set((state) => ({
    voci: [...state.voci, { ...voce, id: Math.random().toString(36).substr(2, 9) }]
  })),
  removeVoce: (id) => set((state) => ({
    voci: state.voci.filter(v => v.id !== id)
  })),
  updateVoce: (id, updatedFields) => set((state) => ({
    voci: state.voci.map(v => v.id === id ? { ...v, ...updatedFields } : v)
  })),
  clearOrdine: () => set({
    nomeCliente: '',
    telefonoCliente: '',
    orarioConsegna: '',
    noteGenerali: '',
    voci: []
  })
}));
