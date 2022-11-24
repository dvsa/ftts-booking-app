import MockDate from 'mockdate';
import { ManageBookingRequestRefundController } from '@pages/manage-booking-request-refund/manage-booking-request-refund';
import { PageNames } from '@constants';
import { CRMGateway } from '../../../../src/services/crm-gateway/crm-gateway';
import { NotificationsGateway } from '../../../../src/services/notifications/notifications-gateway';
import { Candidate } from '../../../../src/services/session';
import { PaymentGateway, Candidate as PaymentCandidate } from '../../../../src/services/payments/payment-gateway';
import { mockManageBooking } from '../../../mocks/data/manage-bookings';
import { mockSessionCandidate } from '../../../mocks/data/session-types';
import { Locale, Target } from '../../../../src/domain/enums';
import { BookingDetails, CRMProduct } from '../../../../src/services/crm-gateway/interfaces';
import { CRMBookingStatus, CRMProductNumber } from '../../../../src/services/crm-gateway/enums';
import { BookingManager } from '../../../../src/helpers/booking-manager';

jest.mock('../../../../src/services/notifications/content/builders', () => ({
  buildRefundRequestEmailContent: () => 'some-email-content',
}));

describe('manage booking - request refund controller', () => {
  let req: any;
  let res: any;
  let requestRefundController: ManageBookingRequestRefundController;

  let mockPayload: PaymentCandidate.BatchRefundPayload;
  let mockCandidate: Candidate;
  let firstBooking: BookingDetails;

  const mockToday = '2020-02-04T12:00:00.000Z';
  MockDate.set(mockToday);

  const paymentsGateway = PaymentGateway.prototype;
  const crmGateway = CRMGateway.prototype;
  const notificationsGateway = NotificationsGateway.prototype;
  const bookingManager = BookingManager.prototype;

  beforeEach(() => {
    req = {
      body: {
        bookingReference: 'mockRef',
      },
      session: {
        target: Target.GB,
        locale: Locale.GB,
        manageBooking: {
          candidate: mockSessionCandidate(),
          bookings: [
            {
              ...mockManageBooking(),
              owedCompensationBooking: true,
              bookingStatus: CRMBookingStatus.Cancelled,
            },
          ],
        },
        journey: {
          inManageBookingMode: true,
        },
      },
      query: {
        ref: 'mockRef',
      },
    };
    res = {
      render: jest.fn(),
      redirect: jest.fn(),
    };
    requestRefundController = new ManageBookingRequestRefundController(paymentsGateway, notificationsGateway, crmGateway, bookingManager);
    crmGateway.updateCompensationBooking = jest.fn();
    paymentsGateway.requestRefund = jest.fn();
    notificationsGateway.sendEmail = jest.fn();
    bookingManager.loadCandidateBookings = jest.fn();

    [firstBooking] = req.session.manageBooking.bookings;
    mockCandidate = req.session.manageBooking.candidate;

    mockPayload = {
      scope: PaymentCandidate.BatchRefundPayload.ScopeEnum.REFUND,
      customerReference: mockCandidate.candidateId as string,
      customerName: `${mockCandidate.firstnames} ${mockCandidate.surname}`,
      customerManagerName: `${mockCandidate.firstnames} ${mockCandidate.surname}`,
      customerAddress: {
        line1: mockCandidate.address?.line1 as string,
        line2: mockCandidate.address?.line2,
        line3: mockCandidate.address?.line3,
        line4: mockCandidate.address?.line4,
        city: mockCandidate.address?.line5 as string,
        postcode: mockCandidate.address?.postcode as string,
      },
      countryCode: PaymentCandidate.BatchRefundPayload.CountryCodeEnum.GB,
      payments: [{
        refundReason: 'Test cancelled by candidate',
        bookingProductId: firstBooking.bookingProductId,
        totalAmount: firstBooking.price.toFixed(2),
        paymentData: [{
          lineIdentifier: 1,
          amount: firstBooking.price.toFixed(2),
          netAmount: firstBooking.price.toFixed(2),
          taxAmount: '0.00',
          salesReference: firstBooking.salesReference,
        }],
      }],
    };
  });

  describe('GET', () => {
    test('renders the page successfully', () => {
      requestRefundController.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_REQUEST_REFUND, {
        backLink: '../home',
        bookingRef: req.query.ref,
        bookTheoryTestLink: 'https://www.gov.uk/book-theory-test',
      });
    });

    test('if the ref in the query params is empty, we get redirected back to the home page', () => {
      delete req.query.ref;

      requestRefundController.get(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/manage-booking/home');
      expect(res.render).not.toHaveBeenCalled();
    });

    test('if the booking does not exist, redirect back to home page', () => {
      req.session.manageBooking.bookings = [];

      requestRefundController.get(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/manage-booking/home');
      expect(res.render).not.toHaveBeenCalled();
    });
  });

  describe('POST', () => {
    test('successfully calls to request the refund and updates the compensation booking', async () => {
      await requestRefundController.post(req, res);

      expect(paymentsGateway.requestRefund).toHaveBeenCalledWith(mockPayload, mockCandidate.candidateId, mockCandidate.personReference);
      expect(crmGateway.updateCompensationBooking).toHaveBeenCalledWith(firstBooking.bookingId, mockToday);
      expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_REFUND_CONFIRMATION, {
        bookingReference: req.body.bookingReference,
        homeLink: '../home',
        bookTheoryTestLink: 'https://www.gov.uk/book-theory-test',
      });
    });

    test('given that the refund has successfully been requested, function successfully sends an email to the candidate to notify them of the refund', async () => {
      await requestRefundController.post(req, res);

      expect(notificationsGateway.sendEmail).toHaveBeenCalledWith(mockCandidate.email, 'some-email-content', firstBooking.reference, Target.GB);
    });

    test('given that the refund has successfully been requested but candidate does not have an email, refund email confirmation does not get sent', async () => {
      delete mockCandidate.email;

      await requestRefundController.post(req, res);
      expect(notificationsGateway.sendEmail).not.toHaveBeenCalled();
    });

    test('refund confirmation page has the instructor theory test link if booking refunded was an instructor booking', async () => {
      const { product } = firstBooking;
      (product as CRMProduct).productnumber = CRMProductNumber.ADIP1;

      await requestRefundController.post(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_REFUND_CONFIRMATION, expect.objectContaining({
        bookTheoryTestLink: 'https://www.gov.uk/book-your-instructor-theory-test',
      }));
    });

    test('given that the call to payments api fails, error gets thrown and refund email is not sent', async () => {
      const error = new Error('failed to call payment api');
      paymentsGateway.requestRefund = jest.fn().mockRejectedValue(error);

      await expect(requestRefundController.post(req, res)).rejects.toEqual(error);
      expect(crmGateway.updateCompensationBooking).not.toHaveBeenCalled();
      expect(notificationsGateway.sendEmail).not.toHaveBeenCalled();
    });

    test('given that the call to crm fails to update the compensation booking, error gets thrown', async () => {
      const error = new Error('failed to call crm');
      crmGateway.updateCompensationBooking = jest.fn().mockRejectedValue(error);

      await expect(requestRefundController.post(req, res)).rejects.toEqual(error);
      expect(notificationsGateway.sendEmail).not.toHaveBeenCalled();
    });

    test('error gets thrown if the journey is not in manageBookingMode', async () => {
      delete req.session.journey.inManageBookingMode;

      await expect(requestRefundController.post(req, res)).rejects.toThrow();
    });

    test('error gets thrown if the manageBooking is not set in session', async () => {
      delete req.session.manageBooking;

      await expect(requestRefundController.post(req, res)).rejects.toThrow();
    });

    test('error gets thrown if the candidate is not set in session', async () => {
      delete req.session.manageBooking.candidate;

      await expect(requestRefundController.post(req, res)).rejects.toThrow();
    });

    test('error gets thrown if the booking cannot be found in the session', async () => {
      delete req.session.manageBooking.bookings;

      await expect(requestRefundController.post(req, res)).rejects.toThrow();
    });

    test('error gets thrown if the booking has not been flagged as refundable', async () => {
      firstBooking.owedCompensationBooking = false;

      await expect(requestRefundController.post(req, res)).rejects.toThrow();
    });
  });
});
