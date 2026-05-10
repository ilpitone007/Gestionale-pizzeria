import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

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

    // Formatting response to be cleaner for frontend
    const formattedPizze = pizze.map(p => ({
      id: p.id,
      nome: p.nome,
      descrizione: p.descrizione,
      categoria: p.categoria.nome,
      prezzoBase: p.prezzoBase,
      ingredienti: p.ingredienti.map(i => i.ingrediente.nome)
    }));

    res.json({ pizze: formattedPizze, categorieAggiunta });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore durante il recupero del menu' });
  }
});

// API: Crea Ordine
app.post('/api/ordini', async (req, res) => {
  try {
    const { nomeCliente, telefonoCliente, orarioConsegna, noteGenerali, voci, operatoreId } = req.body;

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

      totaleOrdine += prezzoTotaleVoce;

      return {
        pizzaId: voce.pizzaId,
        nomePizzaSnapshot: voce.nomePizza,
        prezzoBaseSnapshot: voce.prezzoBase,
        note: voce.note,
        prezzoTotaleVoce,
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
        totaleOrdine,
        operatoreId,
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
        },
        operatore: true
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

// API: Operatori Attivi
app.get('/api/operatori', async (req, res) => {
  try {
    const operatori = await prisma.operatore.findMany({
      where: { attivo: true },
      select: {
        id: true,
        nome: true,
        cognome: true,
        ruolo: true,
        pin: true // We'll map to a boolean to indicate if PIN is required
      },
      orderBy: { nome: 'asc' }
    });

    const formatted = operatori.map(op => ({
      id: op.id,
      nome: op.nome,
      cognome: op.cognome,
      ruolo: op.ruolo,
      richiedePin: op.pin !== null
    }));

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore durante il recupero degli operatori' });
  }
});

// API: Verifica PIN Operatore
app.post('/api/operatori/verify-pin', async (req, res) => {
  try {
    const { operatoreId, pin } = req.body;
    const operatore = await prisma.operatore.findUnique({
      where: { id: operatoreId }
    });

    if (!operatore) {
      return res.status(404).json({ error: 'Operatore non trovato' });
    }

    if (!operatore.pin) {
      return res.json({ success: true, operatore: { id: operatore.id, nome: operatore.nome, cognome: operatore.cognome, ruolo: operatore.ruolo } });
    }

    const isValid = await bcrypt.compare(pin, operatore.pin);
    if (isValid) {
      return res.json({ success: true, operatore: { id: operatore.id, nome: operatore.nome, cognome: operatore.cognome, ruolo: operatore.ruolo } });
    } else {
      return res.status(401).json({ error: 'PIN errato' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore durante la verifica del PIN' });
  }
});

// API: Admin - CRUD Operatori
app.get('/api/admin/operatori', async (req, res) => {
  try {
    // Just get ordini created today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const operatori = await prisma.operatore.findMany({
      orderBy: { nome: 'asc' },
      include: {
        ordini: {
          where: {
            dataOrdine: {
              gte: startOfDay,
              lte: endOfDay
            },
            stato: { notIn: ['annullato'] }
          },
          select: {
            totaleOrdine: true
          }
        }
      }
    });
    res.json(operatori.map(op => ({
      id: op.id, nome: op.nome, cognome: op.cognome,
      ruolo: op.ruolo, attivo: op.attivo,
      ordiniOggi: op.ordini.length,
      incassoOggi: op.ordini.reduce((sum, ordine) => sum + ordine.totaleOrdine, 0)
    })));
  } catch (error) {
    res.status(500).json({ error: 'Errore' });
  }
});

app.post('/api/admin/operatori', async (req, res) => {
  try {
    const { nome, cognome, pin, ruolo } = req.body;
    const hashedPin = pin ? await bcrypt.hash(pin, 10) : null;
    const nuovoOperatore = await prisma.operatore.create({
      data: {
        nome,
        cognome,
        pin: hashedPin,
        ruolo: ruolo || 'operatore'
      }
    });
    res.json(nuovoOperatore);
  } catch (error) {
    res.status(500).json({ error: 'Errore creazione operatore' });
  }
});

app.put('/api/admin/operatori/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nome, cognome, pin, ruolo, attivo } = req.body;
    const data: any = { nome, cognome, ruolo, attivo };
    if (pin !== undefined) {
      data.pin = pin ? await bcrypt.hash(pin, 10) : null;
    }
    const op = await prisma.operatore.update({
      where: { id },
      data
    });
    res.json(op);
  } catch (error) {
    res.status(500).json({ error: 'Errore aggiornamento operatore' });
  }
});


app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
