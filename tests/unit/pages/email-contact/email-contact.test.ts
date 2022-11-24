import emailContact from '@pages/email-contact/email-contact';
import { PageNames } from '@constants';
import { Language, Target, TestType } from '../../../../src/domain/enums';
import { translate } from '../../../../src/helpers/language';
import { isNonStandardJourney, isStandardJourney, isSupportedStandardJourney } from '../../../../src/helpers/journey-helper';

jest.mock('../../../../src/helpers/language', () => ({
  translate: jest.fn(),
}));

jest.mock('../../../../src/helpers/journey-helper', () => ({
  isStandardJourney: jest.fn(),
  isNonStandardJourney: jest.fn(),
  isSupportedStandardJourney: jest.fn(),
}));

describe('Contact details', () => {
  describe('Schema validation checks', () => {
    test('POST request', () => {
      expect(emailContact.postSchemaValidation()).toEqual(expect.objectContaining({
        email: {
          in: ['body'],
          trim: true,
          toLowerCase: true,
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
          trim: true,
          toLowerCase: true,
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
            options: emailContact.matchingEmailValidator,
          },
        },
      }));
    });
  });

  describe('Requests', () => {
    let req: any;
    let res: any;

    beforeEach(() => {
      isStandardJourney.mockReturnValue(false);
      isSupportedStandardJourney.mockReturnValue(false);
      isNonStandardJourney.mockReturnValue(false);

      req = {
        query: {},
        body: {},
        hasErrors: false,
        errors: [],
        session: {
          bookingdtt: {
            testType: TestType.CAR,
            testLanguage: Language.ENGLISH,
          },
          candidate: {},
          test: {},
          journey: {
            support: false,
            standardAccommodation: true,
          },
        },
      };
      res = {
        res_params: {
          chosenTestLanguage: '',
        },
        locals: {
          target: Target.GB,
        },
        status: jest.fn(),
        redirect: jest.fn(),
        render: jest.fn(),
      };
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    describe('GET', () => {
      test('Show email form page to users', () => {
        req.query = {};

        emailContact.get(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.EMAIL_CONTACT, {
          backLink: undefined,
          emailValue: undefined,
          confirmEmailValue: undefined,
          digitalResultsEmailInfo: false,
        });
      });

      test('back button is disabled on standard non support journey', () => {
        req.query = {};

        isStandardJourney.mockReturnValue(true);

        emailContact.get(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.EMAIL_CONTACT, {
          backLink: undefined,
          emailValue: undefined,
          confirmEmailValue: undefined,
          digitalResultsEmailInfo: false,
        });
      });

      test('back link goes to check-your-answers on standard supported journey during edit mode', () => {
        req.query = {};
        req.session.journey.standardAccommodation = true;
        req.session.journey.support = true;
        req.session.journey.inEditMode = true;

        isSupportedStandardJourney.mockReturnValue(true);

        emailContact.get(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.EMAIL_CONTACT, {
          backLink: 'check-your-answers',
          emailValue: undefined,
          confirmEmailValue: undefined,
          digitalResultsEmailInfo: false,
        });
      });

      test('back link goes to check-your-details on non-standard journey during edit mode', () => {
        req.query = {};
        req.session.journey.standardAccommodation = false;
        req.session.journey.support = true;
        req.session.journey.inEditMode = true;

        isNonStandardJourney.mockReturnValue(true);

        emailContact.get(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.EMAIL_CONTACT, {
          backLink: 'check-your-details',
          emailValue: undefined,
          confirmEmailValue: undefined,
          digitalResultsEmailInfo: false,
        });
      });

      test('back link goes to the leaving-nsa page when needing support but in standard journey', () => {
        req.query = {};
        req.session.journey.standardAccommodation = true;
        req.session.journey.support = true;
        req.session.journey.inEditMode = false;

        isSupportedStandardJourney.mockReturnValue(true);

        emailContact.get(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.EMAIL_CONTACT, {
          backLink: '/nsa/leaving-nsa',
          emailValue: undefined,
          confirmEmailValue: undefined,
          digitalResultsEmailInfo: false,
        });
      });

      test('instructor email contact page back link goes to the instructor leaving-nsa page when needing support but in standard journey', () => {
        req.query = {};
        req.session.journey.standardAccommodation = true;
        req.session.journey.support = true;
        req.session.journey.inEditMode = false;
        req.session.journey.isInstructor = true;

        isSupportedStandardJourney.mockReturnValue(true);

        emailContact.get(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.EMAIL_CONTACT, {
          backLink: '/instructor/nsa/leaving-nsa',
          emailValue: undefined,
          confirmEmailValue: undefined,
          digitalResultsEmailInfo: false,
        });
      });

      describe('When support has been selected', () => {
        test('Show email form page to users with back link', () => {
          req.query = {};
          req.session.journey = {
            ...req.session.journey,
            support: true,
            standardAccommodation: false,
          };

          isNonStandardJourney.mockReturnValue(true);

          emailContact.get(req, res);

          expect(res.render).toHaveBeenCalledWith(PageNames.EMAIL_CONTACT, {
            backLink: 'preferred-location',
            emailValue: undefined,
            confirmEmailValue: undefined,
            digitalResultsEmailInfo: false,
          });
        });
      });
    });

    describe('POST', () => {
      test('valid and matching email addresses proceed to next page', () => {
        req.body = { email: 'a@test.com', confirmEmail: 'a@test.com' };

        emailContact.post(req, res);

        expect(res.redirect).toHaveBeenCalledWith('test-type');
      });

      test('check whitespace removed when validating and matching email addresses before proceed to next page', () => {
        //  Validating with spaces
        req.body = { email: '      a@test.com', confirmEmail: 'a@test.com     ' };
        emailContact.post(req, res);
        expect(res.redirect).toHaveBeenCalledWith('test-type');

        //  Validating with tabs + spaces
        req.body = { email: '\ta@test.com', confirmEmail: ' a@test.com  \t \t  ' };
        emailContact.post(req, res);
        expect(res.redirect).toHaveBeenCalledWith('test-type');
      });

      test('check all characters reduced to lowercase when validating and matching email addresses before proceed to next page', () => {
        req.body = { email: '      a@Test.cOm', confirmEmail: 'A@teSt.cOM     ' };
        emailContact.post(req, res);
        expect(res.redirect).toHaveBeenCalledWith('test-type');
      });

      test('returns to the check your answers page if in edit mode and in standard journey', () => {
        req.session.journey.inEditMode = true;
        req.session.journey.standardAccommodation = true;
        req.session.journey.support = false;
        req.body = {
          email: 'another@test.com',
          confirmEmail: 'another@test.com',
        };

        isStandardJourney.mockReturnValue(true);

        emailContact.post(req, res);

        expect(res.redirect).toHaveBeenCalledWith('check-your-answers');
      });

      test('returns to the check your details page if in edit mode and in non-standard journey', () => {
        req.session.journey.inEditMode = true;
        req.session.journey.standardAccommodation = false;
        req.session.journey.support = true;
        req.body = {
          email: 'another@test.com',
          confirmEmail: 'another@test.com',
        };

        isNonStandardJourney.mockReturnValue(true);

        emailContact.post(req, res);

        expect(res.redirect).toHaveBeenCalledWith('check-your-details');
      });

      test('navigates to the test type page when no support requested and within standard accommodation journey', () => {
        req.session.journey.support = false;
        req.session.journey.standardAccommodation = true;
        req.body = { email: 'another@test.com', confirmEmail: 'another@test.com' };

        isStandardJourney.mockReturnValue(true);

        emailContact.post(req, res);

        expect(res.redirect).toHaveBeenCalledWith('test-type');
      });

      test('navigates to the find test centre page when support is requested but has moved to within standard accommodation journey', () => {
        req.session.journey.support = true;
        req.session.journey.standardAccommodation = true;
        req.body = { email: 'another@test.com', confirmEmail: 'another@test.com' };

        isSupportedStandardJourney.mockReturnValue(true);

        emailContact.post(req, res);

        expect(res.redirect).toHaveBeenCalledWith('/find-test-centre');
      });

      test('instructor email contact page navigates to the find test centre page when support is requested but has moved to within standard accommodation journey', () => {
        req.session.journey.support = true;
        req.session.journey.isInstructor = true;
        req.session.journey.standardAccommodation = true;
        req.body = { email: 'another@test.com', confirmEmail: 'another@test.com' };

        isSupportedStandardJourney.mockReturnValue(true);

        emailContact.post(req, res);

        expect(res.redirect).toHaveBeenCalledWith('/instructor/find-test-centre');
      });

      test('navigates to the telephone contact page when support is requested and has remained within non-standard accommodation journey', () => {
        req.session.journey.support = true;
        req.session.journey.standardAccommodation = false;
        req.body = { email: 'another@test.com', confirmEmail: 'another@test.com' };

        isNonStandardJourney.mockReturnValue(true);

        emailContact.post(req, res);

        expect(res.redirect).toHaveBeenCalledWith('telephone-contact');
      });

      test('adds email address to session', () => {
        req.body = { email: 'a@test.com', confirmEmail: 'a@test.com' };

        emailContact.post(req, res);

        expect(req.session.candidate.email).toBe('a@test.com');
      });

      test('renders email-contact when there are errors', () => {
        req.hasErrors = true;

        isStandardJourney.mockReturnValue(true);

        emailContact.post(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.EMAIL_CONTACT, {
          backLink: undefined,
          confirmEmailValue: undefined,
          emailValue: undefined,
          digitalResultsEmailInfo: false,
          errors: [],
        });
      });
    });

    describe('Helpers', () => {
      test('validate matching emails', () => {
        req.body.email = 'a@test.com';

        const email = emailContact.matchingEmailValidator('a@test.com', { req } as any);

        expect(email).toStrictEqual('a@test.com');
      });

      test('empty email string throws error', () => {
        req.body.email = 'b@test.com';
        const errorMessage = 'Ensure confirmation email address matches email address';
        translate.mockImplementation(() => errorMessage);

        expect(() => emailContact.matchingEmailValidator('', { req } as any))
          .toThrow(errorMessage);
      });

      test('non matching emails throws error', () => {
        req.body.email = 'b@test.com';
        const errorMessage = 'Ensure confirmation email address matches email address';
        translate.mockImplementation(() => errorMessage);

        expect(() => emailContact.matchingEmailValidator('a@test.com', { req } as any))
          .toThrow(errorMessage);
      });
    });
  });
});
