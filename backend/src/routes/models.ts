import { Router, Request, Response, NextFunction } from 'express';
import { generalRateLimiter } from '../middleware/rateLimit';
import { getAllModels } from '../providers';

const router = Router();

router.get(
  '/',
  generalRateLimiter,
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const models = await getAllModels();
      res.json({ providers: models });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
