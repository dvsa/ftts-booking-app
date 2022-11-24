import { NextFunction, Request, Response } from 'express';

export function noCache(req: Request, res: Response, next: NextFunction): void {
  res.setHeader('Surrogate-Control', 'no-store');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', 0);
  return next();
}
