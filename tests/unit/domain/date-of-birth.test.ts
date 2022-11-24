import { Meta } from 'express-validator';
import { DateOfBirth } from '../../../src/domain/date-of-birth';

describe('DateOfBirth', () => {
  describe('isValid', () => {
    describe('is true when', () => {
      const validDates: Array<{ dobDay: string; dobMonth: string; dobYear: string }> = [
        { dobDay: '01', dobMonth: '01', dobYear: '2000' },
        { dobDay: '23', dobMonth: '02', dobYear: '2000' },
        { dobDay: '17', dobMonth: '3', dobYear: '2000' },
        { dobDay: '5', dobMonth: '11', dobYear: '2020' },
        { dobDay: '29', dobMonth: '02', dobYear: '2020' }, // Leap Year
      ];

      validDates.forEach((validInput) => {
        test(`${validInput.dobDay}-${validInput.dobMonth}-${validInput.dobYear}`, () => {
          const req = {
            body: validInput,
          };
          expect(DateOfBirth.isValid(validInput.dobDay, { req } as Meta)).toBe(true);
        });
      });
    });

    describe('is false when', () => {
      const invalidDates: Array<[any, string]> = [
        [{ dobMonth: '12', dobYear: '1994' }, 'day is missing'],
        [{ dobDay: '12', dobYear: '1994' }, 'month is missing'],
        [{ dobDay: '12', dobMonth: '12' }, 'year is missing'],
        [{ dobDay: '12', dobMonth: '', dobYear: '' }, 'there are empty values'],
        [{ dobDay: '32', dobMonth: '01', dobYear: '1990' }, 'day does not exist'],
        [{ dobDay: '29', dobMonth: '02', dobYear: '2021' }, 'day does not exist - not a leap year'],
      ];

      invalidDates.forEach((invalidInput) => {
        test(`${invalidInput[1]}`, () => {
          const req = {
            body: invalidInput[0],
          };
          expect(() => DateOfBirth.isValid(invalidInput[0].dobDay, { req } as Meta)).toThrow();
        });
      });
    });
  });
});
