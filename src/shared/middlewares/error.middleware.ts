import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Erro interno do servidor';

  console.error('Error:', error);

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

export class NotFoundError extends Error {
  statusCode = 404;

  constructor(message: string = 'Recurso não encontrado') {
    super(message);
  }
}

export class BadRequestError extends Error {
  statusCode = 400;

  constructor(message: string = 'Requisição inválida') {
    super(message);
  }
}

export class ConflictError extends Error {
  statusCode = 409;

  constructor(message: string = 'Conflito de dados') {
    super(message);
  }
}
