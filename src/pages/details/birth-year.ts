import { Dob, Details } from './types';

export class BirthYear {
  public static min = 1900;

  public static max: number = new Date().getFullYear() - 15;

  public static of(source: Dob | Details): BirthYear {
    return new BirthYear(source.dobYear);
  }

  private readonly value: number;

  constructor(value: string) {
    const year: number = parseInt(value, 10);
    if (Number.isNaN(year)) {
      throw new TypeError('Year must be a number');
    } else if (year < BirthYear.min || year > BirthYear.max) {
      throw new RangeError(`Birth Year must be between  ${BirthYear.min} and ${BirthYear.max}`);
    }

    this.value = year;
  }

  public toNumber(): number {
    return this.value;
  }
}
