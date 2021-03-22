import { Candidate } from '../../../../src/domain/candidate/candidate';
import IncorrectCandidateDetails from '../../../../src/domain/candidate/incorrect-candidate-details-error';
import { LicenceNumber } from '../../../../src/domain/licence-number';
import { ValidatorSchema } from '../../../../src/middleware/request-validator';
import { BirthDay } from '../../../../src/pages/details/birth-day';
import details, { CandidateDetailsController } from '../../../../src/pages/candidate-details/candidate-details';
import DvlaError from '../../../../src/services/dvla-gateway/dvla-error';
import { Dvla } from '../../../../src/pages/details/dvla';
import { UtcDate } from '../../../../src/domain/utc-date';
import { store } from '../../../../src/services/session';
import { Voiceover } from '../../../../src/domain/enums';

jest.mock('../../../../src/domain/candidate/candidate');
jest.mock('../../../../src/helpers/language', () => ({
  translate: () => 'mockTranslatedString',
}));

describe('Candidate Details controller', () => {
  let candidate = Candidate.prototype;
  let req: any;
  let res: any;

  const mockCandidate = Candidate as jest.Mocked<typeof Candidate>;

  beforeEach(() => {
    req = {
      query: {},
      body: {
        firstnames: 'Wendy',
        surname: 'Jones',
        licenceNumber: 'JONES061102W97YT',
        dobDay: 10,
        dobMonth: 11,
        dobYear: 2002,
      },
      hasErrors: false,
      errors: [],
      session: {
        candidate: {
          firstnames: 'Oldy',
          surname: 'McOldface',
        },
        journey: {
          support: false,
        },
      },
    };

    res = {
      res_params: {},
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

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET', () => {
    test('renders the candidate details page', () => {
      details.get(req, res);

      expect(res.res_template).toBe('candidate-details/candidate-details');
      expect(res.res_params).toStrictEqual({
        details: {},
        support: false,
      });
    });

    test('renders the candidate details page if additional support has been requested', () => {
      req.session.journey.support = true;

      details.get(req, res);

      expect(res.res_template).toBe('candidate-details/candidate-details');
      expect(res.res_params).toStrictEqual({
        details: {},
        support: true,
      });
    });

    test('pre-populates the licence number if provided in the url query', () => {
      const mockLicenceNumber = 'JONES061102W97YT';
      req.query.licenceNum = mockLicenceNumber;

      details.get(req, res);

      expect(res.res_params).toStrictEqual({
        details: {
          licenceNumber: mockLicenceNumber,
        },
        support: false,
      });
    });
  });

  describe('POST', () => {
    describe('if the form input validation fails', () => {
      test('re-renders the view with an error', async () => {
        req.hasErrors = true;

        await details.post(req, res);

        expect(res.res_template).toBe('candidate-details/candidate-details');
        expect(res.res_params.details).toStrictEqual(req.body);
        expect(res.res_params.errors).toHaveLength(1);
      });
    });

    describe('if the candidate details are not found', () => {
      test('re-renders the view with an error', async () => {
        mockCandidate.fromUserDetails.mockRejectedValue(new DvlaError());

        await details.post(req, res);

        expect(res.res_template).toBe('candidate-details/candidate-details');
        expect(res.res_params.details).toStrictEqual(req.body);
        expect(res.res_params.errors).toHaveLength(1);
      });
    });

    describe('if the candidate details do not match', () => {
      test('re-renders the view with an error', async () => {
        mockCandidate.fromUserDetails.mockRejectedValue(new IncorrectCandidateDetails());

        await details.post(req, res);

        expect(res.res_template).toBe('candidate-details/candidate-details');
        expect(res.res_params.details).toStrictEqual(req.body);
        expect(res.res_params.errors).toHaveLength(1);
      });
    });

    describe('if the candidate details are found and do match', () => {
      beforeEach(() => {
        candidate = {
          licence: {
            firstnames: 'Newy',
            surname: 'McNewface',
            num: {
              toString: () => 'licence',
            },
            birthDate: new UtcDate(new Date('1990-01-01T00:00:00Z')),
            entitlements: {
              toString: () => 'entitlements',
            },
          },
        } as any;
        mockCandidate.fromUserDetails.mockResolvedValue(candidate);
      });

      test('starts a new candidate session', async () => {
        await details.post(req, res);

        expect(req.session.candidate).toEqual({
          firstnames: 'Newy',
          surname: 'McNewface',
          dateOfBirth: '1990-01-01',
          licenceNumber: 'licence',
          entitlements: 'entitlements',
        });
        expect(req.session.currentBooking).toEqual({
          bsl: false,
          voiceover: Voiceover.NONE,
        });
      });

      test('redirects to the contact details page', async () => {
        await details.post(req, res);

        expect(res.res_status).toBe(302);
        expect(res.res_url).toBe('contact-details');
      });

      describe('and the candidate has chosen to have support', () => {
        test('redirects to the test type page', async () => {
          store.journey.update(req, {
            support: true,
          });
          await details.post(req, res);

          expect(res.res_status).toBe(302);
          expect(res.res_url).toBe('test-type');
        });
      });

      test('redirects to the contact details page', async () => {
        await details.post(req, res);

        expect(res.res_status).toBe(302);
        expect(res.res_url).toBe('contact-details');
      });
    });
  });

  describe('Details controller schema validation checks', () => {
    test('POST request', () => {
      const expectedValidationSchema: ValidatorSchema = {
        firstnames: {
          in: ['body'],
          isEmpty: {
            negated: true,
          },
        },
        surname: {
          in: ['body'],
          isEmpty: {
            negated: true,
          },
        },
        licenceNumber: {
          in: ['body'],
          custom: {
            options: LicenceNumber.isValid,
          },
        },
        dobDay: {
          in: ['body'],
          custom: {
            options: BirthDay.isValid,
          },
        },
      };
      expect(new CandidateDetailsController({} as Dvla).postSchemaValidation).toStrictEqual(expectedValidationSchema);
    });
  });
});
