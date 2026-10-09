import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { ApiResponse } from '../../utils/apiResponse';
import { logAudit } from '../../middlewares/audit.middleware';

export class UserController {
  static async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await UserService.getAllUsers();
      res.status(200).json(new ApiResponse(200, { users }, 'Users fetched successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await UserService.getUserById(req.params.id);
      res.status(200).json(new ApiResponse(200, { user }, 'User details retrieved'));
    } catch (error) {
      next(error);
    }
  }

  static async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await UserService.createUser(req.body);
      await logAudit(req, 'CREATE_USER', 'User', user._id.toString(), { role: user.role });
      res.status(201).json(new ApiResponse(201, { user }, 'User created successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await UserService.updateUser(req.params.id, req.body);
      await logAudit(req, 'UPDATE_USER', 'User', user._id.toString(), { updates: req.body });
      res.status(200).json(new ApiResponse(200, { user }, 'User updated successfully'));
    } catch (error) {
      next(error);
    }
  }
}
