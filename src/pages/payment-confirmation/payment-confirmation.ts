import { Request, Response } from 'express';
import { PageNames } from '@constants';
import { isZeroCostTest } from '../../domain/eligibility';
import {
  Locale, Target, TCNRegion, TestType,
} from '../../domain/enums';
import { CrmServerError } from '../../domain/errors/crm';
import { PaymentConfirmationError } from '../../domain/errors/PaymentConfirmationError';
import { PaymentSystemError } from '../../domain/errors/PaymentSystemError';
import { PaymentUnsuccessfulError } from '../../domain/errors/PaymentUnsuccessfulError';
import { PaymentUserCancelledError } from '../../domain/errors/PaymentUserCancelledError';
import {
  getStartAgainLink, getCreatedBookingIdentifiers, BusinessTelemetryEvents, logger, isValidSessionBooking, isValidSessionCandidate,
} from '../../helpers/index';
import { BookingService } from '../../services/bookings/booking-service';
import { BookingCompletionResult } from '../../services/bookings/types';
import { CRMGateway } from '../../services/crm-gateway/crm-gateway';
import { CRMBookingStatus } from '../../services/crm-gateway/enums';
import { buildBookingConfirmationEmailContent } from '../../services/notifications/content/builders';
import { notificationsGateway, NotificationsGateway } from '../../services/notifications/notifications-gateway';
import { BookingConfirmationDetails } from '../../services/notifications/types';
import { PaymentStatus } from '../../services/payments/enums';
import { Candidate as PaymentCandidate, paymentGateway, PaymentGateway } from '../../services/payments/payment-gateway';
import { Booking, Candidate, store } from '../../services/session';

export class PaymentConfirmationController {
  constructor(
    private notifications: NotificationsGateway,
    private bookingService: BookingService,
    private payments: PaymentGateway,
    private crmGateway: CRMGateway,
  ) { }

  public get = async (req: Request, res: Response): Promise<void> => {
    logger.event(BusinessTelemetryEvents.PAYMENT_BACK, 'PaymentConfirmationController::get: User returned from payment');
    if (!isValidSessionBooking(req.session.currentBooking) || !isValidSessionCandidate(req.session.candidate)) {
      logger.debug('PaymentConfirmationController::get: Session data', {
        booking: req.session.currentBooking,
        candidate: req.session.candidate,
      });
      throw new Error('PaymentConfirmationController::get: Missing required session data');
    }

    const {
      bookingRef, dateTime, testType, centre,
    } = req.session.currentBooking;
    const { email } = req.session.candidate;
    const { target = Target.GB, locale = Locale.GB } = req.session;
    const source = String(req?.baseUrl);
    const startAgainLink = getStartAgainLink(target, locale, source);

    let paymentId: string | undefined;
    const isTestTypeZeroCost = isZeroCostTest(req.session.currentBooking.testType);
    const isCompensationBooking = req.session.currentBooking.compensationBooking;
    if (!isTestTypeZeroCost && !isCompensationBooking && !req.session.currentBooking.receiptReference) {
      throw new Error('PaymentConfirmationController::get: Missing required session data - receipt reference');
    }

    if (isCompensationBooking) {
      await this.compensateBooking(req.session.currentBooking, req.session.candidate);
    } else if (isTestTypeZeroCost) {
      logger.debug('PaymentConfirmationController::get: Updating CRM entity of zero cost booking', { candidate: req.session.candidate, ...getCreatedBookingIdentifiers(req) });
      await this.crmGateway.updateZeroCostBooking(req.session.currentBooking.bookingId);
    } else {
      try {
        paymentId = await this.confirmPayment(req, res, req.session.currentBooking, req.session.candidate);
      } catch (error) {
        store.reset(req, res);
        if (error instanceof PaymentUnsuccessfulError) {
          return res.render(PageNames.PAYMENT_UNSUCCESSFUL, {
            startAgainLink,
          });
        }
        if (error instanceof PaymentConfirmationError) {
          return res.render(PageNames.PAYMENT_CONFIRMATION_ERROR, {
            startAgainLink,
          });
        }
        if (error instanceof PaymentUserCancelledError) {
          return res.render(PageNames.PAYMENT_BOOKING_CANCELLED, {
            startAgainLink,
          });
        }
        if (error instanceof PaymentSystemError) {
          return res.render(PageNames.PAYMENT_SYSTEM_ERROR, {
            startAgainLink,
            bookingRef,
          });
        }
        throw error;
      }
    }

    const bookingCompletionResult = await this.completeBooking(req.session.currentBooking, req.session.candidate, paymentId as string, req);

    if (bookingCompletionResult.isConfirmed) {
      req.session.currentBooking = {
        ...req.session.currentBooking,
        lastRefundDate: bookingCompletionResult.lastRefundDate,
      };
    } else {
      store.reset(req, res); // Reset the session to prevent confirming the booking in the tcn after it becomes unreserved
      return res.render(PageNames.SLOT_CONFIRMATION_ERROR, {
        bookingReference: bookingCompletionResult.bookingRef,
        startAgainLink,
      });
    }

    try {
      const details: BookingConfirmationDetails = {
        bookingRef,
        testType,
        testCentre: centre,
        testDateTime: dateTime,
        lastRefundDate: bookingCompletionResult.lastRefundDate as string,
      };
      const emailContent = buildBookingConfirmationEmailContent(details, target, locale);
      await this.notifications.sendEmail(email, emailContent, bookingRef, target);
    } catch (error) {
      // Log and swallow - email failure not critical and should be followed up
      logger.error(error as Error, 'PaymentConfirmationController::get: Error sending booking confirmation email', { ...getCreatedBookingIdentifiers(req) });
    }

    try {
      const nsaBookings = await this.crmGateway.getUserDraftNSABookingsIfExist(req.session.candidate?.candidateId, req.session.currentBooking?.testType as TestType);
      if (nsaBookings) {
        await this.crmGateway.updateNSABookings(nsaBookings);
      }
    } catch (error) {
      logger.error(error as Error, 'PaymentConfirmationController::get: Error executing batch request to update nsa booking status', { ...getCreatedBookingIdentifiers(req) });
    }
    return res.redirect('/booking-confirmation');
  };

