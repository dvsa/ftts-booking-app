import { Candidate } from '@dvsa/ftts-payment-api-model';
import { PaymentHandler } from '../../../../src/services/payments/payment-handler';
import paymentApiClient from '../../../../src/services/payments/payment-api-client';

jest.mock('../../../../src/config', () => ({
  http: {
    retryClient: {},
  },
  payment: {
    redirectUri: 'redirectUri',
  },
  view: {
    theoryTestPriceInGbp: '23.00',
  },
}));

jest.mock('../../../../src/services/payments/payment-api-client');
jest.mock('../../../../src/services/payments/payment-helper', () => ({
  buildPaymentReference: () => 'mock-payment-ref',
  buildPersonReference: () => '999999999',
}));
const mockPaymentApiClient = paymentApiClient as jest.Mocked<typeof paymentApiClient>;

describe('Payment Handler', () => {
  let req;
  let res;
  let customerAddress: Candidate.Address;
  let cardPaymentPayload: Candidate.CardPaymentPayload;
  let cardPaymentResponse: Candidate.CardPaymentResponse;
  let personReference: string;
  let paymentHandler: PaymentHandler;

  beforeEach(() => {
    personReference = '123456789';
    customerAddress = {
      line1: 'Test St',
      line2: 'Test Line 2',
      city: 'Test City',
      postcode: 'PO57 CDE',
    };
    cardPaymentPayload = {
      scope: Candidate.CardPaymentPayload.ScopeEnum.CARD,
      redirectUri: 'redirectUri/payment-confirmation',
      totalAmount: '23.00',
      customerReference: 'candidate-id',
      customerName: 'John Rambo',
      customerManagerName: 'John Rambo',
      customerAddress,
      countryCode: Candidate.CardPaymentPayload.CountryCodeEnum.GB,
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
        productDescription: '60012278-8783-ea11-a811-00224801cecd',
        receiverReference: 'candidate-id',
        receiverName: 'John Rambo',
        receiverAddress: customerAddress,
        salesPersonReference: 'mock-payment-ref',
      }],
    };
    cardPaymentResponse = {
      gatewayUrl: 'gatewayUrl',
      redirectionData: [],
      receiptReference: 'reference',
    };
    mockPaymentApiClient.initiateCardPayment.mockResolvedValue(cardPaymentResponse);
    paymentHandler = new PaymentHandler();

    req = {
      session: {
        candidate: {
          candidateId: 'candidate-id',
          firstnames: 'John',
          surname: 'Rambo',
          address: {
            line1: 'Test St',
            line2: 'Test Line 2',
            city: 'Test City',
            postcode: 'PO57 CDE',
          },
          personReference,
        },
        currentBooking: {
          bookingProductId: '60012278-8783-ea11-a811-00224801cecd',
          salesReference: 'mock-payment-ref',
        },
      },
    };

    res = {
      res_redirect: '',
      redirect: (url: string): void => {
        res.res_redirect = url;
      },
      render: jest.fn(),
    };

    console.log = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('When handle payment function is called', () => {
    test('should initiate card payment', async () => {
      await paymentHandler.handlePayment(req);

      expect(mockPaymentApiClient.initiateCardPayment).toHaveBeenCalledWith(cardPaymentPayload, 'candidate-id', personReference);
    });

    test('should generate a person reference if currently null - initiate card payment', async () => {
      req.session.candidate.personReference = null;

      await paymentHandler.handlePayment(req);

      expect(mockPaymentApiClient.initiateCardPayment).toHaveBeenCalledWith(cardPaymentPayload, 'candidate-id', '999999999');
    });

    test('should add salesReference to the session', async () => {
      await paymentHandler.handlePayment(req);

      expect(req.session.currentBooking.salesReference).toBe(cardPaymentPayload.paymentData[0].salesReference);
    });

    test('should add receiptReference to the session', async () => {
      await paymentHandler.handlePayment(req);

      expect(req.session.currentBooking.receiptReference).toBe(cardPaymentResponse.receiptReference);
    });

    test('should redirect to gateway url', async () => {
      const gatewayUrl = await paymentHandler.handlePayment(req);

      expect(gatewayUrl).toBe(cardPaymentResponse.gatewayUrl);
    });
  });

  describe('error handling', () => {
    test('throw error if payment fails', async () => {
      mockPaymentApiClient.initiateCardPayment.mockImplementationOnce(() => { throw Error('error'); });
      req.errors = { test: 'test' };

      await expect(paymentHandler.handlePayment(req)).rejects.toThrow();
    });
  });
});
