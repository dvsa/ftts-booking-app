import { UtcDate } from '../../../src/domain/utc-date';

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
        test(entry[2], () => {
          expect(new UtcDate(new Date(entry[0])).subtractBusinessDays(3)).toStrictEqual(UtcDate.of(entry[1]));
        });
      });
    });
  });
});
