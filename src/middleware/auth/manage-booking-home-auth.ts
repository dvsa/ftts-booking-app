import { NextFunction, Request, Response } from 'express';
import { getTimeoutErrorPath } from '../../helpers/session-helper';

export const manageBookingHomeAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (req.session.manageBooking?.candidate) {
    return next();
  }

  return res.redirect(getTimeoutErrorPath(req));
};
