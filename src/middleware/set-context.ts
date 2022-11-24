import { Request, Response, NextFunction } from 'express';
import { Context } from '../domain/enums';

const setContext = (req: Request, res: Response, next: NextFunction): void => {
  if (req.query.context) {
    req.session.context = req.query.context === Context.INSTRUCTOR ? Context.INSTRUCTOR : Context.CITIZEN;
  }
  return next();
};

export {
  setContext,
};
