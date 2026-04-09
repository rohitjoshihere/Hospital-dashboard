import { Router } from 'express';
import { verifyToken } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { list, getOne, create, update, remove } from '../controllers/patient.controller';

const router = Router();

// All patient routes require a valid JWT
router.use(verifyToken);

// GET /api/patients — ADMIN sees all, DOCTOR sees own
router.get('/', list);

// POST /api/patients — ADMIN only
router.post('/', requireRole('ADMIN'), create);

// GET /api/patients/:id — ADMIN full access, DOCTOR only if assigned
router.get('/:id', getOne);

// PUT /api/patients/:id — ADMIN only
router.put('/:id', requireRole('ADMIN'), update);

// DELETE /api/patients/:id — ADMIN only
router.delete('/:id', requireRole('ADMIN'), remove);

export default router;
