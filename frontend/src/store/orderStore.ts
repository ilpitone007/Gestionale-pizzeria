import { create } from 'zustand';
import { format } from 'date-fns';

export interface Aggiunta {
  id: number;
  nome: string;
  prezzo: number;
  categoriaId: number;
}

export interface Impasto {
  id: number;
  nome: string;
  sovrapprezzo: number;
}

export interface VoceOrdine {
  id: string; // temp id for frontend
  pizzaId: number;
  nomePizza: string;
  prezzoBase: number;
  aggiunte: Aggiunta[];
  impasto?: Impasto;
  note: string;
}

interface OrderState {
  nomeCliente: string;
  telefonoCliente: string;
  orarioConsegna: string;
  noteGenerali: string;
  tipoRitiro: string;
  indirizzoConsegna: string;
  noteCitofono: string;
  metodoPagamento: string;
  scontoFisso: number;
  scontoPercentuale: number;
  importoRicevuto: number | undefined;
  editOrderId: number | null;
  voci: VoceOrdine[];

  setNomeCliente: (nome: string) => void;
  setTelefonoCliente: (tel: string) => void;
  setOrarioConsegna: (orario: string) => void;
  setNoteGenerali: (note: string) => void;
  setTipoRitiro: (tipo: string) => void;
  setIndirizzoConsegna: (indirizzo: string) => void;
  setNoteCitofono: (note: string) => void;
  setMetodoPagamento: (val: string) => void;
  setScontoFisso: (val: number) => void;
  setScontoPercentuale: (val: number) => void;
  setImportoRicevuto: (val: number | undefined) => void;
  setEditOrderId: (id: number | null) => void;

  addVoce: (voce: Omit<VoceOrdine, 'id'>) => void;
  removeVoce: (id: string) => void;
  updateVoce: (id: string, voce: Partial<VoceOrdine>) => void;
  clearOrdine: () => void;
  loadOrdine: (ordine: any) => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  nomeCliente: '',
  telefonoCliente: '',
  orarioConsegna: '',
  noteGenerali: '',
  tipoRitiro: 'asporto',
  indirizzoConsegna: '',
  noteCitofono: '',
  metodoPagamento: 'contanti',
  scontoFisso: 0,
  scontoPercentuale: 0,
  importoRicevuto: undefined,
  editOrderId: null,
  voci: [],

  setNomeCliente: (nome) => set({ nomeCliente: nome }),
  setTelefonoCliente: (tel) => set({ telefonoCliente: tel }),
  setOrarioConsegna: (orario) => set({ orarioConsegna: orario }),
  setNoteGenerali: (note) => set({ noteGenerali: note }),
  setTipoRitiro: (tipo) => set({ tipoRitiro: tipo }),
  setIndirizzoConsegna: (indirizzo) => set({ indirizzoConsegna: indirizzo }),
  setNoteCitofono: (note) => set({ noteCitofono: note }),
  setMetodoPagamento: (val) => set({ metodoPagamento: val }),
  setScontoFisso: (val) => set({ scontoFisso: val }),
  setScontoPercentuale: (val) => set({ scontoPercentuale: val }),
  setImportoRicevuto: (val) => set({ importoRicevuto: val }),
  setEditOrderId: (id) => set({ editOrderId: id }),

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
    tipoRitiro: 'asporto',
    indirizzoConsegna: '',
    noteCitofono: '',
    metodoPagamento: 'contanti',
    scontoFisso: 0,
    scontoPercentuale: 0,
    importoRicevuto: undefined,
    editOrderId: null,
    voci: []
  }),
  loadOrdine: (ordine) => {
    // Gestione timezone locale per precompilare il datetime-local
    const date = new Date(ordine.orarioConsegna);
    const dateStr = format(date, "yyyy-MM-dd'T'HH:mm");

    set({
      nomeCliente: ordine.nomeCliente,
      telefonoCliente: ordine.telefonoCliente || '',
      orarioConsegna: dateStr,
      noteGenerali: ordine.noteGenerali || '',
      tipoRitiro: ordine.tipoRitiro,
      indirizzoConsegna: ordine.indirizzoConsegna || '',
      noteCitofono: ordine.noteCitofono || '',
      metodoPagamento: ordine.metodoPagamento || 'contanti',
      scontoFisso: ordine.scontoFisso || 0,
      scontoPercentuale: ordine.scontoPercentuale || 0,
      importoRicevuto: ordine.importoRicevuto !== null ? ordine.importoRicevuto : undefined,
      editOrderId: ordine.id,
      voci: ordine.voci.map((v: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        pizzaId: v.pizzaId,
        nomePizza: v.nomePizzaSnapshot,
        prezzoBase: v.prezzoBaseSnapshot,
        note: v.note || '',
        impasto: v.impastoId ? { id: v.impastoId, nome: v.nomeImpastoSnapshot, sovrapprezzo: v.prezzoImpastoSnapshot } : undefined,
        aggiunte: v.aggiunteSelezionate.map((a: any) => ({
          id: a.aggiuntaId,
          nome: a.nomeAggiuntaSnapshot,
          prezzo: a.prezzoAggiuntaSnapshot
        }))
      }))
    });
  }
}));
