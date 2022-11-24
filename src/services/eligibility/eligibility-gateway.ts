import { AxiosError } from 'axios';
import { ELIG } from '@dvsa/ftts-eligibility-api-model';
import { BusinessTelemetryEvents, logger } from '../../helpers/logger';
import config from '../../config';
import { AxiosRetryClient } from '../../libraries/axios-retry-client';
import { ManagedIdentityAuth } from '../auth/managed-identity-auth';
import { Candidate } from '../session';
import { Locale, Target, TestType } from '../../domain/enums';
import { EligibilityTooManyRequestsError } from '../../domain/errors/eligibility/EligibilityTooManyRequestsError';
import { EligibilityServerError } from '../../domain/errors/eligibility/EligibilityServerError';
import { EligibilityAuthError } from '../../domain/errors/eligibility/EligibilityAuthError';
import { EligibilityLicenceNotFoundError } from '../../domain/errors/eligibility/EligibilityLicenceNotFoundError';
import { EligibilityNotLatestLicenceError } from '../../domain/errors/eligibility/EligibilityNotLatestLicenceError';
import { EligibilityRetrieveError } from '../../domain/errors/eligibility/EligibilityRetrieveError';

export class EligibilityGateway {
  private static instance: EligibilityGateway;

  constructor(
    private auth: ManagedIdentityAuth,
    private axiosRetryClient = new AxiosRetryClient(config.eligibility.retryPolicy).getClient(),
  ) { }

  public static getInstance(): EligibilityGateway {
    if (!EligibilityGateway.instance) {
      EligibilityGateway.instance = new EligibilityGateway(
        new ManagedIdentityAuth(config.eligibility.identity),
      );
    }
    return EligibilityGateway.instance;
  }

  public async getEligibility(drivingLicenceNumber: string, isManageBooking?: boolean, target?: Target, locale?: Locale): Promise<Partial<Candidate>> {
    const eligibilityAxiosUrl = `${config.eligibility.baseUrl}v1/eligibility`;
    const eligibilityRequestPayload: ELIG.EligibilityRequestPayload = {
      drivingLicenceNumber,
      manageBooking: isManageBooking || false,
    };
    try {
      const authHeader = await this.auth.getAuthHeader();
      const response = await this.axiosRetryClient.post<ELIG.EligibilityInformation>(eligibilityAxiosUrl, eligibilityRequestPayload, authHeader);
      logger.debug('EligibilityGateway::getEligibility: Raw Response', { response: response.data });
      return this.mapEligibilityResponseToCandidate(response.data);
    } catch (error) {
      logger.debug('EligibilityGateway::getEligibility: Raw error response', { errorResponse: error?.response });
      const err = error as AxiosError;
      if (err?.response) {
        if (err?.response?.status === 409) {
          logger.warn('EligibilityGateway::getEligibility: Not most recent licence, response 409');
          throw new EligibilityNotLatestLicenceError('Not most recent licence, response 409');
        }
        if (err?.response?.status === 429) {
          logger.error(err, 'EligibilityGateway::getEligibility: Eligibility retries limit exceeded, response 429');
          logger.event(BusinessTelemetryEvents.ELIGIBILITY_REQUEST_ISSUE, 'EligibilityGateway::getEligibility: Eligibility retries limit exceeded, response 429', { error });
          throw new EligibilityTooManyRequestsError();
        }
        if (err?.response?.status >= 500 && err?.response?.status < 600) {
          logger.error(err, 'EligibilityGateway::getEligibility: Eligibility service internal server error');
          logger.event(BusinessTelemetryEvents.ELIGIBILITY_ERROR, 'EligibilityGateway::getEligibility: Eligibility service internal server error', { error });
          throw new EligibilityServerError(`${err?.response?.status}`);
        }
        if (err?.response?.status === 401 || err?.response?.status === 403) { // Non-retryable errors. Generic error page shown.
          logger.error(err, 'EligibilityGateway::getEligibility: Eligibility authorisation error');
          logger.event(BusinessTelemetryEvents.ELIGIBILITY_AUTH_ISSUE, 'EligibilityGateway::getEligibility: Eligibility authorisation error', { error });
          throw new EligibilityAuthError(`${err?.response?.status}`);
        }
        if (err?.response?.status === 404 || err?.response?.status === 400) {
          logger.warn('EligibilityGateway::getEligibility: Driver Licence Number was not found', {
            target,
            locale,
            drivingLicenceNumberLength: drivingLicenceNumber.length,
          });
          throw new EligibilityLicenceNotFoundError('Driver Licence Number was not found');
        }
      }

      logger.error(err, 'EligibilityGateway::getEligibility: Failed to retrive candidates eligibility');
      throw new EligibilityRetrieveError(error?.message);
    }
  }

