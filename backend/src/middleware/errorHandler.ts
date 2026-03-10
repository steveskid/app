import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import config from '../config';

export interface AppError extends Error {
  statusCode?: number;
  provider?: string;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  const statusCode = err.statusCode ?? 500;

  logger.error(
    `${req.method} ${req.path} - ${statusCode} - ${err.message}`,
  );

  const body: Record<string, unknown> = {
    error: err.message || 'Internal server error',
  };

  if (err.provider) {
    body.provider = err.provider;
  }

  if (config.nodeEnv === 'development' && err.stack) {
    body.stack = err.stack;
  }

  res.status(statusCode).json(body);
}
