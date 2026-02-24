import { Router } from 'express';
import {
  getChallenges,
  getChallenge,
  createChallenge,
  getChallengeTypes,
  getChallengeProgress,
} from '../controllers/challengeController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/types', getChallengeTypes);
router.get('/', getChallenges);
router.get('/:id', getChallenge);
router.get('/:id/progress', getChallengeProgress);
router.post('/', createChallenge);

export default router;
