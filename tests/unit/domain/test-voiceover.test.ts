import { TARGET, Voiceover } from '../../../src/domain/enums';
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

  describe('fromDVSAVoiceoverOption', () => {
    test('correctly gets a valid voiceover value', () => {
      expect(TestVoiceover.fromDVSAVoiceoverOption(Voiceover.ENGLISH)).toEqual('English');
    });
    test('correctly gets "None" as a valid voiceover value', () => {
      expect(TestVoiceover.fromDVSAVoiceoverOption(Voiceover.NONE)).toEqual('None');
    });
    test('correctly gets "None" when provided an invalid value', () => {
      expect(TestVoiceover.fromDVSAVoiceoverOption('invalid' as Voiceover)).toEqual('None');
    });
  });

  describe('fromDVAVoiceoverOption', () => {
    test('correctly gets a valid voiceover value', () => {
      expect(TestVoiceover.fromDVAVoiceoverOption(Voiceover.ENGLISH)).toEqual('English');
    });
    test('correctly gets "None" as a valid voiceover value', () => {
      expect(TestVoiceover.fromDVAVoiceoverOption(Voiceover.NONE)).toEqual('None');
    });
    test('correctly gets "None" when provided an invalid value', () => {
      expect(TestVoiceover.fromDVAVoiceoverOption('invalid' as Voiceover)).toEqual('None');
    });
  });

  describe('availableOptions', () => {
    test('returns DVSA Options if the target is GB', () => {
      const result = TestVoiceover.availableOptions(TARGET.GB);
      expect(result.size).toEqual(3);
      expect(result.has(Voiceover.ENGLISH)).toEqual(true);
      expect(result.has(Voiceover.WELSH)).toEqual(true);
      expect(result.has(Voiceover.NONE)).toEqual(true);
    });
    test('returns DVA Options if the target is NI', () => {
      const result = TestVoiceover.availableOptions(TARGET.NI);
      expect(result.size).toEqual(8);
      expect(result.has(Voiceover.ENGLISH)).toEqual(true);
      expect(result.has(Voiceover.TURKISH)).toEqual(true);
      expect(result.has(Voiceover.PORTUGUESE)).toEqual(true);
      expect(result.has(Voiceover.POLISH)).toEqual(true);
      expect(result.has(Voiceover.FARSI)).toEqual(true);
      expect(result.has(Voiceover.CANTONESE)).toEqual(true);
      expect(result.has(Voiceover.ARABIC)).toEqual(true);
      expect(result.has(Voiceover.NONE)).toEqual(true);
    });
  });
});
