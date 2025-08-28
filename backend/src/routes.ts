import { Express } from 'express';
import authRoutes from './modules/auth/auth.routes';
import hodRoutes from './modules/hod/routes';

export function registerRoutes(app: Express) {
  app.use('/auth', authRoutes);
  app.use('/hod', hodRoutes)
}

