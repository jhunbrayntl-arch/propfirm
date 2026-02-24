import { Router } from 'express';
import {
  getFundedAccounts,
  getFundedAccount,
  getAccountStats,
  requestPayout,
  getAccountRules,
} from '../controllers/accountController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getFundedAccounts);
router.get('/:id', getFundedAccount);
router.get('/:id/stats', getAccountStats);
router.get('/:id/rules', getAccountRules);
router.post('/:id/payout', requestPayout);

export default router;
