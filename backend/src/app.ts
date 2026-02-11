import express from 'express';
import testRoutes from './routes/testRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(express.json());

// Routes
app.use('/api/test', testRoutes);

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;