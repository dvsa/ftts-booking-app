export class PaymentUnsuccessfulError extends Error {
  constructor() {
    super();
    this.name = this.constructor.name;
  }
}
