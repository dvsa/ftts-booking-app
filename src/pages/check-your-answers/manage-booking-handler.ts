import { Request } from 'express';
import { store } from '../../services/session';
import { mapBookingEntityToSessionBooking } from '../../helpers/session-helper';

export const setManageBookingEditMode = (req: Request): void => {
  store.journey.update(req, {
    inManagedBookingEditMode: true,
  });
  const booking = store.manageBooking.getBooking(req, req.params.ref);
  if (booking) {
    store.currentBooking.update(req, mapBookingEntityToSessionBooking(booking));
  }
  store.testCentreSearch.reset(req);
};
