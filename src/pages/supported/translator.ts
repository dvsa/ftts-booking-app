import { Request, Response } from 'express';
import '../../libraries/request';
import { ValidatorSchema } from '../../middleware/request-validator';
import { translate } from '../../helpers/language';
import { store } from '../../services/session';

export class TranslatorController {
  public get = (req: Request, res: Response): void => this.renderPage(req, res);

  public post = (req: Request, res: Response): void => {
    if (req.hasErrors) {
      return res.render('supported/translator', {
        value: req.body.translator,
        errors: req.errors,
      });
    }
    store.currentBooking.update(req, {
      translator: req.body.translator,
    });
    return res.redirect('#');
  };

  private renderPage(req: Request, res: Response): void {
    const { translator } = store.currentBooking.get(req);
    return res.render('supported/translator', {
      value: translator,
      errors: req.errors,
    });
  }

  public postSchemaValidation: ValidatorSchema = {
    translator: {
      in: ['body'],
      isEmpty: {
        negated: true,
        errorMessage: (): string => translate('translator.errorMessages.empty'),
      },
      isLength: {
        errorMessage: (): string => translate('translator.errorMessages.tooLong'),
        options: {
          max: 100,
        },
      },
    },
  };
}

export default new TranslatorController();
