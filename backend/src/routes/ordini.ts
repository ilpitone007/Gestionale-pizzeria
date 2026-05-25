import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// API: Crea Ordine
router.post('/', async (req, res) => {
  try {
    const { nomeCliente, telefonoCliente, orarioConsegna, noteGenerali, voci, tipoRitiro, indirizzoConsegna, noteCitofono } = req.body;

    // 1. Get current max order number for today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const result = await prisma.ordine.aggregate({
      where: {
        dataOrdine: {
          gte: startOfDay,
          lte: endOfDay,
        }
      },
      _max: {
        numeroOrdine: true,
      }
    });

    const nextNumeroOrdine = (result._max.numeroOrdine || 0) + 1;


    // Prepare voci
    let totaleOrdine = 0;
    const vociCreate = [];

    // ⚡ Bolt: Batch fetch prices (N+1 query fix)
    // 🎯 Why: Instead of querying the database for every pizza, impasto, and aggiunta in a loop,
    // we fetch all unique IDs in parallel at the start.
    // 📊 Impact: Changes O(N*M) database queries into exactly 3 parallel queries, reducing order creation time significantly for large orders.
    const uniquePizzaIds = [...new Set(voci.map((v: any) => v.pizzaId))] as number[];
    const uniqueImpastoIds = [...new Set(voci.map((v: any) => v.impasto?.id).filter(Boolean))] as number[];
    const uniqueAggiuntaIds = [...new Set(voci.flatMap((v: any) => (v.aggiunte || []).map((a: any) => a.id)).filter(Boolean))] as number[];

    const [pizzeDb, impastiDb, aggiunteDb] = await Promise.all([
      prisma.pizza.findMany({ where: { id: { in: uniquePizzaIds } } }),
      uniqueImpastoIds.length > 0 ? prisma.impasto.findMany({ where: { id: { in: uniqueImpastoIds } } }) : Promise.resolve([]),
      uniqueAggiuntaIds.length > 0 ? prisma.aggiunta.findMany({ where: { id: { in: uniqueAggiuntaIds } } }) : Promise.resolve([])
    ]);

    const pizzeMap = new Map(pizzeDb.map((p: any) => [p.id, p]));
    const impastiMap = new Map(impastiDb.map((i: any) => [i.id, i]));
    const aggiunteMap = new Map(aggiunteDb.map((a: any) => [a.id, a]));

    for (let index = 0; index < voci.length; index++) {
      const voce = voci[index];

      // Recupera il prezzo aggiornato della pizza dal DB (O(1) Map lookup)
      const pizzaDb = pizzeMap.get(voce.pizzaId);
      if (!pizzaDb) {
        return res.status(400).json({ error: `Pizza con id ${voce.pizzaId} non trovata` });
      }

      let prezzoTotaleVoce = pizzaDb.prezzoBase;
      const nomePizzaSnapshot = pizzaDb.nome;
      const prezzoBaseSnapshot = pizzaDb.prezzoBase;

      // Recupera i prezzi delle aggiunte dal DB
      const aggiunteSelezionate = [];
      for (const agg of (voce.aggiunte || [])) {
        const aggiuntaDb = aggiunteMap.get(agg.id);
        if (aggiuntaDb) {
          prezzoTotaleVoce += aggiuntaDb.prezzo;
          aggiunteSelezionate.push({
            aggiuntaId: aggiuntaDb.id,
            nomeAggiuntaSnapshot: aggiuntaDb.nome,
            prezzoAggiuntaSnapshot: aggiuntaDb.prezzo
          });
        }
      }

      // Recupera il prezzo dell'impasto dal DB
      let impastoId = null;
      let nomeImpastoSnapshot = null;
      let prezzoImpastoSnapshot = null;

      if (voce.impasto && voce.impasto.id) {
        const impastoDb = impastiMap.get(voce.impasto.id);
        if (impastoDb) {
          impastoId = impastoDb.id;
          nomeImpastoSnapshot = impastoDb.nome;
          prezzoImpastoSnapshot = impastoDb.sovrapprezzo;
          prezzoTotaleVoce += impastoDb.sovrapprezzo;
        }
      }

      totaleOrdine += prezzoTotaleVoce;

      vociCreate.push({
        pizzaId: voce.pizzaId,
        nomePizzaSnapshot,
        prezzoBaseSnapshot,
        note: voce.note,
        prezzoTotaleVoce,
        impastoId,
        nomeImpastoSnapshot,
        prezzoImpastoSnapshot,
        posizione: index + 1,
        aggiunteSelezionate: {
          create: aggiunteSelezionate
        }
      });
    }

    const ordine = await prisma.ordine.create({
      data: {
        numeroOrdine: nextNumeroOrdine,
        nomeCliente,
        telefonoCliente,
        orarioConsegna: new Date(orarioConsegna),
        noteGenerali,
        tipoRitiro: tipoRitiro || 'asporto',
        indirizzoConsegna,
        noteCitofono,
        totaleOrdine,
        voci: {
          create: vociCreate
        }
      },
      include: {
        voci: {
          include: {
            aggiunteSelezionate: true
          }
        }
      }
    });

    res.status(201).json(ordine);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore durante la creazione dell\'ordine' });
  }
});

