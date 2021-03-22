import { Request, Response } from 'express';
import paymentApiClient from '../../services/payments/payment-api-client';
import { Scheduler } from '../../services/scheduling/scheduling-service';
import { NotificationsGateway } from '../../services/notifications/notifications-gateway';
import { buildBookingConfirmationEmailContent } from '../../services/notifications/content/builders';
import { BookingConfirmationDetails } from '../../services/notifications/types';
import { CRMGateway } from '../../services/crm-gateway/crm-gateway';
import { store } from '../../services/session';
import { CRMBookingStatus } from '../../services/crm-gateway/enums';
import logger from '../../helpers/logger';
import { buildPersonReference } from '../../services/payments/payment-helper';

export class PaymentConfirmation {
  constructor(
    private notifications: NotificationsGateway,
    private scheduling: Scheduler,
    private crmGateway: CRMGateway,
  ) { }

  public get = async (req: Request, res: Response): Promise<void> => {
    const {
      receiptReference, bookingRef, reservationId, bookingId, dateTime, testType, centre, bookingProductId,
    } = store.currentBooking.get(req);
    const { candidateId, email: emailAddress, personReference } = store.candidate.get(req);
    const target = store.target.get(req);
    const lang = store.locale.get(req);

    await paymentApiClient.confirmCardPaymentIsComplete(receiptReference, candidateId, personReference || buildPersonReference());

    // TODO - FTT-4476 - Need to get behavioural markers.
    await this.scheduling.confirmBooking(
      [{
        bookingReferenceId: bookingRef,
        reservationId,
        notes: '',
        behaviouralMarkers: '',
      }],
      centre.region,
    );

    await this.crmGateway.updateBookingStatus(bookingId, CRMBookingStatus.Confirmed);
    await this.crmGateway.updateTCNUpdateDate(bookingProductId);

    const lastRefundDate = await this.crmGateway.calculateThreeWorkingDays(dateTime, centre.remit);
    store.currentBooking.update(req, {
      lastRefundDate,
    });

    const details: BookingConfirmationDetails = {
      bookingRef,
      testType,
      testCentre: centre,
      testDateTime: dateTime,
      lastRefundDate,
    };
    try {
      const emailContent = buildBookingConfirmationEmailContent(details, target, lang);
      await this.notifications.sendEmail(emailAddress, emailContent, bookingRef, target);
    } catch (error) {
      logger.error(error, 'Error: Could not send booking confirmation email');
    }

    res.redirect('/booking-confirmation');
  };
}

export default new PaymentConfirmation(
  NotificationsGateway.getInstance(),
  Scheduler.getInstance(),
  CRMGateway.getInstance(),
);
