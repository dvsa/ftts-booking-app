import dayjs from 'dayjs';
import { Request, Response } from 'express';
import { PageNames } from '@constants';
import { paymentGateway, PaymentGateway, Candidate as PaymentCandidate } from '../../services/payments/payment-gateway';
import { notificationsGateway, NotificationsGateway } from '../../services/notifications/notifications-gateway';
import { logger } from '../../helpers/logger';
import { Locale, Target } from '../../domain/enums';
import { Candidate, store } from '../../services/session';
import { Booking } from '../../domain/booking/booking';
import { CRMGateway } from '../../services/crm-gateway/crm-gateway';
import { buildRefundRequestEmailContent } from '../../services/notifications/content/builders';
import { RefundRequestDetails } from '../../services/notifications/types';
import { buildPaymentRefundPayload } from '../../services/payments/payment-helper';
import { getBackLinkToStartPage, getInstructorBackLinkToStartPage } from '../../helpers/start-page-navigator';
import { INSTRUCTOR_TEST_TYPES } from '../../domain/eligibility';
import { fromCRMProductNumber } from '../../services/crm-gateway/maps';
import { CRMProductNumber } from '../../services/crm-gateway/enums';
import { BookingManager } from '../../helpers/booking-manager';

export class ManageBookingRequestRefundController {
  constructor(
    private readonly payments: PaymentGateway,
    private readonly notifications: NotificationsGateway,
    private readonly crm: CRMGateway,
    private readonly bookingManager: BookingManager,
  ) { }

  public get = (req: Request, res: Response): void => this.renderRequestRefundLink(req, res);

  public post = async (req: Request, res: Response): Promise<void> => {
    if (!req.session.journey?.inManageBookingMode) {
      throw Error('ManageBookingRequestRefundController::post: No session journey inManageBookingMode set');
    }
    if (!req.session.manageBooking) {
      throw Error('ManageBookingRequestRefundController::post: No session manageBooking set');
    }
    if (!req.session.manageBooking.candidate) {
      throw Error('ManageBookingRequestRefundController::post: No session candidate is set');
    }

    const { candidate } = req.session.manageBooking;
    const { bookingReference } = req.body;
    const { target, locale } = req.session;

    const booking = store.manageBooking.getBooking(req, bookingReference);

    if (!booking) {
      throw Error('ManageBookingRequestRefundController::post: No session booking is set');
    }

    try {
      await this.requestRefund(candidate, booking, target as Target);
      if (candidate.email) {
        await this.sendRefundRequestNotification(booking, candidate, target as Target, locale as Locale);
      } else {
        logger.info('ManageBookingRequestRefundController::post: Candidate does not have an email set', {
          bookingId: booking.details.bookingId,
          bookingRef: booking.details.reference,
          bookingProductId: booking.details.bookingProductId,
          candidateId: candidate.candidateId,
        });
      }
    } catch (error) {
      logger.error(error as Error, 'ManageBookingRequestRefundController::post: Couldn\'t request a refund', {
        bookingId: booking.details.bookingId,
        bookingRef: booking.details.reference,
        bookingProductId: booking.details.bookingProductId,
        candidateId: candidate.candidateId,
      });
      throw error;
    }

    await this.renderRefundConfirmationLink(booking, candidate, req, res);
  };

  private async requestRefund(candidate: Candidate, booking: Booking, target: Target): Promise<void> {
    logger.info('ManageBookingRequestRefundController::requestRefund: Refund is being requested', {
      bookingId: booking.details.bookingId,
      bookingRef: booking.details.reference,
      bookingProductId: booking.details.bookingProductId,
      candidateId: candidate.candidateId,
    });

    if (!candidate.candidateId || !candidate.personReference || !candidate.address) {
      throw Error('ManageBookingRequestRefundController::requestRefund: Missing candidate id, person reference or address');
    }

    if (!booking.isCompensationTestEligible() || booking.isZeroCost()) {
      throw Error('ManageBookingRequestRefundController::requestRefund: Booking is not refundable');
    }

    const payload: PaymentCandidate.BatchRefundPayload = buildPaymentRefundPayload(candidate, booking, target);

    await this.payments.requestRefund(payload, candidate.candidateId, candidate.personReference);
    await this.crm.updateCompensationBooking(booking.details.bookingId, dayjs().toISOString());
  }

  private async sendRefundRequestNotification(booking: Booking, candidate: Candidate, target: Target, locale: Locale): Promise<void> {
    const bookingRef = booking.details.reference;
    const emailDetails: RefundRequestDetails = {
      bookingRef,
    };
    const emailContent = buildRefundRequestEmailContent(emailDetails, target, locale);
    try {
      logger.info('ManageBookingRequestRefundController::sendRefundRequestNotification: Attempting to send refund request email', {
        bookingId: booking.details.bookingId,
        bookingRef,
        bookingProductId: booking.details.bookingProductId,
        candidateId: candidate.candidateId,
      });
      await this.notifications.sendEmail(candidate.email as string, emailContent, bookingRef, target);
    } catch (error) {
      logger.warn('ManageBookingRequestRefundController::sendRefundRequestNotification: Cannot send refund request confirmation email', {
        bookingId: booking.details.bookingId,
        bookingRef,
        bookingProductId: booking.details.bookingProductId,
        candidateId: candidate.candidateId,
        error,
      });
    }
  }

  private renderRequestRefundLink(req: Request, res: Response): void {
    const { ref } = req.query;
    const backLink = '../home';

    if (!ref) {
      logger.warn('ManageBookingRequestRefundController::renderRequestRefundLink: Booking ref is empty in query params');
      res.redirect('/manage-booking/home');
      return;
    }

    const booking = store.manageBooking.getBooking(req, ref as string) as Booking;
    if (!booking || !booking.isCompensationTestEligible() || booking.isZeroCost()) {
      logger.warn('ManageBookingRequestRefundController::renderRequestRefundLink: booking was not found as a compensation test', {
        ref,
      });
      res.redirect('/manage-booking/home');
      return;
    }

    const isInstructorBooking = INSTRUCTOR_TEST_TYPES.includes(fromCRMProductNumber(booking.details.product?.productnumber as CRMProductNumber));
    const bookTheoryTestLink = isInstructorBooking ? getInstructorBackLinkToStartPage(req) : getBackLinkToStartPage(req);

    res.render(PageNames.MANAGE_BOOKING_REQUEST_REFUND, {
      backLink,
      bookingRef: ref,
      bookTheoryTestLink,
    });
  }

  private async renderRefundConfirmationLink(booking: Booking, candidate: Candidate, req: Request, res: Response): Promise<void> {
    const homeLink = '../home';

    const isInstructorBooking = INSTRUCTOR_TEST_TYPES.includes(fromCRMProductNumber(booking.details.product?.productnumber as CRMProductNumber));
    const bookTheoryTestLink = isInstructorBooking ? getInstructorBackLinkToStartPage(req) : getBackLinkToStartPage(req);

    await this.bookingManager.loadCandidateBookings(req, candidate.candidateId as string);

    res.render(PageNames.MANAGE_BOOKING_REFUND_CONFIRMATION, {
      bookingReference: booking.details.reference,
      homeLink,
      bookTheoryTestLink,
    });
  }
}

export default new ManageBookingRequestRefundController(
  paymentGateway,
  notificationsGateway,
  CRMGateway.getInstance(),
  BookingManager.getInstance(CRMGateway.getInstance()),
);
