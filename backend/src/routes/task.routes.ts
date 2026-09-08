import { Router } from 'express';
import { TaskController } from '../controllers/taskController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { createTaskSchema, updateTaskStatusSchema } from '../utils/taskValidators';

const router = Router();

router.use(authenticate);

// 1. Nested project routes
router.post('/projects/:projectId/tasks', validateRequest(createTaskSchema), TaskController.create as any);
router.get('/projects/:projectId/tasks', TaskController.getProjectTasks as any);

// 2. Specific static route FIRST (must come before /tasks/:id)
router.get('/tasks/my-tasks', TaskController.getMyTasks as any);

// 3. Parameterized /tasks/:id routes LAST
router.get('/tasks/:id', TaskController.getById as any);
router.put('/tasks/:id/status', validateRequest(updateTaskStatusSchema), TaskController.updateStatus as any);
router.delete('/tasks/:id', TaskController.delete as any);

export default router;