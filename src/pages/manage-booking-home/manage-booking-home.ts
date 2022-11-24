import { Request, Response } from 'express';

import { PageNames } from '@constants';
import { translate, logger, mapCRMNsaStatusToNSAStatus } from '../../helpers';
import { store } from '../../services/session';
import { Booking, byTestDateSoonestFirst } from '../../domain/booking/booking';
import { CRMGateway } from '../../services/crm-gateway/crm-gateway';
import { BookingManager } from '../../helpers/booking-manager';
import { SchedulingGateway } from '../../services/scheduling/scheduling-gateway';
import { INSTRUCTOR_TEST_TYPES } from '../../domain/eligibility';
import {
  CRMNsaBookingSlotStatus, CRMNsaStatus, CRMProductNumber,
} from '../../services/crm-gateway/enums';
import { fromCRMProductNumber } from '../../services/crm-gateway/maps';
import config from '../../config';
import { Target } from '../../domain/enums';
import { CRMNsaBookingSlots, NsaBookingDetail } from '../../services/crm-gateway/interfaces';

type ChangeInProgressBookingTCNStatus = {
  bookingRef: string;
  status: 'OK' | 'ERROR';
};

export class ManageBookingHomeController {
  constructor(
    private bookingManager: BookingManager,
    private scheduling: SchedulingGateway,
  ) { }

  public get = async (req: Request, res: Response): Promise<void> => {
    if (!req.session.manageBooking) {
      throw new Error('ManageBookingHomeController::get: No Manage Booking Session');
    }
    const { candidate } = req.session.manageBooking;
    if (!candidate?.candidateId) {
      return res.redirect('login');
    }

    await this.bookingManager.loadCandidateBookings(req, candidate.candidateId);

    const bookings = store.manageBooking.getBookings(req)
      .filter((booking) => booking.isViewable())
      .sort(byTestDateSoonestFirst);

    const {
      validBookings,
      bookingsWithErrors,
    } = await this.findInvalidChangeInProgressBookings(bookings);

    const nsaBookingDetails: NsaBookingDetail[] = this.retrieveNsaBookingDetails(validBookings);
    const compensationEligibleNotificationLink = this.retrieveCompensationEligibleLink(validBookings, req.session.target as Target);

    return res.render(PageNames.MANAGE_BOOKING_HOME, {
      licenceNumber: candidate.licenceNumber,
      compensationEligibleNotificationLink,
      bookings: validBookings.map((booking) => booking.details),
      bookingsWithErrors: bookingsWithErrors.map((booking) => booking.details),
      nsaBookingDetails,
      heading: bookings.length ? translate('manageBookingHome.header') : translate('manageBookingHome.noBookings'),
      eligibleToBookOnline: candidate.eligibleToBookOnline,
      nsaFeatureToggle: config.featureToggles.enableViewNsaBookingSlots,
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
    const { reference: bookingRef, bookingProductRef, testCentre } = changeInProgressBooking.details;
    try {
      const booking = await this.scheduling.getBooking(bookingProductRef, testCentre.region);
      if (booking) {
        return {
          bookingRef,
          status: 'OK',
        };
      }
    } catch (e) {
      logger.error(e, `Booking ${bookingRef} cannot be retrieved from TCN`, { bookingRef });
    }
    return {
      bookingRef,
      status: 'ERROR',
    };
  };

  private retrieveCompensationEligibleLink(bookings: Booking[], target: Target): string {
    const compensationEligibleBookings = bookings.filter((booking) => booking.isCompensationTestEligible());
    if (compensationEligibleBookings.length <= 0) {
      return '';
    }

    if (compensationEligibleBookings.length > 1 && this.isBookingTypeMixed(compensationEligibleBookings)) {
      if (target === Target.GB) {
        return `${config.landing.gb.citizen.book}`;
      }
      return `${config.landing.ni.citizen.compensationBook}`;
    }

    const isInstructorBooking = INSTRUCTOR_TEST_TYPES.includes(fromCRMProductNumber(compensationEligibleBookings[0].details.product?.productnumber as CRMProductNumber));

    return isInstructorBooking ? '/instructor' : '/';
  }

  private isBookingTypeMixed(bookings : Booking[]): boolean {
    const instructorBookings = bookings.filter((booking) => INSTRUCTOR_TEST_TYPES.includes(fromCRMProductNumber(booking.details.product?.productnumber as CRMProductNumber)));

    return !(instructorBookings.length === bookings.length || instructorBookings.length === 0);
  }

  private retrieveNsaBookingDetails(bookings: Booking[]): NsaBookingDetail[] {
    let nsaBookingDetails: NsaBookingDetail[] = [];
    const checkValidNsaBookingSlots = (nsaBookingSlots: CRMNsaBookingSlots): boolean => nsaBookingSlots.ftts_status === CRMNsaBookingSlotStatus.Offered;

    nsaBookingDetails = bookings.filter((booking: Booking) => {
      const bookingDetails = booking.details;
      return bookingDetails.nsaStatus && bookingDetails.nsaStatus === CRMNsaStatus.AwaitingCandidateSlotConfirmation;
    }).map((booking: Booking) => {
      const bookingDetails = booking.details;
      const canViewSlots: boolean = bookingDetails.nsaBookingSlots?.filter(checkValidNsaBookingSlots).length === 3 && bookingDetails.nsaStatus === CRMNsaStatus.AwaitingCandidateSlotConfirmation; // NSA status needed to allow viewing of slots
      return {
        bookingId: bookingDetails.bookingId,
        nsaStatus: mapCRMNsaStatusToNSAStatus(bookingDetails.nsaStatus as CRMNsaStatus),
        canViewSlots,
      };
    });

    return nsaBookingDetails;
  }
}

export default new ManageBookingHomeController(
  BookingManager.getInstance(CRMGateway.getInstance()),
  SchedulingGateway.getInstance(),
);
