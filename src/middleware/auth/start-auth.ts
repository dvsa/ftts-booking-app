import { NextFunction, Request, Response } from 'express';
import { getTimeoutErrorPath } from '../../helpers/session-helper';

export const startAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (req.session?.journey) {
    if (!req.session?.candidate || req.session.journey.inEditMode) {
      return next();
    }
  }

  return res.redirect(getTimeoutErrorPath(req));
};
