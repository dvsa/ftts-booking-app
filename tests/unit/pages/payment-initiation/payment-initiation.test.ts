import { mock } from 'jest-mock-extended';
import { mocked } from 'ts-jest/utils';
import { Candidate } from '@dvsa/ftts-payment-api-model';
import { PaymentInitiationController } from '@pages/payment-initiation/payment-initiation';
import { PageNames } from '@constants';
import { BusinessTelemetryEvents, logger } from '../../../../src/helpers/logger';
import { paymentGateway, PaymentGateway } from '../../../../src/services/payments/payment-gateway';
import { CRMGateway } from '../../../../src/services/crm-gateway/crm-gateway';
import config from '../../../../src/config';
import { getCreatedBookingIdentifiers } from '../../../../src/helpers/log-helper';

const mockConfig = mocked(config, true);
mockConfig.payment.redirectUri = 'redirectUri';

jest.mock('../../../../src/services/crm-gateway/crm-gateway');
jest.mock('../../../../src/services/payments/payment-gateway');
jest.mock('../../../../src/services/payments/payment-helper', () => ({
  buildPaymentReference: () => 'mock-payment-ref',
}));
const mockPaymentGateway = paymentGateway as jest.Mocked<PaymentGateway>;
const mockCrmGateway = mock<CRMGateway>();

