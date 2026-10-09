import { Encounter } from '../encounter/encounter.model';
import { PipelineStage } from 'mongoose';

export class AnalyticsService {
  private static getDateMatchFilter(startDate?: string, endDate?: string) {
    const match: any = {};
    if (startDate || endDate) {
      match.visitDate = {};
      if (startDate) match.visitDate.$gte = new Date(startDate);
      if (endDate) match.visitDate.$lte = new Date(endDate);
    }
    return match;
  }

  static async getIllnessTrends(startDate?: string, endDate?: string, interval: 'daily' | 'weekly' | 'monthly' = 'daily') {
    const matchFilter = this.getDateMatchFilter(startDate, endDate);

    let dateFormat = '%Y-%m-%d';
    if (interval === 'monthly') dateFormat = '%Y-%m';
    if (interval === 'weekly') dateFormat = '%Y-W%V';

    const pipeline: PipelineStage[] = [
      { $match: matchFilter },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: dateFormat, date: '$visitDate' } },
            category: '$diagnosisCategory',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.date': 1 } },
    ];

    const rawData = await Encounter.aggregate(pipeline);

    const resultMap = new Map<string, any>();

    rawData.forEach((item) => {
      const date = item._id.date;
      const category = item._id.category;
      const count = item.count;

      if (!resultMap.has(date)) {
        resultMap.set(date, {
          date,
          'Viral Illness': 0,
          Respiratory: 0,
          Diabetes: 0,
          Gastrointestinal: 0,
          Cardiovascular: 0,
          Other: 0,
        });
      }

      const entry = resultMap.get(date);
      if (entry && category in entry) {
        entry[category] = count;
      }
    });

    return Array.from(resultMap.values());
  }

  static async getMostCommonDiagnoses(startDate?: string, endDate?: string, limit = 10) {
    const matchFilter = this.getDateMatchFilter(startDate, endDate);

    const pipeline: PipelineStage[] = [
      { $match: matchFilter },
      {
        $group: {
          _id: '$specificDiagnosis',
          category: { $first: '$diagnosisCategory' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          diagnosis: '$_id',
          category: 1,
          count: 1,
        },
      },
    ];

    return await Encounter.aggregate(pipeline);
  }

  static async getSeasonalPatterns(year?: number) {
    const matchFilter: any = {};
    if (year) {
      matchFilter.visitDate = {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31`),
      };
    }

    const pipeline: PipelineStage[] = [
      { $match: matchFilter },
      {
        $group: {
          _id: {
            month: { $month: '$visitDate' },
            category: '$diagnosisCategory',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.month': 1 } },
    ];

    const rawData = await Encounter.aggregate(pipeline);

    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const result = months.map((monthName, index) => {
      const monthNum = index + 1;
      const monthData: any = {
        month: monthName,
        monthNum,
        'Viral Illness': 0,
        Respiratory: 0,
        Gastrointestinal: 0,
        Diabetes: 0,
        Cardiovascular: 0,
        Other: 0,
      };

      rawData.forEach((item) => {
        if (item._id.month === monthNum) {
          const category = item._id.category;
          if (category in monthData) {
            monthData[category] = item.count;
          }
        }
      });

      return monthData;
    });

    return result;
  }

  static async getEncountersByAgeGroup(startDate?: string, endDate?: string) {
    const matchFilter = this.getDateMatchFilter(startDate, endDate);

    const pipeline: PipelineStage[] = [
      { $match: matchFilter },
      {
        $lookup: {
          from: 'patients',
          localField: 'patientId',
          foreignField: '_id',
          as: 'patient',
        },
      },
      { $unwind: '$patient' },
      {
        $project: {
          age: '$patient.age',
          diagnosisCategory: 1,
          ageGroup: {
            $switch: {
              branches: [
                { case: { $lte: ['$patient.age', 12] }, then: '0-12' },
                { case: { $and: [{ $gt: ['$patient.age', 12] }, { $lte: ['$patient.age', 18] }] }, then: '13-18' },
                { case: { $and: [{ $gt: ['$patient.age', 18] }, { $lte: ['$patient.age', 35] }] }, then: '19-35' },
                { case: { $and: [{ $gt: ['$patient.age', 35] }, { $lte: ['$patient.age', 60] }] }, then: '36-60' },
              ],
              default: '60+',
            },
          },
        },
      },
      {
        $group: {
          _id: '$ageGroup',
          count: { $sum: 1 },
        },
      },
    ];

    const rawData = await Encounter.aggregate(pipeline);

    const ageGroupsOrder = ['0-12', '13-18', '19-35', '36-60', '60+'];
    const resultMap = new Map(rawData.map((item) => [item._id, item.count]));

    return ageGroupsOrder.map((group) => ({
      ageGroup: group,
      count: resultMap.get(group) || 0,
    }));
  }

  static async getOverviewKPIs(startDate?: string, endDate?: string) {
    const matchFilter = this.getDateMatchFilter(startDate, endDate);

    const totalEncounters = await Encounter.countDocuments(matchFilter);

    const topCategoryAgg = await Encounter.aggregate([
      { $match: matchFilter },
      { $group: { _id: '$diagnosisCategory', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    const topCategory = topCategoryAgg[0] ? topCategoryAgg[0]._id : 'N/A';

    const uniquePatientsAgg = await Encounter.aggregate([
      { $match: matchFilter },
      { $group: { _id: '$patientId' } },
      { $count: 'total' },
    ]);

    const uniquePatients = uniquePatientsAgg[0] ? uniquePatientsAgg[0].total : 0;

    return {
      totalEncounters,
      topCategory,
      uniquePatients,
    };
  }
}
