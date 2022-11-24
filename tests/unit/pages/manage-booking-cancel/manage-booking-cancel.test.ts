import { ManageBookingCancelController } from '@pages/manage-booking-cancel/manage-booking-cancel';
import { PageNames } from '@constants';
import {
  Locale, Target, TCNRegion, TestType,
} from '../../../../src/domain/enums';
import { Booking } from '../../../../src/domain/booking/booking';
import { BusinessTelemetryEvents, logger } from '../../../../src/helpers/logger';
import { CRMGateway } from '../../../../src/services/crm-gateway/crm-gateway';
import {
  CRMBookingStatus, CRMOrigin, CRMProductNumber, CRMTestLanguage, CRMVoiceOver,
} from '../../../../src/services/crm-gateway/enums';
import { buildBookingCancellationEmailContent } from '../../../../src/services/notifications/content/builders';
import { NotificationsGateway } from '../../../../src/services/notifications/notifications-gateway';
import { BookingCancellationDetails } from '../../../../src/services/notifications/types';
import { SchedulingGateway } from '../../../../src/services/scheduling/scheduling-gateway';
import { PaymentGateway, Candidate as PaymentCandidate } from '../../../../src/services/payments/payment-gateway';
import { BookingManager } from '../../../../src/helpers/booking-manager';
import { PaymentStatus } from '../../../../src/services/payments/enums';

jest.mock('../../../../src/services/scheduling/scheduling-gateway');
jest.mock('../../../../src/services/notifications/notifications-gateway');
jest.mock('../../../../src/services/crm-gateway/crm-gateway');
jest.mock('@dvsa/cds-retry');
jest.mock('../../../../src/helpers/logger');
jest.mock('../../../../src/helpers/booking-manager');

jest.mock('../../../../src/services/payments/payment-helper', () => ({
  buildPaymentReference: () => 'mock-payment-ref',
  buildPaymentRefundPayload: () => ({
    scope: 'REFUND',
    customerReference: 'mockCandidateId',
    customerName: 'First Names Surname',
    customerManagerName: 'First Names Surname',
    customerAddress: {
      line1: 'Line 1',
      line2: 'Line 2 optional',
      line3: 'Line 3 optional',
      line4: 'Line 4 optional',
      city: 'City',
      postcode: 'Postcode',
    },
    countryCode: 'GB',
    payments: [{
      refundReason: 'Test cancelled by candidate',
      bookingProductId: 'mockBookingProductId',
      totalAmount: '23.00',
      paymentData: [{
        lineIdentifier: 1,
        amount: '23.00',
        netAmount: '23.00',
        taxAmount: '0.00',
        salesReference: 'mockSalesRef',
      }],
    }],
  }),
}));

