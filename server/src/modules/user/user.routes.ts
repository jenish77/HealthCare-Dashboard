import { Router } from 'express';
import { UserController } from './user.controller';
import { verifyJWT } from '../../middlewares/auth.middleware';
import { checkRole } from '../../middlewares/rbac.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createUserSchema, updateUserSchema, getUserByIdSchema } from './user.validation';

const router = Router();

router.use(verifyJWT);
router.use(checkRole(['admin']));

router.get('/', UserController.getAllUsers);
router.get('/:id', validate(getUserByIdSchema), UserController.getUserById);
router.post('/', validate(createUserSchema), UserController.createUser);
router.patch('/:id', validate(updateUserSchema), UserController.updateUser);

export default router;
