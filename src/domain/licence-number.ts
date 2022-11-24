import { Meta } from 'express-validator';
import { Target } from './enums';

const licenceNumberRegex = {
  // Regex taken from the DVLA Access to Driver Data spec
  gb: /^(?=.{16}$)[A-Za-z]{1,5}9{0,4}[0-9](?:[05][1-9]|[16][0-2])(?:[0][1-9]|[12][0-9]|3[01])[0-9](?:99|[A-Za-z][A-Za-z9])(?![IOQYZioqyz01_])\w[A-Za-z]{2}/,
  // ni:
  ni: /\b[0-9]{8}\b/,
};
const licenceNumberMatchesGbFormat = (dln: string): boolean => licenceNumberRegex.gb.test(dln);
const licenceNumberMatchesNiFormat = (dln: string): boolean => licenceNumberRegex.ni.test(dln);

const trimWhitespace = (input: string): string => input.replace(/\s+/g, '');
const sliceToFirst16Chars = (input: string): string => input.slice(0, 16);

export class LicenceNumber {
  public static of(input: string, target: Target): LicenceNumber {
    const trimmedInput = trimWhitespace(input);
    if (!trimmedInput) {
      throw new Error('Licence number input is empty');
    }

    if (target === Target.NI) {
      // NI licence number is 8 numeric characters
      // The 8th number is a checksum - this is not being validated
      // It should be handled by Eligibility API
      if (!licenceNumberMatchesNiFormat(trimmedInput)) {
        throw new Error('not a valid NI licence number');
      }
      return new LicenceNumber(trimmedInput);
    }

    // GB licence number is 16 chars but users may mistakenly add
    // the extra 2-character issue number printed on the licence,
    // so slice it before validating
    const licenceNumber = trimmedInput.length > 16 ? sliceToFirst16Chars(trimmedInput) : trimmedInput;
    if (!licenceNumberMatchesGbFormat(licenceNumber) && !licenceNumberMatchesNiFormat(licenceNumber)) {
      throw new Error('not a valid GB or NI licence number');
    }

    return new LicenceNumber(licenceNumber);
  }

  public static isValid(licenceNumber: string, { req }: Meta): boolean {
    return LicenceNumber.of(licenceNumber, req?.res?.locals?.target as Target || Target.GB) instanceof LicenceNumber;
  }

  constructor(private readonly value: string) { }

  public toString(): string {
    return this.value;
  }

  public equals(other: LicenceNumber): boolean {
    return this.value.toUpperCase() === other.value.toUpperCase();
  }
}
