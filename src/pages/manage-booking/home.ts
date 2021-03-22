import { Request, Response } from 'express';

import { translate } from '../../helpers/language';
import { store } from '../../services/session';
import { Booking, byTestDateSoonestFirst } from '../../domain/booking/booking';
import { CRMGateway } from '../../services/crm-gateway/crm-gateway';
import { BookingManager } from './booking-manager';
import { Scheduler } from '../../services/scheduling/scheduling-service';
import logger from '../../helpers/logger';

type ChangeInProgressBookingTCNStatus = {
  bookingRef: string;
  status: 'OK' | 'ERROR';
};

export class ManageBookingHomeController {
  constructor(
    private bookingManager: BookingManager,
    private scheduling: Scheduler,
  ) { }

  public get = async (req: Request, res: Response): Promise<void> => {
    const { candidate } = store.manageBooking.get(req);
    if (!candidate) {
      return res.redirect('login');
    }

    const { licenceNumber } = store.manageBooking.get(req).candidate;
    await this.bookingManager.loadCandidateBookings(req, licenceNumber);

    const bookings = store.manageBooking.getBookings(req)
      .filter((booking) => booking.isViewable())
      .sort(byTestDateSoonestFirst);

    const {
      validBookings,
      bookingsWithErrors,
    } = await this.findInvalidChangeInProgressBookings(bookings);

    return res.render('manage-booking/home', {
      licenceNumber: candidate.licenceNumber,
      bookings: validBookings.map((booking) => booking.details),
      bookingsWithErrors: bookingsWithErrors.map((booking) => booking.details),
      heading: bookings.length ? translate('manageBookingHome.header') : translate('manageBookingHome.noBookings'),
    });
  };

  /**
   * Find and split out any change in progress bookings that have been left in a bad state due to part of the
   * 'change in progress' process originally failing.  validBookings will contain all valid bookings, not just those
   * that are change in progress.
   */
  private findInvalidChangeInProgressBookings = async (bookings: Booking[]): Promise<{ validBookings: Booking[]; bookingsWithErrors: Booking[] }> => {
    const changeInProgressBookings = bookings.filter((booking) => booking.isChangeInProgress());
    const statusOfChangeInProgressBookings = await Promise.all(changeInProgressBookings.map(this.validateChangeInProgressBooking));
    const bookingRefsWithErrors = statusOfChangeInProgressBookings
      .filter((booking) => booking.status === 'ERROR')
      .map((booking) => booking.bookingRef);
    const validBookings = bookings.filter((booking) => !bookingRefsWithErrors.includes(booking.details.reference));
    const bookingsWithErrors = bookings.filter((booking) => bookingRefsWithErrors.includes(booking.details.reference));
    return {
      validBookings,
      bookingsWithErrors,
    };
  };

  private validateChangeInProgressBooking = async (changeInProgressBooking: Booking): Promise<ChangeInProgressBookingTCNStatus> => {
    const { reference: bookingRef, testCentre } = changeInProgressBooking.details;
    try {
      const booking = await this.scheduling.getBooking(bookingRef, testCentre.region);
      if (booking) {
        return {
          bookingRef,
          status: 'OK',
        };
      }
    } catch (e) {
      logger.error(e, `Booking ${bookingRef} cannot be retrieved from TCN`);
    }
    return {
      bookingRef,
      status: 'ERROR',
    };
  };
}

export default new ManageBookingHomeController(
  BookingManager.getInstance(CRMGateway.getInstance()),
  Scheduler.getInstance(),
);
