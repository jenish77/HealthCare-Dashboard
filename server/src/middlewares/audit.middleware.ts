import { Request } from 'express';
import { AuditLog } from '../modules/audit/audit.model';
import { logger } from '../utils/logger';

export const logAudit = async (
  req: Request,
  action:
    | 'CREATE_ENCOUNTER'
    | 'UPDATE_ENCOUNTER'
    | 'DELETE_ENCOUNTER'
    | 'CREATE_PATIENT'
    | 'UPDATE_PATIENT'
    | 'CREATE_USER'
    | 'UPDATE_USER'
    | 'DEACTIVATE_USER'
    | 'USER_LOGIN'
    | 'USER_LOGOUT'
    | 'ACCESS_DENIED',
  resource: string,
  resourceId: string | null = null,
  metadata: Record<string, any> = {}
): Promise<void> => {
  try {
    if (!req.user) return;
    await AuditLog.create({
      userId: req.user._id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action,
      resource,
      resourceId: resourceId ? String(resourceId) : undefined,
      ipAddress: req.ip || req.socket?.remoteAddress,
      userAgent: req.get('User-Agent'),
      status: 'SUCCESS',
      metadata,
    });
  } catch (error: any) {
    logger.error(`Failed to record audit log: ${error.message}`);
  }
};
