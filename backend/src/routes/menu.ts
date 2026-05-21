import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// API: Menu - Pizze disponibili e aggiunte
router.get('/', async (req, res) => {
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
    const formattedPizze = pizze.map((p: any) => ({
      id: p.id,
      nome: p.nome,
      descrizione: p.descrizione,
      categoria: p.categoria.nome,
      prezzoBase: p.prezzoBase,
      ingredienti: p.ingredienti.map((i: any) => i.ingrediente.nome)
    }));

    res.json({ pizze: formattedPizze, categorieAggiunta, impasti });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore durante il recupero del menu' });
  }
});

export default router;
