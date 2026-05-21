import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// API: Statistiche Giornaliere
router.get('/', async (req, res) => {
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

    const incassoTotale = ordiniEvasi.reduce((acc, curr) => acc + Number(curr.totaleOrdine), 0);
    const incassoPrevisto = ordiniGiornata.reduce((acc, curr) => acc + Number(curr.totaleOrdine), 0);

    // Conteggio pizze fatte
    const pizzeFatte: Record<string, number> = {};

    ordiniEvasi.forEach((ordine: any) => {
      ordine.voci.forEach((voce: any) => {
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

export default router;
