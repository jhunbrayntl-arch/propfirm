import { Router } from 'express';
import {
  getTrades,
  getTrade,
  createTrade,
  closeTrade,
  getOpenTrades,
} from '../controllers/tradeController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getTrades);
router.get('/open', getOpenTrades);
router.get('/:id', getTrade);
router.post('/', createTrade);
router.post('/:id/close', closeTrade);

export default router;