describe('Payment confirmation controller', () => {
  let req;
  let res;
  let customerAddress: Candidate.Address;
  let cardPaymentPayload: Candidate.CardPaymentPayload;
  let cardPaymentResponse: Candidate.CardPaymentResponse;
  let candidateId: string;
  let personReference: string;
  let controller: PaymentInitiationController;

  beforeEach(() => {
    candidateId = 'candidate-id';
    personReference = '123456789';
    customerAddress = {
      line1: 'Mock Line 1',
      line2: 'Mock Line 2',
      line3: 'Mock Line 3',
      line4: 'Mock Line 4',
      city: 'Mock City',
      postcode: 'Mock Postcode',
    };
    cardPaymentPayload = {
      scope: Candidate.CardPaymentPayload.ScopeEnum.CARD,
      redirectUri: 'redirectUri/payment-confirmation-loading/B-000-000-001',
      totalAmount: '23.00',
      customerReference: 'candidate-id',
      customerName: 'John Rambo',
      customerManagerName: 'John Rambo',
      customerAddress,
      countryCode: Candidate.CardPaymentPayload.CountryCodeEnum.GB,
      hasInvoice: true,
      refundOverpayment: false,
      paymentData: [{
        lineIdentifier: 1,
        amount: '23.00',
        netAmount: '23.00',
        allocatedAmount: '23.00',
        taxAmount: '0.00',
        taxCode: 'AX',
        taxRate: 0,
        salesReference: 'mock-payment-ref',
        productReference: '60012278-8783-ea11-a811-00224801cecd',
        productDescription: '70012278-8783-ea11-a811-00224801cecd',
        receiverReference: 'candidate-id',
        receiverName: 'John Rambo',
        receiverAddress: customerAddress,
        salesPersonReference: null,
      }],
    };
    cardPaymentResponse = {
      gatewayUrl: 'gatewayUrl',
      redirectionData: [],
      receiptReference: 'reference',
      paymentId: 'payment-id',
    };
    mockPaymentGateway.initiateCardPayment.mockResolvedValue(cardPaymentResponse);
    controller = new PaymentInitiationController(mockCrmGateway, mockPaymentGateway);

    req = {
      session: {
        candidate: {
          candidateId: 'candidate-id',
          licenceId: 'licence-id',
          firstnames: 'John',
          surname: 'Rambo',
          address: {
            line1: 'Mock Line 1',
            line2: 'Mock Line 2',
            line3: 'Mock Line 3',
            line4: 'Mock Line 4',
            line5: 'Mock City',
            postcode: 'Mock Postcode',
          },
          personReference,
        },
        currentBooking: {
          bookingId: 'fd73b747-dfa0-46e7-be4b-1a79aa8e25da',
          bookingProductId: '60012278-8783-ea11-a811-00224801cecd',
          bookingRef: 'B-000-000-001',
          bookingProductRef: 'B-000-000-001-01',
          salesReference: 'mock-payment-ref',
          priceList: {
            price: 23,
            product: {
              productId: '70012278-8783-ea11-a811-00224801cecd',
            },
          },
          bookingRef: 'B-000-000-001',
        },
      },
    };

    res = {
      redirect: jest.fn(),
      render: jest.fn(),
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET request', () => {
    test('calls payment API to initiate the payment', async () => {
      await controller.get(req, res);

      expect(mockPaymentGateway.initiateCardPayment).toHaveBeenCalledWith(cardPaymentPayload, candidateId, personReference);
      expect(logger.debug).toHaveBeenCalledTimes(1);
    });

    test('uses instructor redirect uri if instructor journey', async () => {
      req.session.journey = {
        isInstructor: true,
      };
      cardPaymentPayload.redirectUri = 'redirectUri/instructor/payment-confirmation-loading/B-000-000-001';

      await controller.get(req, res);

      expect(mockPaymentGateway.initiateCardPayment).toHaveBeenCalledWith(cardPaymentPayload, candidateId, personReference);
      expect(logger.debug).toHaveBeenCalledTimes(1);
    });

    test('adds receiptReference to the session', async () => {
      await controller.get(req, res);

      expect(req.session.currentBooking.receiptReference).toBe(cardPaymentResponse.receiptReference);
    });

    test('redirects to payments gateway url', async () => {
      await controller.get(req, res);

      expect(res.redirect).toHaveBeenCalledWith(cardPaymentResponse.gatewayUrl);
    });

    test('calls CRM to create a bind bewtween a booking and a payment', async () => {
      await controller.get(req, res);

      expect(mockCrmGateway.createBindBetweenBookingAndPayment).toHaveBeenCalledWith(
        req.session.currentBooking.bookingId,
        cardPaymentResponse.paymentId,
        cardPaymentResponse.receiptReference,
      );
    });
  });

  describe('error handling', () => {
    test('warns if CRM fails and a bind between a booking and a payment could not be created', async () => {
      mockCrmGateway.createBindBetweenBookingAndPayment.mockRejectedValue(
        new Error('msg'),
      );

      await controller.get(req, res);

      expect(logger.warn).toHaveBeenCalledWith(
        'PaymentInitiationController::get: No bind was created between the booking entity and the payment entity',
        {
          receiptReference: cardPaymentResponse.receiptReference,
          reason: 'msg',
          ...getCreatedBookingIdentifiers(req),
        },
      );
    });

    test('throws if missing session data', async () => {
      req.session.candidate = undefined;

      await expect(controller.get(req, res)).rejects.toThrow();
    });

    test('renders the payment error page if the payment call fails', async () => {
      const mockError = new Error('payment error');
      mockPaymentGateway.initiateCardPayment.mockRejectedValue(mockError);

      await controller.get(req, res);

      expect(logger.event).toHaveBeenCalledWith(
        BusinessTelemetryEvents.PAYMENT_REDIRECT,
        'PaymentInitiationController::get: Sending user to payment processor',
        {
          personReference: '123456789',
          ...getCreatedBookingIdentifiers(req),
        },
      );
      expect(logger.event).toHaveBeenCalledWith(
        BusinessTelemetryEvents.PAYMENT_FAILED,
        'PaymentInitiationController::get: Payment service error',
        {
          error: Error('payment error'),
          personReference: '123456789',
          ...getCreatedBookingIdentifiers(req),
        },
      );
      expect(res.render).toHaveBeenCalledWith(PageNames.PAYMENT_INITIATION_ERROR);
      expect(logger.error).toHaveBeenCalledWith(
        mockError, 'PaymentInitiationController::get: Payment service error',
        {
          personReference: '123456789',
          ...getCreatedBookingIdentifiers(req),
        },
      );
    });

    test('renders the payment error page and logs an error if error 500 is thrown', async () => {
      const mockError = {
        status: 500,
      };

      mockPaymentGateway.initiateCardPayment.mockRejectedValue(mockError);

      await controller.get(req, res);

      expect(logger.event).toHaveBeenCalledWith(BusinessTelemetryEvents.PAYMENT_ERROR, expect.any(String), {
        error: mockError,
        personReference,
        ...getCreatedBookingIdentifiers(req),
      });
    });

    test('renders the payment error page and logs an error if error 401 is thrown', async () => {
      const mockError = {
        status: 401,
      };

      mockPaymentGateway.initiateCardPayment.mockRejectedValue(mockError);

      await controller.get(req, res);

      expect(logger.event).toHaveBeenCalledWith(BusinessTelemetryEvents.PAYMENT_AUTH_ISSUE, expect.any(String), {
        error: mockError,
        personReference,
        ...getCreatedBookingIdentifiers(req),
      });
    });

    test('renders the payment error page and logs an error if error 403 is thrown', async () => {
      const mockError = {
        status: 403,
      };

      mockPaymentGateway.initiateCardPayment.mockRejectedValue(mockError);

      await controller.get(req, res);

      expect(logger.event).toHaveBeenCalledWith(BusinessTelemetryEvents.PAYMENT_AUTH_ISSUE, expect.any(String), {
        error: mockError,
        personReference,
        ...getCreatedBookingIdentifiers(req),
      });
    });
  });
});