// API: Ordini Attivi
router.get('/attivi', async (req, res) => {
  try {
    const ordini = await prisma.ordine.findMany({
      where: {
        stato: { notIn: ['ritirato', 'annullato'] }
      },
      include: {
        voci: {
          include: {
            aggiunteSelezionate: true
          },
          orderBy: { posizione: 'asc' }
        }
      },
      orderBy: { orarioConsegna: 'asc' }
    });

    // Add missing minutes
    const now = new Date().getTime();
    const formattedOrdini = ordini.map((o: any) => {
      const msDiff = new Date(o.orarioConsegna).getTime() - now;
      const minutiAllaConsegna = Math.round(msDiff / 60000);
      return {
        ...o,
        minutiAllaConsegna
      };
    });

    res.json(formattedOrdini);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore durante il recupero degli ordini' });
  }
});

// API: Recupera Singolo Ordine (per Modifica)
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Ignoriamo "attivi" come ID per non collidere con la rotta sopra (in caso di chiamate errate)
    if (id === 'attivi') return next();

    const ordine = await prisma.ordine.findUnique({
      where: { id: parseInt(id) },
      include: {
        voci: {
          include: {
            aggiunteSelezionate: true
          },
          orderBy: { posizione: 'asc' }
        }
      }
    });
    if (!ordine) return res.status(404).json({ error: "Ordine non trovato" });
    res.json(ordine);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errore" });
  }
});

// API: Aggiorna stato ordine (es. ritirato)
router.patch('/:id/stato', async (req, res) => {
  try {
    const { id } = req.params;
    const { stato } = req.body;

    const ordine = await prisma.ordine.update({
      where: { id: parseInt(id) },
      data: { stato, modificatoIl: new Date() }
    });

    res.json(ordine);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errore durante l'aggiornamento dell'ordine" });
  }
});

