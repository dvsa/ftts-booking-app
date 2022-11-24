import { NextFunction, Request, Response } from 'express';
import { getTimeoutErrorPath } from '../../helpers/session-helper';
import { checkCommonAuth } from './common-auth';

export const supportAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (checkCommonAuth(req) && req.session?.journey?.support) {
    return next();
  }
  return res.redirect(getTimeoutErrorPath(req));
};
