import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboardService';
import { sendResponse } from '../utils/response';

export class DashboardController {
  static async getMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const metrics = await DashboardService.getMetrics(req.user!.id);
      return sendResponse(res, 200, metrics);
    } catch (error) {
      next(error);
    }
  }
}