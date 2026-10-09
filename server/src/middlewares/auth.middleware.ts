import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../config/jwt';
import { ApiError } from '../utils/apiError';
import { User } from '../modules/user/user.model';

export const verifyJWT = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new ApiError(401, 'Unauthorized request: Missing access token');
    }

    let decoded: any;
    try {
      decoded = verifyAccessToken(token);
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw new ApiError(401, 'Access token expired', [{ code: 'TOKEN_EXPIRED' }]);
      }
      throw new ApiError(401, 'Invalid access token');
    }

    const user = await User.findById(decoded._id).select('-passwordHash -refreshToken');
    if (!user || !user.isActive) {
      throw new ApiError(401, 'User account is inactive or no longer exists');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