  private mapEligibilityResponseToCandidate(data: ELIG.EligibilityInformation): Partial<Candidate> {
    return {
      title: data.candidateDetails.title,
      firstnames: data.candidateDetails.name,
      surname: data.candidateDetails.surname,
      gender: data.candidateDetails.gender,
      dateOfBirth: data.candidateDetails.dateOfBirth,
      address: data.candidateDetails.address,
      eligibleToBookOnline: data.candidateDetails.eligibleToBookOnline,
      behaviouralMarker: data.candidateDetails.behaviouralMarker,
      behaviouralMarkerExpiryDate: data.candidateDetails.behaviouralMarkerExpiryDate,
      candidateId: data.candidateDetails.candidateId,
      eligibilities: data.eligibilities
        .filter((eligibility) => {
          const testType = EligibilityGateway.ELIGIBILITY_TEST_TYPE_MAP.get(eligibility.testType);
          if (testType === undefined) {
            logger.warn(`EligibilityGateway::mapEligibilityResponseToCandidate Unknown Test Type: ${eligibility.testType}`);
          }
          return testType !== undefined;
        })
        .map((eligibility) => ({
          ...eligibility,
          testType: EligibilityGateway.ELIGIBILITY_TEST_TYPE_MAP.get(eligibility.testType) as TestType,
          eligibleFrom: typeof eligibility.eligibleFrom === 'string' ? eligibility.eligibleFrom : undefined,
          eligibleTo: typeof eligibility.eligibleTo === 'string' ? eligibility.eligibleTo : undefined,
        })),
    };
  }

  private static readonly ELIGIBILITY_TEST_TYPE_MAP: Map<ELIG.Eligibility.TestTypeEnum, TestType> = new Map([
    [ELIG.Eligibility.TestTypeEnum.CAR, TestType.CAR],
    [ELIG.Eligibility.TestTypeEnum.LGVCPC, TestType.LGVCPC],
    [ELIG.Eligibility.TestTypeEnum.LGVCPCC, TestType.LGVCPCC],
    [ELIG.Eligibility.TestTypeEnum.LGVHPT, TestType.LGVHPT],
    [ELIG.Eligibility.TestTypeEnum.LGVMC, TestType.LGVMC],
    [ELIG.Eligibility.TestTypeEnum.MOTORCYCLE, TestType.MOTORCYCLE],
    [ELIG.Eligibility.TestTypeEnum.PCVCPC, TestType.PCVCPC],
    [ELIG.Eligibility.TestTypeEnum.PCVCPCC, TestType.PCVCPCC],
    [ELIG.Eligibility.TestTypeEnum.PCVHPT, TestType.PCVHPT],
    [ELIG.Eligibility.TestTypeEnum.PCVMC, TestType.PCVMC],
    [ELIG.Eligibility.TestTypeEnum.TAXI, TestType.TAXI],
    /* DVSA Instructor Types */
    [ELIG.Eligibility.TestTypeEnum.ADIP1, TestType.ADIP1],
    [ELIG.Eligibility.TestTypeEnum.ADIHPT, TestType.ADIHPT],
    [ELIG.Eligibility.TestTypeEnum.ERS, TestType.ERS],
    /* DVA Instructor Types */
    [ELIG.Eligibility.TestTypeEnum.ADIP1DVA, TestType.ADIP1DVA],
    [ELIG.Eligibility.TestTypeEnum.AMIP1, TestType.AMIP1],
  ]);
}
