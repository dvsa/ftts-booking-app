import { PageNames } from '@constants';
import translatorController from '@pages/instructor-translator/instructor-translator';

describe('Instructor Translator controller', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      body: {
        translator: 'French',
      },
      session: {
        journey: {
          inEditMode: false,
        },
      },
      errors: [],
      hasErrors: false,
      path: '/instructor/nsa/translator',
    };

    res = {
      redirect: jest.fn(),
      render: jest.fn(),
    };

    req.session.currentBooking = {
      ...req.session.currentBooking,
      translator: 'French',
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET', () => {
    test('renders the view with correct data', () => {
      translatorController.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_TRANSLATOR, {
        value: 'French',
        errors: [],
        backLink: 'select-support-type',
      });
    });

    test('edit mode - renders the view with correct data', () => {
      req.session.journey.inEditMode = true;

      translatorController.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_TRANSLATOR, {
        value: 'French',
        errors: [],
        backLink: 'check-your-details',
      });
    });

    test('renders the view with correct error message', () => {
      req.errors.push({
        param: 'translator',
        msg: 'some error',
      });

      translatorController.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_TRANSLATOR, {
        value: 'French',
        errors: [{
          param: 'translator',
          msg: 'some error',
        }],
        backLink: 'select-support-type',
      });
    });

    test('throws if not journey set', () => {
      delete req.session.journey;

      expect(() => translatorController.get(req, res)).toThrow(Error('InstructorTranslatorController::getBackLink: No journey set'));
    });

    test('throws if not booking set', () => {
      delete req.session.currentBooking;

      expect(() => translatorController.get(req, res)).toThrow(Error('InstructorTranslatorController::renderPage: No currentBooking set'));
    });
  });

  describe('POST', () => {
    test('navigates to the next page', () => {
      translatorController.post(req, res);

      expect(res.redirect).toHaveBeenCalledWith('leaving-nsa');
    });

    test('edit mode - navigates to check your details page', () => {
      req.session.journey.inEditMode = true;

      translatorController.post(req, res);

      expect(res.redirect).toHaveBeenCalledWith('check-your-details');
    });

    test('adds translator to the session', () => {
      req.body = { translator: 'French' };

      translatorController.post(req, res);

      expect(req.session.currentBooking.translator).toBe('French');
    });

    test('errors are displayed if they exist', () => {
      req.hasErrors = true;
      req.errors.push({
        param: 'translator',
        msg: 'Which translator',
      });

      translatorController.post(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_TRANSLATOR, {
        value: 'French',
        errors: [{
          param: 'translator',
          msg: 'Which translator',
        }],
        backLink: 'select-support-type',
      });
    });

    test('throws if not journey set', () => {
      delete req.session.journey;

      expect(() => translatorController.post(req, res)).toThrow(Error('InstructorTranslatorController::post: No journey set'));
    });
  });

  describe('Schema validation checks', () => {
    test('POST request', () => {
      expect(translatorController.postSchemaValidation).toEqual(expect.objectContaining({
        translator: {
          in: ['body'],
          isEmpty: {
            negated: true,
            errorMessage: expect.anything(),
          },
          isLength: {
            errorMessage: expect.anything(),
            options: {
              max: 100,
            },
          },
        },
      }));
    });
  });
});
