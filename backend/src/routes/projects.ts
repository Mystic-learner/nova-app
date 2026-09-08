import { Router } from 'express';
import { prisma } from '../lib/prisma'; // Adjust import based on your Prisma instance location
import { authenticateToken } from '../middleware/auth.middleware'; // Adjust import path to your auth middleware

const router = Router();

// PUT /api/projects/:id - Update workspace details
router.put('/projects/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const updatedProject = await prisma.project.update({
      where: { id },
      data: { name, description },
    });

    res.json({ success: true, data: updatedProject });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/projects/:id - Delete workspace & associated tasks
router.delete('/projects/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Delete associated tasks first to prevent foreign key constraint errors
    await prisma.task.deleteMany({ where: { projectId: id } });
    await prisma.project.delete({ where: { id } });

    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;