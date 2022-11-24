import config from '../../../../src/config';
import { ALLOWED_ADDRESSES } from '../../../../src/services/egress';

jest.mock('../../../../src/config', () => ({
  crm: {
    apiUrl: 'https://mock-crm.com',
  },
  location: {
    baseUrl: 'https://mock-location-api.net',
  },
  notification: {
    baseUrl: 'https://mock-notification-api.net',
  },
  payment: {
    baseUrl: 'https://mock-payment-api.net',
  },
  scheduling: {
    baseUrl: 'https://mock-scheduling-api.net',
  },
  eligibility: {
    baseUrl: 'https://mock-eligibility-api.net',
  },
  googleAnalytics: {
    url: 'https://mock-analytics-api.net',
  },
}));

describe('egress', () => {
  beforeEach(() => {
    config.crm.apiUrl = 'mock-crm.com';
    config.location.baseUrl = 'mock-location-api.net';
    config.notification.baseUrl = 'mock-notification-api.net';
    config.payment.baseUrl = 'mock-payment-api.net';
    config.scheduling.baseUrl = 'mock-scheduling-api.net';
    config.eligibility.baseUrl = 'mock-eligibility-api.net';
    config.googleAnalytics.url = 'mock-analytics-api.net';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('ALLOWED_ADDRESSES', () => {
    test('successfully returns whitelisted urls', () => {
      expect(ALLOWED_ADDRESSES).toEqual([
        {
          host: 'mock-crm.com',
          port: 443,
        },
        {
          host: 'mock-location-api.net',
          port: 443,
        },
        {
          host: 'mock-notification-api.net',
          port: 443,
        },
        {
          host: 'mock-payment-api.net',
          port: 443,
        },
        {
          host: 'mock-scheduling-api.net',
          port: 443,
        },
        {
          host: 'mock-eligibility-api.net',
          port: 443,
        },
        {
          host: 'mock-analytics-api.net',
          port: 443,
        },
      ]);
    });
  });
});
