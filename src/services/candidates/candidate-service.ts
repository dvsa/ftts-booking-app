import { ELIG } from '@dvsa/ftts-eligibility-api-model';
import dayjs from 'dayjs';
import { Meta } from 'express-validator';
import { isBookable, isInstructorBookable } from '../../domain/eligibility';
import { Locale, Target } from '../../domain/enums';
import { CrmCreateUpdateCandidateError } from '../../domain/errors/crm/CrmCreateUpdateCandidateError';
import { CrmRetrieveLicenceError } from '../../domain/errors/crm/CrmRetrieveLicenceError';
import { CrmServerError } from '../../domain/errors/crm/CrmServerError';
import { CrmTooManyRequestsError } from '../../domain/errors/crm/CrmTooManyRequestsError';
import { EligbilityCandidateMismatchError } from '../../domain/errors/eligibility/EligbilityCandidateMismatchError';
import { EligibilityNotEligibleError } from '../../domain/errors/eligibility/EligibilityNotEligibleError';
import { AgencyMismatchError } from '../../domain/errors/login/AgencyMismatchError';
import { MultipleCandidateMismatchError } from '../../domain/errors/MultipleCandidateMatchError';
import { LicenceNumber } from '../../domain/licence-number';
import { Eligibility } from '../../domain/types';
import { logger } from '../../helpers/logger';
import { convertNullUndefinedToEmptyString } from '../../helpers/sanitisation';
import { mapToCrmContactAddress } from '../crm-gateway/crm-address-mapper';
import { CRMGateway } from '../crm-gateway/crm-gateway';
import { CRMGovernmentAgency } from '../crm-gateway/enums';
import { EligibilityGateway } from '../eligibility/eligibility-gateway';
import { Candidate } from '../session';

export interface CandidateDetailsInfo {
  firstnames: string;
  surname: string;
  licenceNumber: string;
  dobDay: string;
  dobMonth: string;
  dobYear: string;
}

export interface InstructorCandidateDetailsInfo extends CandidateDetailsInfo {
  personalReference: string;
}

type AlignDataResponse = {
  licenceId: string | undefined;
  crmCandidate: Candidate | undefined;
};

export class CandidateService {
  constructor(
    private crmGateway: CRMGateway,
    private eligibilityGateway: EligibilityGateway,
  ) { }

  public async getManageBookingEligibility(licenceNumber: string, target: Target, locale: Locale): Promise<Partial<Candidate>> {
    return this.eligibilityGateway.getEligibility(licenceNumber, true, target, locale);
  }

  public async getEligibility(licenceNumber: string, candidateDetails: CandidateDetailsInfo, target: Target, locale: Locale, isManageBooking?: boolean, isInstructor?: boolean): Promise<Partial<Candidate>> {
    let candidateEligibility;
    candidateEligibility = await this.eligibilityGateway.getEligibility(licenceNumber, isManageBooking, target, locale);

    if (isInstructor) {
      // For instructor, this check needs to be performed first, before doesCandidateMatchEligibility. for candidates it is the opposite
      const eligibleInstructor = candidateEligibility.eligibilities?.find((eligibility) => isInstructorBookable(eligibility, target));
      if (!eligibleInstructor || !candidateEligibility.eligibleToBookOnline) {
        logger.debug('CandidateService::getEligibility: Candidate is not eligible to book online', { eligible: eligibleInstructor, eligibleToBookOnline: candidateEligibility.eligibleToBookOnline, isInstructor });
        throw new EligibilityNotEligibleError('Candidate is not eligible to book');
      }
    }

    if (!this.doesCandidateMatchEligibility(candidateDetails, candidateEligibility, target, locale, isInstructor)) {
      logger.debug('CandidateService::getEligibility: Candidate details do not match eligibility details', { candidateDetails, candidateEligibility, isInstructor });
      throw new EligbilityCandidateMismatchError('Candidate does not match eligibility details');
    }

    if (!isInstructor) {
      const eligible = candidateEligibility.eligibilities?.find((eligibility) => isBookable(eligibility, target));
      if (!eligible || !candidateEligibility.eligibleToBookOnline) {
        logger.warn('CandidateService::getEligibility: Candidate is not eligible to book online', {
          bookableEligibility: eligible ? 'Bookable eligibility found' : 'No eligibile tests found',
          eligibleToBookOnline: candidateEligibility.eligibleToBookOnline,
          isInstructor,
        });
        logger.debug('CandidateService::getEligibility: Candidate is not eligible to book online', { eligible, eligibleToBookOnline: candidateEligibility.eligibleToBookOnline, isInstructor });
        throw new EligibilityNotEligibleError('Candidate is not eligible to book');
      }
    }

    try {
      candidateEligibility = await this.createOrUpdateCandidate(candidateEligibility, licenceNumber);
    } catch (error) {
      if (error instanceof CrmTooManyRequestsError || error instanceof CrmServerError) {
        throw error;
      }
      logger.error(error as Error, 'CandidateService::createOrUpdateCandidate: Failed to create/update candidate');
      throw new CrmCreateUpdateCandidateError();
    }

    return candidateEligibility;
  }

