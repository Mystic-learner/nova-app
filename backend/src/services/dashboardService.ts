import { prisma } from '../config/database';
import { TaskStatus } from '@prisma/client';

export class DashboardService {
  static async getMetrics(userId: string) {
    const [
      projectCount,
      activeProjects,
      totalTasks,
      completedTasks,
      overdueTasks,
      recentActivity,
      myTasks,
      teamWorkloadRaw,
    ] = await Promise.all([
      // Total projects where user is a member
      prisma.project.count({
        where: { deletedAt: null, members: { some: { userId, leftAt: null } } },
      }),

      // Active projects count
      prisma.project.count({
        where: { status: 'ACTIVE', deletedAt: null, members: { some: { userId, leftAt: null } } },
      }),

      // Total tasks across user's projects
      prisma.task.count({
        where: { deletedAt: null, project: { members: { some: { userId, leftAt: null } } } },
      }),

      // Completed tasks across user's projects
      prisma.task.count({
        where: { status: TaskStatus.DONE, deletedAt: null, project: { members: { some: { userId, leftAt: null } } } },
      }),

      // Overdue tasks assigned to user
      prisma.task.count({
        where: {
          assignedToId: userId,
          deletedAt: null,
          status: { not: TaskStatus.DONE },
          dueDate: { lt: new Date() },
        },
      }),

      // Recent 10 activity logs
      prisma.activityLog.findMany({
        where: {
          project: { members: { some: { userId, leftAt: null } } },
        },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          project: { select: { id: true, name: true } },
          task: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),

      // Top 5 upcoming tasks assigned to user
      prisma.task.findMany({
        where: {
          assignedToId: userId,
          deletedAt: null,
          status: { not: TaskStatus.DONE },
        },
        include: {
          project: { select: { id: true, name: true } },
        },
        orderBy: [{ dueDate: 'asc' }, { priority: 'desc' }],
        take: 5,
      }),

      // Team Workload aggregation
      prisma.task.groupBy({
        by: ['assignedToId'],
        where: {
          assignedToId: { not: null },
          status: { not: TaskStatus.DONE },
          deletedAt: null,
          project: { members: { some: { userId, leftAt: null } } },
        },
        _count: { id: true },
      }),
    ]);

    // Hydrate user details for workload
    const userIds = teamWorkloadRaw
      .map((item) => item.assignedToId)
      .filter((id): id is string => id !== null);

    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true, avatarUrl: true },
    });

    const teamWorkload = teamWorkloadRaw.map((item) => {
      const u = users.find((usr) => usr.id === item.assignedToId);
      return {
        user: u || { id: item.assignedToId, firstName: 'Unassigned', lastName: '' },
        activeTasks: item._count.id,
      };
    });

    return {
      overviewStats: {
        projectCount,
        activeProjects,
        totalTasks,
        completedTasks,
        overdueTasks,
        completionPercentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
      recentActivity,
      myTasks,
      teamWorkload,
    };
  }
}