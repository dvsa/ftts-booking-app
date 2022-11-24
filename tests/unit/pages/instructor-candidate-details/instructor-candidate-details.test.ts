import { v4 as uuid4 } from 'uuid';
import { InstructorCandidateDetailsController } from '@pages/instructor-candidate-details/instructor-candidate-details';
import { PageNames } from '@constants';
import config from '../../../../src/config';
import {
  Locale, Target, TestType, Voiceover,
} from '../../../../src/domain/enums';
import { CrmCreateUpdateCandidateError } from '../../../../src/domain/errors/crm/CrmCreateUpdateCandidateError';
import { EligibilityAuthError } from '../../../../src/domain/errors/eligibility/EligibilityAuthError';
import { EligibilityNotLatestLicenceError } from '../../../../src/domain/errors/eligibility/EligibilityNotLatestLicenceError';
import { EligibilityRetrieveError } from '../../../../src/domain/errors/eligibility/EligibilityRetrieveError';
import { EligibilityServerError } from '../../../../src/domain/errors/eligibility/EligibilityServerError';
import { EligibilityTooManyRequestsError } from '../../../../src/domain/errors/eligibility/EligibilityTooManyRequestsError';
import { logger } from '../../../../src/helpers/logger';
import { CandidateService } from '../../../../src/services/candidates/candidate-service';
import { CRMGateway } from '../../../../src/services/crm-gateway/crm-gateway';
import { EligibilityGateway } from '../../../../src/services/eligibility/eligibility-gateway';
import { Candidate } from '../../../../src/services/session';

jest.mock('../../../../src/helpers/language', () => ({
  translate: () => 'mockTranslatedString',
}));
const gbGovLink = 'https://www.gov.uk';
const niGovLink = 'https://www.nidirect.gov.uk';

