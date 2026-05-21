import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

// Determina il percorso del file di log
const logFilePath = path.join(__dirname, '../../server.log');

export const jsonLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Intercetta la fine della risposta
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs: duration,
      ip: req.ip,
      userAgent: req.get('User-Agent') || 'unknown'
    };

    // Scrive il log in formato JSON su una nuova riga
    fs.appendFile(logFilePath, JSON.stringify(logEntry) + '\n', (err) => {
      if (err) {
        console.error('Errore durante la scrittura del log:', err);
      }
    });
  });

  next();
};
