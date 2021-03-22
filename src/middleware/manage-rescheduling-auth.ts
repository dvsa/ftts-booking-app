import { NextFunction, Request, Response } from 'express';
import { store } from '../services/session';

export function manageReschedulingAuth(req: Request, res: Response, next: NextFunction): void {
  if (store.manageBooking?.get(req).candidate
    && store.currentBooking
    && store.journey?.get(req).inManagedBookingEditMode
    && bookingRefExistsInLoadedBookings(req, store.currentBooking.get(req).bookingRef)) {
    return next();
  }

  return res.redirect('/manage-booking/login');
}

function bookingRefExistsInLoadedBookings(req: Request, bookingReference: string): boolean {
  const booking = store.manageBooking.getBooking(req, bookingReference);
  return Boolean(booking);
}
