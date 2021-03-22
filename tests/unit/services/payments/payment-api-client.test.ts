import { Candidate, Finance } from '@dvsa/ftts-payment-api-model';
import { mocked } from 'ts-jest/utils';
import config from '../../../../src/config';
import { PaymentApiClient } from '../../../../src/services/payments/payment-api-client';
import axiosRetryClient from '../../../../src/libraries/axios-retry-client';

jest.mock('../../../../src/libraries/axios-retry-client');
const axiosMock = mocked(axiosRetryClient, true);

const userId = '186C3777-3167-4206-8C1A-96B688A2D7FC';

describe('PaymentApiClient test', () => {
  let paymentApiClient;
  config.payment.baseUrl = 'url';
  const mockPaymentsUrl = 'payments.com/payments';
  const mockAccessToken = { value: '1234-5678' };
  const headers = {
    Authorization: `Bearer ${mockAccessToken.value}`,
    'X-FTTS-PAYMENT-USER-ID': expect.stringContaining(userId),
  };

  beforeEach(() => {
    const mockAuthClient = {
      getToken: () => mockAccessToken,
    };

    paymentApiClient = new PaymentApiClient(
      mockAuthClient as any,
      mockPaymentsUrl,
    );
  });

  afterEach(() => {
    axiosMock.post.mockClear();
    axiosMock.put.mockClear();
  });

  test('GIVEN valid request WHEN initiate card payment THEN should call payment api and receive valid response', async () => {
    const validAxiosResponse = {
      status: 200,
      data: Candidate.CardPaymentResponse.$serializedExample(),
    };
    axiosMock.post.mockResolvedValue(validAxiosResponse);

    const response = paymentApiClient.initiateCardPayment(Candidate.CardPaymentPayload.$example(), userId);

    await expect(response).resolves.toEqual(Candidate.CardPaymentResponse.$example());
    expect(axiosMock.post).toHaveBeenCalledTimes(1);
    expect(axiosMock.post).toHaveBeenCalledWith(
      `${mockPaymentsUrl}/api/v1/candidate/payment/card`,
      Candidate.CardPaymentPayload.$serializedExample(),
      {
        headers,
      },
    );
  });

  test('GIVEN valid request WHEN initiate card payment and payment api fails THEN should throw correct exception', async () => {
    const expectedError = { message: 'something bad' };
    axiosMock.post.mockRejectedValue(expectedError);

    await expect(
      paymentApiClient.initiateCardPayment(Candidate.CardPaymentPayload.$example(), userId),
    ).rejects.toEqual(expectedError);
  });

  test('GIVEN valid request WHEN confirm card payment THEN should call payment api and receive valid response', async () => {
    const receiptReference = 'reference';
    const code = 104;
    const validAxiosResponse = {
      status: 200,
      data: Candidate.CardPaymentCompletionResponse.$serializedExample(code),
    };
    axiosMock.put.mockResolvedValue(validAxiosResponse);

    const response = paymentApiClient.confirmCardPaymentIsComplete(receiptReference, userId);

    await expect(response).resolves.toEqual(Candidate.CardPaymentCompletionResponse.$example(code));
    expect(axiosMock.put).toHaveBeenCalledTimes(1);
    expect(axiosMock.put).toHaveBeenCalledWith(
      `${mockPaymentsUrl}/api/v1/candidate/gateway/${receiptReference}/complete`,
      null,
      {
        headers,
      },
    );
  });

  test('GIVEN valid request WHEN confirm card payment and payment api fails THEN should throw correct exception', async () => {
    const expectedError = { message: 'something bad' };
    axiosMock.put.mockRejectedValue(expectedError);

    await expect(
      paymentApiClient.confirmCardPaymentIsComplete('any reference', userId),
    ).rejects.toEqual(expectedError);
  });

  test('GIVEN valid request WHEN request refund payment THEN should call payment api and receive valid response', async () => {
    const validAxiosResponse = {
      status: 200,
      data: Candidate.BatchPaymentRefundResponse.$serializedExample(),
    };
    axiosMock.post.mockResolvedValue(validAxiosResponse);

    const response = paymentApiClient.requestRefund(Candidate.BatchRefundPayload.$example(), userId);

    await expect(response).resolves.toEqual(Candidate.BatchPaymentRefundResponse.$example());
    expect(axiosMock.post).toHaveBeenCalledTimes(1);
    expect(axiosMock.post).toHaveBeenCalledWith(
      `${mockPaymentsUrl}/api/v1/candidate/refund`,
      Candidate.BatchRefundPayload.$serializedExample(),
      {
        headers,
      },
    );
  });

  test('GIVEN valid request WHEN request refund payment and payment api fails THEN should throw correct exception', async () => {
    const expectedError = { message: 'something bad' };
    axiosMock.post.mockRejectedValue(expectedError);

    await expect(
      paymentApiClient.requestRefund(Candidate.BatchRefundPayload.$example(), userId),
    ).rejects.toEqual(expectedError);
  });

  test('GIVEN valid request WHEN recognise income THEN should call payment api successfully', async () => {
    const validAxiosResponse = {
      status: 204,
    };
    axiosMock.post.mockResolvedValue(validAxiosResponse);

    const response = paymentApiClient.recogniseIncome(Finance.RecogniseIncomePayload.$example(), userId);

    await expect(response).resolves.toBe(undefined);
    expect(axiosMock.post).toHaveBeenCalledTimes(1);
    expect(axiosMock.post).toHaveBeenCalledWith(
      `${mockPaymentsUrl}/api/v1/finance/recognitions`,
      Finance.RecogniseIncomePayload.$example(),
      {
        headers,
      },
    );
  });

  test('GIVEN valid request WHEN recognise income and payment api fails THEN should throw correct exception', async () => {
    const expectedError = { message: 'something bad' };
    axiosMock.post.mockRejectedValue(expectedError);

    await expect(
      paymentApiClient.recogniseIncome(Finance.RecogniseIncomePayload.$example(), userId),
    ).rejects.toEqual(expectedError);
  });
});
