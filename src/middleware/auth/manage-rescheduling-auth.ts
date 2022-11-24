import { NextFunction, Request, Response } from 'express';
import { getTimeoutErrorPath } from '../../helpers/session-helper';
import { store } from '../../services/session';

const bookingRefExistsInLoadedBookings = (req: Request, bookingReference: string): boolean => {
  const booking = store.manageBooking.getBooking(req, bookingReference);
  return Boolean(booking);
};

export const manageReschedulingAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (req.session.manageBooking?.candidate
    && req.session.currentBooking
    && req.session.journey?.inManagedBookingEditMode
    && bookingRefExistsInLoadedBookings(req, req.session.currentBooking?.bookingRef || '')) {
    return next();
  }

  return res.redirect(getTimeoutErrorPath(req));
};
