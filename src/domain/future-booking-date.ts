import { UtcDate } from './utc-date';

export class FutureBookingDate extends UtcDate {
  public static of(value: string): FutureBookingDate {
    const date = UtcDate.of(value);
    if (date.inThePast()) {
      throw new Error(`"${value}" is in the past, Booking Date's must be prior to today`);
    }

    return date.map((v) => new FutureBookingDate(v));
  }

  public static ofToday(): FutureBookingDate {
    return new FutureBookingDate(new Date());
  }

  public static isValid(value: string): boolean {
    return FutureBookingDate.of(value) instanceof FutureBookingDate;
  }
}
