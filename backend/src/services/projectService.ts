import { prisma } from '../config/database';
import { AppError } from '../utils/errors';
import { ProjectStatus, ProjectVisibility, MemberRole, ActivityAction } from '@prisma/client';
import { validate as isUuid } from 'uuid';

export class ProjectService {
  static async createProject(
    userId: string,
    data: {
      name: string;
      description?: string;
      visibility?: ProjectVisibility;
      startDate?: string | null;
      endDate?: string | null;
    }
  ) {
    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        visibility: data.visibility || ProjectVisibility.TEAM,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: MemberRole.OWNER,
          },
        },
        activityLogs: {
          create: {
            userId,
            action: ActivityAction.CREATED,
            changes: { name: data.name },
          },
        },
      },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } },
        _count: { select: { members: true, tasks: true } },
      },
    });

    return project;
  }

  static async getUserProjects(userId: string, status?: ProjectStatus, search?: string) {
    const projects = await prisma.project.findMany({
      where: {
        deletedAt: null,
        ...(status && { status }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
        members: {
          some: {
            userId,
            leftAt: null,
          },
        },
      },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        members: {
          where: { leftAt: null },
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          },
        },
        _count: { select: { tasks: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return projects;
  }

  static async getProjectById(projectId: string) {
    if (!isUuid(projectId)) {
      throw new AppError('Invalid project ID format', 400);
    }

    const project = await prisma.project.findFirst({
      where: { id: projectId, deletedAt: null },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } },
        members: {
          where: { leftAt: null },
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } },
          },
        },
        tasks: {
          where: { deletedAt: null },
          include: {
            assignedTo: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } },
            createdBy: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          },
          orderBy: [{ status: 'asc' }, { order: 'asc' }, { createdAt: 'desc' }],
        },
        _count: { select: { tasks: true, members: true } },
      },
    });

    if (!project) throw new AppError('Project not found', 404);
    return project;
  }

  static async updateProject(projectId: string, userId: string, data: any) {
    if (!isUuid(projectId)) {
      throw new AppError('Invalid project ID format', 400);
    }

    const existing = await prisma.project.findFirst({ where: { id: projectId, deletedAt: null } });
    if (!existing) throw new AppError('Project not found', 404);

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...data,
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate && { endDate: new Date(data.endDate) }),
      },
    });

    await prisma.activityLog.create({
      data: {
        projectId,
        userId,
        action: ActivityAction.UPDATED,
        changes: data,
      },
    });

    return updated;
  }

  static async deleteProject(projectId: string, userId: string) {
    if (!isUuid(projectId)) {
      throw new AppError('Invalid project ID format', 400);
    }

    const existing = await prisma.project.findFirst({ where: { id: projectId, deletedAt: null } });
    if (!existing) throw new AppError('Project not found', 404);

    const deleted = await prisma.project.update({
      where: { id: projectId },
      data: { deletedAt: new Date() },
    });

    await prisma.activityLog.create({
      data: {
        projectId,
        userId,
        action: ActivityAction.UPDATED,
        changes: { status: 'DELETED', name: existing.name },
      },
    });

    return deleted;
  }

  static async addMember(projectId: string, inviterId: string, email: string, role: MemberRole) {
    if (!isUuid(projectId)) {
      throw new AppError('Invalid project ID format', 400);
    }

    const userToAdd = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!userToAdd || userToAdd.deletedAt) throw new AppError('User with this email was not found', 404);

    const existingMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: userToAdd.id } },
    });

    if (existingMember && !existingMember.leftAt) {
      throw new AppError('User is already a member of this project', 409);
    }

    const member = await prisma.projectMember.upsert({
      where: { projectId_userId: { projectId, userId: userToAdd.id } },
      update: { role, leftAt: null, joinedAt: new Date() },
      create: { projectId, userId: userToAdd.id, role },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        projectId,
        userId: inviterId,
        action: ActivityAction.UPDATED,
        changes: { memberAdded: userToAdd.email, role },
      },
    });

    return member;
  }
}