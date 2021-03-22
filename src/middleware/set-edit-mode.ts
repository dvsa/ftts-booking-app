import { Request, Response, NextFunction } from 'express';
import { store } from '../services/session';

const setEditMode = (req: Request, res: Response, next: NextFunction): void => {
  const { inEditMode } = store.journey.get(req);
  res.locals.inEditMode = Boolean(inEditMode);
  return next();
};

export {
  setEditMode,
};
