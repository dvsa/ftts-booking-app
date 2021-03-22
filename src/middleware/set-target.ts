import { Request, Response, NextFunction } from 'express';
import { TARGET } from '../domain/enums';
import { store } from '../services/session';

const setTarget = (req: Request, res: Response, next: NextFunction): void => {
  if (req.query.target && Object.values(TARGET).includes(req.query.target as TARGET)) {
    store.target.set(req, req.query.target as TARGET);
  }

  res.locals.target = store.target.get(req);

  return next();
};

export {
  setTarget,
};
