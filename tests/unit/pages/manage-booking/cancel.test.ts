import {
  LOCALE, TARGET, TCNRegion, TestType,
} from '../../../../src/domain/enums';
import { Booking } from '../../../../src/domain/booking/booking';
import logger from '../../../../src/helpers/logger';
import { ManageBookingCancelController } from '../../../../src/pages/manage-booking/cancel';
import { CRMGateway } from '../../../../src/services/crm-gateway/crm-gateway';
import { CRMBookingStatus, CRMTestLanguage, CRMVoiceOver } from '../../../../src/services/crm-gateway/enums';
import { buildBookingCancellationEmailContent } from '../../../../src/services/notifications/content/builders';
import { NotificationsGateway } from '../../../../src/services/notifications/notifications-gateway';
import { BookingCancellationDetails } from '../../../../src/services/notifications/types';
import { Scheduler } from '../../../../src/services/scheduling/scheduling-service';
import { PaymentApiClient } from '../../../../src/services/payments/payment-api-client';

jest.mock('../../../../src/services/scheduling/scheduling-service');
jest.mock('../../../../src/services/notifications/notifications-gateway');
jest.mock('../../../../src/services/crm-gateway/crm-gateway');
jest.mock('@dvsa/cds-retry');
jest.mock('../../../../src/helpers/logger');

