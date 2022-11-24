import { Request, Response } from 'express';
import { PageNames } from '@constants';
import { BookingReference, emptyBookingReferenceErrorMsg } from '../../domain/booking/booking-reference';
import { Locale, Target } from '../../domain/enums';
import {
  CrmTooManyRequestsError, CrmServerError, CrmRetrieveLicenceError, CrmCreateUpdateCandidateError,
} from '../../domain/errors/crm';
import {
  EligibilityAuthError, EligibilityLicenceNotFoundError, EligibilityNotLatestLicenceError, EligibilityRetrieveError, EligibilityServerError, EligibilityTooManyRequestsError,
} from '../../domain/errors/eligibility';
import { AgencyMismatchError, BookingNotFoundError } from '../../domain/errors/login';
import { LicenceNumber } from '../../domain/licence-number';
import {
  isEqualBookingRefs, translate, logger, getManageBookingLinkToStartPage,
} from '../../helpers';
import { RequestValidationError, ValidatorSchema } from '../../middleware/request-validator';
import { CandidateService } from '../../services/candidates/candidate-service';
import { CRMGateway } from '../../services/crm-gateway/crm-gateway';
import { EligibilityGateway } from '../../services/eligibility/eligibility-gateway';
import { store } from '../../services/session';
import { BookingManager } from '../../helpers/booking-manager';

const errorMessages = {
  fieldsLeftBlank: (): string => translate('manageBookingLogin.errorMessages.fieldsLeftBlank'),
  incorrectDetails: (): string => translate('manageBookingLogin.errorMessages.incorrectDetails'),
};

type ManageBookingLoginBody = { licenceNumber: string; bookingReference: string };

export class ManageBookingLoginController {
  constructor(
    private crm: CRMGateway,
    private eligibilityGateway: EligibilityGateway,
    private candidateService: CandidateService,
  ) { }

  public get = (req: Request, res: Response): void => {
    store.reset(req);

    if (!req.session?.journey) {
      throw new Error('Journey is not set in the session');
    }

    if (!req.session.journey?.inManageBookingMode) {
      req.session.journey.inManageBookingMode = true;
    }

    return res.render(PageNames.MANAGE_BOOKING_LOGIN, {
      backLink: this.getBackLink(req),
    });
  };

  public post = async (req: Request, res: Response): Promise<void> => {
    if (req.hasErrors) {
      req.errors.forEach((error) => {
        const errorMessage = error.msg;
        if (errorMessage) {
          logger.warn(`ManageBookingLoginController::post: ${errorMessage}`, {
            target: req.session.target,
            locale: req.session.locale,
          });
        }
      });
      return this.sendErrorResponse(req, res);
    }

    const bookingDetails = req.body as ManageBookingLoginBody;
    const { bookingReference } = bookingDetails;
    const licenceNumber = LicenceNumber.of(bookingDetails.licenceNumber, req.session.target as Target)?.toString().toUpperCase();

    try {
      logger.debug(`ManageBookingLoginController::post: Requesting eligibility for licence number: ${licenceNumber}`, {
        licenceNumber,
        bookingRef: bookingReference,
      });
      const candidateEligibility = await this.candidateService.getManageBookingEligibility(licenceNumber, req.session.target as Target, req.session.locale as Locale);

      const { candidateId } = candidateEligibility;
      if (!candidateId) {
        logger.warn('ManageBookingLoginController::post: Candidate record for the given licence number does not exist in CRM', {
          bookingRef: bookingReference,
          target: req.session.target,
          locale: req.session.locale,
        });
        return this.sendErrorResponse(req, res);
      }

      const bookingManager = new BookingManager(this.crm);
      const bookings = await bookingManager.loadCandidateBookings(req, candidateId);
      const candidateAndBookingRefMatch = bookings?.find((booking) => isEqualBookingRefs(booking.reference, bookingReference));
      const target = req.session.target as Target;

      if (!candidateAndBookingRefMatch) {
        logger.debug('ManageBookingLoginController::post: Booking not found for candidate', {
          candidateId,
          bookingRef: bookingReference,
        });
        throw new BookingNotFoundError();
      }

      CandidateService.checkAgencyMatchesTarget(candidateAndBookingRefMatch.governmentAgency, target);

      const result = await this.candidateService.alignCandidateDataInCRM(candidateEligibility, licenceNumber);
      const candidate = result?.crmCandidate;
      const licenceId = result?.licenceId;

      req.session.manageBooking = {
        ...req.session.manageBooking,
        candidate: {
          ...candidateEligibility,
          personReference: candidate?.personReference,
          email: candidate?.email,
          telephone: candidate?.telephone,
          licenceId,
          licenceNumber,
        },
      };

      return res.redirect('home');
    } catch (error) {
      if (error instanceof EligibilityLicenceNotFoundError || error instanceof EligibilityNotLatestLicenceError
        || error instanceof EligibilityRetrieveError || error instanceof AgencyMismatchError
        || error instanceof BookingNotFoundError) {
        logger.warn(`ManageBookingLoginController::post: ${error.message}`, {
          target: req.session.target,
          locale: req.session.locale,
        });
        return this.sendErrorResponse(req, res);
      }

      logger.error(error as Error, 'ManageBookingLoginController::post: Failed login attempt', {
        bookingRef: bookingReference,
        target: req.session.target,
        locale: req.session.locale,
      });
      // Show Generic error page
      if (error instanceof EligibilityAuthError || error instanceof CrmRetrieveLicenceError
        || error instanceof CrmCreateUpdateCandidateError) {
        throw error;
      }
      if (error instanceof EligibilityTooManyRequestsError || error instanceof EligibilityServerError
        || error instanceof CrmTooManyRequestsError || error instanceof CrmServerError) {
        return res.render(PageNames.MANAGE_BOOKING_ELIGIBILITY_RETRY_ERROR);
      }
      throw error;
    }
  };

  private sendErrorResponse = (req: Request, res: Response): void => {
    const errorMessage = req.errors[0]?.msg === 'fieldsLeftBlank' || this.hasEmptyFields(req.errors)
      ? errorMessages.fieldsLeftBlank() : errorMessages.incorrectDetails();

    req.errors = [{
      location: 'body',
      msg: errorMessage,
      param: '',
    }];

    return res.status(400).render(PageNames.MANAGE_BOOKING_LOGIN, {
      errors: req.errors,
      ...req.body,
      backLink: this.getBackLink(req),
    });
  };

  private hasEmptyFields = (errors: RequestValidationError[]): boolean => {
    if (!errors) {
      return false;
    }
    // eslint-disable-next-line no-restricted-syntax
    for (const error of errors) {
      if (error?.msg === emptyBookingReferenceErrorMsg || error?.msg === 'Driving Licence Number is empty') {
        return true;
      }
    }
    return false;
  };

  private getBackLink = (req: Request): string => getManageBookingLinkToStartPage(req);

  /* istanbul ignore next */
  public postSchemaValidation: ValidatorSchema = {
    bookingReference: {
      in: ['body'],
      trim: true,
      custom: {
        options: BookingReference.isValid,
      },
    },
    licenceNumber: {
      in: ['body'],
      trim: true,
      custom: {
        options: CandidateService.isDrivingLicenceValid,
      },
    },
  };
}

export default new ManageBookingLoginController(
  CRMGateway.getInstance(),
  EligibilityGateway.getInstance(),
  new CandidateService(CRMGateway.getInstance(), EligibilityGateway.getInstance()),
);
