import { Router } from 'express';
import {
  getMarketData,
  openTrade,
  closeTrade,
  getPositions,
  getHistory,
} from '../controllers/marketController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/market', getMarketData);
router.get('/positions', getPositions);
router.get('/history', getHistory);
router.post('/open', openTrade);
router.post('/close/:id', closeTrade);

export default router;
