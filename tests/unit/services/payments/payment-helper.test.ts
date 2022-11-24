import { Booking } from '../../../../src/domain/booking/booking';
import { Target } from '../../../../src/domain/enums';
import { buildPaymentRefundPayload, buildPaymentReference } from '../../../../src/services/payments/payment-helper';
import { Candidate } from '../../../../src/services/session';
import { mockManageBooking, mockRefundPayload } from '../../../mocks/data/manage-bookings';
import { mockSessionCandidate } from '../../../mocks/data/session-types';

jest.mock('dayjs', () => () => ({
  format: () => '202126151105',
}));
jest.mock('uuid', () => ({
  v4: () => '362f46fe-4a95-4c32-8620-084c65e37d5b',
}));

describe('Payment helper', () => {
  let mockCandidate: Candidate;
  let mockBooking: Booking;
  beforeEach(() => {
    mockCandidate = mockSessionCandidate();
    mockBooking = new Booking(mockManageBooking());
  });

  describe('buildPaymentReference', () => {
    test('generates a payment reference number in the correct format', () => {
      const result = buildPaymentReference(27);
      expect(result).toBe('FTT37D5B202126151105');
    });
  });

  describe('buildPaymentRefundPayload', () => {
    test('correctly builds payment payload needed in the correct format', () => {
      const payloadResult = buildPaymentRefundPayload(mockCandidate, mockBooking, Target.GB);

      expect(payloadResult).toStrictEqual(mockRefundPayload());
    });
  });
});
