import dayjs, { Dayjs } from 'dayjs';
import { logger } from '../helpers/logger';

export type DateFunction<T> = (v: Date) => T;

export const toISODateString = (date: string | Dayjs): string => {
  const dateDayjs = typeof date === 'string' ? dayjs(date).tz() : date;
  return dateDayjs.format('YYYY-MM-DD');
};

export class UtcDate {
  public static of(value: string): UtcDate {
    if (value === undefined || Number.isNaN(Date.parse(value))) {
      throw new Error(`"${value}" is not a valid Date`);
    }

    return new UtcDate(new Date(value));
  }

  public static isValidIsoTimeStamp(date: string): boolean {
    try {
      return dayjs(date).toISOString() === date;
    } catch (exception) {
      logger.warn('UtcDate::isValidIsoTimeStamp: No valid ISO string format');
      return false;
    }
  }

  public static isValidIsoDateString(date: string): boolean {
    return dayjs(date, 'YYYY-MM-DD', true).isValid();
  }

  public static today(): UtcDate {
    return new UtcDate(new Date());
  }

  private readonly value: Date;

  constructor(value: Date) {
    this.value = new Date(Date.UTC(
      value.getFullYear(),
      value.getMonth(),
      value.getDate(),
      0,
      0,
      0,
      0,
    ));
  }

  public toIsoTimeStamp(): string {
    return this.value.toISOString();
  }

  public toIsoDate(): string {
    return dayjs(this.value).format('YYYY-MM-DD');
  }

  public toDateString(): string {
    return this.value.toDateString();
  }

  public inThePast(): boolean {
    return this.value < UtcDate.today().value;
  }

  public before(other: UtcDate): boolean {
    return this.value < other.value;
  }

  public map<T>(func: DateFunction<T>): T {
    return func(this.value);
  }

  public nextDay(): UtcDate {
    return this.map(toNextDay);
  }

  public equals(other: UtcDate): boolean {
    return this.value.getTime() === other.value.getTime();
  }

  // Adapted from https://github.com/moment/moment/issues/1947
  public subtractBusinessDays(subtrahend: number): UtcDate {
    const clone = new Date(this.value.valueOf());
    const numberOfFullDays = subtrahend + 1;
    const increment = numberOfFullDays / Math.abs(numberOfFullDays);
    clone.setDate(clone.getDate() - (Math.floor(Math.abs(numberOfFullDays) / 5) * 7 * increment));
    let remaining = numberOfFullDays % 5;
    while (remaining !== 0) {
      clone.setDate(clone.getDate() - increment);
      if (!isSaturdayOrSunday(clone)) {
        remaining -= increment;
      }
    }
    return new UtcDate(clone);
  }
}

function isSaturdayOrSunday(date: Date): boolean {
  return date.getDay() % 6 === 0;
}

const toNextDay: DateFunction<UtcDate> = (v) => {
  const nextDay = new Date(v.getFullYear(), v.getMonth(), v.getDate() + 1);
  return new UtcDate(nextDay);
};
