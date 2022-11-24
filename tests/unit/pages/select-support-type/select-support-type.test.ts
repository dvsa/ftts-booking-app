import { PageNames } from '@constants';
import selectSupportType from '@pages/select-support-type/select-support-type';
import {
  SupportType, Target, TestType, Voiceover,
} from '../../../../src/domain/enums';
import { translate } from '../../../../src/helpers/language';

jest.mock('../../../../src/helpers/language', () => ({
  translate: () => 'mockTranslatedString',
}));

describe('SelectSupportType controller', () => {
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
          selectSupportType: undefined,
        },
        journey: {
          inEditMode: false,
        },
      },
      path: '/nsa/select-support-type',
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
    test('in GB context', () => {
      selectSupportType.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.SELECT_SUPPORT_TYPE, expect.objectContaining({
        options: expect.not.arrayContaining([
          expect.objectContaining({
            value: SupportType.TRANSLATOR,
          }),
        ]),
        backLink: 'test-language',
      }));
    });

    test.each([
      [TestType.LGVHPT, SupportType.EXTRA_TIME],
      [TestType.PCVHPT, SupportType.EXTRA_TIME],
      [TestType.ADIHPT, SupportType.EXTRA_TIME],
      [TestType.LGVHPT, SupportType.BSL_INTERPRETER],
      [TestType.PCVHPT, SupportType.BSL_INTERPRETER],
      [TestType.ADIHPT, SupportType.BSL_INTERPRETER],
    ])('in GB context, when test type "%s" is selected, %s option does not show', (testType: TestType, supportType: SupportType) => {
      req.session.currentBooking.testType = testType;
      selectSupportType.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.SELECT_SUPPORT_TYPE, expect.objectContaining({
        options: expect.not.arrayContaining([
          expect.objectContaining({
            value: supportType,
          }),
        ]),
        backLink: 'test-language',
      }));
    });

    test('in NI context', () => {
      req.session.target = Target.NI;

      selectSupportType.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.SELECT_SUPPORT_TYPE, expect.objectContaining({
        options: expect.arrayContaining([
          expect.objectContaining({
            value: SupportType.TRANSLATOR,
          }),
        ]),
        backLink: 'test-type',
      }));
    });

    test.each([
      [TestType.LGVHPT, SupportType.EXTRA_TIME],
      [TestType.PCVHPT, SupportType.EXTRA_TIME],
      [TestType.LGVHPT, SupportType.BSL_INTERPRETER],
      [TestType.PCVHPT, SupportType.BSL_INTERPRETER],
    ])('in NI context, when test type "%s" is selected, extra time option does not show', (testType: TestType, supportType: SupportType) => {
      req.session.currentBooking.testType = testType;
      selectSupportType.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.SELECT_SUPPORT_TYPE, expect.objectContaining({
        options: expect.not.arrayContaining([
          expect.objectContaining({
            value: supportType,
          }),
        ]),
        backLink: 'test-language',
      }));
    });

    test('in Edit mode', () => {
      req.session.target = Target.GB;
      req.session.journey.inEditMode = true;

      selectSupportType.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.SELECT_SUPPORT_TYPE, expect.objectContaining({
        backLink: 'check-your-details',
      }));
    });

    test('ERS test type', () => {
      req.session.currentBooking.testType = TestType.ERS;

      selectSupportType.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.SELECT_SUPPORT_TYPE, expect.objectContaining({
        backLink: 'test-type',
      }));
    });

    test('after coming from confirm support', () => {
      req.session.target = Target.GB;
      req.session.journey.confirmingSupport = true;

      selectSupportType.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.SELECT_SUPPORT_TYPE, expect.objectContaining({
        backLink: 'confirm-support',
      }));
    });

    test('user selected options are referenced', () => {
      req.session.currentBooking.selectSupportType = [SupportType.ON_SCREEN_BSL, SupportType.BSL_INTERPRETER];

      selectSupportType.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.SELECT_SUPPORT_TYPE, expect.objectContaining({
        options: [
          expect.objectContaining({
            value: SupportType.ON_SCREEN_BSL,
            checked: true,
          }),
          expect.objectContaining({
            value: SupportType.BSL_INTERPRETER,
            checked: true,
          }),
          ...Array(4).fill(
            expect.objectContaining({
              checked: false,
            }),
          ),
        ],
      }));
    });
  });

  describe('post', () => {
    test('saves selected options to the session', () => {
      req.body.selectSupportType = [SupportType.ON_SCREEN_BSL, SupportType.BSL_INTERPRETER];

      selectSupportType.post(req, res);

      expect(req.session.currentBooking.selectSupportType).toStrictEqual(req.body.selectSupportType);
    });

    test('saves single support type into session', () => {
      req.body.selectSupportType = SupportType.ON_SCREEN_BSL;

      selectSupportType.post(req, res);

      expect(req.session.currentBooking.selectSupportType).toStrictEqual([req.body.selectSupportType]);
    });

    test('sets BSL on currentBooking if on screen BSL option checked', () => {
      req.body.selectSupportType = SupportType.ON_SCREEN_BSL;

      selectSupportType.post(req, res);

      expect(req.session.currentBooking.bsl).toStrictEqual(true);
    });

    test('BSL remains unset on currentBooking if on screen BSL option is not checked', () => {
      req.body.selectSupportType = [];

      selectSupportType.post(req, res);

      expect(req.session.currentBooking.bsl).toBeFalsy();
    });

    test('resets unchecked options - bsl', () => {
      req.session.currentBooking.bsl = true;
      req.body.selectSupportType = [SupportType.VOICEOVER];

      selectSupportType.post(req, res);

      expect(req.session.currentBooking.bsl).toBeFalsy();
    });

    test('resets unchecked options - voiceover, translator, custom support', () => {
      req.session.currentBooking.voiceover = Voiceover.ENGLISH;
      req.session.currentBooking.translator = 'translator text';
      req.session.currentBooking.customSupport = 'custom support text';
      req.body.selectSupportType = [SupportType.ON_SCREEN_BSL];

      selectSupportType.post(req, res);

      expect(req.session.currentBooking.voiceover).toBe(Voiceover.NONE);
      expect(req.session.currentBooking.translator).toBeUndefined();
      expect(req.session.currentBooking.customSupport).toBeUndefined();
    });

    test('clears the confirming support flag', () => {
      req.session.journey.confirmingSupport = true;
      req.body.selectSupportType = [SupportType.EXTRA_TIME];

      selectSupportType.post(req, res);

      expect(req.session.journey.confirmingSupport).toBeUndefined();
    });
  });

  describe('Support Type Validator', () => {
    test('prevents zero items selected from proceeding', () => {
      expect(() => selectSupportType.supportTypeValidator(req)(undefined)).toThrow();
    });

    test('prevents banned combination from proceeding', () => {
      expect(() => selectSupportType.supportTypeValidator(req)([SupportType.ON_SCREEN_BSL, SupportType.VOICEOVER])).toThrow();
    });

    test.each([
      [Target.GB, TestType.LGVHPT, SupportType.TRANSLATOR],
      [Target.GB, TestType.LGVHPT, SupportType.EXTRA_TIME],
      [Target.GB, TestType.LGVHPT, SupportType.BSL_INTERPRETER],
      [Target.GB, TestType.LGVHPT, SupportType.ON_SCREEN_BSL],
      [Target.GB, TestType.PCVHPT, SupportType.TRANSLATOR],
      [Target.GB, TestType.PCVHPT, SupportType.EXTRA_TIME],
      [Target.GB, TestType.PCVHPT, SupportType.BSL_INTERPRETER],
      [Target.GB, TestType.PCVHPT, SupportType.ON_SCREEN_BSL],
      [Target.GB, TestType.ADIHPT, SupportType.TRANSLATOR],
      [Target.GB, TestType.ADIHPT, SupportType.EXTRA_TIME],
      [Target.GB, TestType.ADIHPT, SupportType.BSL_INTERPRETER],
      [Target.GB, TestType.ADIHPT, SupportType.ON_SCREEN_BSL],
      [Target.GB, TestType.LGVHPT, SupportType.EXTRA_TIME],
      [Target.GB, TestType.LGVHPT, SupportType.BSL_INTERPRETER],
      [Target.GB, TestType.LGVHPT, SupportType.ON_SCREEN_BSL],
      [Target.GB, TestType.PCVHPT, SupportType.EXTRA_TIME],
      [Target.GB, TestType.PCVHPT, SupportType.BSL_INTERPRETER],
      [Target.GB, TestType.PCVHPT, SupportType.ON_SCREEN_BSL],
    ])('prevents invalid combination from proceeding', (target: Target, testType: TestType, supportTypeSelected: SupportType) => {
      req.session.target = target;
      req.session.currentBooking.testType = testType;
      expect(() => selectSupportType.supportTypeValidator(req)([supportTypeSelected])).toThrow(new Error(translate('selectSupportType.errors.invalidOptionSelected')));
    });

    test('prevents invalid combination (as string) from proceeding', () => {
      // This is to make sure the validator function works when only 1 support type is selected. In that scenario, the value passed in is of type 'string' and not 'string[]'
      req.session.target = Target.GB;
      req.session.currentBooking.testType = TestType.LGVHPT;
      expect(() => selectSupportType.supportTypeValidator(req)(SupportType.TRANSLATOR as any)).toThrow(new Error(translate('selectSupportType.errors.invalidOptionSelected')));
    });

    test('allows valid combination', () => {
      const result = selectSupportType.supportTypeValidator(req)([SupportType.BSL_INTERPRETER, SupportType.VOICEOVER]);

      expect(result).toEqual([SupportType.BSL_INTERPRETER, SupportType.VOICEOVER]);
    });

    test('allows valid combination (as string)', () => {
      // This is to make sure the validator function works when only 1 support type is selected. In that scenario, the value passed in is of type 'string' and not 'string[]'
      const result = selectSupportType.supportTypeValidator(req)(SupportType.BSL_INTERPRETER as any);

      expect(result).toEqual(SupportType.BSL_INTERPRETER);
    });
  });
});
