import { Request, Response } from 'express';
import { PageNames } from '@constants';
import config from '../../config';
import { DateOfBirth } from '../../domain/date-of-birth';
import { Locale, Target, Voiceover } from '../../domain/enums';
import { CrmCreateUpdateCandidateError } from '../../domain/errors/crm/CrmCreateUpdateCandidateError';
import { CrmRetrieveLicenceError } from '../../domain/errors/crm/CrmRetrieveLicenceError';
import { CrmServerError } from '../../domain/errors/crm/CrmServerError';
import { CrmTooManyRequestsError } from '../../domain/errors/crm/CrmTooManyRequestsError';
import { EligibilityAuthError } from '../../domain/errors/eligibility/EligibilityAuthError';
import { EligibilityLicenceNotFoundError } from '../../domain/errors/eligibility/EligibilityLicenceNotFoundError';
import { EligibilityNotEligibleError } from '../../domain/errors/eligibility/EligibilityNotEligibleError';
import { EligibilityNotLatestLicenceError } from '../../domain/errors/eligibility/EligibilityNotLatestLicenceError';
import { EligibilityRetrieveError } from '../../domain/errors/eligibility/EligibilityRetrieveError';
import { EligibilityServerError } from '../../domain/errors/eligibility/EligibilityServerError';
import { EligibilityTooManyRequestsError } from '../../domain/errors/eligibility/EligibilityTooManyRequestsError';
import { MultipleCandidateMismatchError } from '../../domain/errors/MultipleCandidateMatchError';
import { LicenceNumber } from '../../domain/licence-number';
import { PRN } from '../../domain/prn';
import { translate } from '../../helpers/language';
import { logger } from '../../helpers/logger';
import { ValidatorSchema } from '../../middleware/request-validator';
import { CandidateService } from '../../services/candidates/candidate-service';
import { CRMGateway } from '../../services/crm-gateway/crm-gateway';
import { EligibilityGateway } from '../../services/eligibility/eligibility-gateway';
import { Candidate, store } from '../../services/session';

export interface CandidateDetailsBody {
  firstnames: string;
  surname: string;
  licenceNumber: string;
  dobDay: string;
  dobMonth: string;
  dobYear: string;
  personalReference: string;
}

export class InstructorCandidateDetailsController {
  constructor(
    private readonly candidateService: CandidateService,
  ) { }

  public get = (req: Request, res: Response): void => {
    if (req.session.currentBooking?.testType) {
      store.reset(req, res);
      return res.redirect('/instructor');
    }
    if (!req.session.journey) {
      throw Error('InstructorCandidateDetailsController::get: No journey set');
    }
    req.session.journey.isInstructor = true;
    let details: Partial<Candidate> = {};
    if (typeof req.query?.licenceNum === 'string') {
      const licenceNumber = LicenceNumber.of(req.query.licenceNum, req.session.target || Target.GB);
      details = {
        licenceNumber: licenceNumber.toString(),
      };
    }

    return res.render(PageNames.INSTRUCTOR_CANDIDATE_DETAILS, {
      details,
      support: req.session.journey?.support,
      backLink: this.getBackLink(req),
    });
  };

