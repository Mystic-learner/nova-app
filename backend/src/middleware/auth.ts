import { Request, Response, NextFunction } from 'express';
import { MemberRole, Role } from '@prisma/client';
import { verifyToken } from '../utils/jwt';
import { AppError } from '../utils/errors';
import { prisma } from '../config/database';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
  };
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication token is missing or invalid', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, deletedAt: true },
    });

    if (!user || user.deletedAt) {
      throw new AppError('User account no longer exists or has been deactivated', 401);
    }

    (req as AuthenticatedRequest).user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(new AppError('Invalid or expired authentication token', 401));
    } else {
      next(error);
    }
  }
};

export const authorizeRole = (...roles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!roles.includes(authReq.user.role)) {
      return next(new AppError('Forbidden: Insufficient system privileges', 403));
    }

    next();
  };
};

export const requireProjectMember = (allowedRoles?: MemberRole[]) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      if (!authReq.user) {
        throw new AppError('Authentication required', 401);
      }

      const rawProjectId = req.params.projectId || req.params.id;

      // GUARD: Reject missing, empty, or literal string placeholders ('undefined', 'null')
      if (
        !rawProjectId ||
        typeof rawProjectId !== 'string' ||
        rawProjectId === 'undefined' ||
        rawProjectId === 'null' ||
        !rawProjectId.trim()
      ) {
        throw new AppError('A valid Project ID parameter is required', 400);
      }

      const projectId = rawProjectId.trim();

      const project = await prisma.project.findFirst({
        where: { id: projectId, deletedAt: null },
      });

      if (!project) {
        throw new AppError('Project not found', 404);
      }

      // System admins and project owners bypass member role restrictions
      if (authReq.user.role === 'ADMIN' || project.ownerId === authReq.user.id) {
        return next();
      }

      const membership = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId,
            userId: authReq.user.id,
          },
        },
      });

      if (!membership || membership.leftAt) {
        throw new AppError('Access denied: You are not a member of this project', 403);
      }

      if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(membership.role)) {
        throw new AppError('Forbidden: Insufficient project permissions', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};