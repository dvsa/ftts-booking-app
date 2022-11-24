export class PaymentSystemError extends Error {
  constructor() {
    super();
    this.name = this.constructor.name;
  }
}
