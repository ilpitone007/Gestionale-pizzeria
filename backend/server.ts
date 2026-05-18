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
    const { nomeCliente, telefonoCliente, orarioConsegna, noteGenerali, voci } = req.body;

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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
