import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from './analytics.service';
import { ApiResponse } from '../../utils/apiResponse';

export class AnalyticsController {
  static async getDashboardMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;
      const interval = (req.query.interval as 'daily' | 'weekly' | 'monthly') || 'daily';

      const [kpis, illnessTrends, commonDiagnoses, seasonalPatterns, ageGroupDistribution] = await Promise.all([
        AnalyticsService.getOverviewKPIs(startDate, endDate),
        AnalyticsService.getIllnessTrends(startDate, endDate, interval),
        AnalyticsService.getMostCommonDiagnoses(startDate, endDate, 10),
        AnalyticsService.getSeasonalPatterns(year),
        AnalyticsService.getEncountersByAgeGroup(startDate, endDate),
      ]);

      res.status(200).json(
        new ApiResponse(
          200,
          {
            kpis,
            illnessTrends,
            commonDiagnoses,
            seasonalPatterns,
            ageGroupDistribution,
          },
          'Analytics dashboard data retrieved successfully'
        )
      );
    } catch (error) {
      next(error);
    }
  }
}
