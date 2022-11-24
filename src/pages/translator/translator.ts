import { Request, Response } from 'express';

import { PageNames } from '@constants';
import { ValidatorSchema } from '../../middleware/request-validator';
import { translate } from '../../helpers/language';
import nsaNavigator from '../../helpers/nsa-navigator';

export class TranslatorController {
  public get = (req: Request, res: Response): void => this.renderPage(req, res);

  public post = (req: Request, res: Response): void => {
    if (req.hasErrors) {
      return this.renderPage(req, res);
    }
    if (!req.session.journey) {
      throw Error('TranslatorController::post: No journey set');
    }
    const { inEditMode } = req.session.journey;
    req.session.currentBooking = {
      ...req.session.currentBooking,
      translator: req.body.translator,
    };
    return inEditMode ? res.redirect('check-your-details') : res.redirect(nsaNavigator.getNextPage(req));
  };

  private renderPage(req: Request, res: Response): void {
    if (!req.session.currentBooking) {
      throw Error('TranslatorController::renderPage: No currentBooking set');
    }
    const { translator } = req.session.currentBooking;
    return res.render(PageNames.TRANSLATOR, {
      value: req.body?.translator || translator,
      backLink: this.getBackLink(req),
      errors: req.errors,
    });
  }

  private getBackLink = (req: Request): string => {
    if (!req.session.journey) {
      throw Error('TranslatorController::getBackLink: No journey set');
    }
    const { inEditMode } = req.session.journey;
    return inEditMode ? 'check-your-details' : nsaNavigator.getPreviousPage(req);
  };

  /* istanbul ignore next */
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
