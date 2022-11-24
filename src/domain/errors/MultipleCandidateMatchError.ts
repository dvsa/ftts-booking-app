export class MultipleCandidateMismatchError extends Error {
  public errors: Error[];

  constructor(errors: Error[]) {
    super('Candidate does not match eligibility details');
    this.name = this.constructor.name;
    this.errors = errors;
  }
}
