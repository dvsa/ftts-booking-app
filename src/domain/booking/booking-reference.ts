/* eslint-disable security/detect-unsafe-regex */
const trimWhitespace = (input: string): string => input.replace(/\s+/g, '');

export const emptyBookingReferenceErrorMsg = 'Booking reference is empty';

export class BookingReference {
  public static of(input: string): BookingReference {
    if (!input) {
      throw new Error(emptyBookingReferenceErrorMsg);
    }

    const trimmedInput = trimWhitespace(input);
    if (!trimmedInput) {
      throw new Error(emptyBookingReferenceErrorMsg);
    }

    // Matches CRM booking reference format
    const bookingReferenceRegex = /^[A-Za-z](-\d{3}){3}?$/;
    if (!bookingReferenceRegex.test(trimmedInput)) {
      throw new Error('not a valid booking reference number');
    }

    return new BookingReference(input);
  }

  constructor(private readonly value: string) { }

  public static isValid(bookingReference: string): boolean {
    return BookingReference.of(bookingReference) instanceof BookingReference;
  }

  public toString(): string {
    return this.value;
  }
}