// API: Aggiorna Ordine Completo (Modifica)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nomeCliente, telefonoCliente, orarioConsegna, noteGenerali, voci, tipoRitiro, indirizzoConsegna, noteCitofono } = req.body;


    let totaleOrdine = 0;
    const vociCreate = [];

    // ⚡ Bolt: Batch fetch prices (N+1 query fix)
    const uniquePizzaIds = [...new Set(voci.map((v: any) => v.pizzaId))] as number[];
    const uniqueImpastoIds = [...new Set(voci.map((v: any) => v.impasto?.id).filter(Boolean))] as number[];
    const uniqueAggiuntaIds = [...new Set(voci.flatMap((v: any) => (v.aggiunte || []).map((a: any) => a.id)).filter(Boolean))] as number[];

    const [pizzeDb, impastiDb, aggiunteDb] = await Promise.all([
      prisma.pizza.findMany({ where: { id: { in: uniquePizzaIds } } }),
      uniqueImpastoIds.length > 0 ? prisma.impasto.findMany({ where: { id: { in: uniqueImpastoIds } } }) : Promise.resolve([]),
      uniqueAggiuntaIds.length > 0 ? prisma.aggiunta.findMany({ where: { id: { in: uniqueAggiuntaIds } } }) : Promise.resolve([])
    ]);

    const pizzeMap = new Map(pizzeDb.map((p: any) => [p.id, p]));
    const impastiMap = new Map(impastiDb.map((i: any) => [i.id, i]));
    const aggiunteMap = new Map(aggiunteDb.map((a: any) => [a.id, a]));

    // 1. Validate and fetch prices FIRST before deleting anything
    for (let index = 0; index < voci.length; index++) {
      const voce = voci[index];

      const pizzaDb = pizzeMap.get(voce.pizzaId);
      if (!pizzaDb) {
        return res.status(400).json({ error: `Pizza con id ${voce.pizzaId} non trovata` });
      }

      let prezzoTotaleVoce = pizzaDb.prezzoBase;
      const nomePizzaSnapshot = pizzaDb.nome;
      const prezzoBaseSnapshot = pizzaDb.prezzoBase;

      const aggiunteSelezionate = [];
      for (const agg of (voce.aggiunte || [])) {
        const aggiuntaDb = aggiunteMap.get(agg.id);
        if (aggiuntaDb) {
          prezzoTotaleVoce += aggiuntaDb.prezzo;
          aggiunteSelezionate.push({
            aggiuntaId: aggiuntaDb.id,
            nomeAggiuntaSnapshot: aggiuntaDb.nome,
            prezzoAggiuntaSnapshot: aggiuntaDb.prezzo
          });
        }
      }

      let impastoId = null;
      let nomeImpastoSnapshot = null;
      let prezzoImpastoSnapshot = null;

      if (voce.impasto && voce.impasto.id) {
        const impastoDb = impastiMap.get(voce.impasto.id);
        if (impastoDb) {
          impastoId = impastoDb.id;
          nomeImpastoSnapshot = impastoDb.nome;
          prezzoImpastoSnapshot = impastoDb.sovrapprezzo;
          prezzoTotaleVoce += impastoDb.sovrapprezzo;
        }
      }

      totaleOrdine += prezzoTotaleVoce;

      vociCreate.push({
        pizzaId: voce.pizzaId,
        nomePizzaSnapshot,
        prezzoBaseSnapshot,
        note: voce.note,
        prezzoTotaleVoce,
        impastoId,
        nomeImpastoSnapshot,
        prezzoImpastoSnapshot,
        posizione: index + 1,
        aggiunteSelezionate: {
          create: aggiunteSelezionate
        }
      });
    }

    // 2. Cancelliamo le vecchie voci e le ricreiamo per semplicità
    await prisma.voceOrdine.deleteMany({
      where: { ordineId: parseInt(id) }
    });


    const ordine = await prisma.ordine.update({
      where: { id: parseInt(id) },
      data: {
        nomeCliente,
        telefonoCliente,
        orarioConsegna: new Date(orarioConsegna),
        noteGenerali,
        tipoRitiro: tipoRitiro || 'asporto',
        indirizzoConsegna,
        noteCitofono,
        totaleOrdine,
        modificatoIl: new Date(),
        voci: {
          create: vociCreate
        }
      }
    });

    res.json(ordine);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errore durante la modifica dell'ordine" });
  }
});

// API: Elimina Ordine (Annullamento definitivo)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.ordine.delete({
      where: { id: parseInt(id) }
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errore durante l'eliminazione dell'ordine" });
  }
});

export default router;
