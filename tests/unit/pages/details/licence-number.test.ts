import { LicenceNumber } from '../../../../src/domain/licence-number';
import { TARGET } from '../../../../src/domain/enums';

describe('Licence Number', () => {
  describe('Licence Number - Target GB', () => {
    const meta = {
      req: {
        res: {
          locals: {
            target: TARGET.GB,
          },
        },
      },
    };
    describe('cannot be constructed', () => {
      test('throws error if empty', () => {
        expect(() => { LicenceNumber.isValid('', meta as any); }).toThrow('Licence number input is empty');
      });

      test('throws error if just whitespace', () => {
        expect(() => { LicenceNumber.isValid('  ', meta as any); }).toThrow('Licence number input is empty');
      });

      describe('throws error if invalid', () => {
        const invalidInputs = [
          'TESTERS13029Mfake',
          'SOUP8902312XT9ZP',
          'SOOP9913269XT9ZP',
          'GRAY9902329XT9ZP',
          'DELL9902312AA0ZP',
          'DERBY602312A14YT',
          'LE879902312AA9ZZ',
          'TESTERS130290MT4',
        ];

        invalidInputs.forEach((input) => {
          test(input, () => {
            expect(() => {
              LicenceNumber.isValid(input, meta as any);
            }).toThrow(`"${input}" is not a valid GB or NI licence number`);
          });
        });
      });
    });

    describe('can be constructed', () => {
      describe('if valid GB licence number', () => {
        const validInputs = ['TEST9812100M92PF', 'JONES061102W97YT', 'WILLI912119D94LW'];
        validInputs.forEach((input) => {
          test(input, () => {
            expect(LicenceNumber.isValid(input, meta as any)).toBe(true);
          });
        });
      });

      describe('if valid NI licence number', () => {
        const validInputs = ['12345678', '87654321'];
        validInputs.forEach((input) => {
          test(input, () => {
            expect(LicenceNumber.isValid(input, meta as any)).toBe(true);
          });
        });
      });

      test('if valid but contains spaces', () => {
        const validLicenceNumber = 'JONES 061102 W97YT';
        expect(LicenceNumber.isValid(validLicenceNumber, meta as any)).toBe(true);
      });

      test('if valid but includes issue number', () => {
        const validLicenceNumber = 'JONES061102W97YT AB';
        expect(LicenceNumber.isValid(validLicenceNumber, meta as any)).toBe(true);
      });
    });
  });

  describe('Licence Number - Target NI', () => {
    const meta = {
      req: {
        res: {
          locals: {
            target: TARGET.NI,
          },
        },
      },
    };
    describe('cannot be constructed', () => {
      test('throws error if empty', () => {
        expect(() => { LicenceNumber.isValid('', meta as any); }).toThrow('Licence number input is empty');
      });

      test('throws error if just whitespace', () => {
        expect(() => { LicenceNumber.isValid('  ', meta as any); }).toThrow('Licence number input is empty');
      });

      describe('throws error if invalid', () => {
        const invalidInputs = [
          'TESTERS13029Mfake',
          'SOUP8902312XT9ZP',
          'SOOP9913269XT9ZP',
          'GRAY9902329XT9ZP',
          'DELL9902312AA0ZP',
          'DERBY602312A14YT',
          'LE879902312AA9ZZ',
          'TESTERS130290MT4',
          'TEST9812100M92PF',
          'JONES061102W97YT',
          'WILLI912119D94LW',
          '1234567',
          '1234567b',
          '123456789',
          'aaaaaaaa',
          'aaaaaaa',
          'aaaaaaaaa',
        ];

        invalidInputs.forEach((input) => {
          test(input, () => {
            expect(() => {
              LicenceNumber.isValid(input, meta as any);
            }).toThrow(`"${input}" is not a valid NI licence number`);
          });
        });
      });
    });

    describe('can be constructed', () => {
      describe('if valid', () => {
        const validInputs = ['17874131', '08705004', '62272485'];
        validInputs.forEach((input) => {
          test(input, () => {
            expect(LicenceNumber.isValid(input, meta as any)).toBe(true);
          });
        });
      });

      test('if valid but contains spaces', () => {
        const validLicenceNumber = '087 050 04';
        expect(LicenceNumber.isValid(validLicenceNumber, meta as any)).toBe(true);
      });
    });
  });

  describe('Licence Number - Error paths', () => {
    describe('cannot be constructed', () => {
      test('uses GB validation if session has an empty req', () => {
        const invalidLicenceNumber = '178741311';
        const invalidMeta = {
          req: {
          },
        };

        expect(() => {
          LicenceNumber.isValid(invalidLicenceNumber, invalidMeta as any);
        }).toThrow(`"${invalidLicenceNumber}" is not a valid GB or NI licence number`);
      });

      test('uses GB validation if session has an empty target', () => {
        const invalidLicenceNumber = '178741311';
        const invalidMeta = {
          req: {
            res: {
              locals: {
                target: undefined,
              },
            },
          },
        };

        expect(() => {
          LicenceNumber.isValid(invalidLicenceNumber, invalidMeta as any);
        }).toThrow(`"${invalidLicenceNumber}" is not a valid GB or NI licence number`);
      });

      test('uses GB validation if session does not have a valid target', () => {
        const invalidLicenceNumber = '178741311';

        const invalidMeta = {
          req: {
            res: {
              locals: {
                target: 'df',
              },
            },
          },
        };

        expect(() => {
          LicenceNumber.isValid(invalidLicenceNumber, invalidMeta as any);
        }).toThrow(`"${invalidLicenceNumber}" is not a valid GB or NI licence number`);
      });
    });
  });
});
