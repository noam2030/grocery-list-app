import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('[API Error]', err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: err.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message
        }))
      }
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  return res.status(statusCode).json({
    error: {
      code: err.code || (statusCode === 404 ? 'NOT_FOUND' : 'INTERNAL_ERROR'),
      message
    }
  });
}
