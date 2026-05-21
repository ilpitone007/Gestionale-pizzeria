import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();
if (!process.env.JWT_SECRET) {
  console.error("ERRORE FATALE: JWT_SECRET non è definito nelle variabili d'ambiente.");
  process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET;

router.post('/login', async (req, res) => {
  try {
    const { username, pin } = req.body;

    if (!username || !pin) {
      return res.status(400).json({ error: 'Username e PIN richiesti' });
    }

    const utente = await prisma.utente.findUnique({
      where: { username }
    });

    if (!utente || !utente.attivo) {
      return res.status(401).json({ error: 'Credenziali non valide o utente disabilitato' });
    }

    const isValid = await bcrypt.compare(pin, utente.pin);

    if (!isValid) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    const token = jwt.sign(
      { id: utente.id, username: utente.username, ruolo: utente.ruolo },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.json({
      token,
      utente: {
        id: utente.id,
        username: utente.username,
        ruolo: utente.ruolo
      }
    });

  } catch (error) {
    console.error('Errore login:', error);
    res.status(500).json({ error: 'Errore durante il login' });
  }
});

export default router;
