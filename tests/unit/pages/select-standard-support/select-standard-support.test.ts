import { PageNames } from '@constants';
import selectStandardSupport from '@pages/select-standard-support/select-standard-support';
import {
  SupportType, Target, TestType, Voiceover,
} from '../../../../src/domain/enums';

jest.mock('../../../../src/helpers/language', () => ({
  translate: () => 'mockTranslatedString',
}));

describe('SelectStandardSupport controller', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = {
      query: {},
      body: {},
      hasErrors: false,
      errors: [],
      session: {
        target: Target.GB,
        currentBooking: {
          testType: TestType.CAR,

        },
        journey: {
          inEditMode: false,
        },
      },
    };

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('get', () => {
    test('In NI context it should render the correct page with the back link equal to test type and option should contain a no support wanted support type', () => {
      req.session.target = Target.NI;

      selectStandardSupport.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.SELECT_STANDARD_SUPPORT, expect.objectContaining({
        options: expect.arrayContaining([
          expect.objectContaining({
            value: SupportType.NO_SUPPORT_WANTED,
          }),
        ]),
        backLink: 'test-type',
      }));
    });

    test('In NI context, if the user has existing received support, back link should go back to received-support-request', () => {
      req.session.target = Target.NI;
      req.session.journey.receivedSupportRequestPageFlag = true;

      selectStandardSupport.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.SELECT_STANDARD_SUPPORT, expect.objectContaining({
        backLink: 'received-support-request',
      }));
    });

    test('In GB context it should render the correct page with the back link equal to test language and option should contain a no support wanted support type', () => {
      req.session.target = Target.GB;

      selectStandardSupport.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.SELECT_STANDARD_SUPPORT, expect.objectContaining({
        options: expect.arrayContaining([
          expect.objectContaining({
            value: SupportType.NO_SUPPORT_WANTED,
          }),
        ]),
        backLink: 'test-language',
      }));
    });

    test('Expect error to be thrown when no information in current booking', () => {
      delete req.session.currentBooking;

      expect(() => selectStandardSupport.get(req, res)).toThrow(Error('SelectStandardSupportController::get: No currentBooking set'));
    });

    test('Expect error to be thrown when no information in journey', () => {
      delete req.session.journey;

      expect(() => selectStandardSupport.get(req, res)).toThrow(Error('SelectStandardSupportController::get: No journey set'));
    });
  });

  describe('post', () => {
    test('sets BSL on currentBooking if on screen BSL option checked', () => {
      req.body = { selectStandardSupportType: SupportType.ON_SCREEN_BSL };

      selectStandardSupport.post(req, res);

      expect(req.session.currentBooking.bsl).toStrictEqual(true);
    });

    test('BSL remains unset on currentBooking if on screen BSL option is not checked', () => {
      selectStandardSupport.post(req, res);

      expect(req.session.currentBooking.bsl).toBeFalsy();
    });

    test('resets unchecked options - bsl', () => {
      req.session.currentBooking.bsl = true;
      req.body = { selectStandardSupportType: SupportType.VOICEOVER };

      selectStandardSupport.post(req, res);

      expect(req.session.currentBooking.bsl).toBeFalsy();
    });

    test('resets unchecked options - voiceover', () => {
      req.session.currentBooking.voiceover = Voiceover.ENGLISH;
      req.body = { selectStandardSupportType: SupportType.ON_SCREEN_BSL };

      selectStandardSupport.post(req, res);

      expect(req.session.currentBooking.voiceover).toBe(Voiceover.NONE);
    });

    test('Expect error to be thrown when no information in journey', () => {
      delete req.session.journey;

      expect(() => selectStandardSupport.post(req, res)).toThrow(Error('SelectStandardSupportController::post: No journey set'));
    });

    test('If error on page then expect select standard support to be rendered', () => {
      req.hasErrors = true;
      selectStandardSupport.post(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.SELECT_STANDARD_SUPPORT, expect.objectContaining({
        options: expect.arrayContaining([
          expect.objectContaining({
            value: SupportType.VOICEOVER,
          }),
        ]),
        backLink: 'test-language',
      }));
    });
  });

  describe('Support Type Validator', () => {
    test('prevents zero items selected from proceeding', () => {
      expect(() => selectStandardSupport.supportTypeValidator(undefined)).toThrow();
    });

    test('Returns item is passes validation', () => {
      expect(selectStandardSupport.supportTypeValidator(SupportType.ON_SCREEN_BSL)).toEqual(SupportType.ON_SCREEN_BSL);
    });
  });
});
