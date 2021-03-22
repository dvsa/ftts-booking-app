import { PaymentConfirmation } from '../../../../src/pages/book-a-test/payment-confirmation';
import paymentApiClient from '../../../../src/services/payments/payment-api-client';
import { Scheduler } from '../../../../src/services/scheduling/scheduling-service';
import { NotificationsGateway } from '../../../../src/services/notifications/notifications-gateway';
import { CRMGateway } from '../../../../src/services/crm-gateway/crm-gateway';
import { TARGET, TCNRegion } from '../../../../src/domain/enums';
import { CRMBookingStatus, CRMRemit } from '../../../../src/services/crm-gateway/enums';

jest.mock('../../../../src/services/payments/payment-api-client');
const mockPaymentApiClient = paymentApiClient as jest.Mocked<typeof paymentApiClient>;

const mockEmailContent = { subject: 'subject', body: 'body' };
jest.mock('../../../../src/services/notifications/content/builders', () => ({
  buildBookingConfirmationEmailContent: () => mockEmailContent,
}));

describe('Payment confirmation controller', () => {
  let paymentConfirmation: PaymentConfirmation;
  let res;
  let req;

  const notifications = NotificationsGateway.prototype;
  const scheduling = Scheduler.prototype;
  const crmGateway = CRMGateway.prototype;
  const receiptReference = 'my_receipt_reference';

  const mockReceiptReference = 'my_receipt_reference';
  const mockBookingRef = '123456-123';
  const mockReservationId = '456789-321';
  const mockBookingId = '1234-5678-9123-4567';
  const mockEmail = 'mock@email.com';
  const mockCandidateId = 'mock-candidate-id';
  const mockPersonReference = '123456789';
  const mockTarget = TARGET.GB;
  const mockRemit = CRMRemit.England;
  const mockDateTime = '2020-10-01';
  const mockbookingProductId = 'mock-booking-product-id';
  const mockRegion = TCNRegion.A;

  beforeEach(() => {
    notifications.sendEmail = jest.fn();
    scheduling.confirmBooking = jest.fn();
    crmGateway.updateBookingStatus = jest.fn();
    crmGateway.calculateThreeWorkingDays = jest.fn();
    crmGateway.updateTCNUpdateDate = jest.fn();

    paymentConfirmation = new PaymentConfirmation(
      notifications,
      scheduling,
      crmGateway,
    );

    req = {
      session: {
        candidate: {
          email: mockEmail,
          candidateId: mockCandidateId,
          personReference: mockPersonReference,
        },
        currentBooking: {
          dateTime: mockDateTime,
          receiptReference,
          bookingRef: mockBookingRef,
          bookingId: mockBookingId,
          reservationId: mockReservationId,
          centre: {
            remit: mockRemit,
            region: mockRegion,
          },
          bookingProductId: mockbookingProductId,
        },
        target: mockTarget,
      },
    };

    res = {
      res_redirect: '',
      redirect: (url: string): void => {
        res.res_redirect = url;
      },
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET request', () => {
    test('redirects to the booking confirmation page', async () => {
      await paymentConfirmation.get(req, res);

      expect(res.res_redirect).toBe('/booking-confirmation');
    });

    test('calls payment API to confirm the payment completion', async () => {
      await paymentConfirmation.get(req, res);

      expect(mockPaymentApiClient.confirmCardPaymentIsComplete).toHaveBeenCalledWith(mockReceiptReference, mockCandidateId, mockPersonReference);
    });

    test('calls scheduling API to confirm the booking with TCN', async () => {
      await paymentConfirmation.get(req, res);

      expect(scheduling.confirmBooking).toHaveBeenCalledWith(
        [{
          bookingReferenceId: mockBookingRef,
          reservationId: mockReservationId,
          notes: '',
          behaviouralMarkers: '',
        }],
        mockRegion,
      );
    });

    test('calls crmGateway to update the booking status', async () => {
      await paymentConfirmation.get(req, res);

      expect(crmGateway.updateBookingStatus).toHaveBeenCalledWith(mockBookingId, CRMBookingStatus.Confirmed);
    });

    test('calls crmGateway to get the cancellation date', async () => {
      await paymentConfirmation.get(req, res);
      expect(crmGateway.calculateThreeWorkingDays).toHaveBeenCalledWith(mockDateTime, mockRemit);
    });

    test('calls crmGateway to update the TCN Update Date', async () => {
      await paymentConfirmation.get(req, res);

      expect(crmGateway.updateTCNUpdateDate).toHaveBeenCalledWith(mockbookingProductId);
    });

    test('calls notification API to send a booking confirmation email', async () => {
      await paymentConfirmation.get(req, res);

      expect(notifications.sendEmail).toHaveBeenCalledWith(mockEmail, mockEmailContent, mockBookingRef, mockTarget);
    });
  });
});
