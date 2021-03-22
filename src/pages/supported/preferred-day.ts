import { Request, Response } from 'express';
import { existsInEnum, PreferredDay } from '../../domain/enums';
import { translate } from '../../helpers/language';
import { ValidatorSchema } from '../../middleware/request-validator';
import { store } from '../../services/session';

interface PreferredDayBody {
  dayInput: string;
  preferredDayOption: PreferredDay;
}

export class PreferredDayController {
  public get = (req: Request, res: Response): void => this.render(req, res);

  public post = (req: Request, res: Response): void => {
    const { dayInput, preferredDayOption } = req.body as PreferredDayBody;

    if (req.hasErrors) {
      return this.render(req, res);
    }

    store.currentBooking.update(req, {
      preferredDay: dayInput,
      preferredDayOption,
    });

    // TODO NSA - navigate to "preferred location" page FTT-6801
    return this.render(req, res);
  };

  private render = (req: Request, res: Response): void => {
    const { dayInput, preferredDayOption } = req.body as PreferredDayBody;
    res.render('supported/preferred-day', {
      errors: req.errors,
      savedPreferredDay: dayInput || store.currentBooking.get(req).preferredDay,
      preferredDayOption: preferredDayOption || store.currentBooking.get(req).preferredDayOption,
    });
  };

  public postSchemaValidation = (req: Request): ValidatorSchema => {
    const { preferredDayOption } = req.body as PreferredDayBody;
    if (preferredDayOption === PreferredDay.ParticularDay) {
      return {
        dayInput: {
          in: ['body'],
          isLength: {
            options: { max: 4000 },
            errorMessage: (): string => translate('preferredDay.errorMessage'),
          },
        },
      };
    }
    return {
      preferredDayOption: {
        in: ['body'],
        errorMessage: (): string => translate('preferredDay.validationError'),
        custom: {
          options: existsInEnum(PreferredDay),
        },
      },
    };
  };
}

export default new PreferredDayController();
