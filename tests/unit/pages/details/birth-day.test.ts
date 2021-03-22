import { BirthDay } from '../../../../src/pages/details/birth-day';
import { BirthMonth } from '../../../../src/pages/details/birth-month';
import { BirthYear } from '../../../../src/pages/details/birth-year';

describe('Birth Day', () => {
  const y2000: BirthYear = new BirthYear('2000');
  const jan2000: BirthMonth = new BirthMonth('01', y2000);
  const feb2000: BirthMonth = new BirthMonth('02', y2000);
  const apr2000: BirthMonth = new BirthMonth('04', y2000);
  const y2001: BirthYear = new BirthYear('2001');
  const feb2001: BirthMonth = new BirthMonth('02', y2001);

  test('is always between 1 and the last day of month', () => {
    expect(() => new BirthDay('0', jan2000)).toThrow();
    expect(new BirthDay('1', jan2000)).toBeTruthy();
    expect(() => new BirthDay('32', jan2000)).toThrow();
    expect(new BirthDay('31', jan2000)).toBeTruthy();
    expect(() => new BirthDay('30', feb2000)).toThrow();
    expect(new BirthDay('29', feb2000)).toBeTruthy();
    expect(() => new BirthDay('31', apr2000)).toThrow();
    expect(new BirthDay('30', apr2000)).toBeTruthy();
    expect(() => new BirthDay('29', feb2001)).toThrow();
    expect(new BirthDay('28', feb2001)).toBeTruthy();
  });

  test('is a number', () => {
    expect(() => new BirthDay('not an number', jan2000)).toThrow();
    expect(() => new BirthDay('', jan2000)).toThrow();
  });

  test('can be constructed from map', () => {
    const body = {
      dobDay: '12',
      dobMonth: '1',
      dobYear: '1994',
    };

    expect(BirthDay.of(body)).toBeTruthy();
  });

  describe('isValid', () => {
    test('is true when date is valid', () => {
      const req = {
        body: { dobDay: '3', dobMonth: '12', dobYear: '2000' },
      };
      expect(BirthDay.isValid(req.body.dobDay, { req })).toBeTruthy();
    });

    describe('is false when', () => {
      const degenerateCases: Array<[any, string]> = [
        [{ dobDay: '12', dobYear: '1994' }, 'month is missing'],
        [{ dobDay: '12', dobMonth: '12' }, 'year is missing'],
        [{ dobDay: '12', dobMonth: '', dobYear: '' }, 'there are empty values'],
        [{ dobDay: '32', dobMonth: '01', dobYear: '1990' }, 'day is out of range'],
        [{ dobDay: '10', dobMonth: '13', dobYear: '1990' }, 'month is out range'],
        [{ dobDay: '1', dobMonth: '1', dobYear: '2099' }, 'date is in the future'],
        [{ dobDay: '1', dobMonth: '1', dobYear: '1899' }, 'date is before year 1900'],
        [{ dobDay: '1', dobMonth: '1', dobYear: '1' }, 'date not in the format of day:dd month:mm year:yyyy'],
      ];

      degenerateCases.forEach((invalidInput) => {
        test(invalidInput[1], () => {
          const req = {
            body: invalidInput[0],
          };

          expect(() => {
            BirthDay.isValid(invalidInput[0].dobDay, { req });
          }).toThrow();
        });
      });
    });
  });
});
