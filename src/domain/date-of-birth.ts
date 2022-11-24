import { Meta } from 'express-validator';
import { logger } from '../helpers/logger';

export class DateOfBirth {
  public static isValid(dobDay: string, { req }: Meta): boolean {
    const { dobMonth, dobYear } = req.body;
    const dateString = `${dobDay}-${dobMonth}-${dobYear}`;

    if (dobDay?.trim() === '' || dobMonth?.trim() === '' || dobYear?.trim() === '') {
      throw new Error('date of birth is blank');
    }

    // Allows the following formats DD-MM-YYY DD-M-YYYY D-MM-YYYY D-M-YYYY
    if (!/^\d{1,2}-\d{1,2}-\d{4}$/.test(dateString)) {
      logger.debug('DateOfBirth::isValid: Format of date of birth is incorrect', {
        dayLength: dobDay?.length,
        monthLength: dobMonth?.length,
        yearLength: dobYear?.length,
      });
      throw new Error('format of date of birth is incorrect');
    }

    const day = parseInt(dobDay, 10);
    const month = parseInt(dobMonth, 10);
    const year = parseInt(dobYear, 10);

    // Check the ranges of month and year
    if (year < 1000 || year > 3000 || month < 1 || month > 12) {
      logger.debug('DateOfBirth::isValid: Range of month/year is invalid', {
        dayLength: dobDay?.length,
        monthLength: dobMonth?.length,
        yearLength: dobYear?.length,
      });
      throw new Error('date of birth range month/year is invalid');
    }

    const monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // Adjust for leap years
    if (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)) {
      monthLength[1] = 29;
    }

    // Check the range of the day
    const dayRangeValid = day > 0 && day <= monthLength[month - 1];
    if (!dayRangeValid) {
      logger.warn('DateOfBirth::isValid: Day range is invalid', {
        dayLength: dobDay?.length,
        monthLength: dobMonth?.length,
        yearLength: dobYear?.length,
      });
      throw new Error('date of birth day range is invalid');
    }

    return dayRangeValid;
  }
}