describe('Instructor Candidate Details controller', () => {
  let req: any;
  let res: any;
  let candidateDetailsController: InstructorCandidateDetailsController;

  const eligibilityGateway = EligibilityGateway.prototype;
  let crmGateway: Partial<CRMGateway>;
  const candidateService = CandidateService.prototype;

  const mockLicence = 'JONES061102W97YT';
  const mockPrn = '123456';
  const mockCandidateId = uuid4();
  const mockLicenceId = uuid4();

  let mockBody;
  let mockEligibilityResponse: Partial<Candidate>;
  let mockCandidateResponse: Partial<Candidate>;

  beforeEach(() => {
    mockBody = {
      firstnames: 'Wendy',
      surname: 'Jones',
      licenceNumber: mockLicence,
      dobDay: '10',
      dobMonth: '11',
      dobYear: '2002',
      personalReference: mockPrn,
    };

    mockEligibilityResponse = {
      candidateId: mockCandidateId,
      firstnames: 'Wendy',
      surname: 'Jones',
      dateOfBirth: '2002-11-10',
      address: {
        line1: '42 Somewhere Street',
        line2: 'This Village',
        line3: 'This County',
        line4: 'Nowhere',
        line5: 'Birmingham',
        postcode: 'B5 1AA',
      },
      eligibilities: [{
        testType: TestType.CAR,
        eligible: false,
        eligibleFrom: '2020-01-01',
        eligibleTo: '2030-01-01',
      }, {
        testType: TestType.ADIP1,
        eligible: true,
        personalReferenceNumber: mockPrn,
        eligibleFrom: '2020-01-01',
        eligibleTo: '2030-01-01',
      }],
      eligibleToBookOnline: true,
    };

    mockCandidateResponse = {
      candidateId: mockCandidateId,
      firstnames: 'Wendy',
      surname: 'Jones',
      email: 'wendyjones@gmail.com',
      dateOfBirth: '2002-11-10',
      licenceId: mockLicenceId,
      licenceNumber: mockLicence,
      personReference: 'mockRef',
      address: {
        line1: '42 Somewhere Street',
        line2: 'This Village',
        line3: 'This County',
        line4: 'Nowhere',
        line5: 'Birmingham',
        postcode: 'B5 1AA',
      },
    };

    req = {
      query: {},
      body: mockBody,
      hasErrors: false,
      errors: [],
      session: {
        candidate: {},
        journey: {
          support: false,
        },
        target: Target.GB,
        locale: Locale.GB,
      },
    };

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      locals: {
        target: Target.GB,
      },
    };

    eligibilityGateway.getEligibility = jest.fn().mockResolvedValue(mockEligibilityResponse);

    crmGateway = {
      createLicence: jest.fn(),
      createCandidate: jest.fn(),
      updateCandidate: jest.fn(),
      updateLicence: jest.fn(),
      getLicenceNumberRecordsByCandidateId: jest.fn(),
    };

    candidateDetailsController = new InstructorCandidateDetailsController(new CandidateService(crmGateway as any, eligibilityGateway));

    config.landing = {
      enableInternalEntrypoints: false,
      gb: {
        citizen: {
          book: `${gbGovLink}/book-theory-test`,
          check: `${gbGovLink}/check-theory-test`,
          change: `${gbGovLink}/change-theory-test`,
          cancel: `${gbGovLink}/cancel-theory-test`,
        },
        instructor: {
          book: `${gbGovLink}/book-your-instructor-theory-test`,
          manageBooking: `${gbGovLink}/check-change-cancel-your-instructor-theory-test`,
        },
      },
      cy: {
        citizen: {
          book: `${gbGovLink}/archebu-prawf-gyrru-theori`,
        },
      },
      ni: {
        citizen: {
          book: `${niGovLink}/services/book-change-or-cancel-your-theory-test-online`,
          manageBooking: `${niGovLink}/services/book-change-or-cancel-your-theory-test-online`,
        },
        instructor: {
          book: `${niGovLink}/services/adi-theory-test-part-one-hazard-perception-test`,
          manageBooking: `${niGovLink}/services/adi-theory-test-part-one-hazard-perception-test`,
        },
      },
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET', () => {
    test('renders the candidate details page', () => {
      candidateDetailsController.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_CANDIDATE_DETAILS, expect.objectContaining({
        details: {},
        support: false,
      }));
    });

    test('when session contains test type redirects to /', () => {
      req.session.currentBooking = {
        testType: TestType.ADIP1,
      };

      candidateDetailsController.get(req, res);

      expect(res.render).not.toHaveBeenCalled();
      expect(req.session.candidate).toBeUndefined();
      expect(req.session.currentBooking).toBeUndefined();
      expect(res.redirect).toHaveBeenCalledWith('/instructor');
    });

    describe('back button navigation', () => {
      test('go back to choose support', () => {
        candidateDetailsController.get(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_CANDIDATE_DETAILS, expect.objectContaining({
          backLink: '/instructor/choose-support',
        }));
      });

      test('navigate back to NI book instructor test start page if target is NI', () => {
        req.session.target = Target.NI;

        candidateDetailsController.get(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_CANDIDATE_DETAILS, expect.objectContaining({
          backLink: 'https://www.nidirect.gov.uk/services/adi-theory-test-part-one-hazard-perception-test',
        }));
      });
    });
  });

  describe('POST', () => {
    describe('candidate exists in CRM', () => {
      test('corrects licence capitalisation and trims spaces before sending to eligibility', async () => {
        eligibilityGateway.getEligibility = jest.fn().mockResolvedValue(mockEligibilityResponse);
        crmGateway.getLicenceNumberRecordsByCandidateId = jest.fn().mockResolvedValue({
          ...mockCandidateResponse,
        });
        mockBody.licenceNumber = ' jOnES  061102W97YT ';

        await candidateDetailsController.post(req, res);

        expect(eligibilityGateway.getEligibility).toHaveBeenCalledWith('JONES061102W97YT', false, Target.GB, Locale.GB);
        expect(res.redirect).toHaveBeenCalledWith('email-contact');
      });

      test('renders the email page if call to Eligibility is successful and candidate has a licence record', async () => {
        eligibilityGateway.getEligibility = jest.fn().mockResolvedValue(mockEligibilityResponse);
        crmGateway.getLicenceNumberRecordsByCandidateId = jest.fn().mockResolvedValue({
          ...mockCandidateResponse,
        });

        await candidateDetailsController.post(req, res);

        expect(eligibilityGateway.getEligibility).toHaveBeenCalledWith(mockLicence, false, Target.GB, Locale.GB);
        expect(req.session.candidate).toStrictEqual({
          ...mockEligibilityResponse,
          licenceNumber: mockLicence,
          licenceId: mockLicenceId,
          personalReferenceNumber: mockPrn,
          paymentReceiptNumber: undefined, // only populated for NI user
          personReference: mockCandidateResponse.personReference,
          supportEvidenceStatus: undefined,
          supportNeedName: undefined,
        });
        expect(req.session.currentBooking).toStrictEqual({
          bsl: false,
          voiceover: Voiceover.NONE,
        });
        expect(res.redirect).toHaveBeenCalledWith('email-contact');
      });

      test('renders the email page if call to Eligibility is successful and candidate doesn\'t have a licence record', async () => {
        const newLicenceId = uuid4();
        eligibilityGateway.getEligibility = jest.fn().mockResolvedValue(mockEligibilityResponse);
        crmGateway.getLicenceNumberRecordsByCandidateId.mockResolvedValue({
          ...mockCandidateResponse,
          licenceId: newLicenceId,
        });

        await candidateDetailsController.post(req, res);

        expect(eligibilityGateway.getEligibility).toHaveBeenCalledWith(mockLicence, false, Target.GB, Locale.GB);
        expect(req.session.candidate).toStrictEqual({
          ...mockEligibilityResponse,
          licenceNumber: mockLicence,
          licenceId: newLicenceId,
          personReference: mockCandidateResponse.personReference,
          personalReferenceNumber: mockPrn,
          paymentReceiptNumber: undefined, // only populated for NI user
          supportEvidenceStatus: undefined,
          supportNeedName: undefined,
        });
        expect(req.session.currentBooking).toStrictEqual({
          bsl: false,
          voiceover: Voiceover.NONE,
        });
        expect(res.redirect).toHaveBeenCalledWith('email-contact');
      });

      test('renders the test type page if in support mode, call to Eligibility is successful and candidate has a licence record', async () => {
        req.session.journey.support = true;
        eligibilityGateway.getEligibility = jest.fn().mockResolvedValue({
          ...mockEligibilityResponse,
          firstnames: 'Wendy',
        });
        crmGateway.getLicenceNumberRecordsByCandidateId = jest.fn().mockResolvedValue({
          ...mockCandidateResponse,
        });

        await candidateDetailsController.post(req, res);

        expect(eligibilityGateway.getEligibility).toHaveBeenCalledWith(mockBody.licenceNumber, false, Target.GB, Locale.GB);
        expect(crmGateway.getLicenceNumberRecordsByCandidateId).toHaveBeenCalledWith(mockEligibilityResponse.candidateId, mockLicence);
        expect(req.session.candidate).toStrictEqual({
          ...mockEligibilityResponse,
          licenceNumber: mockLicence,
          licenceId: mockLicenceId,
          personReference: mockCandidateResponse.personReference,
          personalReferenceNumber: mockPrn,
          paymentReceiptNumber: undefined, // only populated for NI user
          supportEvidenceStatus: undefined,
          supportNeedName: undefined,
        });
        expect(req.session.currentBooking).toStrictEqual({
          bsl: false,
          voiceover: Voiceover.NONE,
        });
        expect(res.redirect).toHaveBeenCalledWith('test-type');
      });

      test('renders the test type page if in support mode, call to Eligibility is successful and candidate doesn\'t have a licence record', async () => {
        req.session.journey.support = true;
        const newLicenceId = uuid4();
        eligibilityGateway.getEligibility = jest.fn().mockResolvedValue({
          ...mockEligibilityResponse,
          firstnames: 'Wendy',
        });
        crmGateway.getLicenceNumberRecordsByCandidateId.mockResolvedValue({
          ...mockCandidateResponse,
          licenceId: newLicenceId,
        });

        await candidateDetailsController.post(req, res);

        expect(eligibilityGateway.getEligibility).toHaveBeenCalledWith(mockBody.licenceNumber, false, Target.GB, Locale.GB);
        expect(crmGateway.getLicenceNumberRecordsByCandidateId).toHaveBeenCalledWith(mockEligibilityResponse.candidateId, mockLicence);
        expect(req.session.candidate).toStrictEqual({
          ...mockEligibilityResponse,
          licenceNumber: mockLicence,
          licenceId: newLicenceId,
          personReference: mockCandidateResponse.personReference,
          personalReferenceNumber: mockPrn,
          paymentReceiptNumber: undefined, // only populated for NI user
          supportEvidenceStatus: undefined,
          supportNeedName: undefined,
        });
        expect(req.session.currentBooking).toStrictEqual({
          bsl: false,
          voiceover: Voiceover.NONE,
        });
        expect(res.redirect).toHaveBeenCalledWith('test-type');
      });
    });

    describe('candidate doesn\'t exist in CRM', () => {
      test('renders the email page if call to Eligibility is successful', async () => {
        mockEligibilityResponse = {
          ...mockEligibilityResponse,
          candidateId: undefined,
        };
        eligibilityGateway.getEligibility = jest.fn().mockResolvedValue(mockEligibilityResponse);
        crmGateway.createCandidate = jest.fn().mockResolvedValue(mockCandidateId);
        crmGateway.createLicence = jest.fn().mockResolvedValue(mockLicenceId);
        crmGateway.getLicenceNumberRecordsByCandidateId = jest.fn().mockResolvedValue(mockCandidateResponse);

        await candidateDetailsController.post(req, res);

        expect(eligibilityGateway.getEligibility).toHaveBeenCalledWith(mockLicence, false, Target.GB, Locale.GB);
        expect(req.session.candidate).toStrictEqual({
          ...mockEligibilityResponse,
          candidateId: mockCandidateId,
          licenceNumber: mockCandidateResponse.licenceNumber,
          licenceId: mockLicenceId,
          personReference: mockCandidateResponse.personReference,
          personalReferenceNumber: mockPrn,
          paymentReceiptNumber: undefined, // only populated for NI user
          supportEvidenceStatus: undefined,
          supportNeedName: undefined,
        });
        expect(req.session.currentBooking).toStrictEqual({
          bsl: false,
          voiceover: Voiceover.NONE,
        });
        expect(res.redirect).toHaveBeenCalledWith('email-contact');
      });

      test('renders the test type page if call to Eligibility is successful and in support mode', async () => {
        req.session.journey.support = true;
        mockEligibilityResponse = {
          ...mockEligibilityResponse,
          candidateId: undefined,
        };
        eligibilityGateway.getEligibility = jest.fn().mockResolvedValue(mockEligibilityResponse);
        crmGateway.createCandidate = jest.fn().mockResolvedValue(mockCandidateId);
        crmGateway.createLicence = jest.fn().mockResolvedValue(mockLicenceId);
        crmGateway.getLicenceNumberRecordsByCandidateId = jest.fn().mockResolvedValue(mockCandidateResponse);

        await candidateDetailsController.post(req, res);

        expect(eligibilityGateway.getEligibility).toHaveBeenCalledWith(mockLicence, false, Target.GB, Locale.GB);
        expect(req.session.candidate).toStrictEqual({
          ...mockEligibilityResponse,
          candidateId: mockCandidateId,
          licenceNumber: mockCandidateResponse.licenceNumber,
          licenceId: mockLicenceId,
          personReference: mockCandidateResponse.personReference,
          personalReferenceNumber: mockPrn,
          paymentReceiptNumber: undefined, // only populated for NI user
          supportEvidenceStatus: undefined,
          supportNeedName: undefined,
        });
        expect(req.session.currentBooking).toStrictEqual({
          bsl: false,
          voiceover: Voiceover.NONE,
        });
        expect(res.redirect).toHaveBeenCalledWith('test-type');
      });
    });

    test('throws error if a call to CRM fails when creating candidate', async () => {
      const error = new Error('failed to create candidate');
      mockEligibilityResponse.candidateId = undefined;
      eligibilityGateway.getEligibility = jest.fn().mockResolvedValue(mockEligibilityResponse);
      crmGateway.createCandidate = jest.fn().mockRejectedValue(error);

      await expect(candidateDetailsController.post(req, res)).rejects.toStrictEqual(new CrmCreateUpdateCandidateError());
    });

    test('throws error if a call to CRM fails when creating licence', async () => {
      const error = new Error('failed to create candidate');
      mockEligibilityResponse.candidateId = undefined;
      eligibilityGateway.getEligibility = jest.fn().mockResolvedValue(mockEligibilityResponse);
      crmGateway.createCandidate = jest.fn().mockResolvedValue(mockCandidateId);
      crmGateway.createLicence = jest.fn().mockRejectedValue(error);

      await expect(candidateDetailsController.post(req, res)).rejects.toStrictEqual(new CrmCreateUpdateCandidateError());
    });

    test('renders candidate details with an error if the form input validation fails', async () => {
      req.hasErrors = true;

      await candidateDetailsController.post(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_CANDIDATE_DETAILS, expect.objectContaining({
        details: mockBody,
        support: false,
        errors: expect.arrayContaining([expect.objectContaining({
          location: 'body',
          msg: 'mockTranslatedString',
          param: '',
        })]),
      }));
    });

    test('renders candidate details with an error if the eligibility call fails', async () => {
      eligibilityGateway.getEligibility = jest.fn().mockRejectedValue(new EligibilityRetrieveError());

      await candidateDetailsController.post(req, res);

      expect(eligibilityGateway.getEligibility).toHaveBeenCalledWith(mockBody.licenceNumber, false, Target.GB, Locale.GB);

      expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_CANDIDATE_DETAILS, expect.objectContaining({
        details: mockBody,
        support: false,
        errors: [{
          location: 'body',
          msg: 'mockTranslatedString',
          param: '',
        }],
      }));
    });

    test('handles 401 response from eligibility api', async () => {
      eligibilityGateway.getEligibility = jest.fn().mockRejectedValue(new EligibilityAuthError());

      await expect(candidateDetailsController.post(req, res)).rejects.toStrictEqual(new EligibilityAuthError());
    });

    test('handles 403 response from eligibility api', async () => {
      eligibilityGateway.getEligibility = jest.fn().mockRejectedValue(new EligibilityAuthError('403'));

      await expect(candidateDetailsController.post(req, res)).rejects.toStrictEqual(new EligibilityAuthError('403'));
    });

    test('handles 429 response from eligibility api', async () => {
      eligibilityGateway.getEligibility = jest.fn().mockRejectedValue(new EligibilityTooManyRequestsError());

      await candidateDetailsController.post(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_ELIGIBILITY_RETRY);
    });

    test('handles 500 response from eligibility api', async () => {
      eligibilityGateway.getEligibility = jest.fn().mockRejectedValue(new EligibilityTooManyRequestsError());

      await candidateDetailsController.post(req, res);

      expect(res.render).toHaveBeenCalledWith((PageNames.INSTRUCTOR_ELIGIBILITY_RETRY));
    });

    test('allows the user past the eligibility check if the the elibility data has trailing spaces', async () => {
      eligibilityGateway.getEligibility = jest.fn().mockResolvedValue({
        ...mockEligibilityResponse,
        firstnames: '  Wendy  ',
        surname: '  Jones  ',
      });

      await candidateDetailsController.post(req, res);

      expect(res.redirect).toHaveBeenCalledWith('email-contact');
    });

    test('allows the user past the eligibility check if the the first name is empty', async () => {
      eligibilityGateway.getEligibility = jest.fn().mockResolvedValue({
        ...mockEligibilityResponse,
        firstnames: '---',
      });

      req.body.firstnames = '';
      await candidateDetailsController.post(req, res);

      expect(res.redirect).toHaveBeenCalledWith('email-contact');
    });

    test('renders candidate details with an error if the candidates first name does not match eligibility first name', async () => {
      eligibilityGateway.getEligibility = jest.fn().mockResolvedValue({
        ...mockEligibilityResponse,
        firstnames: 'Brian',
      });

      await candidateDetailsController.post(req, res);

      expect(eligibilityGateway.getEligibility).toHaveBeenCalledWith(mockBody.licenceNumber, false, Target.GB, Locale.GB);

      expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_CANDIDATE_DETAILS, expect.objectContaining({
        details: mockBody,
        support: false,
        errors: [{
          location: 'body',
          msg: 'mockTranslatedString',
          param: '',
        }],
      }));
    });

    test('renders candidate details with an error if the candidates surname does not match eligibility surname', async () => {
      eligibilityGateway.getEligibility = jest.fn().mockResolvedValue({
        ...mockEligibilityResponse,
        surname: 'Adams',
      });

      await candidateDetailsController.post(req, res);

      expect(eligibilityGateway.getEligibility).toHaveBeenCalledWith(mockBody.licenceNumber, false, Target.GB, Locale.GB);

      expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_CANDIDATE_DETAILS, expect.objectContaining({
        details: mockBody,
        support: false,
        errors: [{
          location: 'body',
          msg: 'mockTranslatedString',
          param: '',
        }],
      }));
    });

    test('renders candidate details with an error if the candidates dob does not match eligibility dob', async () => {
      eligibilityGateway.getEligibility = jest.fn().mockResolvedValue({
        ...mockEligibilityResponse,
        dateOfBirth: '2020-01-01',
      });

      await candidateDetailsController.post(req, res);

      expect(eligibilityGateway.getEligibility).toHaveBeenCalledWith(mockBody.licenceNumber, false, Target.GB, Locale.GB);

      expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_CANDIDATE_DETAILS, expect.objectContaining({
        details: mockBody,
        support: false,
        errors: [{
          location: 'body',
          msg: 'mockTranslatedString',
          param: '',
        }],
      }));
    });

    test('candidate books with the correct PRN', async () => {
      req.body.personalReference = mockPrn;
      crmGateway.getLicenceNumberRecordsByCandidateId = jest.fn().mockResolvedValue({
        ...mockCandidateResponse,
      });
      eligibilityGateway.getEligibility = jest.fn().mockResolvedValue({
        ...mockEligibilityResponse,
      });

      await candidateDetailsController.post(req, res);

      expect(eligibilityGateway.getEligibility).toHaveBeenCalledWith(mockBody.licenceNumber, false, Target.GB, Locale.GB);

      expect(res.redirect).toHaveBeenCalledWith('email-contact');
    });

    test('candidate books with an incorrect PRN', async () => {
      req.body.personalReference = '324232'; // incorrect prn
      crmGateway.getLicenceNumberRecordsByCandidateId = jest.fn().mockResolvedValue({
        ...mockCandidateResponse,
      });
      eligibilityGateway.getEligibility = jest.fn().mockResolvedValue({
        ...mockEligibilityResponse,
      });

      await candidateDetailsController.post(req, res);

      expect(eligibilityGateway.getEligibility).toHaveBeenCalledWith(mockBody.licenceNumber, false, Target.GB, Locale.GB);

      expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_CANDIDATE_DETAILS, {
        backLink: '/instructor/choose-support',
        details: mockBody,
        support: false,
        errors: [{
          location: 'body',
          msg: 'mockTranslatedString',
          param: '',
        }],
      });
    });

    test.each([
      ['lowercase', mockLicence.toLowerCase()],
      ['mixed case', 'jOneS061102W97yT'],
    ])('redirects correctly to the next page if the candidate\'s driving licence number is entered in %s', async (_, licenceNumber) => {
      const mockBodyWithNonUppercaseLicenceNmber = { ...mockBody, licenceNumber };

      await candidateDetailsController.post({ ...req, body: mockBodyWithNonUppercaseLicenceNmber }, res);

      expect(eligibilityGateway.getEligibility).toHaveBeenCalledWith(mockLicence, false, Target.GB, Locale.GB);
      expect(req.session.candidate).toStrictEqual(expect.objectContaining({
        licenceNumber: mockLicence,
      }));
      expect(res.redirect).toHaveBeenCalledWith('email-contact');
    });

    test('redirects correctly to the next page if the candidate\'s dob is entered with no leading zeros and matches the eligibility dob', async () => {
      eligibilityGateway.getEligibility = jest.fn().mockResolvedValue({
        ...mockEligibilityResponse,
        dateOfBirth: '1996-09-07',
      });

      const mockBodyDobNoLeadingZeros = {
        ...mockBody,
        dobDay: '7',
        dobMonth: '9',
        dobYear: '1996',
      };

      await candidateDetailsController.post({ ...req, body: mockBodyDobNoLeadingZeros }, res);

      expect(eligibilityGateway.getEligibility).toHaveBeenCalledWith(mockBody.licenceNumber, false, Target.GB, Locale.GB);
      expect(res.redirect).toHaveBeenCalledWith('email-contact');
    });

    test('missing journey is caught', async () => {
      delete req.session.journey;

      await expect(candidateDetailsController.post(req, res))
        .rejects
        .toThrow(Error('InstructorCandidateDetailsController::post: No journey set'));
    });

    describe('errors', () => {
      test('candidate has no eligible tests', async () => {
        mockEligibilityResponse.eligibilities[1].eligible = false;

        await candidateDetailsController.post(req, res);

        expect(eligibilityGateway.getEligibility).toHaveBeenCalledWith(mockBody.licenceNumber, false, Target.GB, Locale.GB);
        expect(res.render).toHaveBeenCalledWith(PageNames.NO_ELIGIBILITY);
      });

      test('candidate cannot book online', async () => {
        mockEligibilityResponse.eligibleToBookOnline = false;

        await candidateDetailsController.post(req, res);

        expect(eligibilityGateway.getEligibility).toHaveBeenCalledWith(mockBody.licenceNumber, false, Target.GB, Locale.GB);
        expect(res.render).toHaveBeenCalledWith(PageNames.NO_ELIGIBILITY);
      });

      test('eligibility api returns 429', async () => {
        eligibilityGateway.getEligibility = jest.fn().mockRejectedValue(new EligibilityTooManyRequestsError());

        await candidateDetailsController.post(req, res);

        expect(eligibilityGateway.getEligibility).toHaveBeenCalledWith(mockBody.licenceNumber, false, Target.GB, Locale.GB);
        expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_ELIGIBILITY_RETRY);
      });

      test('eligibility api returns 500', async () => {
        eligibilityGateway.getEligibility = jest.fn().mockRejectedValue(new EligibilityServerError('500'));

        await candidateDetailsController.post(req, res);

        expect(eligibilityGateway.getEligibility).toHaveBeenCalledWith(mockBody.licenceNumber, false, Target.GB, Locale.GB);
        expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_ELIGIBILITY_RETRY);
      });

      test('eligibility api returns 599', async () => {
        eligibilityGateway.getEligibility = jest.fn().mockRejectedValue(new EligibilityServerError('599'));

        await candidateDetailsController.post(req, res);

        expect(eligibilityGateway.getEligibility).toHaveBeenCalledWith(mockBody.licenceNumber, false, Target.GB, Locale.GB);
        expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_ELIGIBILITY_RETRY);
      });

      test('eligibility api returns 409 (not most recent licence) - shows candidate details page with an error', async () => {
        eligibilityGateway.getEligibility = jest.fn().mockRejectedValue(new EligibilityNotLatestLicenceError());

        await candidateDetailsController.post(req, res);

        expect(eligibilityGateway.getEligibility).toHaveBeenCalledWith(mockBody.licenceNumber, false, Target.GB, Locale.GB);
        expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_CANDIDATE_DETAILS, expect.objectContaining({
          details: mockBody,
          support: false,
          errors: [{
            location: 'body',
            msg: 'mockTranslatedString',
            param: '',
          }],
        }));
      });

      test('CRM gateway returns 429 when trying to update candidate', async () => {
        candidateService.alignCandidateDataInCRM = jest.fn().mockRejectedValue({
          status: 429,
        });

        await candidateDetailsController.post(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_ELIGIBILITY_RETRY);
        expect(logger.error).toHaveBeenCalledWith({ status: 429 }, 'CandidateService::createOrUpdateCandidate: Failed to update candidate from Eligibility into CRM', {
          candidateId: mockCandidateId,
        });
      });

      test('CRM gateway returns 500 when trying to update candidate', async () => {
        candidateService.alignCandidateDataInCRM = jest.fn().mockRejectedValue({
          status: 500,
        });

        await candidateDetailsController.post(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_ELIGIBILITY_RETRY);
        expect(logger.error).toHaveBeenCalledWith({ status: 500 }, 'CandidateService::createOrUpdateCandidate: Failed to update candidate from Eligibility into CRM', {
          candidateId: mockCandidateId,
        });
      });

      test('CRM gateway returns 599 when trying to update candidate', async () => {
        candidateService.alignCandidateDataInCRM = jest.fn().mockRejectedValue({
          status: 599,
        });

        await candidateDetailsController.post(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_ELIGIBILITY_RETRY);
        expect(logger.error).toHaveBeenCalledWith({ status: 599 }, 'CandidateService::createOrUpdateCandidate: Failed to update candidate from Eligibility into CRM', {
          candidateId: mockCandidateId,
        });
      });

      test('CRM gateway returns 429 when trying to create candidate', async () => {
        mockEligibilityResponse.candidateId = undefined;
        eligibilityGateway.getEligibility = jest.fn().mockResolvedValue(mockEligibilityResponse);
        crmGateway.createCandidate = jest.fn().mockRejectedValue({
          status: 429,
        });

        await candidateDetailsController.post(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_ELIGIBILITY_RETRY);
        expect(logger.error).toHaveBeenCalledWith({ status: 429 }, 'CandidateService::createOrUpdateCandidate: Failed to create candidate and licence from Eligibility into CRM');
      });

      test('CRM gateway returns 500 when trying to create candidate', async () => {
        mockEligibilityResponse.candidateId = undefined;
        eligibilityGateway.getEligibility = jest.fn().mockResolvedValue(mockEligibilityResponse);
        crmGateway.createCandidate = jest.fn().mockRejectedValue({
          status: 500,
        });

        await candidateDetailsController.post(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_ELIGIBILITY_RETRY);
        expect(logger.error).toHaveBeenCalledWith({ status: 500 }, 'CandidateService::createOrUpdateCandidate: Failed to create candidate and licence from Eligibility into CRM');
      });

      test('CRM gateway returns 599 when trying to create candidate', async () => {
        mockEligibilityResponse.candidateId = undefined;
        eligibilityGateway.getEligibility = jest.fn().mockResolvedValue(mockEligibilityResponse);
        crmGateway.createCandidate = jest.fn().mockRejectedValue({
          status: 599,
        });

        await candidateDetailsController.post(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_ELIGIBILITY_RETRY);
        expect(logger.error).toHaveBeenCalledWith({ status: 599 }, 'CandidateService::createOrUpdateCandidate: Failed to create candidate and licence from Eligibility into CRM');
      });

      test('CRM gateway returns 429 when trying to create licence', async () => {
        mockEligibilityResponse.candidateId = undefined;
        eligibilityGateway.getEligibility = jest.fn().mockResolvedValue(mockEligibilityResponse);
        crmGateway.createCandidate = jest.fn().mockResolvedValue(mockCandidateId);
        crmGateway.createLicence = jest.fn().mockRejectedValue({
          status: 429,
        });

        await candidateDetailsController.post(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_ELIGIBILITY_RETRY);
        expect(logger.error).toHaveBeenCalledWith({ status: 429 }, 'CandidateService::createOrUpdateCandidate: Failed to create candidate and licence from Eligibility into CRM');
      });

      test('CRM gateway returns 500 when trying to create licence', async () => {
        mockEligibilityResponse.candidateId = undefined;
        eligibilityGateway.getEligibility = jest.fn().mockResolvedValue(mockEligibilityResponse);
        crmGateway.createCandidate = jest.fn().mockResolvedValue(mockCandidateId);
        crmGateway.createLicence = jest.fn().mockRejectedValue({
          status: 500,
        });

        await candidateDetailsController.post(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_ELIGIBILITY_RETRY);
        expect(logger.error).toHaveBeenCalledWith({ status: 500 }, 'CandidateService::createOrUpdateCandidate: Failed to create candidate and licence from Eligibility into CRM');
      });

      test('CRM gateway returns 599 when trying to create licence', async () => {
        mockEligibilityResponse.candidateId = undefined;
        eligibilityGateway.getEligibility = jest.fn().mockResolvedValue(mockEligibilityResponse);
        crmGateway.createCandidate = jest.fn().mockResolvedValue(mockCandidateId);
        crmGateway.createLicence = jest.fn().mockRejectedValue({
          status: 599,
        });

        await candidateDetailsController.post(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_ELIGIBILITY_RETRY);
        expect(logger.error).toHaveBeenCalledWith({ status: 599 }, 'CandidateService::createOrUpdateCandidate: Failed to create candidate and licence from Eligibility into CRM');
      });
    });
  });
});
