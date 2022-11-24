import { TestLanguageController } from '@pages/test-language/test-language';
import { PageNames } from '@constants';
import { TestLanguage } from '../../../../src/domain/test-language';
import { Language, Target, TestType } from '../../../../src/domain/enums';
import { isStandardJourney, isNonStandardJourney, isSupportedStandardJourney } from '../../../../src/helpers/journey-helper';
import { mockSessionBooking } from '../../../mocks/data/session-types';

jest.mock('../../../../src/helpers/journey-helper', () => ({
  isStandardJourney: jest.fn(),
  isNonStandardJourney: jest.fn(),
  isSupportedStandardJourney: jest.fn(),
}));

describe('TestLanguageController', () => {
  let req: any;
  let res: any;
  let testLanguageController: TestLanguageController;

  beforeEach(() => {
    isStandardJourney.mockReturnValue(false);
    isNonStandardJourney.mockReturnValue(false);
    isSupportedStandardJourney.mockReturnValue(false);
    req = {
      query: {},
      body: {},
      hasErrors: false,
      errors: [],
      session: {
        target: Target.GB,
        currentBooking: {},
        journey: {
          support: false,
          standardAccommodation: true,
          inEditMode: false,
          inManagedBookingEditMode: false,
          receivedSupportRequestPageFlag: false,
        },
        manageBookingEdits: {},
      },
    };
    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      locals: {
        target: Target.GB,
      },
    };

    testLanguageController = new TestLanguageController();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('get', () => {
    test('throws an error is no journey is set', () => {
      delete req.session.journey;
      expect(() => testLanguageController.get(req, res)).toThrow();
    });

    test('throws an error if current booking is missing', () => {
      delete req.session.currentBooking;
      expect(() => testLanguageController.get(req, res)).toThrow();
    });

    test('Show Test Language selection page to GB users', () => {
      req.session.journey.support = false;
      req.session.journey.standardAccommodation = true;
      req.session.journey.inManagedBookingEditMode = false;

      isStandardJourney.mockReturnValue(true);

      testLanguageController.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.TEST_LANGUAGE, {
        availableLanguages: TestLanguage.availableLanguages(),
        booking: {},
        chosenTestLanguage: undefined,
        errors: [],
        backLink: 'test-type',
        inManagedBookingEditMode: false,
      });
    });

    test('back link in edit mode takes you back to check-your-answers', () => {
      req.session.journey.support = false;
      req.session.journey.standardAccommodation = true;
      req.session.journey.inManagedBookingEditMode = false;
      req.session.journey.inEditMode = true;

      isStandardJourney.mockReturnValue(true);

      testLanguageController.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.TEST_LANGUAGE, {
        availableLanguages: TestLanguage.availableLanguages(),
        booking: {},
        chosenTestLanguage: undefined,
        errors: [],
        backLink: 'check-your-answers',
        inManagedBookingEditMode: false,
      });
    });

    test('back link in edit mode takes you back to check-your-details when in non-standard accommodation', () => {
      req.session.journey.support = true;
      req.session.journey.standardAccommodation = false;
      req.session.journey.inManagedBookingEditMode = false;
      req.session.journey.inEditMode = true;

      isNonStandardJourney.mockReturnValue(true);

      testLanguageController.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.TEST_LANGUAGE, {
        availableLanguages: TestLanguage.availableLanguages(),
        booking: {},
        chosenTestLanguage: undefined,
        errors: [],
        backLink: 'check-your-details',
        inManagedBookingEditMode: false,
      });
    });

    test('NI users default language to English and skips page to select-standard-support', () => {
      req.query = {};
      req.session.journey.support = true;
      req.session.journey.standardAccommodation = true;
      req.session.target = Target.NI;

      isStandardJourney.mockReturnValue(true);

      testLanguageController.get(req, res);

      expect(res.redirect).toHaveBeenCalledWith('select-standard-support');
      expect(req.session.currentBooking.language).toBe(Language.ENGLISH);
    });

    test('GB NSA instructor ERS users should be redirected to select-support-type page', () => {
      req.query = {};
      req.session.journey.support = true;
      req.session.journey.standardAccommodation = true;
      req.session.journey.isInstructor = true;
      req.session.target = Target.GB;
      req.session.currentBooking.testType = TestType.ERS;

      testLanguageController.get(req, res);

      expect(res.redirect).toHaveBeenCalledWith('select-support-type');
    });

    test('Non-standard Accommodation NI users default language to English and skips page to select-support-type', () => {
      req.query = {};
      req.session.journey.standardAccommodation = false;
      req.session.journey.support = true;
      req.session.target = Target.NI;

      isNonStandardJourney.mockReturnValue(true);

      testLanguageController.get(req, res);

      expect(req.session.currentBooking.language).toBe(Language.ENGLISH);
    });

    test('when in Managed Booking Edit Mode the manageBookingEdits session will be reset', () => {
      req.session.journey.inManagedBookingEditMode = true;
      req.session.manageBookingEdits = {
        bsl: false,
      };

      isStandardJourney.mockReturnValue(true);

      testLanguageController.get(req, res);

      expect(req.session.manageBookingEdits).toBeUndefined();
      expect(res.render).toHaveBeenCalledWith(PageNames.TEST_LANGUAGE, {
        availableLanguages: TestLanguage.availableLanguages(),
        booking: {},
        chosenTestLanguage: undefined,
        errors: [],
        inManagedBookingEditMode: true,
      });
    });
  });

  describe('post', () => {
    test('throws an error is no journey is set', () => {
      req.session.currentBooking = mockSessionBooking();
      delete req.session.journey;
      expect(() => testLanguageController.post(req, res)).toThrow();
    });

    test('throws if trying to set test language for instructor test types', () => {
      req.session.journey.inEditMode = true;
      req.session.journey.support = false;
      req.session.journey.standardAccommodation = true;
      req.body = {
        testLanguage: Language.ENGLISH,
      };
      req.session.currentBooking.testType = TestType.ERS;
      expect(() => testLanguageController.post(req, res)).toThrow();
    });

    test('handles setting a language on standard journey and redirects to select-standard-support page', () => {
      req.session.currentBooking = mockSessionBooking();
      req.body = {
        testLanguage: Language.ENGLISH,
      };

      isStandardJourney.mockReturnValue(true);

      testLanguageController.post(req, res);

      expect(res.redirect).toHaveBeenLastCalledWith('select-standard-support');
      expect(req.session.currentBooking.language).toEqual(Language.ENGLISH);
    });

    test('handles setting a language in non-standard journey and redirects to select-support-type', () => {
      req.session.currentBooking = mockSessionBooking();
      req.body = {
        testLanguage: Language.ENGLISH,
      };

      req.session.journey.standardAccommodation = false;
      req.session.journey.support = true;

      isNonStandardJourney.mockReturnValue(true);

      testLanguageController.post(req, res);

      expect(res.redirect).toHaveBeenLastCalledWith('select-support-type');
      expect(req.session.currentBooking.language).toEqual(Language.ENGLISH);
    });

    test('handles setting a language on edit mode journey and redirects to check-your-answers', () => {
      req.session.currentBooking = mockSessionBooking();
      req.session.journey.inEditMode = true;
      req.session.journey.support = false;
      req.session.journey.standardAccommodation = true;
      req.body = {
        testLanguage: Language.WELSH,
      };

      isStandardJourney.mockReturnValue(true);

      testLanguageController.post(req, res);

      expect(res.redirect).toHaveBeenCalledWith('check-your-answers');
      expect(req.session.currentBooking.language).toEqual(Language.WELSH);
    });

    test('handles setting a language on edit mode journey and redirects to check-your-details', () => {
      req.session.currentBooking = mockSessionBooking();
      req.session.journey.inEditMode = true;
      req.session.journey.support = true;
      req.session.journey.standardAccommodation = false;
      req.body = {
        testLanguage: Language.WELSH,
      };

      isNonStandardJourney.mockReturnValue(true);

      testLanguageController.post(req, res);

      expect(res.redirect).toHaveBeenCalledWith('check-your-details');
      expect(req.session.currentBooking.language).toEqual(Language.WELSH);
    });

    test('handles setting a language in non standard accommodation journey and redirects to select-support-type', () => {
      req.session.currentBooking = mockSessionBooking();
      req.session.journey.standardAccommodation = false;
      req.body = {
        testLanguage: Language.WELSH,
      };

      isNonStandardJourney.mockReturnValue(true);

      testLanguageController.post(req, res);

      expect(req.session.currentBooking.language).toEqual(Language.WELSH);
    });

    test('handles setting a language on managed edit mode journey and redirects to check-change', () => {
      req.session.currentBooking = mockSessionBooking();
      req.session.journey.inManagedBookingEditMode = true;
      req.session.currentBooking.language = Language.ENGLISH;
      req.body = {
        testLanguage: Language.WELSH,
      };

      isStandardJourney.mockReturnValue(true);

      testLanguageController.post(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/manage-booking/check-change');
      expect(req.session.manageBookingEdits.language).toEqual(Language.WELSH);
      expect(req.session.currentBooking.language).toEqual(Language.ENGLISH);
    });

    test('renders test-language when there are errors', () => {
      req.hasErrors = true;
      req.errors = [{ msg: 'error' }];

      isStandardJourney.mockReturnValue(true);

      testLanguageController.post(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.TEST_LANGUAGE, {
        availableLanguages: TestLanguage.availableLanguages(),
        booking: {},
        backLink: 'test-type',
        chosenTestLanguage: undefined,
        errors: [{ msg: 'error' }],
        inManagedBookingEditMode: false,
      });
    });

    test('redirects to select-standard-support when receivedSupportRequestPageFlag is true', () => {
      req.session.journey.receivedSupportRequestPageFlag = true;
      req.session.currentBooking = mockSessionBooking();

      isStandardJourney.mockReturnValue(true);

      testLanguageController.post(req, res);

      expect(res.redirect).toHaveBeenCalledWith('select-standard-support');
    });

    test('throws an error if journey is missing but we have errors in the request', () => {
      delete req.session.journey;
      req.hasErrors = true;
      req.errors = [{ msg: 'error' }];

      expect(() => testLanguageController.post(req, res)).toThrow();
    });
  });
});
