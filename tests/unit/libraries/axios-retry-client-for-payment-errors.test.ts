// Using nock to intercept http calls with mock response
import nock from 'nock';
import MockDate from 'mockdate';
import { mocked } from 'ts-jest/utils';
import { AxiosRetryClientForPaymentErrors } from '../../../src/libraries/axios-retry-client-for-payment-errors';
import { RetryPolicy } from '../../../src/config';
import {
  calculateRetryDelay, is429Error, isGatewayError, isSystemError,
} from '../../../src/libraries/axios-retry-client-helper';

jest.mock('../../../src/libraries/axios-retry-client-helper');
const mockedcalculateRetryDelay = mocked(calculateRetryDelay, true);
const mockedIs429Error = mocked(is429Error, true);
const mockedIsGatewayError = mocked(isGatewayError, true);
const mockedIsSystemError = mocked(isSystemError, true);

describe('AxiosRetryClient', () => {
  const mockUrl = 'https://mock-payment-api.com';
  const mockEndpoint = '/make-a-payment';

  const axiosSuccessResponse = expect.objectContaining({ status: 200 });
  const axiosError = (status: number) => new Error(`Request failed with status code ${status}`);

  let setTimeoutSpy: jest.SpyInstance;
  let axiosRetryClientForPaymentErrors: AxiosRetryClientForPaymentErrors;
  let retryPolicy: RetryPolicy;

  beforeEach(() => {
    // Override setTimeout so it doesn't actually perform delay in tests
    // But can capture delay value passed to it
    setTimeoutSpy = jest
      .spyOn(global, 'setTimeout')
      .mockImplementation((handler: TimerHandler) => (typeof handler === 'function' ? handler() as number : -1));

    MockDate.set('Fri, 4 Dec 2020 11:00:00 GMT'); // Mock Date.now()

    retryPolicy = {
      maxRetries: 3,
      defaultRetryDelay: 300,
      maxRetryAfter: 1000,
      exponentialBackoff: false,
    };

    axiosRetryClientForPaymentErrors = new AxiosRetryClientForPaymentErrors(retryPolicy);
  });

  afterEach(() => {
    MockDate.reset();
    nock.cleanAll();
    jest.resetAllMocks();
  });

  describe('given a 200 success response', () => {
    test('resolves the request', async () => {
      nock(mockUrl)
        .post(mockEndpoint)
        .reply(200);

      const promise = axiosRetryClientForPaymentErrors.getClient().post(mockUrl + mockEndpoint);

      await expect(promise).resolves.toStrictEqual(axiosSuccessResponse);
    });
  });

  describe('given a non-retryable error response', () => {
    test('throws the error without any retries for a 400 bad-request', async () => {
      nock(mockUrl)
        .post(mockEndpoint)
        .reply(400);

      const promise = axiosRetryClientForPaymentErrors.getClient().post(mockUrl + mockEndpoint);

      await expect(promise).rejects.toThrow(axiosError(400));
    });

    test('throws the error without any retries for a 500 gateway error', async () => {
      nock(mockUrl)
        .post(mockEndpoint)
        .reply(500);

      mockedIsGatewayError.mockReturnValue(true);

      const promise = axiosRetryClientForPaymentErrors.getClient().post(mockUrl + mockEndpoint);

      await expect(promise).rejects.toThrow(axiosError(500));
    });

    test('throws the error without any retries for a 500 system error', async () => {
      nock(mockUrl)
        .post(mockEndpoint)
        .reply(500);

      mockedIsSystemError.mockReturnValue(true);

      const promise = axiosRetryClientForPaymentErrors.getClient().post(mockUrl + mockEndpoint);

      await expect(promise).rejects.toThrow(axiosError(500));
    });
  });

  describe('given a retryable 5xx error response', () => {
    test('retries up to max 3 times and then throws the error', async () => {
      const scope = nock(mockUrl)
        .post(mockEndpoint)
        .times(4) // Mock 4 calls, the first then 3 retries
        .reply(503);

      mockedcalculateRetryDelay.mockReturnValue(30);
      const promise = axiosRetryClientForPaymentErrors.getClient().post(mockUrl + mockEndpoint);

      await expect(promise).rejects.toThrow(axiosError(503));
      expect(scope.isDone()).toBe(true); // True if all 4 calls were made
    });

    test('delays by the default amount between each retry without exponential backoff', async () => {
      nock(mockUrl)
        .post(mockEndpoint)
        .times(4)
        .reply(503);

      mockedcalculateRetryDelay.mockReturnValue(300);
      const promise = axiosRetryClientForPaymentErrors.getClient().post(mockUrl + mockEndpoint);

      await expect(promise).rejects.toThrow(axiosError(503));
      expect(setTimeoutSpy.mock.calls).toEqual(
        Array(3).fill([expect.any(Function), retryPolicy.defaultRetryDelay]),
      );
    });

    test('delays by the default amount between each retry with exponential backoff', async () => {
      retryPolicy.exponentialBackoff = true;
      axiosRetryClientForPaymentErrors = new AxiosRetryClientForPaymentErrors(retryPolicy);

      nock(mockUrl)
        .post(mockEndpoint)
        .times(4)
        .reply(503);

      mockedcalculateRetryDelay.mockReturnValueOnce(300);
      mockedcalculateRetryDelay.mockReturnValueOnce(600);
      mockedcalculateRetryDelay.mockReturnValueOnce(900);
      const promise = axiosRetryClientForPaymentErrors.getClient().post(mockUrl + mockEndpoint);

      await expect(promise).rejects.toThrow(axiosError(503));
      expect(setTimeoutSpy.mock.calls).toEqual(
        [
          [expect.any(Function), retryPolicy.defaultRetryDelay],
          [expect.any(Function), 2 * retryPolicy.defaultRetryDelay],
          [expect.any(Function), 3 * retryPolicy.defaultRetryDelay],
        ],
      );
    });

    test('resolves if one of the retries succeeds', async () => {
      nock(mockUrl)
        .post(mockEndpoint)
        .reply(500) // Initial call
        .post(mockEndpoint)
        .reply(500) // First retry
        .post(mockEndpoint)
        .reply(200); // Second retry

      mockedcalculateRetryDelay.mockReturnValue(30);
      const promise = axiosRetryClientForPaymentErrors.getClient().post(mockUrl + mockEndpoint);

      await expect(promise).resolves.toStrictEqual(axiosSuccessResponse);
    });
  });

  describe('given a retryable connection error', () => {
    test('retries up to max 3 times and then throws the error', async () => {
      const mockNetworkError = new Error('Node connection error');
      mockNetworkError.code = 'ECONNRESET';
      const scope = nock(mockUrl)
        .post(mockEndpoint)
        .times(4)
        .replyWithError(mockNetworkError);

      mockedcalculateRetryDelay.mockReturnValue(30);
      const promise = axiosRetryClientForPaymentErrors.getClient().post(mockUrl + mockEndpoint);

      await expect(promise).rejects.toThrow(mockNetworkError);
      expect(scope.isDone()).toBe(true);
    });
  });

  describe('given a retryable 429 error response', () => {
    describe('with Retry-After header in seconds', () => {
      test('delays by the parsed amount before retrying', async () => {
        nock(mockUrl)
          .post(mockEndpoint)
          .reply(429, '429 Error', {
            'Retry-After': '0.5',
          })
          .post(mockEndpoint)
          .reply(200);

        mockedcalculateRetryDelay.mockReturnValue(500);
        mockedIs429Error.mockReturnValue(true);
        const promise = axiosRetryClientForPaymentErrors.getClient().post(mockUrl + mockEndpoint);

        await expect(promise).resolves.toStrictEqual(axiosSuccessResponse);
        expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
        expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 500);
      });
    });

    describe('with Retry-After header in http datetime format', () => {
      test('delays by the parsed amount before retrying', async () => {
        nock(mockUrl)
          .post(mockEndpoint)
          .reply(429, '429 Error', {
            'Retry-After': 'Fri, 4 Dec 2020 11:00:01 GMT', // 1 second after mock Date.now()
          })
          .post(mockEndpoint)
          .reply(200);

        mockedcalculateRetryDelay.mockReturnValue(1000);
        mockedIs429Error.mockReturnValue(true);
        const promise = axiosRetryClientForPaymentErrors.getClient().post(mockUrl + mockEndpoint);

        await expect(promise).resolves.toStrictEqual(axiosSuccessResponse);
        expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
        expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 1000);
      });
    });

    describe('with no Retry-After header', () => {
      test('delays by the default amount before retrying', async () => {
        nock(mockUrl)
          .post(mockEndpoint)
          .reply(429)
          .post(mockEndpoint)
          .reply(200);

        mockedcalculateRetryDelay.mockReturnValue(300);
        mockedIs429Error.mockReturnValue(true);
        const promise = axiosRetryClientForPaymentErrors.getClient().post(mockUrl + mockEndpoint);

        await expect(promise).resolves.toStrictEqual(axiosSuccessResponse);
        expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
        expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), retryPolicy.defaultRetryDelay);
      });
    });

    describe('if the Retry-After value is greater than the maximum allowed', () => {
      test('rethrows the error without retrying', async () => {
        nock(mockUrl)
          .post(mockEndpoint)
          .reply(429, '429 Error', {
            'Retry-After': '5', // 5 seconds > maxRetryAfter
          });

        const promise = axiosRetryClientForPaymentErrors.getClient().post(mockUrl + mockEndpoint);

        await expect(promise).rejects.toThrow(axiosError(429));
      });
    });
  });
});
