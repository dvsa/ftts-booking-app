import { DateFunction, UtcDate } from '../../domain/utc-date';

export class VisibleMonths {
  public static of(value: string): VisibleMonths {
    const date = UtcDate.of(value);
    if (date.before(firstDayOfThisMonth())) {
      throw Error('Calendar firstDay date must be in or after the previous month');
    }

    return new VisibleMonths(date);
  }

  public static ofToday(): VisibleMonths {
    return new VisibleMonths(UtcDate.today());
  }

  public static isValid(value: string): boolean {
    return VisibleMonths.of(value) instanceof VisibleMonths;
  }

  private readonly value: UtcDate;

  constructor(value: UtcDate) {
    this.value = value.map(toFirstDayOfMonth);
  }

  public firstDay(): UtcDate {
    return this.value;
  }

  public lastDay(): UtcDate {
    return this.value.map(toLastDay);
  }
}

function firstDayOfThisMonth(): UtcDate {
  return UtcDate.today().map(toFirstDayOfMonth);
}

const toLastDay: DateFunction<UtcDate> = (v) => {
  const lastDay = new Date(v.getFullYear(), v.getMonth() + 2, 0);
  return new UtcDate(lastDay);
};

const toFirstDayOfMonth: DateFunction<UtcDate> = (v) => {
  const firstDayOfMonth = new Date(v.getFullYear(), v.getMonth(), 1);
  return new UtcDate(firstDayOfMonth);
};
