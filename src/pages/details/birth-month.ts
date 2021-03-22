import { BirthYear } from './birth-year';
import { Dob, Details } from './types';

export class BirthMonth {
  public static of(source: Dob | Details): BirthMonth {
    const year = BirthYear.of(source);
    return new BirthMonth(source.dobMonth, year);
  }

  private readonly value: number;

  private readonly year: BirthYear;

  constructor(value: string, year: BirthYear) {
    const month: number = parseInt(value, 10);
    if (Number.isNaN(month)) {
      throw new TypeError('Birth Month must be a number');
    } else if (month < 1 || month > 12) {
      throw new RangeError('Birth Month must be between 1 and 12');
    }
    this.value = month;
    this.year = year;
  }

  public sizeInDays(): number {
    return new Date(this.year.toNumber(), this.value, 0).getDate();
  }

  public toNumber(): number {
    return this.value;
  }

  public toYear(): BirthYear {
    return this.year;
  }
}
