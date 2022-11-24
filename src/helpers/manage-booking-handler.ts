import { Request } from 'express';
import { store } from '../services/session';
import { mapBookingEntityToSessionBooking } from './session-helper';

export const setManageBookingEditMode = (req: Request): void => {
  if (!req.session.journey) {
    throw Error('setManageBookingEditMode:: No journey set');
  }
  req.session.journey.inManagedBookingEditMode = true;
  const booking = store.manageBooking.getBooking(req, req.params.ref);
  if (booking) {
    const sessionBooking = mapBookingEntityToSessionBooking(booking);
    req.session.currentBooking = {
      ...req.session.currentBooking,
      ...sessionBooking,
    };
  }
  req.session.testCentreSearch = undefined;
};
