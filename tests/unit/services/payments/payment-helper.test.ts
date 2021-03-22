import { buildPaymentReference } from '../../../../src/services/payments/payment-helper';

jest.mock('dayjs', () => () => ({
  format: () => '202126151105',
}));
jest.mock('uuid', () => ({
  v4: () => '362f46fe-4a95-4c32-8620-084c65e37d5b',
}));

describe('Payment helper', () => {
  describe('buildPaymentReference', () => {
    test('generates a payment reference number in the correct format', () => {
      const result = buildPaymentReference(27);
      expect(result).toBe('FTT-37D5B-202126151105');
    });
  });
});
