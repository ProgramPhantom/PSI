import express from 'express';
import diagramRoutes from './routes/diagramRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import session from 'express-session';
import { sessionOptns } from './middlewares/sessionOptns.js';
const app = express();

app.use(express.json());
app.use(session(sessionOptns))

// Routes
app.use('/api/diagrams', diagramRoutes);
app.use('/api/users')

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;