import { Router, Request, Response, NextFunction } from 'express';
import { verifyToken } from '../middleware/auth';
import { upload } from '../services/media.service';
import { uploadMedia, mediaStatus } from '../controllers/media.controller';

const router = Router();

router.use(verifyToken);

// POST /api/patients/:id/media — multipart upload, returns 202 immediately
router.post(
  '/patients/:id/media',
  (req: Request, res: Response, next: NextFunction) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        res.status(400).json({ message: err.message });
        return;
      }
      next();
    });
  },
  uploadMedia
);

// GET /api/media/:id/status — poll processing status
router.get('/media/:id/status', mediaStatus);

export default router;
