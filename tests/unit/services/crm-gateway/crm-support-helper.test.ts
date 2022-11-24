import { CRMPreferredCommunicationMethod } from '@dvsa/ftts-crm-test-client/dist/enums';
import { PreferredDay, PreferredLocation, SupportType } from '../../../../src/domain/enums';
import { CRMSupportHelper } from '../../../../src/services/crm-gateway/crm-support-helper';

describe('CRMSupportTypeBuilder', () => {
  let req;

  beforeEach(() => {
    req = {
      session: {
        currentBooking: {
          selectSupportType: [
            SupportType.BSL_INTERPRETER,
            SupportType.VOICEOVER,
            SupportType.EXTRA_TIME,
          ],
          customSupport: 'Lorem ipsum dolor amet',
          preferredDayOption: PreferredDay.ParticularDay,
          preferredDay: 'I would like Monday\'s',
          preferredLocationOption: PreferredLocation.DecideLater,
          preferredLocation: '',
          translator: 'French',
          voicemail: true,
        },
        candidate: {
          telephone: '123 456 7890',
        },
      },
    };
  });

  describe('preferredCommunicationMethod', () => {
    test('preferred communication method set to phone is telephone is provided', () => {
      const result = CRMSupportHelper.preferredCommunicationMethod(req.session.candidate.telephone);

      expect(result).toEqual(CRMPreferredCommunicationMethod.Phone);
    });

    test('preferred communication method set to email is telephone is not provided', () => {
      req.session.candidate.telephone = '';

      const result = CRMSupportHelper.preferredCommunicationMethod(req.session.candidate.telephone);

      expect(result).toEqual(CRMPreferredCommunicationMethod.Email);
    });
  });

  describe('isPreferredDayOrLocation', () => {
    test('returns preferred text if preferred day is set to a particular day', () => {
      const result = CRMSupportHelper.getPreferredDayOrLocation(req.session.currentBooking.preferredDayOption, req.session.currentBooking.preferredDay);

      expect(result).toEqual(req.session.currentBooking.preferredDay);
    });

    test('returns preferred text if preferred location is set to a particular location', () => {
      req.session.currentBooking.preferredLocation = 'Dudley please';
      req.session.currentBooking.preferredLocationOption = PreferredLocation.ParticularLocation;

      const result = CRMSupportHelper.getPreferredDayOrLocation(req.session.currentBooking.preferredLocationOption, req.session.currentBooking.preferredLocation);

      expect(result).toEqual(req.session.currentBooking.preferredLocation);
    });

    test('returns undefined if preferred text supplied and preferred option is set to decide later', () => {
      req.session.currentBooking.preferredDay = 'I would like Monday\'s';
      req.session.currentBooking.preferredDayOption = PreferredDay.DecideLater;

      const result = CRMSupportHelper.getPreferredDayOrLocation(req.session.currentBooking.preferredDayOption, req.session.currentBooking.preferredDay);

      expect(result).toBeUndefined();
    });

    test('returns undefined if no preferred text and preferred day is set to decide later', () => {
      req.session.currentBooking.preferredDay = undefined;
      req.session.currentBooking.preferredDayOption = PreferredLocation.DecideLater;

      const result = CRMSupportHelper.getPreferredDayOrLocation(req.session.currentBooking.preferredDayOption, req.session.currentBooking.preferredDay);

      expect(result).toBeUndefined();
    });

    test('returns undefined if no preferred text and preferred location is set to decide later', () => {
      req.session.currentBooking.preferredLocation = undefined;
      req.session.currentBooking.preferredLocationOption = PreferredLocation.DecideLater;

      const result = CRMSupportHelper.getPreferredDayOrLocation(req.session.currentBooking.preferredLocationOption, req.session.currentBooking.preferredLocation);

      expect(result).toBeUndefined();
    });
  });

  describe('isTranslator', () => {
    test('returns translator option is translator type is in support types', () => {
      req.session.currentBooking.selectSupportType.push(SupportType.TRANSLATOR);

      const result = CRMSupportHelper.getTranslator(req.session.currentBooking.selectSupportType, req.session.currentBooking.translator);

      expect(result).toBe(req.session.currentBooking.translator);
    });

    test('returns undefined if translator option doesn\'t exist in support types', () => {
      const result = CRMSupportHelper.getTranslator(req.session.currentBooking.selectSupportType, req.session.currentBooking.translator);

      expect(result).toBeUndefined();
    });
  });

  describe('isVoicemail', () => {
    test('returns voicemail option if telephone is supplied', () => {
      const result = CRMSupportHelper.isVoicemail(req.session.candidate.telephone, req.session.currentBooking.voicemail);

      expect(result).toBe(req.session.currentBooking.voicemail);
    });

    test('returns undefined if no telephone is supplied', () => {
      req.session.candidate.telephone = undefined;

      const result = CRMSupportHelper.isVoicemail(req.session.candidate.telephone, req.session.currentBooking.voicemail);

      expect(result).toBeUndefined();
    });
  });

  describe('toString', () => {
    test('structures support types and custom support properly', () => {
      req.session.currentBooking.selectSupportType.push(SupportType.OTHER);
      const supportTypeBuilder = new CRMSupportHelper(req.session.currentBooking.selectSupportType, req.session.currentBooking.customSupport);

      expect(supportTypeBuilder.toString()).toBe(`- ${CRMSupportHelper.supportTypeMap.get(req.session.currentBooking.selectSupportType[0])}\n- ${CRMSupportHelper.supportTypeMap.get(req.session.currentBooking.selectSupportType[1])}\n- ${CRMSupportHelper.supportTypeMap.get(req.session.currentBooking.selectSupportType[2])}\n- ${CRMSupportHelper.supportTypeMap.get(req.session.currentBooking.selectSupportType[3])}\n\n${req.session.currentBooking.customSupport}`);
    });

    test('structures translator type properly', () => {
      const language = req.session.currentBooking.translator;
      const supportTypeBuilder = new CRMSupportHelper([SupportType.TRANSLATOR], '');

      expect(supportTypeBuilder.toString(language)).toBe(`- ${CRMSupportHelper.supportTypeMap.get(SupportType.TRANSLATOR)} (${language})\n\n`);
    });

    test('returns nothing if no support type exists', () => {
      req.session.currentBooking.selectSupportType = [];
      req.session.currentBooking.customSupport = '';

      const supportTypeBuilder = new CRMSupportHelper(req.session.currentBooking.selectSupportType, req.session.currentBooking.customSupport);

      expect(supportTypeBuilder.toString()).toBe('');
    });
  });
});
