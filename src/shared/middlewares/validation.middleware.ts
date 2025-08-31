import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodError } from 'zod';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

export interface ValidationError {
  field: string;
  message: string;
}

const formatZodError = (error: ZodError<any>): ValidationError[] => {
  return error.issues.map(issue => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));
};

export const validateBody = (schema: ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Dados de entrada inválidos',
          errors: formatZodError(error as ZodError<any>),
        });
      }
      next(error);
    }
  };
};

export const validateParams = (schema: ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params) as ParamsDictionary;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Parâmetros inválidos',
          errors: formatZodError(error as ZodError<any>),
        });
      }
      next(error);
    }
  };
};

export const validateQuery = (schema: ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query) as ParsedQs;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Query parameters inválidos',
          errors: formatZodError(error as ZodError<any>),
        });
      }
      next(error);
    }
  };
};
