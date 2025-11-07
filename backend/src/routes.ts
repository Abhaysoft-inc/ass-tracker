import { Express } from 'express';
import authRoutes from './modules/auth/auth.routes';
import hodRoutes from './modules/hod/routes';
import studentRoutes from './modules/student/route';
import facultyRoutes from './modules/faculty/routes';
import timetableRoutes from './modules/timetable/timetable.routes';

export function registerRoutes(app: Express) {
  app.use('/auth', authRoutes);
  app.use('/hod', hodRoutes);
  app.use('/student', studentRoutes);
  app.use('/faculty', facultyRoutes);
  app.use('/timetable', timetableRoutes);
}