  public async getLicenceNumberRecordsByCandidateId(candidateId: string, licenceNumber: string): Promise<Candidate | undefined> {
    try {
      const response = await this.crmGateway.getLicenceNumberRecordsByCandidateId(candidateId, licenceNumber);
      return response;
    } catch (error) {
      throw new CrmRetrieveLicenceError();
    }
  }

  public async alignCandidateDataInCRM(candidate: Partial<Candidate>, licenceNumber: string): Promise<AlignDataResponse> {
    let crmCandidate = await this.crmGateway.getLicenceNumberRecordsByCandidateId(candidate.candidateId as string, licenceNumber);
    let licenceId = crmCandidate?.licenceId;

    if (crmCandidate) {
      // Candidate already exists, check if licence and candidate updates are required and update them
      if (this.isLicenceDataToBeUpdated(candidate, crmCandidate)) {
        logger.info('CandidateService::alignCandidateDataInCRM: licence has to be updated');
        await this.crmGateway.updateLicence(crmCandidate?.licenceId as string, candidate.candidateId as string, candidate.address);
        // candidate entity has duplicated address fields, the same as licence entity, so if addres changed we have to update both
        crmCandidate = await this.crmGateway.updateCandidate(candidate.candidateId as string, candidate);
      }

      if (this.isCandidateDataToBeUpdated(candidate, crmCandidate)) {
        logger.info('CandidateService::alignCandidateDataInCRM: candidate has to be updated');
        crmCandidate = await this.crmGateway.updateCandidate(candidate.candidateId as string, candidate);
      }
    } else {
      // Create new licence and update candidate
      logger.info('CandidateService::alignCandidateDataInCRM: crmCandidate undefined, new licence will be created');
      licenceId = await this.crmGateway.createLicence(licenceNumber, candidate.address as ELIG.Address, candidate.candidateId as string);
      crmCandidate = await this.crmGateway.updateCandidate(candidate.candidateId as string, candidate);
    }

    return {
      licenceId,
      crmCandidate,
    };
  }

  public static isDrivingLicenceValid = (licenceNumber: string, meta: Meta): boolean => {
    if (licenceNumber.trim() === '') {
      throw new Error('Driving Licence Number is empty');
    }

    try {
      return LicenceNumber.isValid(licenceNumber, meta);
    } catch (error) {
      logger.debug('CandidateService::isDrivingLicenceValid: Driving Licence Number is invalid', {
        message: (error as Error)?.message,
        licenceNumberLength: licenceNumber.length,
        target: meta.req?.res?.locals?.target as Target || Target.GB,
        locale: meta.req?.res?.locals?.locale as Locale || Locale.GB,
      });
      throw new Error('Driving Licence Number is invalid');
    }
  };

  public static checkAgencyMatchesTarget = (agency: CRMGovernmentAgency, target: Target): void => {
    if (!((target === Target.NI && agency === CRMGovernmentAgency.Dva)
      || (target === Target.GB && agency === CRMGovernmentAgency.Dvsa))) {
      throw new AgencyMismatchError();
    }
  };

  public doesCandidateMatchEligibility(candidateDetails: CandidateDetailsInfo | InstructorCandidateDetailsInfo, candidateEligibility: Partial<Candidate>, target: Target, locale: Locale, isInstructorJourney?: boolean): boolean {
    const firstnames = this.replaceFirstnameWithThreeDashesIfEmptyGB(target, candidateDetails.firstnames);
    const firstnamesValid = (firstnames.toUpperCase()?.trim() === candidateEligibility.firstnames?.toUpperCase().trim());
    const surnameValid = candidateDetails.surname?.toUpperCase()?.trim() === candidateEligibility.surname?.toUpperCase().trim();
    const dobValid = dayjs(`${candidateDetails.dobYear?.trim()}-${candidateDetails.dobMonth?.trim()}-${candidateDetails.dobDay?.trim()}`).format('YYYY-MM-DD') === candidateEligibility?.dateOfBirth;

    // validates PRN if from instructor journey, otherwise defaults to true for candidate service
    const prnValid = isInstructorJourney ? this.doesPRNMatchEligibility((candidateDetails as InstructorCandidateDetailsInfo).personalReference, candidateEligibility, target) : true;

    const errors = [];

    if (!firstnamesValid) {
      logger.debug('CandidateService::doesCandidateMatchEligibility: First name did not match eligibility response', { target, locale, firstnamesLength: candidateDetails.firstnames.trim().length });
      const error = new Error('First name did not match eligibility response');
      errors.push(error);
    }

    if (!surnameValid) {
      logger.debug('CandidateService::doesCandidateMatchEligibility: Surname did not match eligibility response', { target, locale, surnameLength: candidateDetails.surname.trim().length });
      const error = new Error('Surname did not match eligibility response');
      errors.push(error);
    }

    if (!dobValid) {
      const error = new Error('Date of birth did not match eligibility response');
      errors.push(error);
    }

    if (!prnValid) {
      const error = new Error('Instructor PRN did not match eligibility response');
      errors.push(error);
    }

    if (errors.length > 0) {
      throw new MultipleCandidateMismatchError(errors);
    }

    return firstnamesValid && surnameValid && dobValid && prnValid;
  }

