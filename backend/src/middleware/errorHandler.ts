import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Sanitiza un objeto removiendo campos sensibles antes de loguear
 */
const sanitizeForLogging = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;

  const sensitive = ['password', 'password_hash', 'token', 'refreshToken', 'currentPassword', 'newPassword'];
  const sanitized = { ...obj };

  for (const key of Object.keys(sanitized)) {
    if (sensitive.some(s => key.toLowerCase().includes(s.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeForLogging(sanitized[key]);
    }
  }

  return sanitized;
};

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    // Log seguro para errores operacionales
    if (process.env.NODE_ENV !== 'production') {
      console.error('AppError:', {
        message: err.message,
        statusCode: err.statusCode,
        path: req.path,
        method: req.method
      });
    }

    res.status(err.statusCode).json({
      error: err.message,
      status: 'error'
    });
    return;
  }

  // Log sanitizado para errores no manejados
  console.error('Error no manejado:', {
    message: err.message,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    body: sanitizeForLogging(req.body),
    query: sanitizeForLogging(req.query)
  });

  res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Error interno del servidor'
      : err.message,
    status: 'error'
  });
};
