export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details?: any[];

  constructor(message: string, statusCode: number = 400, details?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}