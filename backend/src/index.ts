import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Menu - Pizze
app.get('/api/menu/pizze', async (req, res) => {
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

    // Flatten ingredienti
    const formattedPizze = pizze.map(p => ({
      ...p,
      ingredienti: p.ingredienti.map(i => i.ingrediente.nome)
    }));

    res.json(formattedPizze);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore durante il recupero delle pizze' });
  }
});

// Menu - Aggiunte
app.get('/api/menu/aggiunte', async (req, res) => {
  try {
    const aggiunte = await prisma.aggiunta.findMany({
      where: { disponibile: true },
      include: { categoria: true }
    });
    res.json(aggiunte);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore durante il recupero delle aggiunte' });
  }
});

// Ordini - Crea
app.post('/api/ordini', async (req, res) => {
  try {
    const { nomeCliente, telefonoCliente, orarioConsegna, noteGenerali, tipoRitiro, voci } = req.body;

    // Get max numero ordine for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxOrdine = await prisma.ordine.findFirst({
      where: {
        dataOrdine: {
          gte: today,
        }
      },
      orderBy: { numeroOrdine: 'desc' },
      select: { numeroOrdine: true }
    });

    const nextNumeroOrdine = (maxOrdine?.numeroOrdine || 0) + 1;

    // Calculate totaleOrdine
    const totaleOrdine = voci.reduce((acc: number, voce: any) => acc + voce.prezzoTotaleVoce, 0);

    const ordine = await prisma.ordine.create({
      data: {
        numeroOrdine: nextNumeroOrdine,
        nomeCliente,
        telefonoCliente,
        orarioConsegna: new Date(orarioConsegna),
        tipoRitiro: tipoRitiro || 'asporto',
        noteGenerali,
        totaleOrdine,
        voci: {
          create: voci.map((voce: any, index: number) => ({
            pizzaId: voce.pizzaId,
            nomePizzaSnapshot: voce.nomePizzaSnapshot,
            prezzoBaseSnapshot: voce.prezzoBaseSnapshot,
            note: voce.note,
            prezzoTotaleVoce: voce.prezzoTotaleVoce,
            posizione: index + 1,
            aggiunteSelezionate: {
              create: voce.aggiunte.map((agg: any) => ({
                aggiuntaId: agg.aggiuntaId,
                nomeAggiuntaSnapshot: agg.nomeAggiuntaSnapshot,
                prezzoAggiuntaSnapshot: agg.prezzoAggiuntaSnapshot
              }))
            }
          }))
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

// Ordini - Lista Attivi
app.get('/api/ordini', async (req, res) => {
  try {
    const ordini = await prisma.ordine.findMany({
      where: {
        stato: {
          notIn: ['ritirato', 'annullato']
        }
      },
      orderBy: {
        orarioConsegna: 'asc'
      },
      include: {
        voci: {
          include: {
            aggiunteSelezionate: true
          }
        }
      }
    });
    res.json(ordini);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore durante il recupero degli ordini' });
  }
});

// Ordini - Dettaglio
app.get('/api/ordini/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const ordine = await prisma.ordine.findUnique({
      where: { id: Number(id) },
      include: {
        voci: {
          include: {
            aggiunteSelezionate: true
          },
          orderBy: {
            posizione: 'asc'
          }
        }
      }
    });

    if (!ordine) {
      return res.status(404).json({ error: 'Ordine non trovato' });
    }

    res.json(ordine);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore durante il recupero dell\'ordine' });
  }
});


const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
