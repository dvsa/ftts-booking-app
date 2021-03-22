import { NextFunction, Request, Response } from 'express';
import { store } from '../services/session';

export function auth(req: Request, res: Response, next: NextFunction): void {
  if (!store.active(req)) {
    return res.redirect('/choose-support');
  }
  return next();
}
