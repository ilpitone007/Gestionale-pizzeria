import express from 'express';
import cors from 'cors';

// Importa le routes
import authRoutes from './src/routes/auth';
import menuRoutes from './src/routes/menu';
import ordiniRoutes from './src/routes/ordini';
import adminRoutes from './src/routes/admin';
import statisticheRoutes from './src/routes/statistiche';

// Importa i middleware
import { jsonLogger } from './src/middlewares/logger';
import { authMiddleware, adminMiddleware } from './src/middlewares/auth';

const app = express();

app.use(cors());
app.use(express.json());
app.use(jsonLogger);

// Registra le route modulari
app.use('/api/auth', authRoutes);

// Menu accessibile liberamente (o si può proteggere, ma solitamente serve per creare ordini)
app.use('/api/menu', menuRoutes);

// Ordini protetti per gli operatori (authMiddleware)
app.use('/api/ordini', authMiddleware, ordiniRoutes);

// Admin e statistiche protetti per gli admin (authMiddleware + adminMiddleware)
app.use('/api/admin', authMiddleware, adminMiddleware, adminRoutes);
app.use('/api/statistiche', authMiddleware, adminMiddleware, statisticheRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
