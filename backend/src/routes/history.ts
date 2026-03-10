import { Router, Request, Response } from 'express';
import { generalRateLimiter } from '../middleware/rateLimit';
import chatHistoryService from '../services/chatHistory';

const router = Router();

router.get('/', generalRateLimiter, (_req: Request, res: Response): void => {
  const sessions = chatHistoryService.getAllSessions();
  res.json({ sessions });
});

router.get('/:sessionId', generalRateLimiter, (req: Request, res: Response): void => {
  const session = chatHistoryService.getSession(req.params.sessionId);
  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }
  res.json({ session });
});

router.delete('/:sessionId', generalRateLimiter, (req: Request, res: Response): void => {
  const deleted = chatHistoryService.deleteSession(req.params.sessionId);
  if (!deleted) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }
  res.json({ message: 'Session deleted' });
});

export default router;