  public post = async (req: Request, res: Response): Promise<void> => {
    if (req.hasErrors) {
      req.errors.forEach((error) => {
        const errorMessage = error.msg;
        if (errorMessage) {
          logger.warn(`InstructorCandidateDetailsController::post: ${errorMessage}`, {
            target: req.session.target,
            locale: req.session.locale,
          });
        }
      });
      return this.sendIncorrectDetailsErrorResponse(req, res);
    }
    if (!req.session.journey) {
      throw Error('InstructorCandidateDetailsController::post: No journey set');
    }

    const candidateDetails: CandidateDetailsBody = req.body;
    const licenceNumber = this.getLicenceNumber(candidateDetails, req);

    try {
      const candidateEligibility = await this.candidateService.getEligibility(licenceNumber, candidateDetails, req.session.target as Target, req.session.locale as Locale, false, true);
      const crmCandidate = await this.candidateService.getLicenceNumberRecordsByCandidateId(candidateEligibility.candidateId as string, licenceNumber);
      const personReference = crmCandidate?.personReference;

      req.session.candidate = {
        ...req.session.candidate,
        ...candidateEligibility,
        licenceNumber,
        personReference,
        personalReferenceNumber: req.session.target === Target.GB ? candidateDetails.personalReference : undefined,
        paymentReceiptNumber: req.session.target === Target.NI ? candidateDetails.personalReference : undefined,
        supportNeedName: crmCandidate?.supportNeedName,
        supportEvidenceStatus: crmCandidate?.supportEvidenceStatus,
      };

      req.session.currentBooking = {
        ...req.session.currentBooking,
        bsl: false,
        voiceover: Voiceover.NONE,
      };

      const { support } = req.session.journey;

      if (support) {
        return res.redirect('test-type');
      }

      return res.redirect('email-contact');
    } catch (error) {
      if (error instanceof EligibilityTooManyRequestsError || error instanceof EligibilityServerError
        || error instanceof CrmTooManyRequestsError || error instanceof CrmServerError) {
        return res.render(PageNames.INSTRUCTOR_ELIGIBILITY_RETRY);
      }
      if (error instanceof EligibilityNotEligibleError) {
        logger.warn(`InstructorCandidateDetailsController::post: ${error.message}`, {
          target: req.session.target,
          locale: req.session.locale,
        });
        return res.render(PageNames.NO_ELIGIBILITY);
      }
      if (error instanceof CrmCreateUpdateCandidateError || error instanceof CrmRetrieveLicenceError
        || error instanceof EligibilityAuthError) {
        throw error;
      }
      if (error instanceof EligibilityLicenceNotFoundError || error instanceof EligibilityNotLatestLicenceError
        || error instanceof EligibilityRetrieveError) {
        logger.warn(`InstructorCandidateDetailsController::post: ${error.message}`, {
          target: req.session.target,
          locale: req.session.locale,
        });
        return this.sendIncorrectDetailsErrorResponse(req, res);
      }
      if (error instanceof MultipleCandidateMismatchError) {
        const { errors } = error;
        errors?.forEach((fieldError) => {
          logger.warn(`InstructorCandidateDetailsController::post: ${fieldError.message}`, {
            target: req.session.target,
            locale: req.session.locale,
          });
        });
        return this.sendIncorrectDetailsErrorResponse(req, res);
      }
      throw error;
    }
  };

  private getLicenceNumber(candidateDetails: CandidateDetailsBody, req: Request): string {
    return LicenceNumber.of(candidateDetails.licenceNumber, req.session.target || Target.GB)?.toString().toUpperCase();
  }

  private sendIncorrectDetailsErrorResponse = (req: Request, res: Response): void => {
    // Errors are overwritten to not provide a clue as to which field contains the error for security reasons
    req.errors = [{
      location: 'body',
      msg: translate('details.errorMessage'),
      param: '',
    }];

    return res.render(PageNames.INSTRUCTOR_CANDIDATE_DETAILS, {
      details: req.body,
      errors: req.errors,
      support: req.session.journey?.support,
      backLink: this.getBackLink(req),
    });
  };

  private getBackLink = (req: Request): string => {
    if (req.session.target === Target.NI) {
      return config.landing.ni.instructor.book;
    }
    return '/instructor/choose-support';
  };

  /* istanbul ignore next */
  public postSchemaValidation: ValidatorSchema = {
    firstnames: {
      in: ['body'],
      trim: true,
    },
    surname: {
      in: ['body'],
      trim: true,
      isEmpty: {
        negated: true,
      },
      errorMessage: 'Surname is empty',
    },
    licenceNumber: {
      in: ['body'],
      trim: true,
      custom: {
        options: CandidateService.isDrivingLicenceValid,
      },
    },
    dobDay: {
      in: ['body'],
      custom: {
        options: DateOfBirth.isValid,
      },
    },
    personalReference: {
      in: ['body'],
      trim: true,
      custom: {
        options: PRN.isValid,
      },
    },
  };
}

export default new InstructorCandidateDetailsController(
  new CandidateService(CRMGateway.getInstance(), EligibilityGateway.getInstance()),
);
