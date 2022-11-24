import { Request, Response } from 'express';
import { PageNames } from '@constants';
import { existsInEnum, PreferredLocation } from '../../domain/enums';
import { translate } from '../../helpers/language';
import { ValidatorSchema } from '../../middleware/request-validator';

interface PreferredLocationBody {
  locationInput: string;
  preferredLocationOption: PreferredLocation;
}

export class PreferredLocationController {
  public get = (req: Request, res: Response): void => this.render(req, res);

  public post = (req: Request, res: Response): void => {
    if (!req.session.journey) {
      throw Error('PreferredLocationBody::post: No journey set');
    }
    const { locationInput, preferredLocationOption } = req.body as PreferredLocationBody;
    const { inEditMode } = req.session.journey;

    if (req.hasErrors) {
      return this.render(req, res);
    }

    req.session.currentBooking = {
      ...req.session.currentBooking,
      preferredLocation: locationInput,
      preferredLocationOption,
    };

    return inEditMode ? res.redirect('check-your-details') : res.redirect('email-contact');
  };

  private render = (req: Request, res: Response): void => {
    if (!req.session.journey) {
      throw Error('PreferredLocationBody::render: No journey set');
    }
    const { locationInput, preferredLocationOption } = req.body as PreferredLocationBody;
    const { inEditMode } = req.session.journey;

    res.render(PageNames.PREFERRED_LOCATION, {
      errors: req.errors,
      savedPreferredLocation: locationInput || req.session.currentBooking?.preferredLocation,
      preferredLocationOption: preferredLocationOption || req.session.currentBooking?.preferredLocationOption,
      backLink: inEditMode ? 'check-your-details' : 'preferred-day',
    });
  };

  /* istanbul ignore next */
  public postSchemaValidation = (req: Request): ValidatorSchema => {
    const { preferredLocationOption } = req.body as PreferredLocationBody;
    if (preferredLocationOption === PreferredLocation.ParticularLocation) {
      return {
        locationInput: {
          in: ['body'],
          isLength: {
            options: { max: 4000 },
            errorMessage: (): string => translate('preferredLocation.errorMessage'),
          },
        },
      };
    }

    return {
      preferredLocationOption: {
        in: ['body'],
        errorMessage: (): string => translate('preferredLocation.validationError'),
        custom: {
          options: existsInEnum(PreferredLocation),
        },
      },
    };
  };
}

export default new PreferredLocationController();
