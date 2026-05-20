import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// API: Menu - Pizze disponibili e aggiunte
app.get('/api/menu', async (req, res) => {
  try {
    const pizze = await prisma.pizza.findMany({
      where: { disponibile: true },
      include: {
        categoria: true,
        ingredienti: {
          include: { ingrediente: true }
        }
      },
      orderBy: [
        { categoria: { ordine: 'asc' } },
        { nome: 'asc' }
      ]
    });

    const categorieAggiunta = await prisma.categoriaAggiunta.findMany({
      include: {
        aggiunte: {
          where: { disponibile: true }
        }
      }
    });

    const impasti = await prisma.impasto.findMany({
      where: { disponibile: true }
    });

    // Formatting response to be cleaner for frontend
    const formattedPizze = pizze.map(p => ({
      id: p.id,
      nome: p.nome,
      descrizione: p.descrizione,
      categoria: p.categoria.nome,
      prezzoBase: p.prezzoBase,
      ingredienti: p.ingredienti.map(i => i.ingrediente.nome)
    }));

    res.json({ pizze: formattedPizze, categorieAggiunta, impasti });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore durante il recupero del menu' });
  }
});

// API: Crea Ordine
app.post('/api/ordini', async (req, res) => {
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

    let totaleOrdine = 0;

    // Prepare voci
    const vociCreate = voci.map((voce: any, index: number) => {
      let prezzoTotaleVoce = voce.prezzoBase;
      const aggiunteSelezionate = voce.aggiunte.map((agg: any) => {
        prezzoTotaleVoce += agg.prezzo;
        return {
          aggiuntaId: agg.id,
          nomeAggiuntaSnapshot: agg.nome,
          prezzoAggiuntaSnapshot: agg.prezzo
        };
      });

      if (voce.impasto) {
        prezzoTotaleVoce += voce.impasto.sovrapprezzo;
      }

      totaleOrdine += prezzoTotaleVoce;

      return {
        pizzaId: voce.pizzaId,
        nomePizzaSnapshot: voce.nomePizza,
        prezzoBaseSnapshot: voce.prezzoBase,
        note: voce.note,
        prezzoTotaleVoce,
        impastoId: voce.impasto?.id,
        nomeImpastoSnapshot: voce.impasto?.nome,
        prezzoImpastoSnapshot: voce.impasto?.sovrapprezzo,
        posizione: index + 1,
        aggiunteSelezionate: {
          create: aggiunteSelezionate
        }
      };
    });

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

// API: Aggiorna stato ordine (es. ritirato)
app.patch('/api/ordini/:id/stato', async (req, res) => {
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

// API: Recupera Singolo Ordine (per Modifica)
app.get('/api/ordini/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Ignoriamo "attivi" come ID per non collidere con la rotta sotto
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

// API: Aggiorna Ordine Completo (Modifica)
app.put('/api/ordini/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nomeCliente, telefonoCliente, orarioConsegna, noteGenerali, voci, tipoRitiro, indirizzoConsegna, noteCitofono } = req.body;

    // Cancelliamo le vecchie voci e le ricreiamo per semplicità
    await prisma.voceOrdine.deleteMany({
      where: { ordineId: parseInt(id) }
    });

    let totaleOrdine = 0;

    const vociCreate = voci.map((voce: any, index: number) => {
      let prezzoTotaleVoce = voce.prezzoBase;
      const aggiunteSelezionate = voce.aggiunte.map((agg: any) => {
        prezzoTotaleVoce += agg.prezzo;
        return {
          aggiuntaId: agg.id,
          nomeAggiuntaSnapshot: agg.nome,
          prezzoAggiuntaSnapshot: agg.prezzo
        };
      });

      if (voce.impasto) {
        prezzoTotaleVoce += voce.impasto.sovrapprezzo;
      }

      totaleOrdine += prezzoTotaleVoce;

      return {
        pizzaId: voce.pizzaId,
        nomePizzaSnapshot: voce.nomePizza,
        prezzoBaseSnapshot: voce.prezzoBase,
        note: voce.note,
        prezzoTotaleVoce,
        impastoId: voce.impasto?.id,
        nomeImpastoSnapshot: voce.impasto?.nome,
        prezzoImpastoSnapshot: voce.impasto?.sovrapprezzo,
        posizione: index + 1,
        aggiunteSelezionate: {
          create: aggiunteSelezionate
        }
      };
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
app.delete('/api/ordini/:id', async (req, res) => {
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

// API: Ordini Attivi
app.get('/api/ordini/attivi', async (req, res) => {
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
    const formattedOrdini = ordini.map(o => {
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

// API: Admin Pizze
app.get('/api/admin/pizze', async (req, res) => {
  try {
    const pizze = await prisma.pizza.findMany({
      include: { categoria: true },
      orderBy: [{ categoria: { ordine: 'asc' } }, { nome: 'asc' }]
    });
    res.json(pizze);
  } catch (error) {
    res.status(500).json({ error: "Errore" });
  }
});

app.patch('/api/admin/pizze/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { disponibile, prezzoBase, nome } = req.body;

    const dataToUpdate: any = {};
    if (disponibile !== undefined) dataToUpdate.disponibile = disponibile;
    if (prezzoBase !== undefined) dataToUpdate.prezzoBase = parseFloat(prezzoBase);
    if (nome !== undefined) dataToUpdate.nome = nome;

    dataToUpdate.modificatoIl = new Date();

    const pizza = await prisma.pizza.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
      include: { categoria: true }
    });
    res.json(pizza);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errore durante l'aggiornamento della pizza" });
  }
});

// API: Admin Impasti
app.get('/api/admin/impasti', async (req, res) => {
  try {
    const impasti = await prisma.impasto.findMany({
      orderBy: { nome: 'asc' }
    });
    res.json(impasti);
  } catch (error) {
    res.status(500).json({ error: "Errore" });
  }
});

app.patch('/api/admin/impasti/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { disponibile, sovrapprezzo, nome } = req.body;

    const dataToUpdate: any = {};
    if (disponibile !== undefined) dataToUpdate.disponibile = disponibile;
    if (sovrapprezzo !== undefined) dataToUpdate.sovrapprezzo = parseFloat(sovrapprezzo);
    if (nome !== undefined) dataToUpdate.nome = nome;

    const impasto = await prisma.impasto.update({
      where: { id: parseInt(id) },
      data: dataToUpdate
    });
    res.json(impasto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errore durante l'aggiornamento dell'impasto" });
  }
});

// API: Admin Aggiunte
app.get('/api/admin/aggiunte', async (req, res) => {
  try {
    const aggiunte = await prisma.aggiunta.findMany({
      include: { categoria: true },
      orderBy: { nome: 'asc' }
    });
    res.json(aggiunte);
  } catch (error) {
    res.status(500).json({ error: "Errore" });
  }
});

app.patch('/api/admin/aggiunte/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { disponibile, prezzo, nome } = req.body;

    const dataToUpdate: any = {};
    if (disponibile !== undefined) dataToUpdate.disponibile = disponibile;
    if (prezzo !== undefined) dataToUpdate.prezzo = parseFloat(prezzo);
    if (nome !== undefined) dataToUpdate.nome = nome;

    const agg = await prisma.aggiunta.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
      include: { categoria: true }
    });
    res.json(agg);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errore durante l'aggiornamento dell'aggiunta" });
  }
});

// API: Statistiche Giornaliere
app.get('/api/statistiche', async (req, res) => {
  try {
    const { data } = req.query; // Expects 'YYYY-MM-DD'

    if (!data || typeof data !== 'string') {
      return res.status(400).json({ error: "Data non fornita" });
    }

    const startOfDay = new Date(`${data}T00:00:00.000Z`);
    const endOfDay = new Date(`${data}T23:59:59.999Z`);

    // Tutti gli ordini della giornata che non sono annullati
    const ordiniGiornata = await prisma.ordine.findMany({
      where: {
        dataOrdine: {
          gte: startOfDay,
          lte: endOfDay,
        },
        stato: { not: 'annullato' }
      },
      include: {
        voci: true
      }
    });

    const ordiniEvasi = ordiniGiornata.filter(o => o.stato === 'ritirato');

    const incassoTotale = ordiniEvasi.reduce((acc, curr) => acc + curr.totaleOrdine, 0);
    const incassoPrevisto = ordiniGiornata.reduce((acc, curr) => acc + curr.totaleOrdine, 0);

    // Conteggio pizze fatte
    const pizzeFatte: Record<string, number> = {};

    ordiniEvasi.forEach(ordine => {
      ordine.voci.forEach(voce => {
        if (!pizzeFatte[voce.nomePizzaSnapshot]) {
          pizzeFatte[voce.nomePizzaSnapshot] = 0;
        }
        pizzeFatte[voce.nomePizzaSnapshot] += 1;
      });
    });

    res.json({
      ordiniTotali: ordiniGiornata.length,
      ordiniEvasi: ordiniEvasi.length,
      incassoTotale,
      incassoPrevisto,
      pizzeFatte,
      ordiniDettaglio: ordiniGiornata // Include the detail for CSV export
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errore statistiche" });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
