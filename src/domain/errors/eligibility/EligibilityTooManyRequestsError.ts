export class EligibilityTooManyRequestsError extends Error {
  constructor() {
    super();
    this.name = this.constructor.name;
  }
}
