import { Request, Response, NextFunction } from 'express';
import { store } from '../services/session';

const setSupportMode = (req: Request, res: Response, next: NextFunction): void => {
  const { support } = store.journey.get(req);
  res.locals.inSupportMode = Boolean(support);
  return next();
};

export {
  setSupportMode,
};
