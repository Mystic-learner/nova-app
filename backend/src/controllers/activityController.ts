import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { sendResponse } from '../utils/response';

export class ActivityController {
  // GET /api/projects/:id/activity
  static async getProjectLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: projectId } = req.params;

      const logs = await prisma.activityLog.findMany({
        where: { projectId },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });

      return sendResponse(res, 200, logs);
    } catch (error) {
      next(error);
    }
  }
}