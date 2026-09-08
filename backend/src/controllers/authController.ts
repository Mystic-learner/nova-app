import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { AuthenticatedRequest } from '../middleware/auth';
import { sendResponse } from '../utils/response';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      return sendResponse(res, 201, result, 'User registered successfully');
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);
      return sendResponse(res, 200, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.refresh(req.body.refreshToken);
      return sendResponse(res, 200, result, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  }

  static async logout(_req: Request, res: Response) {
    return sendResponse(res, 200, null, 'Logged out successfully');
  }

  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      return sendResponse(res, 200, authReq.user, 'Current user retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}