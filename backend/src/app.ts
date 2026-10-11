import express from 'express';
import { corsMiddleware } from './middlewares/cors';
import { errorHandler } from './middlewares/errorHandler';
import healthRoutes from './routes/health.routes';
import listsRoutes from './routes/lists.routes';
import itemsRoutes from './routes/items.routes';

export function createApp() {
  const app = express();

  // Standard middleware
  app.use(corsMiddleware);
  app.use(express.json({ limit: '2mb' }));

  // Routes
  app.use(healthRoutes);
  app.use('/api/lists', listsRoutes);
  app.use('/api/items', itemsRoutes);

  // Error handling middleware
  app.use(errorHandler);

  return app;
}
