import { Request, Response, NextFunction } from 'express';
import { EncounterService } from './encounter.service';
import { ApiResponse } from '../../utils/apiResponse';
import { logAudit } from '../../middlewares/audit.middleware';

export class EncounterController {
  static async createEncounter(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const encounter = await EncounterService.createEncounter(req.body, req.user!._id.toString());
      await logAudit(req, 'CREATE_ENCOUNTER', 'Encounter', encounter._id.toString(), {
        patientId: encounter.patientId,
        category: encounter.diagnosisCategory,
      });
      res.status(201).json(new ApiResponse(201, { encounter }, 'Encounter entry saved successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async getAllEncounters(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = req.query.search as string;
      const category = req.query.category as string;
      const patientId = req.query.patientId as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const filter: any = {};
      if (category) filter.diagnosisCategory = category;
      if (patientId) filter.patientId = patientId;

      const result = await EncounterService.getAllEncounters(filter, search, limit, page);
      res.status(200).json(new ApiResponse(200, result, 'Encounters retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async getEncounterById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const encounter = await EncounterService.getEncounterById(req.params.id);
      res.status(200).json(new ApiResponse(200, { encounter }, 'Encounter details retrieved'));
    } catch (error) {
      next(error);
    }
  }

  static async updateEncounter(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const encounter = await EncounterService.updateEncounter(req.params.id, req.body);
      await logAudit(req, 'UPDATE_ENCOUNTER', 'Encounter', encounter._id.toString(), {
        updates: req.body,
      });
      res.status(200).json(new ApiResponse(200, { encounter }, 'Encounter record updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async deleteEncounter(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await EncounterService.deleteEncounter(req.params.id);
      await logAudit(req, 'DELETE_ENCOUNTER', 'Encounter', req.params.id);
      res.status(200).json(new ApiResponse(200, null, 'Encounter deleted successfully'));
    } catch (error) {
      next(error);
    }
  }
}
