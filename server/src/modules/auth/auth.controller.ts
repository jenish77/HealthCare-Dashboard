import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { ApiResponse } from '../../utils/apiResponse';
import { logAudit } from '../../middlewares/audit.middleware';

// For cross-origin production deployment (e.g. Vercel frontend + Railway backend),
// sameSite MUST be 'none' and secure MUST be true for cross-site cookie delivery.
const getCookieOptions = (maxAgeMs: number) => ({
  httpOnly: true,
  secure: true,
  sameSite: 'none' as const,
  maxAge: maxAgeMs,
});

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await AuthService.registerUser(req.body);
      await logAudit(req, 'CREATE_USER', 'User', user._id.toString(), { role: user.role });
      res.status(201).json(new ApiResponse(201, { user }, 'User registered successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const { user, tokens } = await AuthService.loginUser(email, password);

      res.cookie('accessToken', tokens.accessToken, getCookieOptions(15 * 60 * 1000));
      res.cookie('refreshToken', tokens.refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));

      req.user = user;
      await logAudit(req, 'USER_LOGIN', 'Auth', user._id.toString());

      res.status(200).json(
        new ApiResponse(
          200,
          {
            user: {
              _id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
            },
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          },
          'Login successful'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const incomingRefreshToken =
        req.cookies?.refreshToken || req.body?.refreshToken || req.headers['x-refresh-token'];

      const { tokens, user } = await AuthService.refreshAccessToken(incomingRefreshToken);

      res.cookie('accessToken', tokens.accessToken, getCookieOptions(15 * 60 * 1000));
      res.cookie('refreshToken', tokens.refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));

      res.status(200).json(
        new ApiResponse(
          200,
          {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: {
              _id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
            },
          },
          'Token refreshed successfully'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user) {
        await AuthService.logoutUser(req.user._id.toString());
        await logAudit(req, 'USER_LOGOUT', 'Auth', req.user._id.toString());
      }

      res.clearCookie('accessToken', getCookieOptions(0));
      res.clearCookie('refreshToken', getCookieOptions(0));

      res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json(new ApiResponse(200, { user: req.user }, 'Current user retrieved'));
    } catch (error) {
      next(error);
    }
  }
}
