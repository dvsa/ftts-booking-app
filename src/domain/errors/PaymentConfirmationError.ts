export class PaymentConfirmationError extends Error {
  constructor() {
    super();
    this.name = this.constructor.name;
  }
}
