import MockDate from 'mockdate';
import Dayjs from 'dayjs';
import { DateInput, today, tomorrow } from '../../../src/domain/date-input';

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
      ['30', '6', '20'],
      ['01', '2', '20'],
      ['1', '02', '2020'],
    ])('%s-%s-%s', (day, month, year) => {
      const source = { day, month, year };

      const date = DateInput.of(source);

      expect(date).toBeInstanceOf(DateInput);
    });
  });

  describe('isAfter', () => {
    test('dates after \'today\' return true', () => {
      const date = Dayjs('2021-09-03');
      const dateInput = new DateInput(date);

      expect(dateInput.isAfter(Dayjs('2020-01-01'))).toBe(true);
    });

    test('dates before \'today\' return false', () => {
      const date = Dayjs('1999-09-03');
      const dateInput = new DateInput(date);

      expect(dateInput.isAfter(Dayjs('2020-01-01'))).toBe(false);
    });

    test('today\'s date returns false when checking today', () => {
      const date = Dayjs('2020-01-01');
      const dateInput = new DateInput(date);

      expect(dateInput.isAfter(Dayjs('2020-01-01'))).toBe(false);
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

      expect(() => DateInput.of(source)).toThrow('dateNotValid');
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

      expect(() => DateInput.of(source)).toThrow('dateInPast');
    });
  });

  test('todays date throws a dateIsTodayOrTomorrow error', () => {
    const source = { day: '01', month: '01', year: '2020' };
    expect(() => DateInput.of(source)).toThrow('dateIsTodayOrTomorrow');
  });

  test('tomorrows date throws a dateIsTodayOrTomorrow error', () => {
    const source = { day: '02', month: '01', year: '2020' };
    expect(() => DateInput.of(source)).toThrow('dateIsTodayOrTomorrow');
  });

  describe('dates beyond 6 months throw error', () => {
    test.each([
      ['1', '7', '20'],
      ['2', '7', '20'],
      ['28', '07', '2020'],
      ['20', '3', '2050'],
      ['01', '01', '2021'],
    ])('%s-%s-%s', (day, month, year) => {
      const source = { day, month, year };

      expect(() => DateInput.of(source)).toThrow('dateBeyond6Months');
    });
  });

  describe('date helpers', () => {
    test('start of today helper', () => {
      const date = today().toISOString();

      expect(date).toStrictEqual('2020-01-01T00:00:00.000Z');
    });

    test('start of tomorrow helper', () => {
      const date = tomorrow().toISOString();

      expect(date).toStrictEqual('2020-01-02T00:00:00.000Z');
    });
  });
});
