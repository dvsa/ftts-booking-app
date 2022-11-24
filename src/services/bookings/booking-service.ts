import { behaviouralMarkerLabel, hasBehaviouralMarkerForTest } from '../../domain/eligibility';
import { TCNRegion } from '../../domain/enums';
import { CrmServerError } from '../../domain/errors/crm';
import { logger, BusinessTelemetryEvents } from '../../helpers/logger';
import { CRMGateway } from '../crm-gateway/crm-gateway';
import { CRMBookingStatus } from '../crm-gateway/enums';
import { SchedulingGateway } from '../scheduling/scheduling-gateway';
import { Booking, Candidate } from '../session';
import { BookingCompletionResult } from './types';

export class BookingService {
  public static getInstance(): BookingService {
    if (!BookingService.instance) {
      BookingService.instance = new BookingService(SchedulingGateway.getInstance(), CRMGateway.getInstance());
    }
    return BookingService.instance;
  }

  private static instance: BookingService;

  constructor(
    private scheduling: SchedulingGateway,
    private crmGateway: CRMGateway,
  ) { }

  /**
   * Completes a booking, confirming the slot, updating its booking status and setting the TCN Update Date on the associated booking product
   * @param candidate an object containing behavioural marker properties (which can be undefined)
   * @param booking a **pre-validated** booking object to ensure _all required properties are present and set_
   * @returns an object with a boolean isConfirmed flag and the booking reference if slot confirmation unsuccessful, or the last refund date if successful
   */
  public async completeBooking(
    candidate: Pick<Candidate, | 'behaviouralMarker' | 'behaviouralMarkerExpiryDate'>,
    booking: Required<Pick<Booking, 'bookingId' | 'bookingProductId' | 'reservationId' | 'bookingRef' | 'bookingProductRef' | 'dateTime' | 'centre'>>,
    paymentId?: string,
  ): Promise<BookingCompletionResult> {
    const {
      bookingId, bookingProductId, reservationId, bookingRef, bookingProductRef, dateTime, centre,
    } = booking;

    const businessIdentifiers = {
      bookingId,
      bookingProductId,
      reservationId,
    };

    try {
      await this.scheduling.confirmBooking(
        [{
          bookingReferenceId: bookingProductRef,
          reservationId,
          notes: '',
          behaviouralMarkers: hasBehaviouralMarkerForTest(dateTime, candidate.behaviouralMarker, candidate.behaviouralMarkerExpiryDate) ? behaviouralMarkerLabel : '',
        }],
        centre.region,
      );
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        logger.event(BusinessTelemetryEvents.SCHEDULING_AUTH_ISSUE, 'BookingService::completeBooking: Failed to authenticate to the scheduling api', {
          ...businessIdentifiers,
        });
      } else if (error.response?.status >= 400 && error.response?.status < 500) {
        logger.event(BusinessTelemetryEvents.SCHEDULING_REQUEST_ISSUE, `BookingService::completeBooking: Scheduling API did not accept request ${error.response?.status}`, {
          ...businessIdentifiers,
        });
      } else if (error.response?.status >= 500) {
        logger.event(BusinessTelemetryEvents.SCHEDULING_ERROR, `BookingService::completeBooking: Scheduling API returned error response ${error.response?.status}`, {
          ...businessIdentifiers,
        });
      }
      logger.event(BusinessTelemetryEvents.SCHEDULING_FAIL_CONFIRM_NEW, 'BookingService::completeBooking: Failed to confirm new slot to make the booking with Scheduling API', {
        ...businessIdentifiers,
      });
      logger.error(error as Error, 'BookingService::completeBooking: Error confirming booking slot with scheduling', {
        bookingRef,
        ...businessIdentifiers,
      });
      await this.unreserveBooking(bookingProductRef, centre.region, bookingProductId, bookingId, reservationId, CRMBookingStatus.Draft);
      return { isConfirmed: false, bookingRef };
    }

    let lastRefundDate;
    try {
      await this.crmGateway.updateBookingStatusPaymentStatusAndTCNUpdateDate(
        bookingId,
        bookingProductId,
        CRMBookingStatus.Confirmed,
        paymentId,
        false,
      );

      lastRefundDate = await this.crmGateway.calculateThreeWorkingDays(dateTime, centre.remit);
      logger.info('BookingService::completeBooking: booking confirmed', {
        ...businessIdentifiers,
        lastRefundDate,
      });
    } catch (error) {
      throw new CrmServerError();
    }

    return { isConfirmed: true, lastRefundDate };
  }

  public async unreserveBooking(bookingProductRef: string, region: TCNRegion, bookingProductId: string, bookingId: string, reservationId: string, bookingStatus: CRMBookingStatus, paymentId?: string): Promise<void> {
    const businessIdentifiers = {
      bookingProductRef,
      bookingProductId,
      bookingId,
    };
    try {
      await this.scheduling.deleteReservation(reservationId, region, bookingProductRef); // We want to still update booking status to draft if this fails
    } catch (error) {
      logger.warn('BookingService::unreserveBooking: Error when deleting reservation', {
        error,
        ...businessIdentifiers,
      });
    }
    await this.crmGateway.updateBookingStatusPaymentStatusAndTCNUpdateDate(bookingId, bookingProductId, bookingStatus, paymentId);
    logger.info('BookingService::unreserveBooking: booking unreserved', {
      ...businessIdentifiers,
    });
  }
}
