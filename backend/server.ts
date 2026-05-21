import express from 'express';
import cors from 'cors';

// Importa le routes
import menuRoutes from './src/routes/menu';
import ordiniRoutes from './src/routes/ordini';
import adminRoutes from './src/routes/admin';
import statisticheRoutes from './src/routes/statistiche';

// Importa il logger middleware
import { jsonLogger } from './src/middlewares/logger';

const app = express();

app.use(cors());
app.use(express.json());
app.use(jsonLogger);

// Registra le route modulari
app.use('/api/menu', menuRoutes);
app.use('/api/ordini', ordiniRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/statistiche', statisticheRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
