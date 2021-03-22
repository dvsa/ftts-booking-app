import { Request, Response } from 'express';
import '../../libraries/request';
import { ValidatorSchema } from '../../middleware/request-validator';
import { YesOrNo } from '../../value-objects/yes-or-no';
import { store } from '../../services/session';
import { YES_NO } from '../../domain/enums';
import { translate } from '../../helpers/language';

interface BritishSignLanguageBody {
  bsl: YES_NO;
}

export class BritishSignLanagugeController {
  public get = (req: Request, res: Response): void => {
    if (store.journey.get(req).inManagedBookingEditMode) {
      store.manageBookingEdits.reset(req);
    }
    this.renderPage(req, res);
  };

  public post = (req: Request, res: Response): void => {
    if (req.hasErrors) {
      req.errors.forEach((error) => {
        error.msg = translate('manageBookingChangeBSL.errorBannerNotification');
      });

      return this.renderPage(req, res);
    }

    const isEditMode = store.journey.get(req).inEditMode;
    const { bsl } = req.body as BritishSignLanguageBody;

    if (isEditMode) {
      store.currentBooking.update(req, {
        bsl: bsl === YES_NO.YES,
      });

      return res.redirect('check-your-answers');
    }

    store.manageBookingEdits.update(req, {
      bsl: bsl === YES_NO.YES,
    });

    return res.redirect('check-change');
  };

  private renderPage(req: Request, res: Response): void {
    const { bsl, bookingRef } = store.currentBooking.get(req);
    const isEditMode = store.journey.get(req).inEditMode;

    const chosenBSL = bsl ? YES_NO.YES : YES_NO.NO;

    return res.render('manage-booking/british-sign-language', {
      chosenBSL: isEditMode ? chosenBSL : undefined,
      bookingRef,
      errors: req.errors,
    });
  }

  public postSchemaValidation: ValidatorSchema = {
    bsl: {
      in: ['body'],
      custom: {
        options: YesOrNo.isValid,
      },
    },
  };
}

export default new BritishSignLanagugeController();
