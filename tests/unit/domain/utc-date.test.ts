import dayjs from 'dayjs';
import { UtcDate, toISODateString } from '../../../src/domain/utc-date';

describe('UtcDate', () => {
  describe('subtractBusinessDays returns the correct date', () => {
    describe('3 days before', () => {
      const threeBusinessDaysBefore: Array<[string, string, string]> = [
        ['February 16, 2020 23:15:30 GMT+01:00', '2020-02-11', 'given a date on Sunday'],
        ['May 03, 2020', '28 April 2020', 'given a date on Sunday at the beginning of a month'],
        ['2020-02-29', '2020-02-25', 'given a date on Saturday'],
        ['2020-02-01', '2020-01-28', 'given a date on Saturday at the beginning of a month'],
        ['February 7, 2020', '2020-02-03', 'given a date on Friday'],
        ['2020-05-14', '2020-05-08', 'given a date on Thursday'],
        ['2020-05-13', '2020-05-07', 'given a date on Wednesday'],
        ['2020-05-12', '2020-05-06', 'given a date on Tuesday'],
        ['2020-05-11', '2020-05-05', 'given a date on Monday']];

      threeBusinessDaysBefore.forEach((entry) => {
        test(`${entry[2]}`, () => {
          expect(new UtcDate(new Date(entry[0])).subtractBusinessDays(3)).toStrictEqual(UtcDate.of(entry[1]));
        });
      });
    });
  });

  describe('isValidIsoTimeStamp', () => {
    test('returns true if the date is valid', () => {
      expect(UtcDate.isValidIsoTimeStamp('2020-07-30T09:00:00.000Z')).toEqual(true);
    });

    test('returns false if the date is invalid', () => {
      expect(UtcDate.isValidIsoTimeStamp('2020-07-32T09:00:00.000Z')).toEqual(false);
    });

    test('returns false if the date format is incorrect', () => {
      expect(UtcDate.isValidIsoTimeStamp('2020/07/30')).toEqual(false);
    });

    test('returns false if the date is missing time', () => {
      expect(UtcDate.isValidIsoTimeStamp('2020-07-30')).toEqual(false);
    });
  });

  describe('isValidIsoDateString', () => {
    test('returns true if the date is valid', () => {
      expect(UtcDate.isValidIsoDateString('2020-07-30')).toEqual(true);
    });

    test('returns false if the date is invalid', () => {
      expect(UtcDate.isValidIsoDateString('2020-07-32')).toEqual(false);
    });

    test('returns false if the date format is incorrect', () => {
      expect(UtcDate.isValidIsoDateString('2020/07/30')).toEqual(false);
    });
  });

  describe('toISODateString', () => {
    test('returns toISODateString if YYYY-MM-DD datejs is passed to it', () => {
      const globalDate = dayjs('2020-11-16');
      expect(toISODateString(globalDate)).toEqual('2020-11-16');
    });

    test('returns toISODateString if YYYY-MM-DDT HH:MM:SS:MS dayjs is passed to it', () => {
      const globalDate = dayjs('2020-07-30T09:00:00.000Z');
      expect(toISODateString(globalDate)).toEqual('2020-07-30');
    });

    test('returns Invalid if the day js date is invalid', () => {
      const globalDate = dayjs('2020-07-33T09:00:00.000Z');
      expect(toISODateString(globalDate)).toEqual('Invalid Date');
    });
  });
});