  private compensateBooking = async (currentBooking: Booking, candidate: Candidate): Promise<void> => {
    if (!currentBooking.bookingProductId) {
      throw Error('PaymentConfirmationController::compensateBooking: Unable to create compensated booking - new booking product id does not exist');
    }

    try {
      await this.payments.compensateBooking(
        {
          compensatedBookingProductId: currentBooking.compensationBooking?.bookingProductId as string,
          newBookingProductId: currentBooking.bookingProductId,
        },
        candidate?.candidateId as string,
        candidate?.personReference as string,
      );
    } catch (error) {
      logger.error(error as Error, 'PaymentConfirmationController::compensateBooking: Failed to compensate booking', {
        newBookingProductId: currentBooking.bookingProductId,
        originalBookingProductId: currentBooking.compensationBooking?.bookingProductId,
        candidateId: candidate.candidateId,
      });
      throw error;
    }
  };

  private confirmPayment = async (req: Request, res: Response, currentBooking: Booking, candidate: Candidate): Promise<string> => {
    const {
      bookingProductRef, centre, bookingProductId, bookingId, reservationId,
    } = currentBooking;
    if (!currentBooking.receiptReference) {
      throw new Error('PaymentConfirmationController::confirmPayment: Missing receipt reference');
    }

    if (!candidate.personReference) {
      throw new Error('PaymentConfirmationController::confirmPayment: Missing person reference');
    }

    let cardPaymentCompletionResponse: PaymentCandidate.CardPaymentCompletionResponse;
    try {
      cardPaymentCompletionResponse = await this.payments.confirmCardPaymentIsComplete(currentBooking.receiptReference, candidate.candidateId as string, candidate.personReference);
      logger.debug('PaymentConfirmationController::confirmPayment: confirmCardPayment response for booking', {
        response: cardPaymentCompletionResponse,
        ...getCreatedBookingIdentifiers(req),
      });
      if (cardPaymentCompletionResponse.code !== PaymentStatus.SUCCESS) {
        logger.warn('PaymentConfirmationController::confirmPayment: Payment status NOT successful - cancelling booking', {
          cpmsCode: cardPaymentCompletionResponse.code,
          cpmsMessage: cardPaymentCompletionResponse.message,
          ...getCreatedBookingIdentifiers(req),
        });
        logger.event(BusinessTelemetryEvents.PAYMENT_FAILED, 'PaymentConfirmationController::confirmPayment: Error confirming payment', {
          ...getCreatedBookingIdentifiers(req),
          cpmsCode: cardPaymentCompletionResponse?.code,
        });
        await this.bookingService.unreserveBooking(bookingProductRef as string, centre?.region as TCNRegion, bookingProductId as string, bookingId as string, reservationId as string, CRMBookingStatus.Draft);
        throw new PaymentUnsuccessfulError();
      }
      return cardPaymentCompletionResponse.paymentId;
    } catch (error) {
      if (error instanceof PaymentUnsuccessfulError) {
        throw error;
      }
      const errorCode = error?.response?.data?.code; // TODO Tech debt: can we find a better way to type this?
      logger.error(error as Error, 'PaymentConfirmationController::confirmPayment: Error confirming payment for booking', {
        response: error?.response?.data,
        cpmsCode: errorCode,
        ...getCreatedBookingIdentifiers(req),
      });
      logger.event(BusinessTelemetryEvents.PAYMENT_FAILED, 'PaymentConfirmationController::confirmPayment: Error confirming payment', {
        error,
        cpmsCode: errorCode,
        ...getCreatedBookingIdentifiers(req),
      });
      if (errorCode > 800) { // Is a payment status
        if (errorCode === PaymentStatus.USER_CANCELLED) {
          logger.event(BusinessTelemetryEvents.PAYMENT_CANCEL, 'PaymentConfirmationController::confirmPayment: User cancelled payment', {
            error,
            cpmsCode: errorCode,
            ...getCreatedBookingIdentifiers(req),
          });
          await this.bookingService.unreserveBooking(bookingProductRef as string, centre?.region as TCNRegion, bookingProductId as string, bookingId as string, reservationId as string, CRMBookingStatus.AbandonedNonRecoverable, req.session.currentBooking?.paymentId);
          throw new PaymentUserCancelledError();
        } else if (errorCode === PaymentStatus.GATEWAY_ERROR) {
          logger.event(BusinessTelemetryEvents.PAYMENT_GATEWAY_ERROR, 'PaymentConfirmationController::confirmPayment: Payment API gateway error', {
            error,
            cpmsCode: errorCode,
            ...getCreatedBookingIdentifiers(req),
          });
          await this.bookingService.unreserveBooking(bookingProductRef as string, centre?.region as TCNRegion, bookingProductId as string, bookingId as string, reservationId as string, CRMBookingStatus.SystemErrorNonRecoverable);
        } else if (errorCode === PaymentStatus.SYSTEM_ERROR) {
          logger.event(BusinessTelemetryEvents.PAYMENT_SYSTEM_ERROR, 'PaymentConfirmationController::confirmPayment: Payment API system error', {
            error,
            cpmsCode: errorCode,
            ...getCreatedBookingIdentifiers(req),
          });
          await this.bookingService.unreserveBooking(bookingProductRef as string, centre?.region as TCNRegion, bookingProductId as string, bookingId as string, reservationId as string, CRMBookingStatus.SystemErrorNonRecoverable);
          throw new PaymentSystemError();
        } else {
          await this.bookingService.unreserveBooking(bookingProductRef as string, centre?.region as TCNRegion, bookingProductId as string, bookingId as string, reservationId as string, CRMBookingStatus.Draft);
        }
        throw new PaymentUnsuccessfulError();
      } else {
        await this.bookingService.unreserveBooking(bookingProductRef as string, centre?.region as TCNRegion, bookingProductId as string, bookingId as string, reservationId as string, CRMBookingStatus.Draft);
      }
      // Other unknown error
      throw new PaymentConfirmationError();
    }
  };

  private completeBooking = async (booking: Required<Pick<Booking, 'bookingId' | 'bookingProductId' | 'reservationId' | 'bookingRef' | 'bookingProductRef' | 'dateTime' | 'centre'>>, candidate: Candidate, paymentId: string, req: Request): Promise<BookingCompletionResult> => {
    const { bookingRef } = booking;
    let bookingCompletionResult: BookingCompletionResult = { isConfirmed: false, bookingRef };

    try {
      bookingCompletionResult = await this.bookingService.completeBooking(
        candidate,
        booking,
        paymentId,
      );
    } catch (error) {
      logger.error(error as Error, 'payment-confirmation::get: Error completing booking', {
        bookingRef,
        ...getCreatedBookingIdentifiers(req),
      });

      // If the error is CRM related, we would like to throw generic service unavailable error.
      if (error instanceof CrmServerError) {
        throw error;
      }
    }

    return bookingCompletionResult;
  };
}

export default new PaymentConfirmationController(
  notificationsGateway,
  BookingService.getInstance(),
  paymentGateway,
  CRMGateway.getInstance(),
);
