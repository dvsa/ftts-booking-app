import { hasSlotsKpis } from '../../../../src/services/scheduling/scheduling-helper';
import { Booking } from '../../../../src/services/session';

describe('Scheduling Helper', () => {
  describe('hasSlotsKpis', () => {
    test.each([
      [
        'all 3 values have been set',
        {
          dateAvailableOnOrAfterPreferredDate: 'mock-date',
          dateAvailableOnOrAfterToday: 'mock-date',
          dateAvailableOnOrBeforePreferredDate: 'mock-date',
        },
        true,
      ],
      [
        'dateAvailableOnOrAfterPreferredDate not set',
        {
          dateAvailableOnOrAfterToday: 'mock-date',
          dateAvailableOnOrBeforePreferredDate: 'mock-date',
        },
        false,
      ],
      [
        'dateAvailableOnOrAfterToday not set',
        {
          dateAvailableOnOrAfterPreferredDate: 'mock-date',
          dateAvailableOnOrBeforePreferredDate: 'mock-date',
        },
        false,
      ],
      [
        'dateAvailableOnOrBeforePreferredDate not set',
        {
          dateAvailableOnOrAfterPreferredDate: 'mock-date',
          dateAvailableOnOrAfterToday: 'mock-date',
        },
        false,
      ],
      [
        'all kpis missing',
        {},
        false,
      ],
    ])('%s', (description: string, booking: Booking, result: boolean) => {
      expect(hasSlotsKpis(booking)).toEqual(result);
    });
  });
});
