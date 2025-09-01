import { NextFunction, Request, Response } from 'express';

export const authHandler = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['Authorization'] as string || req.headers['authorization'] as string;

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'API key é obrigatória',
    });
  }

  if (apiKey !== process.env.API_KEY) {
    return res.status(403).json({
      success: false,
      message: 'API key inválida',
    });
  }

  next();
}
