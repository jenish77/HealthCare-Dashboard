import { Router } from 'express';
import { AuditController } from './audit.controller';
import { verifyJWT } from '../../middlewares/auth.middleware';
import { checkRole } from '../../middlewares/rbac.middleware';

const router = Router();

router.use(verifyJWT);
router.use(checkRole(['admin']));

router.get('/', AuditController.getLogs);

export default router;
