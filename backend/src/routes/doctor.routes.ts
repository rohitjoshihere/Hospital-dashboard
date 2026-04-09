import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { logger } from '../config/logger';

const router = Router();
const prisma = new PrismaClient();

// GET /api/doctors — ADMIN only, returns list of doctors for assignment dropdown
router.get('/', verifyToken, requireRole('ADMIN'), async (_req: Request, res: Response) => {
  try {
    const doctors = await prisma.user.findMany({
      where: { role: 'DOCTOR' },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    });
    res.json(doctors);
  } catch (err) {
    logger.error('Failed to fetch doctors', { message: (err as Error).message });
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
