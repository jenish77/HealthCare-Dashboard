import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';
import { AuditLog } from '../modules/audit/audit.model';

export const checkRole = (allowedRoles: Array<'admin' | 'doctor' | 'nurse'>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required');
      }

      if (!allowedRoles.includes(req.user.role)) {
        AuditLog.create({
          userId: req.user._id,
          userEmail: req.user.email,
          userRole: req.user.role,
          action: 'ACCESS_DENIED',
          resource: req.originalUrl,
          ipAddress: req.ip || req.socket.remoteAddress,
          userAgent: req.get('User-Agent'),
          status: 'FAILURE',
          metadata: { requiredRoles: allowedRoles, method: req.method },
        }).catch((err) => console.error('Failed to log access denial:', err));

        throw new ApiError(
          403,
          `Access Forbidden: Role '${req.user.role}' is not authorized to access this resource`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
