import { Meta } from 'express-validator';
import { UtcDate } from '../../domain/utc-date';
import { BirthMonth } from './birth-month';
import { Dob, Details } from './types';

export class BirthDay {
  public static of(source: Dob | Details): BirthDay {
    const month = BirthMonth.of(source);
    return new BirthDay(source.dobDay, month);
  }

  public static isValid(dobDay: string, { req }: Meta): boolean {
    return BirthDay.of(req.body) instanceof BirthDay;
  }

  private readonly month: BirthMonth;

  private readonly value: number;

  constructor(value: string, month: BirthMonth) {
    const day: number = parseInt(value, 10);
    if (Number.isNaN(day)) {
      throw new TypeError('Birth Day must be a number');
    } else if (day < 1 || day > month.sizeInDays()) {
      throw new RangeError(`Birth Day must be between 1 and ${month.sizeInDays()}`);
    }
    this.value = day;
    this.month = month;
  }

  public toDate(): UtcDate {
    return UtcDate.of(`${this.month.toYear().toNumber()}-${this.month.toNumber()}-${this.value}`);
  }
}
