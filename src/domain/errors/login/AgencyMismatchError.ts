export class AgencyMismatchError extends Error {
  constructor(message?: string) {
    super(message || 'Booking does not match agency');
    this.name = this.constructor.name;
  }
}
