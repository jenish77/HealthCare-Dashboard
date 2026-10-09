import { AuditLog, IAuditLog } from './audit.model';

export class AuditService {
  static async getAuditLogs(filter: any = {}, search?: string, limit = 50, page = 1) {
    const query: any = { ...filter };

    if (search) {
      query.$or = [
        { userEmail: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
        { resource: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { logs, total, page, totalPages: Math.ceil(total / limit) };
  }
}
