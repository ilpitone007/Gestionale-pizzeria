import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// API: Admin Pizze
router.get('/pizze', async (req, res) => {
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

router.patch('/pizze/:id', async (req, res) => {
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
router.get('/impasti', async (req, res) => {
  try {
    const impasti = await prisma.impasto.findMany({
      orderBy: { nome: 'asc' }
    });
    res.json(impasti);
  } catch (error) {
    res.status(500).json({ error: "Errore" });
  }
});

router.patch('/impasti/:id', async (req, res) => {
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
router.get('/aggiunte', async (req, res) => {
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

router.patch('/aggiunte/:id', async (req, res) => {
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

export default router;
