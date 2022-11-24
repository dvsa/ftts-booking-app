import { AxiosStatic } from 'axios';
import { ELIG } from '@dvsa/ftts-eligibility-api-model';
import { EligibilityGateway } from '../../../../src/services/eligibility/eligibility-gateway';
import { ManagedIdentityAuth } from '../../../../src/services/auth/managed-identity-auth';
import { Candidate } from '../../../../src/services/session';
import { Locale, Target, TestType } from '../../../../src/domain/enums';
import { BusinessTelemetryEvents, logger } from '../../../../src/helpers/logger';
import { EligibilityTooManyRequestsError } from '../../../../src/domain/errors/eligibility/EligibilityTooManyRequestsError';
import { EligibilityServerError } from '../../../../src/domain/errors/eligibility/EligibilityServerError';
import { EligibilityAuthError } from '../../../../src/domain/errors/eligibility/EligibilityAuthError';
import { EligibilityLicenceNotFoundError } from '../../../../src/domain/errors/eligibility/EligibilityLicenceNotFoundError';
import { EligibilityRetrieveError } from '../../../../src/domain/errors/eligibility/EligibilityRetrieveError';

const mockedAxios = jest.createMockFromModule<jest.Mocked<AxiosStatic>>('axios');

const eligibiltyResponse: ELIG.EligibilityInformation = {
  candidateDetails: {
    title: 'Lady',
    name: 'mock-name',
    surname: 'mock-surname',
    gender: ELIG.CandidateDetails.GenderEnum.M,
    dateOfBirth: '2020-01-01',
    address: {
      line1: 'mock-line-one',
      postcode: 'mock-postcode',
    },
    eligibleToBookOnline: true,
    behaviouralMarker: false,
  },
  eligibilities: [
    {
      testType: ELIG.Eligibility.TestTypeEnum.CAR,
      eligible: true,
      eligibleFrom: '2020-01-01',
      eligibleTo: '2020-01-01',
      paymentReceiptNumber: 'mock-receipt-number',
      personalReferenceNumber: 'mock-reference-number',
    },
    {
      testType: ELIG.Eligibility.TestTypeEnum.ERS,
      eligible: false,
      reasonForIneligibility: 'mock-reason',
      eligibleFrom: '2020-01-01',
      eligibleTo: '2030-01-01',
    },
    {
      testType: ELIG.Eligibility.TestTypeEnum.LGVCPC,
      eligible: true,
      eligibleFrom: '2020-01-01',
      eligibleTo: '2030-01-01',
    },
    {
      testType: ELIG.Eligibility.TestTypeEnum.LGVCPCC,
      eligible: true,
      eligibleFrom: undefined,
      eligibleTo: undefined,
    },
  ],
};

const expectedResult: Candidate = {
  title: 'Lady',
  firstnames: 'mock-name',
  surname: 'mock-surname',
  gender: ELIG.CandidateDetails.GenderEnum.M,
  dateOfBirth: '2020-01-01',
  address: {
    line1: 'mock-line-one',
    postcode: 'mock-postcode',
  },
  eligibleToBookOnline: true,
  behaviouralMarker: false,
  behaviouralMarkerExpiryDate: undefined,
  candidateId: undefined,
  eligibilities: [
    {
      testType: TestType.CAR,
      eligible: true,
      eligibleFrom: '2020-01-01',
      eligibleTo: '2020-01-01',
      paymentReceiptNumber: 'mock-receipt-number',
      personalReferenceNumber: 'mock-reference-number',
    },
    {
      testType: TestType.ERS,
      eligible: false,
      reasonForIneligibility: 'mock-reason',
      eligibleFrom: '2020-01-01',
      eligibleTo: '2030-01-01',
    },
    {
      testType: TestType.LGVCPC,
      eligible: true,
      eligibleFrom: '2020-01-01',
      eligibleTo: '2030-01-01',
    },
    {
      testType: TestType.LGVCPCC,
      eligible: true,
      eligibleFrom: undefined,
      eligibleTo: undefined,
    },
  ],
};

