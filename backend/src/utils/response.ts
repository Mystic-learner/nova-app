import { Response } from 'express';

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  data: T,
  message?: string,
  pagination?: PaginationMeta
) => {
  return res.status(statusCode).json({
    success: true,
    ...(message && { message }),
    data: pagination ? { items: data, pagination } : data,
  });
};