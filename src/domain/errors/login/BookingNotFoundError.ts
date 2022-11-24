export class BookingNotFoundError extends Error {
  constructor(message?: string) {
    super(message || 'Booking not found or is not an active booking for this candidate');
    this.name = this.constructor.name;
  }
}
