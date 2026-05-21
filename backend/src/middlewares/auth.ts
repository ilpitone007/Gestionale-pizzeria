import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
  console.error("ERRORE FATALE: JWT_SECRET non è definito nelle variabili d'ambiente.");
  process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET;

// Estendi l'interfaccia Request di Express
declare global {
  namespace Express {
    interface Request {
      utente?: {
        id: number;
        username: string;
        ruolo: string;
      };
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Autorizzazione negata. Token mancante.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number, username: string, ruolo: string };
    req.utente = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token non valido o scaduto.' });
  }
};

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.utente || req.utente.ruolo !== 'admin') {
    return res.status(403).json({ error: 'Accesso negato. Richiesti permessi di Amministratore.' });
  }
  next();
};