jest.mock('../../../../src/services/payments/payment-helper', () => ({
  buildPaymentReference: () => 'mock-payment-ref',
  buildPersonReference: () => '111222333',
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
    city: 'City',
    postcode: 'Postcode',
  };
  const mockPersonReference = '123456789';

  const mockScheduler = {
    deleteBooking: jest.fn(),
  };

  const mockCRMGateway = {
    updateTCNUpdateDate: jest.fn(),
    updateBookingStatus: jest.fn(() => Promise.resolve()),
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

  const controller = new ManageBookingCancelController(
    mockScheduler as unknown as Scheduler,
    mockCRMGateway as unknown as CRMGateway,
    mockNotificationsGateway as unknown as NotificationsGateway,
    mockPaymentClient as unknown as PaymentApiClient,
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
          },
          bookings: [
            {
              bookingProductId: 'mockBookingProductId',
              reference: 'mockRef',
              bookingId: 'mockBookingId',
              bookingStatus: CRMBookingStatus.Confirmed,
              testDate: '2020-10-29T14:00:00.000Z',
              testLanguage: CRMTestLanguage.English,
              voiceoverLanguage: CRMVoiceOver.None,
              additionalSupport: null,
              paymentStatus: null,
              price: 23,
              salesReference: 'mockSalesRef',
              testType: TestType.Car,
              origin: 1,
              testCentre: {
                name: 'mockTestCentreName',
                addressLine1: 'mockTestCentreAddress1',
                addressLine2: 'mockTestCentreAddress2',
                city: 'mockTestCentreCity',
                postcode: 'mockTestCentrePostcode',
                region: TCNRegion.A,
              },
            },
          ],
        },
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

      expect(res.render).toHaveBeenCalledWith('manage-booking/cancel', {
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

    test('renders the cancel booking page', async () => {
      await controller.post(req, res);

      expect(mockScheduler.deleteBooking).toHaveBeenCalledWith(req.session.manageBooking.bookings[0].reference, 'a');
      expect(mockCRMGateway.updateTCNUpdateDate).toHaveBeenCalledWith(req.session.manageBooking.bookings[0].bookingProductId);
      expect(res.render).toHaveBeenCalledWith('manage-booking/cancel-confirmation', {
        licenceNumber: req.session.manageBooking.candidate.licenceNumber,
        booking: req.session.manageBooking.bookings[0],
      });
    });

    describe('Handle payment/refund', () => {
      describe('if the booking is refundable', () => {
        test('calls payment api to request a refund', async () => {
          Booking.prototype.isRefundable = jest.fn(() => true);

          await controller.post(req, res);

          const expectedPayload = {
            scope: 'REFUND',
            customerReference: 'mockCandidateId',
            customerName: 'First Names Surname',
            customerManagerName: 'First Names Surname',
            customerAddress: mockCandidateAddress,
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
          };
          expect(mockPaymentClient.requestRefund).toHaveBeenCalledWith(expectedPayload, 'mockCandidateId', mockPersonReference);
        });

        test('sends payment with generated person reference if none is available', async () => {
          Booking.prototype.isRefundable = jest.fn(() => true);
          req.session.manageBooking.candidate.personReference = null;

          await controller.post(req, res);

          const expectedPayload = {
            scope: 'REFUND',
            customerReference: 'mockCandidateId',
            customerName: 'First Names Surname',
            customerManagerName: 'First Names Surname',
            customerAddress: mockCandidateAddress,
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
          };
          expect(mockPaymentClient.requestRefund).toHaveBeenCalledWith(expectedPayload, 'mockCandidateId', '111222333');
        });
      });

      describe('if the booking is not refundable', () => {
        test('calls payment api to recognise the payment as income', async () => {
          Booking.prototype.isRefundable = jest.fn(() => false);

          await controller.post(req, res);

          const expectedPayload = {
            bookingProductId: 'mockBookingProductId',
          };
          expect(mockPaymentClient.recogniseIncome).toHaveBeenCalledWith(expectedPayload, 'mockCandidateId', mockPersonReference);
        });

        test('sends payment with generated person reference if none is available', async () => {
          Booking.prototype.isRefundable = jest.fn(() => false);
          req.session.manageBooking.candidate.personReference = null;

          await controller.post(req, res);

          const expectedPayload = {
            bookingProductId: 'mockBookingProductId',
          };
          expect(mockPaymentClient.recogniseIncome).toHaveBeenCalledWith(expectedPayload, 'mockCandidateId', '111222333');
        });
      });
    });
    describe('Set Cancellation in Progress', () => {
      test('update booking status to Cancellation in Progress in CRM', async () => {
        await controller.post(req, res);

        expect(mockCRMGateway.updateBookingStatus).toBeCalledWith(
          req.session.manageBooking.bookings[0].bookingId,
          CRMBookingStatus.CancellationInProgress,
        );
      });
      test('should redirect the user to the error page if the call fails', async () => {
        mockCRMGateway.updateBookingStatus.mockRejectedValue({
          status: 400,
        });

        await controller.post(req, res);

        expect(mockCRMGateway.updateBookingStatus).toBeCalled();
        expect(res.render).toHaveBeenCalledWith('manage-booking/cancel-error', {
          bookingRef: req.session.manageBooking.bookings[0].reference,
        });
      });
    });
    describe('Cancel in CRM', () => {
      test('update booking status to cancelled in CRM', async () => {
        await controller.post(req, res);

        expect(mockCRMGateway.updateBookingStatus).toBeCalledWith(
          req.session.manageBooking.bookings[0].bookingId,
          CRMBookingStatus.Cancelled,
        );
      });

      test('update booking status failed', async () => {
        await controller.post(req, res);

        expect(logger.error).toBeCalled();
      });
    });

    describe('Send Cancellation Email', () => {
      test('calls notifications send email', async () => {
        const mockBooking = req.session.manageBooking.bookings[0];
        const bookingCancellationDetails: BookingCancellationDetails = {
          bookingRef: mockBooking.reference,
          testType: mockBooking.testType,
          testDateTime: mockBooking.testDate,
        };
        const content = buildBookingCancellationEmailContent(bookingCancellationDetails, TARGET.GB, LOCALE.GB);

        await controller.post(req, res);

        expect(mockNotificationsGateway.sendEmail).toHaveBeenCalledWith(
          mockCandidateEmail,
          content,
          mockBooking.reference,
          TARGET.GB,
        );
      });

      test('calls notifications send email', async () => {
        const mockBooking = req.session.manageBooking.bookings[0];
        const bookingCancellationDetails: BookingCancellationDetails = {
          bookingRef: mockBooking.reference,
          testType: mockBooking.testType,
          testDateTime: mockBooking.testDate,
        };
        const content = buildBookingCancellationEmailContent(bookingCancellationDetails, TARGET.NI, LOCALE.NI);
        const testReq = {
          ...req,
          session: {
            ...req.session,
            target: TARGET.NI,
          },
        };
        await controller.post(testReq, res);

        expect(mockNotificationsGateway.sendEmail).toHaveBeenCalledWith(
          mockCandidateEmail,
          content,
          mockBooking.reference,
          TARGET.NI,
        );
      });

      test('logs and swallows error if notifications send email fail', async () => {
        const error = Error('NtfApi error');
        const { candidateId } = req.session.manageBooking.candidate;
        mockNotificationsGateway.sendEmail.mockImplementationOnce(() => {
          throw error;
        });

        await controller.post(req, res);

        expect(logger.error).toHaveBeenCalledWith(error, `Could not send booking cancellation email - candidateId: ${candidateId}`);
      });
    });
  });
});
