import contactDetails from '../../../../src/pages/book-a-test/contact-details';
import { LANGUAGE, TARGET, TestType } from '../../../../src/domain/enums';
import { translate } from '../../../../src/helpers/language';
import { store } from '../../../../src/services/session';

jest.mock('../../../../src/helpers/language', () => ({
  translate: jest.fn(),
}));

describe('Contact details', () => {
  describe('Schema validation checks', () => {
    test('POST request', () => {
      expect(contactDetails.postSchemaValidation()).toEqual(expect.objectContaining({
        email: {
          in: ['body'],
          isEmail: {
            errorMessage: expect.anything(),
            options: {
              ignore_max_length: true,
            },
          },
          isLength: {
            errorMessage: expect.anything(),
            options: {
              max: 100,
            },
          },
        },
        confirmEmail: {
          in: ['body'],
          isEmail: {
            errorMessage: expect.anything(),
            options: {
              ignore_max_length: true,
            },
          },
          isLength: {
            errorMessage: expect.anything(),
            options: {
              max: 100,
            },
          },
          custom: {
            options: contactDetails.matchingEmailValidator,
          },
        },
      }));
    });
  });

  describe('Requests', () => {
    let req: any;
    let res: any;

    beforeEach(() => {
      req = {
        query: {},
        body: {},
        hasErrors: false,
        errors: [],
        session: {
          bookingdtt: {
            testType: TestType.Car,
            testLanguage: LANGUAGE.ENGLISH,
          },
          candidate: {},
          test: {},
          journey: {},
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

      store.journey.update(req, {
        support: false,
        standardAccommodation: true,
      });
    });

    describe('GET', () => {
      test('Show email form page to users', () => {
        req.query = {};

        contactDetails.get(req, res);

        expect(res.res_template).toBe('contact-details');
        expect(res.res_params).toStrictEqual({
          backLink: undefined,
          emailValue: undefined,
          confirmEmailValue: undefined,
          standardAccommodation: true,
        });
      });

      describe('When support has been selected', () => {
        test('Show email form page to users with back link', () => {
          req.query = {};
          store.journey.update(req, {
            support: true,
            standardAccommodation: false,
          });

          contactDetails.get(req, res);

          expect(res.res_template).toBe('contact-details');
          expect(res.res_params).toStrictEqual({
            backLink: '#',
            emailValue: undefined,
            confirmEmailValue: undefined,
            standardAccommodation: false,
          });
        });
      });
    });

    describe('POST', () => {
      test('valid and matching email addresses proceed to next page', () => {
        req.body = { email: 'a@test.com', confirmEmail: 'a@test.com' };

        contactDetails.post(req, res);

        expect(res.res_url).toBe('test-type');
      });

      test('returns to the check your answers page if in edit mode', () => {
        req.session.journey.inEditMode = true;
        req.body = { email: 'another@test.com', confirmEmail: 'another@test.com' };

        contactDetails.post(req, res);

        expect(res.res_url).toBe('check-your-answers');
      });

      test('adds email address to session', () => {
        req.body = { email: 'a@test.com', confirmEmail: 'a@test.com' };

        contactDetails.post(req, res);

        expect(req.session.candidate.email).toBe('a@test.com');
      });

      test('renders contact-details when there are errors', () => {
        req.hasErrors = true;

        contactDetails.post(req, res);

        expect(res.res_template).toBe('contact-details');
      });
    });

    describe('Helpers', () => {
      test('validate matching emails', () => {
        req.body.email = 'a@test.com';

        const email = contactDetails.matchingEmailValidator('a@test.com', { req } as any);

        expect(email).toStrictEqual('a@test.com');
      });

      test('empty email string throws error', () => {
        req.body.email = 'b@test.com';
        const errorMessage = 'Ensure confirmation email address matches email address';
        translate.mockImplementation(() => errorMessage);

        expect(() => contactDetails.matchingEmailValidator('', { req } as any))
          .toThrowError(errorMessage);
      });

      test('non matching emails throws error', () => {
        req.body.email = 'b@test.com';
        const errorMessage = 'Ensure confirmation email address matches email address';
        translate.mockImplementation(() => errorMessage);

        expect(() => contactDetails.matchingEmailValidator('a@test.com', { req } as any))
          .toThrowError(errorMessage);
      });
    });
  });
});
