import { NextFunction, Request, Response } from 'express';
import config from '../../config';
import { getTimeoutErrorPath } from '../../helpers';

export const manageBookingNsaAuth = (req: Request, res: Response, next: NextFunction): void => {
  const featureFlag = config.featureToggles.enableViewNsaBookingSlots;
  if (req.session.manageBooking?.candidate && featureFlag) { // TODO Update to include where the booking will be stored following FTT-19136
    return next();
  }

  return res.redirect(getTimeoutErrorPath(req));
};
