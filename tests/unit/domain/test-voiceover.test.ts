import { Target, TestType, Voiceover } from '../../../src/domain/enums';
import { TestVoiceover } from '../../../src/domain/test-voiceover';
import { CRMVoiceOver } from '../../../src/services/crm-gateway/enums';

describe('TestVoiceover', () => {
  describe('fromCRMVoiceover', () => {
    test('correctly maps Arabic Voiceover from CRM', () => {
      expect(TestVoiceover.fromCRMVoiceover(CRMVoiceOver.Arabic)).toEqual(Voiceover.ARABIC);
    });
    test('correctly maps Cantonese Voiceover from CRM', () => {
      expect(TestVoiceover.fromCRMVoiceover(CRMVoiceOver.Cantonese)).toEqual(Voiceover.CANTONESE);
    });
    test('correctly maps English Voiceover from CRM', () => {
      expect(TestVoiceover.fromCRMVoiceover(CRMVoiceOver.English)).toEqual(Voiceover.ENGLISH);
    });
    test('correctly maps Farsi Voiceover from CRM', () => {
      expect(TestVoiceover.fromCRMVoiceover(CRMVoiceOver.Farsi)).toEqual(Voiceover.FARSI);
    });
    test('correctly maps Polish Voiceover from CRM', () => {
      expect(TestVoiceover.fromCRMVoiceover(CRMVoiceOver.Polish)).toEqual(Voiceover.POLISH);
    });
    test('correctly maps Portuguese Voiceover from CRM', () => {
      expect(TestVoiceover.fromCRMVoiceover(CRMVoiceOver.Portuguese)).toEqual(Voiceover.PORTUGUESE);
    });
    test('correctly maps Turkish Voiceover from CRM', () => {
      expect(TestVoiceover.fromCRMVoiceover(CRMVoiceOver.Turkish)).toEqual(Voiceover.TURKISH);
    });
    test('correctly maps Welsh Voiceover from CRM', () => {
      expect(TestVoiceover.fromCRMVoiceover(CRMVoiceOver.Welsh)).toEqual(Voiceover.WELSH);
    });
    test('correctly maps No Voiceover from CRM', () => {
      expect(TestVoiceover.fromCRMVoiceover(CRMVoiceOver.None)).toEqual(Voiceover.NONE);
    });
    test('returns None if the voiceover is not supported by the booking app', () => {
      expect(TestVoiceover.fromCRMVoiceover(CRMVoiceOver.Mirpuri)).toEqual(Voiceover.NONE);
    });
  });

  describe('availableOptions', () => {
    test('returns all DVSA Options if the target is GB, for any OCB test type', () => {
      const result = TestVoiceover.availableOptions(Target.GB, TestType.LGVMC);
      expect(result).toStrictEqual([
        Voiceover.ENGLISH,
        Voiceover.WELSH,
      ]);
    });

    test('returns all DVA Options if the target is NI, for car/motorcycle tests', () => {
      const result = TestVoiceover.availableOptions(Target.NI, TestType.CAR);
      expect(result).toStrictEqual([
        Voiceover.ENGLISH,
        Voiceover.TURKISH,
        Voiceover.PORTUGUESE,
        Voiceover.POLISH,
        Voiceover.FARSI,
        Voiceover.CANTONESE,
        Voiceover.ARABIC,
      ]);
    });

    test('returns limited DVA Options if the target is NI, for non-car/motorcycle tests', () => {
      const result = TestVoiceover.availableOptions(Target.NI, TestType.TAXI);
      expect(result).toStrictEqual([
        Voiceover.ENGLISH,
      ]);
    });

    test.each([
      TestType.ADIP1,
      TestType.ADIHPT,
    ])('%s test type is valid voiceover option', (testType: TestType) => {
      const result = TestVoiceover.availableOptions(Target.GB, testType);
      expect(result).toStrictEqual([
        Voiceover.ENGLISH,
        Voiceover.WELSH,
      ]);
    });

    test('returns only english voiceover if the test type is ERS for instructor', () => {
      const result = TestVoiceover.availableOptions(Target.GB, TestType.ERS);
      expect(result).toStrictEqual([
        Voiceover.ENGLISH,
      ]);
    });

    test.each([
      TestType.ADIP1DVA,
      TestType.AMIP1,
    ])('%s test type should not have any voice over options', (testType: TestType) => {
      const result = TestVoiceover.availableOptions(Target.NI, testType);
      expect(result).toStrictEqual([]);
    });
  });

  describe('isAvailable', () => {
    test.each([
      TestType.ADIP1DVA,
      TestType.AMIP1,
    ])('DVA Instructor %s test type should return false (no voiceover options available)', (testType: TestType) => {
      const result = TestVoiceover.isAvailable(testType);
      expect(result).toBe(false);
    });

    test.each([
      TestType.ADIP1,
      TestType.CAR,
    ])('DVSA/DVA %s test type should return true (voiceover is available)', (testType: TestType) => {
      const result = TestVoiceover.isAvailable(testType);
      expect(result).toBe(true);
    });
  });
});
