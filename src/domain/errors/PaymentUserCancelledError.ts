export class PaymentUserCancelledError extends Error {
  constructor() {
    super();
    this.name = this.constructor.name;
  }
}
