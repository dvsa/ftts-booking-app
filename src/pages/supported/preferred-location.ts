import { Request, Response } from 'express';
import { existsInEnum, PreferredLocation } from '../../domain/enums';
import { translate } from '../../helpers/language';
import { ValidatorSchema } from '../../middleware/request-validator';
import { store } from '../../services/session';

interface PreferredLocationBody {
  locationInput: string;
  preferredLocationOption: PreferredLocation;
}

export class PreferredLocationController {
  public get = (req: Request, res: Response): void => this.render(req, res);

  public post = (req: Request, res: Response): void => {
    const { locationInput, preferredLocationOption } = req.body as PreferredLocationBody;

    if (req.hasErrors) {
      return this.render(req, res);
    }

    store.currentBooking.update(req, {
      preferredLocation: locationInput,
      preferredLocationOption,
    });

    // TODO NSA - adjust navigation in FTT-6801
    return this.render(req, res);
  };

  private render = (req: Request, res: Response): void => {
    const { locationInput, preferredLocationOption } = req.body as PreferredLocationBody;
    res.render('supported/preferred-location', {
      errors: req.errors,
      savedPreferredLocation: locationInput || store.currentBooking.get(req).preferredLocation,
      preferredLocationOption: preferredLocationOption || store.currentBooking.get(req).preferredLocationOption,
    });
  };

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