  private doesPRNMatchEligibility(prn: string, candidateEligibility: Partial<Candidate>, target: Target): boolean {
    const prnMatches = candidateEligibility.eligibilities?.filter((eligibility: Eligibility) => eligibility?.eligible === true)
      .map((eligibility: Eligibility) => {
        if (target === Target.NI) {
          return eligibility?.paymentReceiptNumber?.trim() === prn;
        }
        return eligibility?.personalReferenceNumber?.trim() === prn;
      })
      .filter((match: boolean) => match) || [];
    return prnMatches.length > 0;
  }

  public async createOrUpdateCandidate(candidateEligibility: Partial<Candidate>, licenceNumber: string): Promise<Partial<Candidate>> {
    const { candidateId } = candidateEligibility;
    if (candidateId) { // Candidate exists in CRM.
      try {
        const alignCandidateResponse = await this.alignCandidateDataInCRM(candidateEligibility, licenceNumber);
        return {
          ...candidateEligibility,
          licenceId: alignCandidateResponse?.licenceId,
        };
      } catch (error) {
        logger.error(error, 'CandidateService::createOrUpdateCandidate: Failed to update candidate from Eligibility into CRM', { candidateId });
        if (error?.status === 429) {
          throw new CrmTooManyRequestsError();
        }
        if (error?.status >= 500 && error?.status < 600) {
          throw new CrmServerError(`${error?.status}`);
        }
        throw error;
      }
    } else { // Candidate doesn't exist in CRM.
      try {
        if (!candidateEligibility.address) {
          throw new Error('CandidateService::createOrUpdateCandidate: Missing Address from Eligibility Response');
        }
        const crmCandidateId = await this.crmGateway.createCandidate(candidateEligibility);
        const crmLicenceId = await this.crmGateway.createLicence(licenceNumber, candidateEligibility.address, crmCandidateId);

        return {
          ...candidateEligibility,
          candidateId: crmCandidateId,
          licenceId: crmLicenceId,
        };
      } catch (error) {
        logger.error(error, 'CandidateService::createOrUpdateCandidate: Failed to create candidate and licence from Eligibility into CRM');
        if (error?.status === 429) {
          throw new CrmTooManyRequestsError();
        }
        if (error?.status >= 500 && error?.status < 600) {
          throw new CrmServerError(`${error?.status}`);
        }
        throw error;
      }
    }
  }

  private isLicenceDataToBeUpdated(candidateEligibility: Partial<Candidate>, crmCandidate: Candidate): boolean {
    const eligibilityAddress = mapToCrmContactAddress(candidateEligibility.address);
    const crmAddress = mapToCrmContactAddress(crmCandidate.address);

    return convertNullUndefinedToEmptyString(eligibilityAddress.address1_line1) !== convertNullUndefinedToEmptyString(crmAddress.address1_line1)
      || convertNullUndefinedToEmptyString(eligibilityAddress.address1_line2) !== convertNullUndefinedToEmptyString(crmAddress.address1_line2)
      || convertNullUndefinedToEmptyString(eligibilityAddress.address1_city) !== convertNullUndefinedToEmptyString(crmAddress.address1_city)
      || convertNullUndefinedToEmptyString(eligibilityAddress.address1_postalcode) !== convertNullUndefinedToEmptyString(crmAddress.address1_postalcode);
  }

  private isCandidateDataToBeUpdated(candidateEligibility: Partial<Candidate>, crmCandidate: Candidate): boolean {
    return convertNullUndefinedToEmptyString(candidateEligibility.firstnames) !== convertNullUndefinedToEmptyString(crmCandidate.firstnames)
      || convertNullUndefinedToEmptyString(candidateEligibility.surname) !== convertNullUndefinedToEmptyString(crmCandidate.surname)
      || convertNullUndefinedToEmptyString(candidateEligibility.dateOfBirth) !== convertNullUndefinedToEmptyString(crmCandidate.dateOfBirth)
      || convertNullUndefinedToEmptyString(candidateEligibility.title?.toLowerCase()) !== convertNullUndefinedToEmptyString(crmCandidate.title?.toLowerCase())
      || candidateEligibility.gender !== crmCandidate.gender;
  }

  private replaceFirstnameWithThreeDashesIfEmptyGB(target: Target, firstname: string): string {
    return ((firstname.trim() === '' || firstname.trim() === '-') && target === Target.GB) ? '---' : firstname;
  }
}
