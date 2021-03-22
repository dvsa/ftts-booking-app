import { Request, Response } from 'express';
import logger from '../../helpers/logger';
import { CRMGateway } from '../../services/crm-gateway/crm-gateway';
import { Scheduler } from '../../services/scheduling/scheduling-service';
import { buildBookingCancellationEmailContent } from '../../services/notifications/content/builders';
import { NotificationsGateway } from '../../services/notifications/notifications-gateway';
import { BookingCancellationDetails } from '../../services/notifications/types';
import { store, Candidate } from '../../services/session';
import { CRMBookingStatus } from '../../services/crm-gateway/enums';
import { Booking } from '../../domain/booking/booking';
import { LOCALE, TARGET } from '../../domain/enums';
import paymentApiClient, { PaymentApiClient, Candidate as PaymentCandidate } from '../../services/payments/payment-api-client';
import { buildPersonReference } from '../../services/payments/payment-helper';

export class ManageBookingCancelController {
  constructor(
    private scheduler: Scheduler,
    private crmGateway: CRMGateway,
    private notificationsGateway: NotificationsGateway,
    private paymentClient: PaymentApiClient,
  ) { }

  public get = (req: Request, res: Response): void => {
    const { candidate } = store.manageBooking.get(req);

    const bookingReference = req.params.ref;
    const booking = store.manageBooking.getBooking(req, bookingReference);

    if (!candidate || !booking || !booking.canBeCancelled()) {
      return res.redirect('../login');
    }

    return res.render('manage-booking/cancel', {
      booking: booking.details,
    });
  };

  public post = async (req: Request, res: Response): Promise<void> => {
    const { candidate } = store.manageBooking.get(req);
    const target = store.target.get(req);
    const lang = store.locale.get(req);

    const bookingReference = req.params.ref;
    const booking = store.manageBooking.getBooking(req, bookingReference);

    if (!candidate || !booking || !booking.canBeCancelled()) {
      return res.redirect('../login');
    }

    try {
      await this.setCancelInProgressInCRM(booking);
      await this.handlePayment(booking, candidate, target);
    } catch (error) {
      logger.error(error, `Cancelling failed for booking ref: ${bookingReference}`);
      return res.render('manage-booking/cancel-error', { bookingRef: booking.details.reference });
    }
    await this.deleteScheduledSlot(booking);
    await this.cancelBookingInCRM(booking);
    await this.sendCancellationEmail(booking, candidate, target, lang);
    await this.refreshBookings(req, candidate);

    return res.render('manage-booking/cancel-confirmation', {
      licenceNumber: candidate.licenceNumber,
      booking: booking.details,
    });
  };

  private setCancelInProgressInCRM = async (booking: Booking): Promise<void> => {
    try {
      logger.info(`Attempting to set booking status of Cancellation in Progress - booking ref: ${booking.details.reference}`);
      return this.crmGateway.updateBookingStatus(booking.details.bookingId, CRMBookingStatus.CancellationInProgress);
    } catch (error) {
      logger.error(error, `Failed to set status of Cancellation in Progess in CRM after 3 retries - booking ref: ${booking.details.reference}`);
      throw error;
    }
  };

  private handlePayment = async (booking: Booking, candidate: Candidate, target: TARGET): Promise<void> => {
    if (booking.isRefundable()) {
      const refundAmount = booking.details.price.toFixed(2);
      const payload: PaymentCandidate.BatchRefundPayload = {
        scope: PaymentCandidate.BatchRefundPayload.ScopeEnum.REFUND,
        customerReference: candidate.candidateId,
        customerName: `${candidate.firstnames} ${candidate.surname}`,
        customerManagerName: `${candidate.firstnames} ${candidate.surname}`,
        customerAddress: { // Hardcoded until we get address from eligibility API/CRM contact
          line1: 'Line 1',
          line2: 'Line 2 optional',
          line3: 'Line 3 optional',
          line4: 'Line 4 optional',
          city: 'City',
          postcode: 'Postcode',
        },
        countryCode: target === TARGET.NI
          ? PaymentCandidate.BatchRefundPayload.CountryCodeEnum.NI
          : PaymentCandidate.BatchRefundPayload.CountryCodeEnum.GB,
        payments: [{
          refundReason: 'Test cancelled by candidate',
          bookingProductId: booking.details.bookingProductId,
          totalAmount: refundAmount,
          paymentData: [{
            lineIdentifier: 1,
            amount: refundAmount,
            netAmount: refundAmount,
            taxAmount: '0.00',
            salesReference: booking.details.salesReference,
          }],
        }],
      };
      logger.info(`Attempting to request refund for ${candidate.candidateId}`);
      await this.paymentClient.requestRefund(payload, candidate.candidateId, candidate.personReference || buildPersonReference());
    } else {
      logger.info(`Attempting to recognise income for ${booking.details.bookingProductId}`);
      await this.paymentClient.recogniseIncome({
        bookingProductId: booking.details.bookingProductId,
      }, candidate.candidateId, candidate.personReference || buildPersonReference());
    }
  };

  private cancelBookingInCRM = async (booking: Booking): Promise<void> => {
    try {
      logger.info(`Cancelling booking in CRM - booking ref: ${booking.details.reference}`);
      await this.crmGateway.updateBookingStatus(booking.details.bookingId, CRMBookingStatus.Cancelled);
    } catch (error) {
      logger.error(error, `Cancelling booking in CRM failed - booking ref: ${booking.details.reference}`);
    }
  };

  private deleteScheduledSlot = async (booking: Booking): Promise<void> => {
    try {
      await this.scheduler.deleteBooking(booking.details.reference, booking.details.testCentre.region);
      await this.crmGateway.updateTCNUpdateDate(booking.details.bookingProductId);
    } catch (error) {
      logger.error(error, `Unable to successfully delete scheduled slot for booking reference: ${booking.details.reference}`);
    }
  };

  private sendCancellationEmail = async (booking: Booking, candidate: Candidate, target: TARGET, lang: LOCALE): Promise<void> => {
    try {
      const { email } = candidate;
      logger.info('Sending cancellation email');
      const bookingCancellationDetails: BookingCancellationDetails = {
        bookingRef: booking.details.reference,
        testType: booking.details.testType,
        testDateTime: booking.details.testDate,
      };
      const emailContent = buildBookingCancellationEmailContent(bookingCancellationDetails, target, lang);
      await this.notificationsGateway.sendEmail(email, emailContent, booking.details.reference, target);
    } catch (error) {
      logger.error(error, `Could not send booking cancellation email - candidateId: ${candidate.candidateId}`);
    }
  };

  private refreshBookings = async (req: Request, candidate: Candidate): Promise<void> => {
    try {
      logger.log('Getting updated list of candidate bookings');
      store.manageBooking.update(req, {
        bookings: await this.crmGateway.getCandidateBookings(candidate.candidateId),
      });
    } catch (error) {
      logger.error(error, `Unable to refresh the local state with updated bookings for candidate ${candidate.candidateId}`);
    }
  };
}

export default new ManageBookingCancelController(
  Scheduler.getInstance(),
  CRMGateway.getInstance(),
  NotificationsGateway.getInstance(),
  paymentApiClient,
);
