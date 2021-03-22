import MockDate from 'mockdate';
import { DateInput } from '../../../../src/pages/select-date/date-input';

describe('Date Input', () => {
  beforeEach(() => {
    MockDate.set('2020-01-01'); // Set fixed date for 'today'
  });

  afterEach(() => {
    MockDate.reset();
  });

  describe('can be constructed from valid inputs', () => {
    test.each([
      ['01', '02', '2020'],
      ['1', '7', '20'],
      ['01', '2', '20'],
      ['1', '02', '2020'],
    ])('%s-%s-%s', (day, month, year) => {
      const source = { day, month, year };

      const date = DateInput.of(source);

      expect(date).toBeInstanceOf(DateInput);
    });
  });

  describe('invalid dates throw error', () => {
    test.each([
      ['0', '02', '20'],
      ['1', 'ha', '2020'],
      ['20', '14', '20'],
      ['32', '01', '2020'],
    ])('%s-%s-%s', (day, month, year) => {
      const source = { day, month, year };

      expect(() => DateInput.of(source)).toThrowError('dateNotValid');
    });
  });

  describe('dates in the past throw a dateInPast error', () => {
    test.each([
      ['31', '12', '19'],
      ['13', '04', '1999'],
      ['20', '3', '2019'],
      ['01', '01', '2015'],
    ])('%s-%s-%s', (day, month, year) => {
      const source = { day, month, year };

      expect(() => DateInput.of(source)).toThrowError('dateInPast');
    });
  });

  test('todays date throws a dateIsToday error', () => {
    const source = { day: '01', month: '01', year: '2020' };
    expect(() => DateInput.of(source)).toThrowError('dateIsToday');
  });

  describe('dates beyond 6 months throw error', () => {
    test.each([
      ['2', '7', '20'],
      ['28', '07', '2020'],
      ['20', '3', '2050'],
      ['01', '01', '2021'],
    ])('%s-%s-%s', (day, month, year) => {
      const source = { day, month, year };

      expect(() => DateInput.of(source)).toThrowError('dateBeyond6Months');
    });
  });
});
