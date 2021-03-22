import { FutureBookingDate } from '../../../../src/domain/future-booking-date';

describe('Future Booking Date', () => {
  describe('can not be constructed when the date string', () => {
    const invalidDates: Array<[string, string]> = [
      ['13/12/13', 'is in the format mm/dd/yy with an invalid month'],
      ['gh-aa-bb', 'has values that are not integers'],
      ['10--', 'has empty values'],
      ['01-08-2019', 'is a date in the past'],
      ['2050-33-13', 'is not a valid date']];

    invalidDates.forEach((invalidInput) => {
      test(invalidInput[1], () => {
        expect(() => {
          FutureBookingDate.isValid(invalidInput[0]);
        }).toThrow();
      });
    });
  });

  test('can be constructed', () => {
    expect(FutureBookingDate.isValid('12-08-2040')).toBe(true);
  });

  test('can be constructed with today\'s date', () => {
    expect(FutureBookingDate.isValid(new Date().toDateString())).toBe(true);
  });

  test('construction removes time', () => {
    expect(FutureBookingDate.of('2040-12-08T01:01:01.001Z').toIsoTimeStamp()).toBe('2040-12-08T00:00:00.000Z');
  });

  test('toIsoTimeStamp returns a string containing an ISO formatted timestamp', () => {
    expect(FutureBookingDate.of('12-08-2040').toIsoTimeStamp()).toBe('2040-12-08T00:00:00.000Z');
  });

  test('offset dates are normalised to UTC', () => {
    expect(FutureBookingDate.of('2040-12-08T05:00:01.001+01:00').toIsoTimeStamp()).toBe('2040-12-08T00:00:00.000Z');
  });

  test('toIsoDate returns a string containing an ISO formatted Date', () => {
    expect(FutureBookingDate.of('12-08-2040').toIsoDate()).toBe('2040-12-08');
  });
});
