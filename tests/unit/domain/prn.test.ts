import { Target } from '../../../src/domain/enums';
import { PRN } from '../../../src/domain/prn';

describe('PRN', () => {
  test('undefined PRN is not valid', () => {
    const prn = undefined;

    expect(() => PRN.isPRNValid(prn, Target.GB)).toThrow();
  });

  test('empty PRN is not valid', () => {
    const prn = '';

    expect(() => PRN.isPRNValid(prn, Target.GB)).toThrow();
  });

  test('empty space PRN is not valid', () => {
    const prn = ' ';

    expect(() => PRN.isPRNValid(prn, Target.GB)).toThrow();
  });

  describe('GB - Personal Reference Number', () => {
    test('valid PRN returns true', () => {
      const prn = '012345';

      const valid = PRN.isPRNValid(prn, Target.GB);

      expect(valid).toBe(true);
    });

    test('non numeric PRN is not valid', () => {
      const prn = '12b456';

      expect(() => PRN.isPRNValid(prn, Target.GB)).toThrow();
    });

    test('PRN longer than 6 characters is not valid', () => {
      const prn = '1234567';

      expect(() => PRN.isPRNValid(prn, Target.GB)).toThrow();
    });
  });

  describe('NI - Payment Receipt Number', () => {
    test('valid PRN returns true', () => {
      const prn = '1234567890123456';

      const valid = PRN.isPRNValid(prn, Target.NI);

      expect(valid).toBe(true);
    });

    test('non numeric PRN is not valid', () => {
      const prn = '12b456';

      expect(() => PRN.isPRNValid(prn, Target.NI)).toThrow();
    });

    test('PRN longer than 16 characters is not valid', () => {
      const prn = '12345678901234567';

      expect(() => PRN.isPRNValid(prn, Target.NI)).toThrow();
    });
  });
});
