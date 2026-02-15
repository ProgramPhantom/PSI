import express from 'express';
import diagramRoutes from './routes/diagramRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(express.json());

// Routes
app.use('/api/diagrams', diagramRoutes);

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;