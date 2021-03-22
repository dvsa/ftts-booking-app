import { VisibleMonths } from '../../../../src/pages/choose-appointment/visible-months';

describe('Visible Months', () => {
  describe('can not be constructed when the date string', () => {
    const invalidDates: Array<[string, string]> = [
      ['13/12/13', 'is in the format mm/dd/yy with an invalid month'],
      ['gh-aa-bb', 'has values that are not integers'],
      ['10--', 'has empty values'],
      ['2050-33-13', 'is not a valid date']];

    invalidDates.forEach((invalidInput) => {
      test(invalidInput[1], () => {
        expect(() => {
          VisibleMonths.isValid(invalidInput[0]);
        }).toThrow();
      });
    });
  });

  test('can be constructed', () => {
    const visibleMonths = VisibleMonths.of('02-27-2040');

    expect(visibleMonths.firstDay().toIsoDate()).toBe('2040-02-01');
    expect(visibleMonths.lastDay().toIsoDate()).toBe('2040-03-31');
  });

  test('can be constructed with first day of month', () => {
    const today = new Date();
    const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    expect(VisibleMonths.isValid(firstDayOfLastMonth.toDateString())).toBeTruthy();
  });

  test('can not be constructed with the last day of last month', () => {
    const today = new Date();
    const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 0);

    expect(() => {
      VisibleMonths.isValid(lastDayOfLastMonth.toDateString());
    }).toThrow();
  });
});
