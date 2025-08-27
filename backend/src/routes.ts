import { Express } from 'express';
import authRoutes from './modules/auth/auth.routes';

export function registerRoutes(app: Express) {
  app.use('/auth', authRoutes);
}

