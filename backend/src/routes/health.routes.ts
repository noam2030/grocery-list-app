import { Router, Request, Response } from 'express';
import { env } from '../config/env';

const router = Router();

router.get(['/health', '/api/health'], (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    service: 'grocery-list-app-api',
    project: env.GCP_PROJECT_ID,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router;
