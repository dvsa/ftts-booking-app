import dayjs, { Dayjs } from 'dayjs';
import { Meta } from 'express-validator';
import { toISODateString } from './utc-date';

export const today = (): Dayjs => dayjs().startOf('day');
export const tomorrow = (): Dayjs => today().add(1, 'day').startOf('day');

interface DateSource {
  day: string;
  month: string;
  year: string;
}

export class DateInput {
  private static allowedFormats = [
    'DD-MM-YYYY', 'D-M-YYYY', 'DD-M-YYYY', 'D-MM-YYYY',
    'DD-MM-YY', 'D-M-YY', 'DD-M-YY', 'D-MM-YY',
  ];

  public static get min(): number {
    return today().add(1, 'day').valueOf();
  }

  public static get max(): number {
    return today().add(6, 'month').subtract(1, 'day').valueOf();
  }

  public static split(isoDateString: string): DateSource {
    const [year, month, day] = isoDateString.split('-');
    return { day, month, year };
  }

  public static isValid(value: string, { req }: Meta): boolean {
    return DateInput.of(req.body) instanceof DateInput;
  }

  public static isValidWithoutCheckingForSameDayOrSixMonthConstraint(value: string, { req }: Meta): boolean {
    return DateInput.of(req.body) instanceof DateInput;
  }

  public static of(source: DateSource): DateInput {
    const { day, month, year } = source;
    const dateString = `${day}-${month}-${year}`;
    const date = dayjs(dateString, DateInput.allowedFormats, true);

    if (!date.isValid()) {
      throw new Error('dateNotValid');
    }
    if (date.isBefore(today())) {
      throw new Error('dateInPast');
    }

    if (date.isSame(today()) || date.isSame(tomorrow())) {
      throw new Error('dateIsTodayOrTomorrow');
    }
    if (date.isAfter(today().add(6, 'month').subtract(1, 'day'))) {
      throw new Error('dateBeyond6Months');
    }

    return new DateInput(date);
  }

  constructor(private readonly date: Dayjs) {}

  public toISOFormat(): string {
    return toISODateString(this.date);
  }

  public isAfter(date: Dayjs): boolean {
    return this.date.isAfter(date);
  }
}
