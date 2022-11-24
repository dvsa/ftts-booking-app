import { Request, Response } from 'express';
import { PageNames } from '@constants';
import { Booking } from '../../domain/booking/booking';
import { isZeroCostTest } from '../../domain/eligibility';
import { Locale, Target, TestType } from '../../domain/enums';
import { logger, BusinessTelemetryEvents } from '../../helpers/logger';
import { CRMGateway } from '../../services/crm-gateway/crm-gateway';
import { CRMBookingStatus, CRMOrigin, CRMProductNumber } from '../../services/crm-gateway/enums';
import { fromCRMProductNumber } from '../../services/crm-gateway/maps';
import { buildBookingCancellationEmailContent } from '../../services/notifications/content/builders';
import { notificationsGateway, NotificationsGateway } from '../../services/notifications/notifications-gateway';
import { BookingCancellationDetails } from '../../services/notifications/types';
import { PaymentStatus } from '../../services/payments/enums';
import { paymentGateway, Candidate as PaymentCandidate, PaymentGateway } from '../../services/payments/payment-gateway';
import { buildPaymentRefundPayload } from '../../services/payments/payment-helper';
import { SchedulingGateway } from '../../services/scheduling/scheduling-gateway';
import { Candidate, store } from '../../services/session';
import { BookingManager } from '../../helpers/booking-manager';

export class ManageBookingCancelController {
  constructor(
    private schedulingGateway: SchedulingGateway,
    private crmGateway: CRMGateway,
    private notifications: NotificationsGateway,
    private paymentClient: PaymentGateway,
    private bookingManager: BookingManager,
  ) { }

  public get = (req: Request, res: Response): void => {
    if (!req.session.manageBooking) {
      logger.warn('ManageBookingCancelController::get: No session manageBooking set');
      return res.redirect('../login');
    }
    const { candidate } = req.session.manageBooking;

    const bookingReference = req.params.ref;
    const booking = store.manageBooking.getBooking(req, bookingReference);

    if (!candidate || !booking || !booking.canBeCancelled()) {
      return res.redirect('../login');
    }

    return res.render(PageNames.MANAGE_BOOKING_CANCEL, {
      booking: booking.details,
    });
  };

  public post = async (req: Request, res: Response): Promise<void> => {
    if (!req.session.manageBooking) {
      throw Error('ManageBookingCancelController::post: No session manageBooking set');
    }
    const { candidate } = req.session.manageBooking;
    const target = req.session.target || Target.GB;
    const lang = req.session.locale || Locale.GB;

    const bookingReference = req.params.ref;
    const booking = store.manageBooking.getBooking(req, bookingReference);

    if (!candidate?.candidateId || !booking || !booking.canBeCancelled() || !candidate.eligibleToBookOnline) {
      return res.redirect('../login');
    }

    try {
      await this.setCancelInProgressInCRM(booking);
      const testType: TestType = fromCRMProductNumber(booking.details.product?.productnumber as CRMProductNumber);
      if (!isZeroCostTest(testType)) {
        await this.handlePayment(booking, candidate, target);
      }
    } catch (error) {
      logger.error(error as Error, 'ManageBookingCancelController::post: Cancelling failed', { bookingReference });
      await this.bookingManager.loadCandidateBookings(req, candidate.candidateId);
      return res.render(PageNames.MANAGE_BOOKING_CANCEL_ERROR, { bookingRef: booking.details.reference });
    }
    await this.deleteScheduledSlot(booking);
    await this.cancelBookingInCRM(booking);
    await this.sendCancellationEmail(booking, candidate, target, lang);
    await this.bookingManager.loadCandidateBookings(req, candidate.candidateId);

    return res.render(PageNames.MANAGE_BOOKING_CANCEL_CONFIRMATION, {
      licenceNumber: candidate?.licenceNumber,
      booking: booking?.details,
    });
  };

  private setCancelInProgressInCRM = async (booking: Booking): Promise<void> => {
    try {
      logger.info('ManageBookingCancelController::setCancelInProgressInCRM: Attempting to set booking status of Cancellation in Progress', {
        bookingRef: booking.details.reference,
      });
      return await this.crmGateway.updateBookingStatus(booking.details.bookingId, CRMBookingStatus.CancellationInProgress, booking?.details?.origin === CRMOrigin.CustomerServiceCentre);
    } catch (error) {
      logger.error(error as Error, 'ManageBookingCancelController::setCancelInProgressInCRM: Failed to set status of Cancellation in Progress in CRM after 3 retries', {
        bookingRef: booking.details.reference,
      });
      logger.event(BusinessTelemetryEvents.CDS_FAIL_BOOKING_CANCEL, 'ManageBookingCancelController::setCancelInProgressInCRM: Failed to set status of Cancellation in Progress in CRM after 3 retries', {
        error,
        bookingRef: booking.details.reference,
      });
      throw error;
    }
  };

