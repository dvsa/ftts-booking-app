import { Meta } from 'express-validator';
import { Target } from '../../../src/domain/enums';
import { LicenceNumber } from '../../../src/domain/licence-number';

describe('Licence Numbers', () => {
  describe('GB Invalid Licence Number Tests', () => {
    const invalidLicenceNumbers: Array<[string, string]> = [
      ['9ONE9061103W97YT', 'UK Invalid Licence 1 test - number at the start of licence number'],
      ['PIKOJ710123B9', 'UK Invalid Licence 2 test - to short'],
      ['DELA9009020GW5!P', 'UK Invalid Licence 3 test - wrong character added'],
      ['12345853270G99JF', 'UK Invalid Licence 4 test - replace name with numbers'],
      ['', 'UK Invalid Licence 5 test - Empty String']];

    const req = {
      body: Target.GB,
    };

    invalidLicenceNumbers.forEach((inValidInput) => {
      test(`${inValidInput[1]}`, () => {
        expect(() => {
          LicenceNumber.isValid(inValidInput[0], { req } as Meta);
        }).toThrow();
      });
    });
  });

  describe('NI Invalid Licence Number Tests', () => {
    const invalidLicenceNumbers: Array<[string, string]> = [
      ['1234567', 'NI Invalid Licence 1 test - To short'],
      ['123456789', 'NI Invalid Licence 2 test - To long'],
      ['1B3456*!', 'NI Invalid Licence 3 test - contains letters and special characters'],
      ['', 'NI Invalid Licence 4 test - Empty String']];

    const req = {
      body: Target.NI,
    };

    invalidLicenceNumbers.forEach((inValidInput) => {
      test(`${inValidInput[1]}`, () => {
        expect(() => {
          LicenceNumber.isValid(inValidInput[0], { req } as Meta);
        }).toThrow();
      });
    });
  });

  describe('GB Valid Licence Number Tests', () => {
    const validLicenceNumbers: Array<[string, string]> = [
      ['JONE9061103W97YT', 'UK Valid Licence 1 test'],
      ['PIKOJ710123B96TH', 'UK Valid Licence 2 test'],
      ['DELA9009020GW5XY', 'UK Valid Licence 3 test'],
      ['JACKS853270G99JF', 'UK Valid Licence 4 test']];

    const req = {
      body: Target.GB,
    };

    validLicenceNumbers.forEach((validInput) => {
      test(`${validInput[1]}`, () => {
        expect(LicenceNumber.isValid(validInput[0], { req } as Meta)).toBe(true);
      });
    });
  });

  describe('NI Valid Licence Number Tests', () => {
    const validLicenceNumbers: Array<[string, string]> = [
      ['12345678', 'NI Valid Licence 1 test'],
      ['11111111', 'NI Valid Licence 2 test'],
      ['99999999', 'NI Valid Licence 3 test'],
      ['00000000', 'NI Valid Licence 4 test']];

    const req = {
      body: Target.NI,
    };

    validLicenceNumbers.forEach((validInput) => {
      test(`${validInput[1]}`, () => {
        expect(LicenceNumber.isValid(validInput[0], { req } as Meta)).toBe(true);
      });
    });
  });
});
