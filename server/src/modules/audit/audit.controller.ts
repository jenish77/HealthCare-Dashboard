import { Request, Response, NextFunction } from 'express';
import { AuditService } from './audit.service';
import { ApiResponse } from '../../utils/apiResponse';

export class AuditController {
  static async getLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = req.query.search as string;
      const action = req.query.action as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const filter: any = {};
      if (action) filter.action = action;

      const result = await AuditService.getAuditLogs(filter, search, limit, page);
      res.status(200).json(new ApiResponse(200, result, 'Audit logs retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }
}
