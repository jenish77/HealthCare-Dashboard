import { Request, Response, NextFunction } from 'express';
import { PatientService } from './patient.service';
import { ApiResponse } from '../../utils/apiResponse';
import { logAudit } from '../../middlewares/audit.middleware';

export class PatientController {
  static async createPatient(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const patient = await PatientService.createPatient(req.body, req.user!._id.toString());
      await logAudit(req, 'CREATE_PATIENT', 'Patient', patient._id.toString(), {
        anonymizedId: patient.anonymizedId,
      });
      res.status(201).json(new ApiResponse(201, { patient }, 'Anonymized patient registered successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async getAllPatients(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = req.query.search as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await PatientService.getAllPatients({}, search, limit, page);
      res.status(200).json(new ApiResponse(200, result, 'Patients retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async getPatientById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const patient = await PatientService.getPatientById(req.params.id);
      res.status(200).json(new ApiResponse(200, { patient }, 'Patient details retrieved'));
    } catch (error) {
      next(error);
    }
  }

  static async updatePatient(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const patient = await PatientService.updatePatient(req.params.id, req.body);
      await logAudit(req, 'UPDATE_PATIENT', 'Patient', patient._id.toString(), { updates: req.body });
      res.status(200).json(new ApiResponse(200, { patient }, 'Patient updated successfully'));
    } catch (error) {
      next(error);
    }
  }
}
