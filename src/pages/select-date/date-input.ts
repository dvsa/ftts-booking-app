import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Meta } from 'express-validator';
import { DateSource } from './types';

dayjs.extend(customParseFormat);

const today = (): Dayjs => dayjs().startOf('day');

export class DateInput {
  private static allowedFormats = [
    'DD-MM-YYYY', 'D-M-YYYY', 'DD-M-YYYY', 'D-MM-YYYY',
    'DD-MM-YY', 'D-M-YY', 'DD-M-YY', 'D-MM-YY',
  ];

  public static get min(): number {
    return today().add(1, 'day').valueOf();
  }

  public static get max(): number {
    return today().add(6, 'month').valueOf();
  }

  public static split(isoDateString: string): DateSource {
    const [year, month, day] = isoDateString.split('-');
    return { day, month, year };
  }

  public static isValid(value: string, { req }: Meta): boolean {
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
    if (date.isSame(today())) {
      throw new Error('dateIsToday');
    }
    if (date.isAfter(today().add(6, 'month'))) {
      throw new Error('dateBeyond6Months');
    }

    return new DateInput(date);
  }

  constructor(private readonly date: Dayjs) {}

  public toISOFormat(): string {
    return this.date.format('YYYY-MM-DD');
  }
}
