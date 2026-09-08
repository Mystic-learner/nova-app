import { z } from 'zod';
import { ProjectStatus, ProjectVisibility, MemberRole } from '@prisma/client';

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Project name is required').max(100),
    description: z.string().optional().nullable(),
    visibility: z.nativeEnum(ProjectVisibility).optional().default(ProjectVisibility.PRIVATE),
    // Allows empty strings, standard YYYY-MM-DD dates, ISO datetimes, or null
    startDate: z.string().or(z.date()).optional().nullable(),
    endDate: z.string().or(z.date()).optional().nullable(),
  }),
});

export const updateProjectSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Project ID is required'),
  }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().optional().nullable(),
    status: z.nativeEnum(ProjectStatus).optional(),
    visibility: z.nativeEnum(ProjectVisibility).optional(),
    startDate: z.string().or(z.date()).optional().nullable(),
    endDate: z.string().or(z.date()).optional().nullable(),
  }),
});

export const addMemberSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Project ID is required'),
  }),
  body: z.object({
    email: z.string().email('Valid user email required'),
    role: z.nativeEnum(MemberRole).optional().default(MemberRole.VIEWER),
  }),
});

export const updateMemberRoleSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Project ID is required'),
    userId: z.string().min(1, 'User ID is required'),
  }),
  body: z.object({
    role: z.nativeEnum(MemberRole),
  }),
});