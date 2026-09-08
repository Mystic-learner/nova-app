import { prisma } from '../config/database';
import { AppError } from '../utils/errors';
import { TaskStatus, TaskPriority, ActivityAction } from '@prisma/client';
import { validate as isUuid } from 'uuid';

export class TaskService {
  static async createTask(
    projectId: string,
    createdById: string,
    data: {
      title: string;
      description?: string;
      assignedToId?: string | null;
      priority?: TaskPriority;
      dueDate?: string | null;
    }
  ) {
    const taskCount = await prisma.task.count({
      where: { projectId, status: TaskStatus.TODO, deletedAt: null },
    });

    return prisma.task.create({
      data: {
        projectId,
        createdById,
        title: data.title,
        description: data.description,
        assignedToId: data.assignedToId || null,
        priority: data.priority || TaskPriority.MEDIUM,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        order: taskCount,
        activityLogs: {
          create: {
            projectId,
            userId: createdById,
            action: ActivityAction.CREATED,
            changes: { title: data.title },
          },
        },
      },
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    });
  }

  static async getProjectTasks(
    projectId: string,
    filters?: { status?: TaskStatus; priority?: TaskPriority; assignedToId?: string }
  ) {
    return prisma.task.findMany({
      where: {
        projectId,
        deletedAt: null,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.priority && { priority: filters.priority }),
        ...(filters?.assignedToId && { assignedToId: filters.assignedToId }),
      },
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
      orderBy: [{ status: 'asc' }, { order: 'asc' }, { createdAt: 'desc' }],
    });
  }

  static async getUserTasks(userId: string) {
    return prisma.task.findMany({
      where: {
        assignedToId: userId,
        deletedAt: null,
      },
      include: {
        project: { select: { id: true, name: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  static async getTaskById(taskId: string) {
    if (!isUuid(taskId)) {
      throw new AppError('Invalid task ID format', 400);
    }

    const task = await prisma.task.findFirst({
      where: { id: taskId, deletedAt: null },
      include: {
        project: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    if (!task) throw new AppError('Task not found', 404);
    return task;
  }

  static async updateTaskStatus(taskId: string, userId: string, newStatus: TaskStatus, newOrder?: number) {
    if (!isUuid(taskId)) {
      throw new AppError('Invalid task ID format', 400);
    }

    const existing = await prisma.task.findFirst({ where: { id: taskId, deletedAt: null } });
    if (!existing) throw new AppError('Task not found', 404);

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: newStatus,
        ...(newOrder !== undefined && { order: newOrder }),
      },
    });

    await prisma.activityLog.create({
      data: {
        projectId: existing.projectId,
        taskId,
        userId,
        action: ActivityAction.STATUS_CHANGED,
        changes: { from: existing.status, to: newStatus },
      },
    });

    return updated;
  }

  static async deleteTask(taskId: string, userId: string) {
    if (!isUuid(taskId)) {
      throw new AppError('Invalid task ID format', 400);
    }

    const existing = await prisma.task.findFirst({ where: { id: taskId, deletedAt: null } });
    if (!existing) throw new AppError('Task not found', 404);

    const deleted = await prisma.task.update({
      where: { id: taskId },
      data: { deletedAt: new Date() },
    });

    await prisma.activityLog.create({
      data: {
        projectId: existing.projectId,
        taskId,
        userId,
        action: ActivityAction.UPDATED,
        changes: { status: 'DELETED', title: existing.title },
      },
    });

    return deleted;
  }
}