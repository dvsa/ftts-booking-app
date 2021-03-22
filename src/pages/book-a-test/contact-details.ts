import { Request, Response } from 'express';
import { Meta } from 'express-validator';
import '../../libraries/request';
import { store } from '../../services/session';
import { translate } from '../../helpers/language';
import { RequestValidationError, ValidatorSchema } from '../../middleware/request-validator';

type ViewData = {
  backLink: string | undefined;
  errors?: RequestValidationError[];
  emailValue: string;
  confirmEmailValue: string;
  standardAccommodation: boolean;
};

export class ContactDetailsController {
  private EMAIL_MAX_LENGTH = 100;

  public get = (req: Request, res: Response): void => {
    const { email } = store.candidate.get(req);
    const { support, standardAccommodation } = store.journey.get(req);

    const viewData: ViewData = {
      backLink: this.getBackLink(support, standardAccommodation),
      emailValue: email,
      confirmEmailValue: email,
      standardAccommodation,
    };

    return res.render('contact-details', viewData);
  };

  public post = (req: Request, res: Response): void => {
    if (req.hasErrors) {
      const { support, standardAccommodation } = store.journey.get(req);
      const viewData: ViewData = {
        backLink: this.getBackLink(support, standardAccommodation),
        errors: req.errors,
        confirmEmailValue: req.body.confirmEmail,
        emailValue: req.body.email,
        standardAccommodation,
      };
      return res.render('contact-details', viewData);
    }

    store.candidate.update(req, {
      email: req.body.email,
    });

    const { inEditMode } = store.journey.get(req);
    if (inEditMode) {
      return res.redirect('check-your-answers');
    }

    return res.redirect('test-type');
  };

  /* istanbul ignore next */
  public postSchemaValidation = (): ValidatorSchema => ({
    email: {
      in: ['body'],
      isEmail: {
        errorMessage: (): string => translate('contactDetails.emailValidationError'),
        options: {
          ignore_max_length: true,
        },
      },
      isLength: {
        errorMessage: (): string => translate('contactDetails.emailTooLong'),
        options: {
          max: this.EMAIL_MAX_LENGTH,
        },
      },
    },
    confirmEmail: {
      in: ['body'],
      isEmail: {
        errorMessage: (): string => translate('contactDetails.emailValidationError'),
        options: {
          ignore_max_length: true,
        },
      },
      isLength: {
        errorMessage: (): string => translate('contactDetails.emailTooLong'),
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
      throw new Error(translate('contactDetails.unmatchingError'));
    }

    if (value !== req.body.email) {
      throw new Error(translate('contactDetails.unmatchingError'));
    }

    return value;
  };

  private getBackLink = (support: boolean, standardAccommodation: boolean): string | undefined => {
    // TODO correct nav logic and links needed (FTT-6801).
    if (support || !standardAccommodation) {
      return '#';
    }
    return undefined;
  };
}

export default new ContactDetailsController();
