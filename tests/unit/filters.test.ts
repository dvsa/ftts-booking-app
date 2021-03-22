import MockDate from 'mockdate';
import config from '../../src/config';
import { CurrencyFilter as currencyFilters } from '../../src/nunjucks-filters/currency-filter';
import { ErrorFilter as errorFilters } from '../../src/nunjucks-filters/error-filter';
import { DistanceFilter } from '../../src/nunjucks-filters/distance-filter';
import {
  asFullDateWithoutWeekday, asFullDateWithWeekday, asLocalTime, asShortDateNoDelimiters, toStartOfDay,
} from '../../src/nunjucks-filters/local-date-time-filter';

describe('Nunjucks custom date/time dateTimeFilters tests', () => {
  describe('asShortDateNoDelimiters', () => {
    test('returns the date in the format "08 11 2018" given an ISO datetime string', () => {
      const isoDateString = '2018-11-08T10:00:56Z';
      expect(asShortDateNoDelimiters(isoDateString)).toBe('08 11 2018');
    });
  });

  describe('asLocalTime', () => {
    test('returns the local time in the format "5:30pm" given an ISO datetime string', () => {
      const isoDateString = '2018-11-08T17:30:56Z';
      expect(asLocalTime(isoDateString)).toBe('5:30pm');
    });
  });

  describe('asFullDateWithWeekday', () => {
    test('returns the date in the format "Thursday 8 November 2018" given an ISO datetime string', () => {
      const isoDateString = '2018-11-08T10:00:56Z';
      expect(asFullDateWithWeekday(isoDateString)).toBe('Thursday 8 November 2018');
    });
  });

  describe('asFullDateWithoutWeekday', () => {
    test('returns the date in the format "8 November 2018" given an ISO datetime string', () => {
      const isoDateString = '2018-11-08T10:00:56Z';
      expect(asFullDateWithoutWeekday(isoDateString)).toBe('8 November 2018');
    });
  });
});

describe('Nunjucks custom errors filter tests', () => {
  test('existsAsAnErrorIn return false when errors is undefined', () => {
    const fieldName = 'name';
    expect(errorFilters.existsAsAnErrorIn(fieldName, undefined)).toStrictEqual(false);
  });

  test('existsAsAnErrorIn return true when field has an error', () => {
    const fieldName = 'name';
    const errors = [{
      location: 'body',
      param: 'name',
      msg: 'name is required',
      value: '',
    }];
    expect(errorFilters.existsAsAnErrorIn(fieldName, errors)).toStrictEqual(true);
  });

  test('existsAsAnErrorIn return false when field has no errors', () => {
    const fieldName = 'name';
    const errors = [{}];
    expect(errorFilters.existsAsAnErrorIn(fieldName, errors as any)).toStrictEqual(false);
  });

  test('fieldErrorMessage return empty string when errors is undefined', () => {
    const fieldName = 'name';
    expect(errorFilters.fieldErrorMessage(fieldName, undefined)).toStrictEqual('');
  });

  test('fieldErrorMessage return empty string when no errors for param', () => {
    const fieldName = 'name';
    const errors = [{
      location: 'body',
      param: 'anotherParam',
      msg: 'name is required',
      value: '',
    }];
    expect(errorFilters.fieldErrorMessage(fieldName, errors)).toStrictEqual('');
  });

  test('fieldErrorMessage returns error message of field', () => {
    const fieldName = 'name';
    const errors = [{
      location: 'body',
      param: 'name',
      msg: 'name is required',
      value: '',
    }];
    expect(errorFilters.fieldErrorMessage(fieldName, errors)).toStrictEqual('name is required');
  });

  test('fieldErrorMessage returns empty string if error message empty', () => {
    const fieldName = 'name';
    const errors = [{
      location: 'body',
      param: 'name',
      msg: '',
      value: '',
    }];
    expect(errorFilters.fieldErrorMessage(fieldName, errors)).toStrictEqual('');
  });

  test('fieldErrorObject returns error object of field', () => {
    const fieldName = 'name';
    const errors = [{
      location: 'body',
      param: 'name',
      msg: 'name is required',
      value: '',
    }];
    expect(errorFilters.fieldErrorObject(fieldName, errors)).toStrictEqual({ text: 'name is required' });
  });

  test('fieldErrorObject returns undefined if error message empty', () => {
    const fieldName = 'name';
    const errors = [{
      location: 'body',
      param: 'name',
      msg: '',
      value: '',
    }];
    expect(errorFilters.fieldErrorObject(fieldName, errors)).toStrictEqual(undefined);
  });

  test('fieldErrorObject returns undefined if errors is undefined', () => {
    const fieldName = 'name';
    expect(errorFilters.fieldErrorObject(fieldName, undefined)).toStrictEqual(undefined);
  });
});

describe('Nunjucks custom currency filters', () => {
  test('toTwoDecimalPlaces returns a decimal number, from an integer', () => {
    const num = 23;
    expect(currencyFilters.toTwoDecimalPlaces(num)).toStrictEqual('23.00');
  });

  test('toTwoDecimalPlaces returns the same decimal number, from a decimal number', () => {
    const num = 23.30;
    expect(currencyFilters.toTwoDecimalPlaces(num)).toStrictEqual('23.30');
  });

  test('withCurrencyCode returns a string in format "<currencyCode><number>", from a number', () => {
    const num = 23;
    expect(currencyFilters.withCurrencyCode(num)).toStrictEqual(`${config.currencyCode}23`);
  });

  test('withCurrencySymbol returns a string in format "<currencySymbol><number>", from a number', () => {
    const num = 23;
    expect(currencyFilters.withCurrencySymbol(num)).toStrictEqual(`${config.currencySymbol}23`);
  });
});

describe('Nunjucks distance filter', () => {
  describe('formatDistance', () => {
    test('converts to 1 decimal place for values less than 10', () => {
      const distance = 0.4743545232;
      expect(DistanceFilter.formatDistance(distance)).toStrictEqual('0.5');
    });

    test('converts to 0 decimal place for values larger than 10', () => {
      const distance = 11.43873423;
      expect(DistanceFilter.formatDistance(distance)).toStrictEqual('11');
    });

    test('removes trailing zeros for values less than 10', () => {
      const distance = 9.00;
      expect(DistanceFilter.formatDistance(distance)).toStrictEqual('9');
    });
  });

  describe('milesToKilometres', () => {
    test('converts miles to kilometres', () => {
      const distanceInMiles = 11.43873423;
      const expectedDistanceInKm = 18.40492337607;

      const result = DistanceFilter.milesToKilometres(distanceInMiles);

      expect(result).toStrictEqual(expectedDistanceInKm);
    });
  });

  describe('converts to start of day', () => {
    test('date is converted to start of day', () => {
      MockDate.set('2020-11-11T14:30:45.979Z');
      const time = '2020-12-15T11:45:00.000Z';

      expect(toStartOfDay(time)).toStrictEqual('2020-12-15T00:00:00.000Z');

      MockDate.reset();
    });
  });
});
