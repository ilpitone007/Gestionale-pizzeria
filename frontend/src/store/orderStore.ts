import { create } from 'zustand';
import { format } from 'date-fns';

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
  orderId: number | null;
  tipoRitiro: string;
  numeroTavolo: string;
  nomeCliente: string;
  telefonoCliente: string;
  orarioConsegna: string;
  noteGenerali: string;
  voci: VoceOrdine[];

  setOrderId: (id: number | null) => void;
  setTipoRitiro: (tipo: string) => void;
  setNumeroTavolo: (num: string) => void;
  setNomeCliente: (nome: string) => void;
  setTelefonoCliente: (tel: string) => void;
  setOrarioConsegna: (orario: string) => void;
  setNoteGenerali: (note: string) => void;

  loadOrder: (orderData: any) => void;

  addVoce: (voce: Omit<VoceOrdine, 'id'>) => void;
  removeVoce: (id: string) => void;
  updateVoce: (id: string, voce: Partial<VoceOrdine>) => void;
  clearOrdine: () => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  orderId: null,
  tipoRitiro: 'asporto',
  numeroTavolo: '',
  nomeCliente: '',
  telefonoCliente: '',
  orarioConsegna: '',
  noteGenerali: '',
  voci: [],

  setOrderId: (id) => set({ orderId: id }),
  setTipoRitiro: (tipo) => set({ tipoRitiro: tipo }),
  setNumeroTavolo: (num) => set({ numeroTavolo: num }),
  setNomeCliente: (nome) => set({ nomeCliente: nome }),
  setTelefonoCliente: (tel) => set({ telefonoCliente: tel }),
  setOrarioConsegna: (orario) => set({ orarioConsegna: orario }),
  setNoteGenerali: (note) => set({ noteGenerali: note }),

  loadOrder: (orderData) => set({
    orderId: orderData.id,
    tipoRitiro: orderData.tipoRitiro,
    numeroTavolo: orderData.numeroTavolo ? String(orderData.numeroTavolo) : '',
    nomeCliente: orderData.nomeCliente,
    telefonoCliente: orderData.telefonoCliente || '',
    // Format date for datetime-local input (yyyy-MM-dd'T'HH:mm) using local time
    orarioConsegna: format(new Date(orderData.orarioConsegna), "yyyy-MM-dd'T'HH:mm"),
    noteGenerali: orderData.noteGenerali || '',
    voci: orderData.voci.map((v: any) => ({
      id: String(v.id), // Using existing ID as string for the list
      pizzaId: v.pizzaId,
      nomePizza: v.nomePizzaSnapshot,
      prezzoBase: v.prezzoBaseSnapshot,
      note: v.note || '',
      aggiunte: v.aggiunteSelezionate.map((a: any) => ({
        id: a.aggiuntaId,
        nome: a.nomeAggiuntaSnapshot,
        prezzo: a.prezzoAggiuntaSnapshot,
        categoriaId: 0 // Doesn't matter for the display
      }))
    }))
  }),

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
    orderId: null,
    tipoRitiro: 'asporto',
    numeroTavolo: '',
    nomeCliente: '',
    telefonoCliente: '',
    orarioConsegna: '',
    noteGenerali: '',
    voci: []
  })
}));
