import { Router } from 'express';
import { EncounterController } from './encounter.controller';
import { verifyJWT } from '../../middlewares/auth.middleware';
import { checkRole } from '../../middlewares/rbac.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  createEncounterSchema,
  updateEncounterSchema,
  getEncounterByIdSchema,
} from './encounter.validation';

const router = Router();

router.use(verifyJWT);

router.get('/', EncounterController.getAllEncounters);
router.get('/:id', validate(getEncounterByIdSchema), EncounterController.getEncounterById);
router.post(
  '/',
  checkRole(['admin', 'doctor', 'nurse']),
  validate(createEncounterSchema),
  EncounterController.createEncounter
);
router.patch(
  '/:id',
  checkRole(['admin', 'doctor']),
  validate(updateEncounterSchema),
  EncounterController.updateEncounter
);
router.delete(
  '/:id',
  checkRole(['admin']),
  validate(getEncounterByIdSchema),
  EncounterController.deleteEncounter
);

export default router;
