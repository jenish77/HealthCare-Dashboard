import { Router } from 'express';
import { PatientController } from './patient.controller';
import { verifyJWT } from '../../middlewares/auth.middleware';
import { checkRole } from '../../middlewares/rbac.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createPatientSchema, updatePatientSchema, getPatientByIdSchema } from './patient.validation';

const router = Router();

router.use(verifyJWT);

router.get('/', PatientController.getAllPatients);
router.get('/:id', validate(getPatientByIdSchema), PatientController.getPatientById);
router.post('/', checkRole(['admin', 'doctor', 'nurse']), validate(createPatientSchema), PatientController.createPatient);
router.patch('/:id', checkRole(['admin', 'doctor']), validate(updatePatientSchema), PatientController.updatePatient);

export default router;
