import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { TaskService } from '../services/taskService';
import { sendResponse } from '../utils/response';
import { TaskPriority, TaskStatus } from '@prisma/client';

export class TaskController {
  static async create(req: Request<{ projectId: string }>, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const task = await TaskService.createTask(req.params.projectId, authReq.user!.id, req.body);
      return sendResponse(res, 201, task, 'Task created successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getProjectTasks(req: Request<{ projectId: string }>, res: Response, next: NextFunction) {
    try {
      const filters = {
        status: req.query.status as TaskStatus | undefined,
        priority: req.query.priority as TaskPriority | undefined,
        assignedToId: req.query.assignedToId as string | undefined,
      };
      const tasks = await TaskService.getProjectTasks(req.params.projectId, filters);
      return sendResponse(res, 200, tasks);
    } catch (error) {
      next(error);
    }
  }

  static async getMyTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const tasks = await TaskService.getUserTasks(authReq.user!.id);
      return sendResponse(res, 200, tasks);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const task = await TaskService.getTaskById(req.params.id);
      return sendResponse(res, 200, task);
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const { status, order } = req.body;
      const task = await TaskService.updateTaskStatus(req.params.id, authReq.user!.id, status, order);
      return sendResponse(res, 200, task, 'Task status updated');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      await TaskService.deleteTask(req.params.id, authReq.user!.id);
      return sendResponse(res, 200, null, 'Task deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}