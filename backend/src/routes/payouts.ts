import { Router } from 'express';
import {
  getPayouts,
  getPayout,
  createPayoutRequest,
  approvePayout,
  rejectPayout,
  getPayoutHistory,
} from '../controllers/payoutController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// User routes
router.get('/', getPayouts);
router.get('/:id', getPayout);
router.post('/', createPayoutRequest);

// Admin routes
router.get('/admin/history', authorize('ADMIN', 'SUPER_ADMIN'), getPayoutHistory);
router.post('/admin/:id/approve', authorize('ADMIN', 'SUPER_ADMIN'), approvePayout);
router.post('/admin/:id/reject', authorize('ADMIN', 'SUPER_ADMIN'), rejectPayout);

export default router;
