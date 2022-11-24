// Using nock to intercept http calls with mock response
import MockDate from 'mockdate';
import { CustomAxiosError } from '@dvsa/azure-logger/dist/interfaces';
import { AxiosError } from 'axios';
import {
  calculateRetryDelay, is429Error, isGatewayError, isSystemError, isUserCancelledError, parseRetryAfter,
} from '../../../src/libraries/axios-retry-client-helper';
import { PaymentStatus } from '../../../src/services/payments/enums';
import { RetryPolicy } from '../../../src/config';
import { logger } from '../../../src/helpers/logger';

const error: CustomAxiosError = {
  response: {
    data: 'testData',
    status: 429,
  },
};

describe('AxiosRetryClientHelper', () => {
  const mockToday = '2022-07-16T12:00:00.000Z';
  MockDate.set(mockToday); // Set mocked date/time for 'now'

  describe('is429Error', () => {
    test('if error status is equal to 429 return true', () => {
      expect(is429Error(error)).toBe(true);
    });

    test('if error status is not equal to 429 return false', () => {
      error.response = {
        data: 'testData',
        status: 600,
      };
      expect(is429Error(error)).toBe(false);
    });
  });

  describe('isUserCancelledError', () => {
    test('if error status is equal to 500 and data is user cancelled return true', () => {
      error.response = {
        data:
        { code: PaymentStatus.USER_CANCELLED },
        status: 500,
      };
      expect(isUserCancelledError(error)).toBe(true);
    });

    test('if error status is not equal to 500 and data is not user cancelled return false', () => {
      error.response = {
        data: {
          code: 'testData',
        },
        status: 600,
      };
      expect(isUserCancelledError(error)).toBe(false);
    });
  });

  describe('isGatewayError', () => {
    test('if error status is equal to 500 and data is gateway error return true', () => {
      error.response = {
        data: {
          code: PaymentStatus.GATEWAY_ERROR,
        },
        status: 500,
      };
      expect(isGatewayError(error)).toBe(true);
    });

    test('if error status is equal to 500 and data is not gateway error return false', () => {
      error.response = {
        data: {
          code: 800,
        },
        status: 500,
      };
      expect(isGatewayError(error)).toBe(false);
    });

    test('if error status is not equal to 500 and data is gateway error return false', () => {
      error.response = {
        data: {
          code: PaymentStatus.GATEWAY_ERROR,
        },
        status: 200,
      };
      expect(isGatewayError(error)).toBe(false);
    });

    test('if error status is not equal to 500 and data is not gateway error return false', () => {
      error.response = {
        data: {
          code: 800,
        },
        status: 200,
      };
      expect(isGatewayError(error)).toBe(false);
    });
  });

  describe('isSystemError', () => {
    test('if error status is equal to 500 and data is system error return true', () => {
      error.response = {
        data: {
          code: PaymentStatus.SYSTEM_ERROR,
        },
        status: 500,
      };
      expect(isSystemError(error)).toBe(true);
    });

    test('if error status is equal to 500 and data is not system error return false', () => {
      error.response = {
        data: {
          code: 800,
        },
        status: 500,
      };
      expect(isSystemError(error)).toBe(false);
    });

    test('if error status is not equal to 500 and data is system error return false', () => {
      error.response = {
        data: {
          code: PaymentStatus.SYSTEM_ERROR,
        },
        status: 200,
      };
      expect(isSystemError(error)).toBe(false);
    });

    test('if error status is not equal to 500 and data is not system error return false', () => {
      error.response = {
        data: {
          code: 800,
        },
        status: 200,
      };
      expect(isSystemError(error)).toBe(false);
    });
  });

  describe('parseRetryAfter', () => {
    test('if string of seconds is passed to parseRetryAfter', () => {
      expect(parseRetryAfter('120')).toEqual(120000);
    });

    test('if http date time is passed to parseRetryAfter', () => {
      expect(parseRetryAfter('Sun, 17 JUL 2022 22:23:32 GMT')).toEqual(123812000);
    });

    test('if http date time is passed is smaller than current date then returned undefined', () => {
      expect(parseRetryAfter('Friday, 15 JUL 2022 22:23:32 GMT')).toBeUndefined();
    });

    test('if random string is passed to parseRetryAfter', () => {
      expect(parseRetryAfter('hguyfuci')).toBeUndefined();
    });
  });

  describe('calculateRetryDelay', () => {
    const retryPolicy: RetryPolicy = {
      maxRetries: 3,
      defaultRetryDelay: 300,
      maxRetryAfter: 1000,
      exponentialBackoff: false,
    };
    const retryCount = 3;
    let axiosError: AxiosError = {
      response: {
        status: 500,
        data: 'test123',
        statusText: 'test123',
        headers: {
          'retry-after': 'test123',
        },
        config: {},
      },
      config: {},
      isAxiosError: false,
      name: '',
      message: '',
      toJSON: () => ({ test: 'Not Used' }),
    };

    test('if is429Error is equal to false', () => {
      const delay = calculateRetryDelay(retryCount, axiosError, retryPolicy);
      expect(logger.warn).toHaveBeenCalled();
      expect(delay).toEqual(300);
    });

    test('if is429Error is equal to true and retry after has a property', () => {
      axiosError = {
        response: {
          status: 429,
          data: 'test123',
          statusText: 'test123',
          headers: {
            'retry-after': 'test123',
          },
          config: {},
        },
        config: {},
        isAxiosError: false,
        name: '',
        message: '',
        toJSON: () => {
          throw new Error('Function not used.');
        },
      };
      const delay = calculateRetryDelay(retryCount, axiosError, retryPolicy);
      expect(logger.warn).toHaveBeenCalled();
      expect(delay).toEqual(300);
    });

    test('if is429Error is equal to true and retry after has no property', () => {
      axiosError = {
        response: {
          status: 429,
          data: 'test123',
          statusText: 'test123',
          headers: {},
          config: {},
        },
        config: {},
        isAxiosError: false,
        name: '',
        message: '',
        toJSON: () => {
          throw new Error('Function not used.');
        },
      };
      const delay = calculateRetryDelay(retryCount, axiosError, retryPolicy);
      expect(logger.warn).toHaveBeenCalled();
      expect(delay).toEqual(300);
    });

    test('if is429Error is equal to true retry after has a property, delay is larger than retryPolicy so error is thrown', () => {
      axiosError = {
        response: {
          status: 429,
          data: 'test123',
          statusText: 'test123',
          headers: {
            'retry-after': 'test123',
          },
          config: {},
        },
        config: {},
        isAxiosError: false,
        name: '',
        message: '',
        toJSON: () => ({ test: 'Not Used' }),
      };
      retryPolicy.defaultRetryDelay = 2000;
      expect(() => calculateRetryDelay(retryCount, axiosError, retryPolicy)).toThrow();
    });
  });
});
