import { Request, Response } from 'express';
import { PageNames } from '@constants';
import { existsInEnum, PreferredDay } from '../../domain/enums';
import { translate } from '../../helpers/language';
import { ValidatorSchema } from '../../middleware/request-validator';

interface PreferredDayBody {
  dayInput: string;
  preferredDayOption: PreferredDay;
}

export class InstructorPreferredDayController {
  public get = (req: Request, res: Response): void => this.render(req, res);

  public post = (req: Request, res: Response): void => {
    if (!req.session.journey) {
      throw Error('InstructorPreferredDayController::post: No journey set');
    }
    const { dayInput, preferredDayOption } = req.body as PreferredDayBody;
    const { inEditMode } = req.session.journey;

    if (req.hasErrors) {
      return this.render(req, res);
    }

    req.session.currentBooking = {
      ...req.session.currentBooking,
      preferredDay: dayInput,
      preferredDayOption,
    };

    return inEditMode ? res.redirect('check-your-details') : res.redirect('preferred-location');
  };

  private render = (req: Request, res: Response): void => {
    if (!req.session.journey) {
      throw Error('InstructorPreferredDayController::render: No journey set');
    }
    const { dayInput, preferredDayOption } = req.body as PreferredDayBody;
    const { inEditMode } = req.session.journey;
    res.render(PageNames.INSTRUCTOR_PREFERRED_DAY, {
      errors: req.errors,
      savedPreferredDay: dayInput || req.session.currentBooking?.preferredDay,
      preferredDayOption: preferredDayOption || req.session.currentBooking?.preferredDayOption,
      backLink: inEditMode ? 'check-your-details' : 'staying-nsa',
    });
  };

  /* istanbul ignore next */
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

export default new InstructorPreferredDayController();
