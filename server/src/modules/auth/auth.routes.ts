import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../middlewares/validate.middleware';
import { verifyJWT } from '../../middlewares/auth.middleware';
import { checkRole } from '../../middlewares/rbac.middleware';
import { registerSchema, loginSchema, refreshTokenSchema } from './auth.validation';

const router = Router();

router.post('/login', validate(loginSchema), AuthController.login);
router.post('/refresh', validate(refreshTokenSchema), AuthController.refresh);

// Protected routes
router.use(verifyJWT);
router.post('/logout', AuthController.logout);
router.get('/me', AuthController.getCurrentUser);
router.post('/register', checkRole(['admin']), validate(registerSchema), AuthController.register);

export default router;
