const trimWhitespace = (input: string): string => input.replace(/\s+/g, '');

export class BookingReference {
  public static of(input: string): BookingReference {
    const trimmedInput = trimWhitespace(input);
    if (!trimmedInput) {
      throw new Error('Booking reference input is empty');
    }

    // Matches CRM booking reference format
    const bookingReferenceRegex = /^[A-Z](-\d{3}){3}?$/;
    if (!bookingReferenceRegex.test(trimmedInput)) {
      throw new Error(`"${input}" is not a valid booking reference number`);
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
