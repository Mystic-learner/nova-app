import { Router, Request, Response, NextFunction } from 'express';
import { ProjectController } from '../controllers/projectController';
import { ActivityController } from '../controllers/activityController';
import { authenticate, requireProjectMember } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { createProjectSchema, updateProjectSchema, addMemberSchema } from '../utils/projectValidators';

const router = Router();

// Middleware: Reject invalid or literal undefined/null route IDs before touching Prisma
const validateProjectIdParam = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  if (!id || id === 'undefined' || id === 'null' || !id.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or missing project ID in request parameters',
    });
  }
  next();
};

// Global Auth Middleware
router.use(authenticate);

// Workspace Project Routes
router.post('/', validateRequest(createProjectSchema), ProjectController.create as any);
router.get('/', ProjectController.getAll as any);

// Individual Project Sub-routes
router.get('/:id', validateProjectIdParam, requireProjectMember(), ProjectController.getById as any);
router.put('/:id', validateProjectIdParam, requireProjectMember(['OWNER', 'ADMIN']), validateRequest(updateProjectSchema), ProjectController.update as any);
router.delete('/:id', validateProjectIdParam, requireProjectMember(['OWNER']), ProjectController.delete as any);
router.post('/:id/members', validateProjectIdParam, requireProjectMember(['OWNER', 'ADMIN']), validateRequest(addMemberSchema), ProjectController.addMember as any);

// Timeline Activity Log Endpoint
router.get('/:id/activity', validateProjectIdParam, requireProjectMember(), ActivityController.getProjectLogs as any);

export default router;