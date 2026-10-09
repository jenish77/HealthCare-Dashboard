import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { verifyJWT } from '../../middlewares/auth.middleware';
import { checkRole } from '../../middlewares/rbac.middleware';

const router = Router();

router.use(verifyJWT);
router.get(
  '/dashboard',
  checkRole(['admin', 'doctor', 'nurse']),
  AnalyticsController.getDashboardMetrics
);

export default router;
