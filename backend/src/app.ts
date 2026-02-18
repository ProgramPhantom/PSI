import express from 'express';
import diagramRoutes from './routes/diagramRoutes.js';
import userRoutes from './routes/userRoutes.js'
import { errorHandler } from './middlewares/errorHandler.js';
import session from 'express-session';
import { sessionOptns } from './middlewares/sessionOptns.js';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import type { JsonObject } from './db/db.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(session(sessionOptns))

// Routes
app.use('/api/diagrams', diagramRoutes);
app.use('/api/users', userRoutes);

const swaggerDocument = YAML.load(path.join(__dirname, '../docs/openapi.yml')) as JsonObject;

app.use(
  '/api-docs', 
  swaggerUi.serve, 
  swaggerUi.setup(swaggerDocument)
);

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;