describe('Manage booking - cancel controller', () => {
  let req: any;
  let res: any;

  const mockCandidateEmail = 'candidate@email.com';
  const mockCandidateAddress = {
    line1: 'Line 1',
    line2: 'Line 2 optional',
    line3: 'Line 3 optional',
    line4: 'Line 4 optional',
    line5: 'City',
    postcode: 'Postcode',
  };
  const mockPersonReference = '123456789';

  const expectedPayload: PaymentCandidate.BatchRefundPayload = {
    scope: PaymentCandidate.BatchRefundPayload.ScopeEnum.REFUND,
    customerReference: 'mockCandidateId',
    customerName: 'First Names Surname',
    customerManagerName: 'First Names Surname',
    customerAddress: {
      line1: 'Line 1',
      line2: 'Line 2 optional',
      line3: 'Line 3 optional',
      line4: 'Line 4 optional',
      city: 'City',
      postcode: 'Postcode',
    },
    countryCode: PaymentCandidate.BatchRefundPayload.CountryCodeEnum.GB,
    payments: [{
      refundReason: 'Test cancelled by candidate',
      bookingProductId: 'mockBookingProductId',
      totalAmount: '23.00',
      paymentData: [{
        lineIdentifier: 1,
        amount: '23.00',
        netAmount: '23.00',
        taxAmount: '0.00',
        salesReference: 'mockSalesRef',
      }],
    }],
  };

  const mockSchedulingGateway = {
    deleteBooking: jest.fn(),
  };

  const mockCRMGateway = {
    updateTCNUpdateDate: jest.fn(),
    updateBookingStatus: jest.fn(() => Promise.resolve()),
    markBookingCancelled: jest.fn(() => Promise.resolve()),
    getCandidateBookings: jest.fn(() => Promise.resolve()),

    getLicenceAndCandidate: () => ({
      candidate: {
        email: 'test@test.com',
      },
    }),
  };

  const mockNotificationsGateway = {
    sendEmail: jest.fn(),
  };

  const mockPaymentClient = {
    requestRefund: jest.fn(),
    recogniseIncome: jest.fn(),
  };

  const mockBookingManager = {
    loadCandidateBookings: jest.fn(),
  };

  const controller = new ManageBookingCancelController(
    mockSchedulingGateway as unknown as SchedulingGateway,
    mockCRMGateway as unknown as CRMGateway,
    mockNotificationsGateway as unknown as NotificationsGateway,
    mockPaymentClient as unknown as PaymentGateway,
    mockBookingManager as unknown as BookingManager,
  );

  beforeEach(() => {
    req = {
      hasErrors: false,
      errors: [],
      params: {
        ref: 'mockRef',
      },
      session: {
        manageBooking: {
          candidate: {
            candidateId: 'mockCandidateId',
            licenceNumber: 'BENTO603026A97BQ',
            firstnames: 'First Names',
            surname: 'Surname',
            email: mockCandidateEmail,
            address: mockCandidateAddress,
            personReference: mockPersonReference,
            eligibleToBookOnline: true,
            licenceId: 'mockLicenceId',
          },
          bookings: [
            {
              bookingProductId: 'mockBookingProductId',
              reference: 'mockRef',
              bookingProductRef: 'mockBookingProductRef',
              bookingId: 'mockBookingId',
              bookingStatus: CRMBookingStatus.Confirmed,
              testDate: '2020-10-29T14:00:00.000Z',
              testLanguage: CRMTestLanguage.English,
              voiceoverLanguage: CRMVoiceOver.None,
              additionalSupport: null,
              paymentStatus: null,
              price: 23,
              salesReference: 'mockSalesRef',
              testType: TestType.CAR,
              origin: CRMOrigin.CitizenPortal,
              testCentre: {
                name: 'mockTestCentreName',
                addressLine1: 'mockTestCentreAddress1',
                addressLine2: 'mockTestCentreAddress2',
                city: 'mockTestCentreCity',
                postcode: 'mockTestCentrePostcode',
                region: TCNRegion.A,
              },
              product: {
                productnumber: CRMProductNumber.CAR,
              },
            },
          ],
        },
        target: Target.GB,
        locale: Locale.GB,
      },
    };

    res = {
      redirect: jest.fn(),
      render: jest.fn(),
    };

    Booking.prototype.canBeCancelled = jest.fn(() => true);
    Booking.prototype.isRefundable = jest.fn(() => true);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET', () => {
    test('redirects to the manage booking login page if booking in session', () => {
      delete req.session.manageBooking;

      controller.get(req, res);

      expect(res.redirect).toHaveBeenCalledWith('../login');
    });

    test('redirects to the manage booking login page if no candidate in session', () => {
      delete req.session.manageBooking.candidate;

      controller.get(req, res);

      expect(res.redirect).toHaveBeenCalledWith('../login');
    });

    test('redirects to the manage booking login page if reference no is not a candidates booking', () => {
      const testReq = {
        ...req,
        params: {
          ref: 'anotherRef',
        },
      };

      controller.get(testReq, res);

      expect(res.redirect).toHaveBeenCalledWith('../login');
    });

    test('redirects to the manage booking login page if there are no bookings', () => {
      delete req.session.manageBooking.bookings;

      controller.get(req, res);

      expect(res.redirect).toHaveBeenCalledWith('../login');
    });

    test('renders the cancel booking page', () => {
      controller.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_CANCEL, {
        booking: req.session.manageBooking.bookings[0],
      });
    });
  });

  describe('POST', () => {
    test('redirects to the manage booking login page if reference no is not a candidates booking', async () => {
      const testReq = {
        ...req,
        params: {
          ref: 'anotherRef',
        },
      };

      await controller.post(testReq, res);

      expect(res.redirect).toHaveBeenCalledWith('../login');
    });

    test('redirects to the manage booking login page if candidate is not eligible to book online/cancel', async () => {
      req.session.manageBooking.candidate.eligibleToBookOnline = false;

      await controller.post(req, res);

      expect(res.redirect).toHaveBeenCalledWith('../login');
    });

    test('renders the cancel booking page', async () => {
      await controller.post(req, res);

      expect(mockSchedulingGateway.deleteBooking).toHaveBeenCalledWith(req.session.manageBooking.bookings[0].bookingProductRef, 'a');
      expect(mockCRMGateway.updateTCNUpdateDate).toHaveBeenCalledWith(req.session.manageBooking.bookings[0].bookingProductId);
      expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_CANCEL_CONFIRMATION, {
        licenceNumber: req.session.manageBooking.candidate.licenceNumber,
        booking: req.session.manageBooking.bookings[0],
      });
    });

    test('refreshes bookings when deletion of scheduled slot fails', async () => {
      mockSchedulingGateway.deleteBooking.mockRejectedValue({
        status: 400,
      });
      await controller.post(req, res);

      expect(mockSchedulingGateway.deleteBooking).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith({ status: 400 }, 'ManageBookingCancelController::deleteScheduledSlot: Unable to successfully delete scheduled slot', {
        reference: req.session.manageBooking.bookings[0].reference,
      });
      expect(logger.event).toHaveBeenCalledWith(BusinessTelemetryEvents.SCHEDULING_FAIL_CONFIRM_CANCEL, 'ManageBookingCancelController::deleteScheduledSlot: Failed to cancel slot while cancelling a booking with the Scheduling API', {
        error: { status: 400 },
        reference: req.session.manageBooking.bookings[0].reference,
      });
      expect(mockBookingManager.loadCandidateBookings).toHaveBeenCalledWith(req, 'mockCandidateId');
    });

    test('CSC bookings - renders the cancel booking page', async () => {
      req.session.manageBooking.bookings[0].origin = CRMOrigin.CustomerServiceCentre;

      await controller.post(req, res);

      expect(mockSchedulingGateway.deleteBooking).toHaveBeenCalledWith(req.session.manageBooking.bookings[0].bookingProductRef, 'a');
      expect(mockCRMGateway.updateTCNUpdateDate).toHaveBeenCalledWith(req.session.manageBooking.bookings[0].bookingProductId);
      expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_CANCEL_CONFIRMATION, {
        licenceNumber: req.session.manageBooking.candidate.licenceNumber,
        booking: req.session.manageBooking.bookings[0],
      });
    });

    describe('For zero cost test', () => {
      test('payment API is not called', async () => {
        req.session.manageBooking.bookings[0].product.productnumber = CRMProductNumber.ADIP1DVA;

        await controller.post(req, res);

        expect(mockSchedulingGateway.deleteBooking).toHaveBeenCalledWith(req.session.manageBooking.bookings[0].bookingProductRef, 'a');
        expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_CANCEL_CONFIRMATION, {
          licenceNumber: req.session.manageBooking.candidate.licenceNumber,
          booking: req.session.manageBooking.bookings[0],
        });
        expect(mockPaymentClient.requestRefund).not.toHaveBeenCalled();
        expect(mockPaymentClient.recogniseIncome).not.toHaveBeenCalled();
      });
    });

    describe('Handle payment/refund', () => {
      describe('if the booking is refundable', () => {
        test('calls payment api to request a refund', async () => {
          Booking.prototype.isRefundable = jest.fn(() => true);

          await controller.post(req, res);

          expect(mockPaymentClient.requestRefund).toHaveBeenCalledWith(expectedPayload, 'mockCandidateId', mockPersonReference);
        });

        test('calls payment api to request a refund with missing line 5', async () => {
          Booking.prototype.isRefundable = jest.fn(() => true);
          delete req.session.manageBooking.candidate.address.line5;

          await controller.post(req, res);

          expect(mockPaymentClient.requestRefund).toHaveBeenCalledWith(expectedPayload, 'mockCandidateId', mockPersonReference);
        });

        test('calls payment api to request a refund with missing line 4', async () => {
          Booking.prototype.isRefundable = jest.fn(() => true);
          delete req.session.manageBooking.candidate.address.line4;
          delete req.session.manageBooking.candidate.address.line5;

          await controller.post(req, res);

          expect(mockPaymentClient.requestRefund).toHaveBeenCalledWith(expectedPayload, 'mockCandidateId', mockPersonReference);
        });

        test('requesting refund fails', async () => {
          const error = new Error();
          mockPaymentClient.requestRefund.mockRejectedValue(error);

          await controller.post(req, res);

          expect(mockPaymentClient.requestRefund).toHaveBeenCalled();

          expect(logger.event).toHaveBeenCalledWith(BusinessTelemetryEvents.PAYMENT_REFUND_FAIL, 'ManageBookingCancelController::handlePayment: Refund attempt failed', {
            error,
            candidateId: req.session.manageBooking.candidate.candidateId,
            personReference: req.session.manageBooking.candidate.personReference,
          });
          expect(mockBookingManager.loadCandidateBookings).toHaveBeenCalledWith(req, 'mockCandidateId');
        });

        test('requesting refund fails - resolves', async () => {
          const response = {
            code: PaymentStatus.FAILED,
            message: 'Refund not successful',
          };
          mockPaymentClient.requestRefund.mockResolvedValue(response);

          await controller.post(req, res);

          expect(mockPaymentClient.requestRefund).toHaveBeenCalled();
          expect(logger.warn).toHaveBeenCalledWith(
            'ManageBookingCancelController::handlePayment: Refund failed - Payment status NOT success',
            {
              bookingId: 'mockBookingId',
              bookingProductId: 'mockBookingProductId',
              bookingRef: 'mockRef',
              candidateId: 'mockCandidateId',
              cpmsCode: 802,
              cpmsMessage: 'Refund not successful',
              licenceId: 'mockLicenceId',
            },
          );
        });
      });

      describe('if the booking is not refundable', () => {
        test('calls payment api to recognise the payment as income', async () => {
          Booking.prototype.isRefundable = jest.fn(() => false);

          await controller.post(req, res);

          const expectedRecogniseIncomePayload = {
            bookingProductId: 'mockBookingProductId',
          };
          expect(mockPaymentClient.recogniseIncome).toHaveBeenCalledWith(expectedRecogniseIncomePayload, 'mockCandidateId', mockPersonReference);
        });

        test('recognising payment fails', async () => {
          const error = new Error();
          mockPaymentClient.recogniseIncome.mockRejectedValue(error);

          Booking.prototype.isRefundable = jest.fn(() => false);

          await controller.post(req, res);

          expect(mockPaymentClient.recogniseIncome).toHaveBeenCalled();

          expect(logger.event).toHaveBeenCalledWith(BusinessTelemetryEvents.PAYMENT_INCOME_FAIL, 'ManageBookingCancelController::handlePayment: Income recognition failure', {
            error,
            bookingProductId: req.session.manageBooking.bookings[0].bookingProductId,
            candidateId: req.session.manageBooking.candidate.candidateId,
            personReference: req.session.manageBooking.candidate.personReference,
          });
          expect(mockBookingManager.loadCandidateBookings).toHaveBeenCalledWith(req, 'mockCandidateId');
        });
      });
    });
  });

  describe('Set Cancellation in Progress', () => {
    test('update booking status to Cancellation in Progress in CRM', async () => {
      await controller.post(req, res);

      expect(mockCRMGateway.updateBookingStatus).toHaveBeenCalledWith(
        req.session.manageBooking.bookings[0].bookingId,
        CRMBookingStatus.CancellationInProgress,
        false,
      );
    });

    test('CSC bookings - update booking status to Cancellation in Progress in CRM', async () => {
      req.session.manageBooking.bookings[0].origin = CRMOrigin.CustomerServiceCentre;

      await controller.post(req, res);

      expect(mockCRMGateway.updateBookingStatus).toHaveBeenCalledWith(
        req.session.manageBooking.bookings[0].bookingId,
        CRMBookingStatus.CancellationInProgress,
        true,
      );
    });

    test('should redirect the user to the error page if the call fails', async () => {
      mockCRMGateway.updateBookingStatus.mockRejectedValue({
        status: 400,
      });

      await controller.post(req, res);

      expect(mockCRMGateway.updateBookingStatus).toHaveBeenCalled();
      expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_CANCEL_ERROR, {
        bookingRef: req.session.manageBooking.bookings[0].reference,
      });
      expect(logger.error).toHaveBeenCalledWith({ status: 400 }, 'ManageBookingCancelController::post: Cancelling failed', {
        bookingReference: req.session.manageBooking.bookings[0].reference,
      });
      expect(mockBookingManager.loadCandidateBookings).toHaveBeenCalledWith(req, 'mockCandidateId');
    });
  });

  describe('Cancel in CRM', () => {
    test('update booking status to cancelled in CRM', async () => {
      await controller.post(req, res);

      expect(mockCRMGateway.markBookingCancelled).toHaveBeenCalledWith(
        req.session.manageBooking.bookings[0].bookingId,
        req.session.manageBooking.bookings[0].bookingProductId,
        false,
      );
    });

    test('CSC bookings - update booking status to cancelled in CRM', async () => {
      req.session.manageBooking.bookings[0].origin = CRMOrigin.CustomerServiceCentre;

      await controller.post(req, res);

      expect(mockCRMGateway.markBookingCancelled).toHaveBeenCalledWith(
        req.session.manageBooking.bookings[0].bookingId,
        req.session.manageBooking.bookings[0].bookingProductId,
        true,
      );
    });

    test('update booking status failed', async () => {
      const error = new Error();
      mockCRMGateway.markBookingCancelled.mockRejectedValue(error);

      await controller.post(req, res);

      expect(logger.error).toHaveBeenCalledWith(error, 'ManageBookingCancelController::cancelBookingInCRM: Cancelling booking in CRM failed', {
        reference: req.session.manageBooking.bookings[0].reference,
      });
      expect(mockBookingManager.loadCandidateBookings).toHaveBeenCalledWith(req, 'mockCandidateId');
    });
  });

  describe('Send Cancellation Email', () => {
    test('calls notifications send email for gb', async () => {
      const mockBooking = req.session.manageBooking.bookings[0];
      const bookingCancellationDetails: BookingCancellationDetails = {
        bookingRef: mockBooking.reference,
        testType: mockBooking.testType,
        testDateTime: mockBooking.testDate,
      };
      const content = buildBookingCancellationEmailContent(bookingCancellationDetails, Target.GB, Locale.GB);

      await controller.post(req, res);

      expect(mockNotificationsGateway.sendEmail).toHaveBeenCalledWith(
        mockCandidateEmail,
        content,
        mockBooking.reference,
        Target.GB,
      );
    });

    test('calls notifications send email for ni', async () => {
      const mockBooking = req.session.manageBooking.bookings[0];
      const bookingCancellationDetails: BookingCancellationDetails = {
        bookingRef: mockBooking.reference,
        testType: mockBooking.testType,
        testDateTime: mockBooking.testDate,
      };
      const content = buildBookingCancellationEmailContent(bookingCancellationDetails, Target.NI, Locale.NI);
      const testReq = {
        ...req,
        session: {
          ...req.session,
          target: Target.NI,
        },
      };
      await controller.post(testReq, res);

      expect(mockNotificationsGateway.sendEmail).toHaveBeenCalledWith(
        mockCandidateEmail,
        content,
        mockBooking.reference,
        Target.NI,
      );
    });

    test('logs and swallows error if notifications send email fail', async () => {
      const error = Error('NtfApi error');
      const { candidateId } = req.session.manageBooking.candidate;
      mockNotificationsGateway.sendEmail.mockImplementationOnce(() => {
        throw error;
      });

      await controller.post(req, res);

      expect(logger.error).toHaveBeenCalledWith(
        error,
        'ManageBookingCancelController::sendCancellationEmail: Could not send booking cancellation email',
        {
          candidateId,
        },
      );
      expect(mockBookingManager.loadCandidateBookings).toHaveBeenCalledWith(req, 'mockCandidateId');
    });
  });
});
