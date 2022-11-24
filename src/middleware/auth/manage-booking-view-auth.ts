import { NextFunction, Request, Response } from 'express';
import { getTimeoutErrorPath } from '../../helpers/session-helper';
import { store } from '../../services/session';

const bookingRefExistsInLoadedBookings = (req: Request, bookingReference: string): boolean => {
  const booking = store.manageBooking.getBooking(req, bookingReference);
  return Boolean(booking);
};

export const manageBookingViewAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (req.session.manageBooking?.candidate
    && bookingRefExistsInLoadedBookings(req, req.params.ref || '')) {
    return next();
  }

  return res.redirect(getTimeoutErrorPath(req));
};
