import { AxiosStatic } from 'axios';
import { Candidate, Finance } from '@dvsa/ftts-payment-api-model';
import config from '../../../../src/config';
import { BusinessTelemetryEvents, logger } from '../../../../src/helpers/logger';
import { ManagedIdentityAuth } from '../../../../src/services/auth/managed-identity-auth';
import { PaymentGateway } from '../../../../src/services/payments/payment-gateway';

const mockedAxios = jest.createMockFromModule<jest.Mocked<AxiosStatic>>('axios');
const axiosRetryClientForPaymentErrors = jest.createMockFromModule<jest.Mocked<AxiosStatic>>('axios');

const userId = '186C3777-3167-4206-8C1A-96B688A2D7FC';
const personReference = 'mockPersonRef';

describe('PaymentGateway', () => {
  let paymentGateway: PaymentGateway;
  config.payment.baseUrl = 'url';
  const mockPaymentsUrl = 'payments.com/payments';
  const mockAccessToken = { value: '1234-5678' };
  const headers = {
    Authorization: `Bearer ${mockAccessToken.value}`,
    'X-FTTS-PAYMENT-USER-ID': expect.stringContaining(userId),
    'X-FTTS-PAYMENT-PERSON-REFERENCE': personReference,
  };

  beforeEach(() => {
    const mockAuthClient = {
      getAuthHeader: () => ({
        headers: {
          Authorization: `Bearer ${mockAccessToken.value}`,
        },
      }),
    };

    paymentGateway = new PaymentGateway(
      mockAuthClient as unknown as ManagedIdentityAuth,
      mockedAxios,
      axiosRetryClientForPaymentErrors,
      mockPaymentsUrl,
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('GIVEN valid request WHEN initiate card payment THEN should call payment api and receive valid response', async () => {
    const validAxiosResponse = {
      status: 200,
      data: Candidate.CardPaymentResponse.$serializedExample(),
    };
    mockedAxios.post.mockResolvedValue(validAxiosResponse);

    const response = paymentGateway.initiateCardPayment(Candidate.CardPaymentPayload.$example(), userId, personReference);

    await expect(response).resolves.toEqual(Candidate.CardPaymentResponse.$example());
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      `${mockPaymentsUrl}/api/v1/candidate/payment/card`,
      Candidate.CardPaymentPayload.$serializedExample(),
      {
        headers,
      },
    );
  });

  test('GIVEN valid request WHEN initiate card payment and payment api fails THEN should throw correct exception', async () => {
    const expectedError = { message: 'something bad' };
    mockedAxios.post.mockRejectedValue(expectedError);

    await expect(
      paymentGateway.initiateCardPayment(Candidate.CardPaymentPayload.$example(), userId, personReference),
    ).rejects.toEqual(expectedError);
  });

  test('GIVEN valid request WHEN confirm card payment THEN should call payment api and receive valid response', async () => {
    const receiptReference = 'reference';
    const code = 104;
    const validAxiosResponse = {
      status: 200,
      data: Candidate.CardPaymentCompletionResponse.$serializedExample(code),
    };
    axiosRetryClientForPaymentErrors.put.mockResolvedValue(validAxiosResponse);

    const response = paymentGateway.confirmCardPaymentIsComplete(receiptReference, userId, personReference);

    await expect(response).resolves.toEqual(Candidate.CardPaymentCompletionResponse.$example(code));
    expect(axiosRetryClientForPaymentErrors.put).toHaveBeenCalledTimes(1);
    expect(axiosRetryClientForPaymentErrors.put).toHaveBeenCalledWith(
      `${mockPaymentsUrl}/api/v1/candidate/gateway/${receiptReference}/complete`,
      null,
      {
        headers,
      },
    );
  });

  test('GIVEN valid request WHEN confirm card payment and payment api fails THEN should throw correct exception', async () => {
    const expectedError = { message: 'something bad', data: 'test' };
    axiosRetryClientForPaymentErrors.put.mockRejectedValue(expectedError);

    await expect(
      paymentGateway.confirmCardPaymentIsComplete('any reference', userId, personReference),
    ).rejects.toEqual(expectedError);
  });

  test('GIVEN valid request WHEN request refund payment THEN should call payment api and receive valid response', async () => {
    const validAxiosResponse = {
      status: 200,
      data: Candidate.BatchPaymentRefundResponse.$serializedExample(),
    };
    mockedAxios.post.mockResolvedValue(validAxiosResponse);

    const response = paymentGateway.requestRefund(Candidate.BatchRefundPayload.$example(), userId, personReference);

    await expect(response).resolves.toEqual(Candidate.BatchPaymentRefundResponse.$example());
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      `${mockPaymentsUrl}/api/v1/candidate/refund`,
      Candidate.BatchRefundPayload.$serializedExample(),
      {
        headers,
      },
    );
  });

  test('GIVEN valid request WHEN request refund payment and payment api fails THEN should throw correct exception', async () => {
    const expectedError = { message: 'something bad' };
    mockedAxios.post.mockRejectedValue(expectedError);

    await expect(
      paymentGateway.requestRefund(Candidate.BatchRefundPayload.$example(), userId, personReference),
    ).rejects.toEqual(expectedError);
  });

  test('GIVEN valid request WHEN recognise income THEN should call payment api successfully', async () => {
    const validAxiosResponse = {
      status: 204,
    };
    mockedAxios.post.mockResolvedValue(validAxiosResponse);

    const response = paymentGateway.recogniseIncome(Finance.RecogniseIncomePayload.$example(), userId, personReference);

    await expect(response).resolves.toBeUndefined();
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      `${mockPaymentsUrl}/api/v1/finance/recognitions`,
      Finance.RecogniseIncomePayload.$example(),
      {
        headers,
      },
    );
  });

  test('GIVEN valid request WHEN error http response THEN should throw correct exception', async () => {
    const validAxiosResponse = {
      status: 500,
      statusText: 'msg',
    };
    mockedAxios.post.mockResolvedValue(validAxiosResponse);

    await expect(
      paymentGateway.recogniseIncome(Finance.RecogniseIncomePayload.$example(), userId, personReference),
    ).rejects.toEqual(new Error('HTTP request error - 500: msg'));

    expect(mockedAxios.post).toHaveBeenCalledWith(
      `${mockPaymentsUrl}/api/v1/finance/recognitions`,
      {
        bookingProductId: '9a0bd3da-394c-42d4-9565-443526450126',
      },
      {
        headers,
      },
    );
    expect(logger.event).toHaveBeenCalledWith(
      BusinessTelemetryEvents.PAYMENT_INCOME_FAIL,
      'PaymentApiClient::recogniseIncome: Failed to recognise income',
      {
        bookingProductId: '9a0bd3da-394c-42d4-9565-443526450126',
      },
    );
  });

  test('GIVEN valid request WHEN recognise income and payment api fails THEN should throw correct exception', async () => {
    const expectedError = { message: 'something bad' };
    mockedAxios.post.mockRejectedValue(expectedError);

    await expect(
      paymentGateway.recogniseIncome(Finance.RecogniseIncomePayload.$example(), userId, personReference),
    ).rejects.toEqual(expectedError);
  });

  test('GIVEN valid request WHEN compensate booking THEN call payment api successfully', async () => {
    mockedAxios.post.mockResolvedValue({ status: 200 });

    await paymentGateway.compensateBooking(
      {
        compensatedBookingProductId: 'mockCompensatedBookingProductId',
        newBookingProductId: 'mockNewBookingProductId',
      }, userId, personReference,
    );

    expect(mockedAxios.post).toHaveBeenCalledWith(
      `${mockPaymentsUrl}/api/v1/finance/compensation-booking`,
      {
        compensatedBookingProductId: 'mockCompensatedBookingProductId',
        newBookingProductId: 'mockNewBookingProductId',
      },
      {
        headers,
      },
    );
    expect(logger.event).toHaveBeenCalledWith(
      BusinessTelemetryEvents.PAYMENT_COMPENSATION_SUCCESS,
      'PaymentApiClient::compensateBooking: Finished Successfully',
      {
        compensatedBookingProductId: 'mockCompensatedBookingProductId',
        newBookingProductId: 'mockNewBookingProductId',
      },
    );
  });

  test('GIVEN valid request WHEN payment api fails THEN log an event', async () => {
    mockedAxios.post.mockRejectedValue({ status: 500 });

    await expect(paymentGateway.compensateBooking(
      {
        compensatedBookingProductId: 'mockCompensatedBookingProductId',
        newBookingProductId: 'mockNewBookingProductId',
      }, userId, personReference,
    ))
      .rejects
      .toStrictEqual({
        status: 500,
      });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      `${mockPaymentsUrl}/api/v1/finance/compensation-booking`,
      {
        compensatedBookingProductId: 'mockCompensatedBookingProductId',
        newBookingProductId: 'mockNewBookingProductId',
      },
      {
        headers,
      },
    );
    expect(logger.event).toHaveBeenCalledWith(
      BusinessTelemetryEvents.PAYMENT_COMPENSATION_FAIL,
      'PaymentApiClient::compensateBooking: Failed to compensate booking',
      {
        compensatedBookingProductId: 'mockCompensatedBookingProductId',
        newBookingProductId: 'mockNewBookingProductId',
      },
    );
  });
});
