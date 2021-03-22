import { Request, Response } from 'express';
import { translate } from '../../helpers/language';
import { ValidatorSchema } from '../../middleware/request-validator';
import { store } from '../../services/session';

interface CustomSupportBody {
  support: string;
}

export class CustomSupportController {
  public get = (req: Request, res: Response): void => this.render(req, res);

  public post = (req: Request, res: Response): void => {
    const { support } = req.body as CustomSupportBody;
    store.currentBooking.update(req, {
      customSupport: support,
    });

    if (req.hasErrors) {
      return this.render(req, res);
    }

    // TODO NSA - navigate to "we'll contact you" page FTT-6801
    return this.render(req, res);
  };

  private render = (req: Request, res: Response): void => {
    res.render('supported/custom-support', {
      errors: req.errors,
      savedCustomSupport: store.currentBooking.get(req).customSupport,
    });
  };

  public postSchemaValidation = (): ValidatorSchema => ({
    support: {
      in: ['body'],
      isLength: {
        options: { max: 4000 },
        errorMessage: (): string => translate('customSupport.errorMessage'),
      },
    },
  });
}

export default new CustomSupportController();
