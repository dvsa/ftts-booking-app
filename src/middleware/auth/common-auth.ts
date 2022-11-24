import { NextFunction, Request, Response } from 'express';
import { getTimeoutErrorPath } from '../../helpers/session-helper';

export const checkCommonAuth = (req: Request): boolean => Boolean(req.session?.candidate);

export const commonAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (checkCommonAuth(req)) {
    return next();
  }
  return res.redirect(getTimeoutErrorPath(req));
};