  private handlePayment = async (booking: Booking, candidate: Candidate, target: Target): Promise<void> => {
    if (!candidate.address || !candidate.personReference) {
      throw new Error('ManageBookingCancelController::handlePayment: Missing required candidate session data');
    }
    if (booking.isRefundable()) {
      const payload: PaymentCandidate.BatchRefundPayload = buildPaymentRefundPayload(candidate, booking, target);
      logger.info('ManageBookingCancelController::handlePayment: Attempting to request refund', {
        candidateId: candidate.candidateId,
      });
      logger.debug('ManageBookingCancelController::handlePayment: Refund payload:', {
        payload,
      });
      try {
        const response = await this.paymentClient.requestRefund(payload, candidate.candidateId as string, candidate.personReference);
        if (response?.code && Number(response.code) !== PaymentStatus.REFUND_SUCCESS) {
          logger.warn('ManageBookingCancelController::handlePayment: Refund failed - Payment status NOT success', {
            bookingRef: booking.details.reference,
            cpmsCode: response.code,
            cpmsMessage: response.message,
            bookingId: booking.details.bookingId,
            bookingProductId: booking.details.bookingProductId,
            candidateId: candidate.candidateId,
            licenceId: candidate.licenceId,
          });
        }
      } catch (error) {
        const errorCode = error?.response?.data?.code;
        logger.event(BusinessTelemetryEvents.PAYMENT_REFUND_FAIL, 'ManageBookingCancelController::handlePayment: Refund attempt failed', {
          error,
          candidateId: candidate.candidateId,
          personReference: candidate.personReference,
          cpmsCode: errorCode,
        });
        throw error;
      }
    } else {
      logger.info('ManageBookingCancelController::handlePayment: Attempting to recognise income', {
        candidateId: candidate.candidateId,
        bookingProductId: booking.details.bookingProductId,
      });
      try {
        await this.paymentClient.recogniseIncome({
          bookingProductId: booking.details.bookingProductId,
        }, candidate.candidateId as string, candidate.personReference);
        logger.event(BusinessTelemetryEvents.PAYMENT_INCOME_SUCCESS, 'ManageBookingCancelController::handlePayment: Income recognised', {
          bookingProductId: booking.details.bookingProductId,
          candidateId: candidate.candidateId,
          personReference: candidate.personReference,
        });
      } catch (error) {
        logger.event(BusinessTelemetryEvents.PAYMENT_INCOME_FAIL, 'ManageBookingCancelController::handlePayment: Income recognition failure', {
          error,
          bookingProductId: booking.details.bookingProductId,
          candidateId: candidate.candidateId,
          personReference: candidate.personReference,
        });
        throw error;
      }
    }
  };

  private cancelBookingInCRM = async (booking: Booking): Promise<void> => {
    try {
      logger.info('ManageBookingCancelController::cancelBookingInCRM: Cancelling booking in CRM', {
        reference: booking.details.reference,
      });
      await this.crmGateway.markBookingCancelled(booking.details.bookingId, booking.details.bookingProductId, booking?.details?.origin === CRMOrigin.CustomerServiceCentre);
    } catch (error) {
      logger.error(error as Error, 'ManageBookingCancelController::cancelBookingInCRM: Cancelling booking in CRM failed', {
        reference: booking.details.reference,
      });
    }
  };

  private deleteScheduledSlot = async (booking: Booking): Promise<void> => {
    try {
      await this.schedulingGateway.deleteBooking(booking.details.bookingProductRef, booking.details.testCentre.region);
      await this.crmGateway.updateTCNUpdateDate(booking.details.bookingProductId);
    } catch (error) {
      logger.error(error as Error, 'ManageBookingCancelController::deleteScheduledSlot: Unable to successfully delete scheduled slot', {
        reference: booking.details.reference,
      });
      logger.event(BusinessTelemetryEvents.SCHEDULING_FAIL_CONFIRM_CANCEL, 'ManageBookingCancelController::deleteScheduledSlot: Failed to cancel slot while cancelling a booking with the Scheduling API', {
        error,
        reference: booking.details.reference,
      });
    }
  };

  private sendCancellationEmail = async (booking: Booking, candidate: Candidate, target: Target, lang: Locale): Promise<void> => {
    try {
      const { email } = candidate;
      logger.info('ManageBookingCancelController::sendCancellationEmail: Sending cancellation email', {
        bookingProductRef: booking.details.bookingProductRef,
      });
      const bookingCancellationDetails: BookingCancellationDetails = {
        bookingRef: booking.details.reference,
        testType: fromCRMProductNumber(booking.details.product?.productnumber as CRMProductNumber),
        testDateTime: booking.details.testDate as unknown as string,
      };
      const emailContent = buildBookingCancellationEmailContent(bookingCancellationDetails, target, lang);
      await this.notifications.sendEmail(email as string, emailContent, booking.details.reference, target);
    } catch (error) {
      logger.error(error as Error, 'ManageBookingCancelController::sendCancellationEmail: Could not send booking cancellation email', {
        candidateId: candidate.candidateId,
      });
    }
  };
}

export default new ManageBookingCancelController(
  SchedulingGateway.getInstance(),
  CRMGateway.getInstance(),
  notificationsGateway,
  paymentGateway,
  BookingManager.getInstance(CRMGateway.getInstance()),
);
