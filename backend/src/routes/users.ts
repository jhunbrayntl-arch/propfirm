import { Router } from 'express';
import {
  getUsers,
  getUser,
  updateUser,
  suspendUser,
  getDashboardStats,
} from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Admin routes
router.get('/admin/all', authorize('ADMIN', 'SUPER_ADMIN'), getUsers);
router.get('/admin/:id', authorize('ADMIN', 'SUPER_ADMIN'), getUser);
router.put('/admin/:id', authorize('ADMIN', 'SUPER_ADMIN'), updateUser);
router.post('/admin/:id/suspend', authorize('SUPER_ADMIN'), suspendUser);
router.get('/admin/dashboard/stats', authorize('ADMIN', 'SUPER_ADMIN'), getDashboardStats);

export default router;
