import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { ProjectService } from '../services/projectService';
import { sendResponse } from '../utils/response';
import { ProjectStatus } from '@prisma/client';

export class ProjectController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      
      if (!authReq.user?.id) {
        return sendResponse(res, 401, null, 'Unauthorized: User session missing');
      }

      const project = await ProjectService.createProject(authReq.user.id, req.body);
      return sendResponse(res, 201, project, 'Project created successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;

      if (!authReq.user?.id) {
        return sendResponse(res, 401, null, 'Unauthorized: User session missing');
      }

      const status = req.query.status as ProjectStatus | undefined;
      const search = req.query.search as string | undefined;
      const projects = await ProjectService.getUserProjects(authReq.user.id, status, search);
      return sendResponse(res, 200, projects);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const { id } = req.params;

      // Reject invalid or literal undefined route parameters
      if (!id || id === 'undefined' || id === 'null' || !id.trim()) {
        return sendResponse(res, 400, null, 'Invalid project ID provided');
      }

      if (!authReq.user?.id) {
        return sendResponse(res, 401, null, 'Unauthorized: User session missing');
      }

      const project = await ProjectService.getProjectById(id, authReq.user.id);
      
      if (!project) {
        return sendResponse(res, 404, null, 'Project not found');
      }

      return sendResponse(res, 200, project);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const { id } = req.params;

      if (!id || id === 'undefined' || id === 'null') {
        return sendResponse(res, 400, null, 'Invalid project ID provided');
      }

      if (!authReq.user?.id) {
        return sendResponse(res, 401, null, 'Unauthorized: User session missing');
      }

      const project = await ProjectService.updateProject(id, authReq.user.id, req.body);
      return sendResponse(res, 200, project, 'Project updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const { id } = req.params;

      if (!id || id === 'undefined' || id === 'null') {
        return sendResponse(res, 400, null, 'Invalid project ID provided');
      }

      if (!authReq.user?.id) {
        return sendResponse(res, 401, null, 'Unauthorized: User session missing');
      }

      await ProjectService.deleteProject(id, authReq.user.id);
      return sendResponse(res, 200, null, 'Project deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async addMember(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const { id } = req.params;

      if (!id || id === 'undefined' || id === 'null') {
        return sendResponse(res, 400, null, 'Invalid project ID provided');
      }

      if (!authReq.user?.id) {
        return sendResponse(res, 401, null, 'Unauthorized: User session missing');
      }

      const member = await ProjectService.addMember(
        id,
        authReq.user.id,
        req.body.email,
        req.body.role
      );
      return sendResponse(res, 201, member, 'Member added successfully');
    } catch (error) {
      next(error);
    }
  }
}