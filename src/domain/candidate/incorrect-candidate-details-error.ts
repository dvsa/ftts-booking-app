export default class IncorrectCandidateDetails extends Error {
  constructor(message?: string) {
    super(message);

    // explicitly setting the prototype
    // See https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, IncorrectCandidateDetails.prototype);
  }
}
