import { Request, Response } from 'express';
import { Meta } from 'express-validator';

import { PageNames } from '@constants';
import config from '../../config';
import { translate } from '../../helpers/language';
import { RequestValidationError, ValidatorSchema } from '../../middleware/request-validator';
import {
  isNonStandardJourney, isStandardJourney, isSupportedStandardJourney,
} from '../../helpers/journey-helper';

type ViewData = {
  backLink: string | undefined;
  errors?: RequestValidationError[];
  emailValue?: string;
  confirmEmailValue?: string;
  digitalResultsEmailInfo: boolean;
  locale?: string;
};

export class EmailContactController {
  private EMAIL_MAX_LENGTH = 100;

  public get = (req: Request, res: Response): void => {
    if (!req.session.candidate) {
      throw Error('EmailContactController::get: No candidate set');
    }
    const { email } = req.session.candidate;
    const { locale } = req.session;

    const viewData: ViewData = {
      backLink: this.getBackLink(req),
      emailValue: email,
      confirmEmailValue: email,
      digitalResultsEmailInfo: config.featureToggles.digitalResultsEmailInfo,
      locale,
    };

    return res.render(PageNames.EMAIL_CONTACT, viewData);
  };

  public post = (req: Request, res: Response): void => {
    const { locale } = req.session;
    if (req.hasErrors) {
      const viewData: ViewData = {
        backLink: this.getBackLink(req),
        errors: req.errors,
        confirmEmailValue: req.body.confirmEmail,
        emailValue: req.body.email,
        digitalResultsEmailInfo: config.featureToggles.digitalResultsEmailInfo,
        locale,
      };
      return res.render(PageNames.EMAIL_CONTACT, viewData);
    }
    if (!req.session.journey) {
      throw Error('EmailContactController::post: No journey set');
    }

    req.session.candidate = {
      ...req.session.candidate,
      email: req.body.email,
    };

    const { inEditMode } = req.session.journey;
    if (inEditMode) {
      if (isStandardJourney(req) || isSupportedStandardJourney(req)) {
        return res.redirect('check-your-answers');
      }
      return res.redirect('check-your-details');
    }
    if (isStandardJourney(req)) {
      return res.redirect('test-type');
    }
    if (isSupportedStandardJourney(req)) {
      if (req.session.journey?.isInstructor) {
        return res.redirect('/instructor/find-test-centre');
      }

      return res.redirect('/find-test-centre');
    }
    if (isNonStandardJourney(req)) {
      return res.redirect('telephone-contact');
    }
    return res.redirect('test-type');
  };

  /* istanbul ignore next */
  public postSchemaValidation = (): ValidatorSchema => ({
    email: {
      in: ['body'],
      trim: true,
      toLowerCase: true,
      isEmail: {
        errorMessage: (): string => translate('emailContact.emailValidationError'),
        options: {
          ignore_max_length: true,
        },
      },
      isLength: {
        errorMessage: (): string => translate('emailContact.emailTooLong'),
        options: {
          max: this.EMAIL_MAX_LENGTH,
        },
      },
    },
    confirmEmail: {
      in: ['body'],
      trim: true,
      toLowerCase: true,
      isEmail: {
        errorMessage: (): string => translate('emailContact.confirmEmailValidationError'),
        options: {
          ignore_max_length: true,
        },
      },
      isLength: {
        errorMessage: (): string => translate('emailContact.emailTooLong'),
        options: {
          max: this.EMAIL_MAX_LENGTH,
        },
      },
      custom: {
        options: this.matchingEmailValidator,
      },
    },
  });

  public matchingEmailValidator = (value: string, { req }: Meta): string => {
    if (!value) {
      throw new Error(translate('emailContact.unmatchingError'));
    }

    if (value !== req.body.email) {
      throw new Error(translate('emailContact.unmatchingError'));
    }

    return value;
  };

  private getBackLink = (req: Request): string | undefined => {
    if (!req.session.journey) {
      throw Error('EmailContactController::getBackLink: No journey set');
    }
    const { inEditMode } = req.session.journey;
    if (inEditMode) {
      if (isStandardJourney(req) || isSupportedStandardJourney(req)) {
        return 'check-your-answers';
      }
      return 'check-your-details';
    }
    if (isStandardJourney(req)) {
      return undefined;
    }
    if (isNonStandardJourney(req)) {
      return 'preferred-location';
    }
    if (isSupportedStandardJourney(req)) {
      if (req.session.journey?.isInstructor) {
        return '/instructor/nsa/leaving-nsa';
      }

      return '/nsa/leaving-nsa';
    }
    return undefined;
  };
}

export default new EmailContactController();