describe('EligibilityGateway', () => {
  let eligibilityGateway: EligibilityGateway;
  let isManageBooking: boolean;

  beforeEach(() => {
    isManageBooking = false;
    const mockAuth = {
      getAuthHeader: () => ({
        headers: { Authorization: 'Bearer mockToken' },
      }),
    };

    eligibilityGateway = new EligibilityGateway(mockAuth as unknown as ManagedIdentityAuth, mockedAxios);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getEligibility', () => {
    test('should return the candidates eligibility information', async () => {
      mockedAxios.post.mockResolvedValue({ data: eligibiltyResponse });

      const result = await eligibilityGateway.getEligibility('mock-licence', isManageBooking);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'v1/eligibility',
        {
          drivingLicenceNumber: 'mock-licence',
          manageBooking: false,
        },
        {
          headers: {
            Authorization: 'Bearer mockToken',
          },
        },
      );
      expect(result).toStrictEqual(expectedResult);
    });

    test('should set the manageBooking param to true if called from manage booking journey', async () => {
      isManageBooking = true;

      mockedAxios.post.mockResolvedValue({ data: eligibiltyResponse });

      const result = await eligibilityGateway.getEligibility('mock-licence', isManageBooking);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'v1/eligibility',
        {
          drivingLicenceNumber: 'mock-licence',
          manageBooking: true,
        },
        {
          headers: {
            Authorization: 'Bearer mockToken',
          },
        },
      );
      expect(result).toStrictEqual(expectedResult);
    });

    test('should set the manageBooking param to false by default if no flag is sent to getEligibility', async () => {
      isManageBooking = undefined;

      mockedAxios.post.mockResolvedValue({ data: eligibiltyResponse });

      const result = await eligibilityGateway.getEligibility('mock-licence', isManageBooking);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'v1/eligibility',
        {
          drivingLicenceNumber: 'mock-licence',
          manageBooking: false,
        },
        {
          headers: {
            Authorization: 'Bearer mockToken',
          },
        },
      );
      expect(result).toStrictEqual(expectedResult);
    });

    test('should throw an error when eligibility fails', async () => {
      const error = new EligibilityRetrieveError('error');
      mockedAxios.post.mockRejectedValue(error);

      await expect(eligibilityGateway.getEligibility('mock-licence', isManageBooking)).rejects.toThrow(error);

      expect(logger.error).toHaveBeenCalledWith(error, 'EligibilityGateway::getEligibility: Failed to retrive candidates eligibility');
    });

    test('should throw a TooManyRequestsError when eligibility returns http code 429', async () => {
      const error = {
        response: {
          status: 429,
        },
      };
      mockedAxios.post.mockRejectedValue(error);
      await expect(eligibilityGateway.getEligibility('mock-licence')).rejects.toStrictEqual(new EligibilityTooManyRequestsError());
      expect(logger.error).toHaveBeenCalledWith(error, 'EligibilityGateway::getEligibility: Eligibility retries limit exceeded, response 429');
      expect(logger.event).toHaveBeenCalledWith(
        BusinessTelemetryEvents.ELIGIBILITY_REQUEST_ISSUE,
        'EligibilityGateway::getEligibility: Eligibility retries limit exceeded, response 429',
        { error },
      );
    });

    test('should throw a ServerError when eligibility returns http code 5**', async () => {
      const error = {
        response: {
          status: 500,
        },
      };
      mockedAxios.post.mockRejectedValue(error);

      await expect(eligibilityGateway.getEligibility('mock-licence')).rejects.toStrictEqual(new EligibilityServerError('500'));
      expect(logger.error).toHaveBeenCalledWith(error, 'EligibilityGateway::getEligibility: Eligibility service internal server error');
      expect(logger.event).toHaveBeenCalledWith(
        BusinessTelemetryEvents.ELIGIBILITY_ERROR,
        'EligibilityGateway::getEligibility: Eligibility service internal server error',
        { error },
      );
    });

    test('should throw a AuthError when eligibility returns http code 401', async () => {
      const error = {
        response: {
          status: 401,
        },
      };
      mockedAxios.post.mockRejectedValue(error);

      await expect(eligibilityGateway.getEligibility('mock-licence')).rejects.toStrictEqual(new EligibilityAuthError('401'));
      expect(logger.error).toHaveBeenCalledWith(error, 'EligibilityGateway::getEligibility: Eligibility authorisation error');
      expect(logger.event).toHaveBeenCalledWith(
        BusinessTelemetryEvents.ELIGIBILITY_AUTH_ISSUE,
        'EligibilityGateway::getEligibility: Eligibility authorisation error',
        { error },
      );
    });

    test('should throw a LicenceNotFound error when eligibility returns http code 404', async () => {
      const error = {
        response: {
          status: 404,
        },
      };
      mockedAxios.post.mockRejectedValue(error);

      await expect(eligibilityGateway.getEligibility('mock-licence', false, Target.GB, Locale.GB))
        .rejects.toStrictEqual(new EligibilityLicenceNotFoundError('Driver Licence Number was not found'));

      expect(logger.warn).toHaveBeenCalledWith(
        'EligibilityGateway::getEligibility: Driver Licence Number was not found',
        { drivingLicenceNumberLength: 12, target: Target.GB, locale: Locale.GB },
      );
    });

    test('logs if a test type cannot be mapped', async () => {
      mockedAxios.post.mockResolvedValue({
        data: {
          ...eligibiltyResponse,
          eligibilities: [
            ...eligibiltyResponse.eligibilities,
            {
              testType: 'ABC123',
              eligible: false,
              eligibleFrom: undefined,
              eligibleTo: undefined,
            },
          ],
        },
      });

      const result = await eligibilityGateway.getEligibility('mock-licence', isManageBooking);

      expect(result).toStrictEqual(expectedResult);
      expect(logger.warn).toHaveBeenCalledWith('EligibilityGateway::mapEligibilityResponseToCandidate Unknown Test Type: ABC123');
    });
  });
});
