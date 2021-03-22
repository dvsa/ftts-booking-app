import { Request, Response } from 'express';
import { YES_NO } from '../../domain/enums';
import { translate } from '../../helpers/language';
import { ValidatorSchema } from '../../middleware/request-validator';
import { store } from '../../services/session';
import { YesOrNo } from '../../value-objects/yes-or-no';

interface ChooseSupportBody {
  chooseSupport: YES_NO;
}
export class ChooseSupportController {
  public get = (req: Request, res: Response): void => {
    store.reset(req);
    return this.renderPage(res, req);
  };

  public post = (req: Request, res: Response): void => {
    if (req.hasErrors) {
      return this.renderPage(res, req);
    }

    const { chooseSupport } = req.body as ChooseSupportBody;
    const supportRequested = chooseSupport === YES_NO.YES;

    store.journey.update(req, {
      support: supportRequested,
      standardAccommodation: !supportRequested,
    });

    return res.redirect('candidate-details');
  };

  private renderPage(res: Response, req: Request): void {
    if (req.errors?.length) {
      req.errors[0].msg = translate('chooseSupport.errorMessage');
    }
    return res.render('common/choose-support', {
      errors: req.errors,
      booking: store.currentBooking.get(req),
    });
  }

  public postSchemaValidation(): ValidatorSchema {
    return {
      chooseSupport: {
        in: ['body'],
        custom: {
          options: YesOrNo.isValid,
        },
      },
    };
  }
}

export default new ChooseSupportController();
