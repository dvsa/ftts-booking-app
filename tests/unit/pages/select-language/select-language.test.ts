import { TestLanguage } from '../../../../src/domain/test-language';
import { ValidatorSchema } from '../../../../src/middleware/request-validator';
import selectLanguage from '../../../../src/pages/select-language/select-language';
import { LANGUAGE, TARGET } from '../../../../src/domain/enums';

describe('SelectLanguageController', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = {
      query: {},
      body: {},
      hasErrors: false,
      errors: [],
      session: {
        currentBooking: {},
        journey: {
          inManagedBookingEditMode: false,
        },
        manageBookingEdits: {},
      },
    };
    res = {
      res_params: {
        chosenTestLanguage: '',
      },
      locals: {
        target: TARGET.GB,
      },
      res_url: '',
      res_status: 200,
      res_template: '',
      status: (status: number): object => {
        res.res_status = status;
        return res;
      },
      redirect: (url: string): void => {
        res.res_url = url;
        res.res_status = 302;
      },
      render: (template: string, params: any): void => {
        res.res_template = template;
        res.res_params = params;
      },
    };
  });

  describe('get', () => {
    test('Show Test Language selection page to GB users', () => {
      req.query = {};
      res.locals.target = TARGET.GB;

      selectLanguage.get(req, res);

      expect(res.res_template).toBe('test-language');
      expect(res.res_params).toStrictEqual({
        availableLanguages: TestLanguage.availableLanguages(),
        booking: {},
        chosenTestLanguage: undefined,
        errors: [],
        inManagedBookingEditMode: false,
      });
    });

    test('NI users default language to English and skips page', () => {
      req.query = {};
      res.locals.target = TARGET.NI;

      selectLanguage.get(req, res);

      expect(res.res_url).toBe('find-test-centre');
      expect(req.session.currentBooking.language).toBe(LANGUAGE.ENGLISH);
    });

    test('when in Managed Booking Edit Mode the manageBookingEdits session will be reset', () => {
      req.session.journey.inManagedBookingEditMode = true;
      req.session.manageBookingEdits = {
        bsl: false,
      };

      selectLanguage.get(req, res);

      expect(req.session.manageBookingEdits).toStrictEqual({});
      expect(res.res_template).toBe('test-language');
      expect(res.res_params).toStrictEqual({
        availableLanguages: TestLanguage.availableLanguages(),
        booking: {},
        chosenTestLanguage: undefined,
        errors: [],
        inManagedBookingEditMode: true,
      });
    });
  });

  describe('post', () => {
    test('handles setting a language on standard journey and redirects to find-test-centre', () => {
      req.body = {
        testLanguage: LANGUAGE.ENGLISH,
      };

      selectLanguage.post(req, res);

      expect(res.res_url).toBe('find-test-centre');
      expect(req.session.currentBooking.language).toEqual(LANGUAGE.ENGLISH);
    });

    test('handles setting a language on edit mode journey and redirects to check-your-answers', () => {
      req.session.journey.inEditMode = true;
      req.body = {
        testLanguage: LANGUAGE.WELSH,
      };

      selectLanguage.post(req, res);

      expect(res.res_url).toBe('check-your-answers');
      expect(req.session.currentBooking.language).toEqual(LANGUAGE.WELSH);
    });

    test('handles setting a language on managed edit mode journey and redirects to check-change', () => {
      req.session.journey.inManagedBookingEditMode = true;
      req.session.currentBooking.language = LANGUAGE.ENGLISH;
      req.body = {
        testLanguage: LANGUAGE.WELSH,
      };

      selectLanguage.post(req, res);

      expect(res.res_url).toBe('/manage-booking/check-change');
      expect(req.session.manageBookingEdits.language).toEqual(LANGUAGE.WELSH);
      expect(req.session.currentBooking.language).toEqual(LANGUAGE.ENGLISH);
    });
    test('renders test-language when there are errors', () => {
      req.hasErrors = true;

      selectLanguage.post(req, res);

      expect(res.res_template).toBe('test-language');
    });
  });

  describe('Schema validation checks', () => {
    test('POST request', () => {
      const expectedValidationSchema: ValidatorSchema = {
        testLanguage: {
          in: ['body'],
          custom: {
            options: TestLanguage.isValid,
          },
        },
      };
      expect(selectLanguage.testLanguagePostSchema()).toStrictEqual(expectedValidationSchema);
    });
  });
});
