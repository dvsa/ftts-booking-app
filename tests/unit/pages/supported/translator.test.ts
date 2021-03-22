import translatorController from '../../../../src/pages/supported/translator';
import { store } from '../../../../src/services/session';

describe('Translator controller', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      body: {
        translator: 'French',
      },
      errors: [],
      hasErrors: false,
      session: {},
    };

    res = {
      redirect: jest.fn(),
      render: jest.fn(),
    };

    store.currentBooking.update(req, {
      translator: 'French',
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET', () => {
    test('renders the view with correct data', () => {
      translatorController.get(req, res);

      expect(res.render).toHaveBeenCalledWith('supported/translator', {
        value: 'French',
        errors: [],
      });
    });

    test('renders the view with correct error message', () => {
      req.errors.push({
        param: 'translator',
        msg: 'some error',
      });

      translatorController.get(req, res);

      expect(res.render).toHaveBeenCalledWith('supported/translator', {
        value: 'French',
        errors: [{
          param: 'translator',
          msg: 'some error',
        }],
      });
    });
  });

  describe('POST', () => {
    test('redirects to the next page', () => {
      translatorController.post(req, res);

      expect(res.redirect).toHaveBeenCalledWith('#');
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

      expect(res.render).toHaveBeenCalledWith('supported/translator', {
        value: 'French',
        errors: [{
          param: 'translator',
          msg: 'Which translator',
        }],
      });
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
