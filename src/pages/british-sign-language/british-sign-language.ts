import { Request, Response } from 'express';

import { PageNames } from '@constants';
import { ValidatorSchema } from '../../middleware/request-validator';
import { YesOrNo } from '../../value-objects/yes-or-no';
import { YesNo } from '../../domain/enums';
import { translate } from '../../helpers/language';

interface BritishSignLanguageBody {
  bsl: YesNo;
}

export class BritishSignLanagugeController {
  public get = (req: Request, res: Response): void => {
    if (!req.session.journey) {
      throw Error('BritishSignLanagugeController::get: No journey set');
    }
    if (req.session.journey.inManagedBookingEditMode) {
      req.session.manageBookingEdits = undefined;
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
    if (!req.session.journey) {
      throw Error('BritishSignLanagugeController::post: No journey set');
    }
    const isEditMode = req.session.journey.inEditMode;
    const { bsl } = req.body as BritishSignLanguageBody;

    if (isEditMode) {
      req.session.currentBooking = {
        ...req.session.currentBooking,
        bsl: bsl === YesNo.YES,
      };

      return res.redirect('check-your-answers');
    }

    req.session.manageBookingEdits = {
      ...req.session.manageBookingEdits,
      bsl: bsl === YesNo.YES,
    };

    return res.redirect('check-change');
  };

  private renderPage(req: Request, res: Response): void {
    if (!req.session.currentBooking) {
      throw Error('BritishSignLanagugeController::renderPage: No currentBooking set');
    }
    if (!req.session.journey) {
      throw Error('BritishSignLanagugeController::renderPage: No journey set');
    }
    const { bsl, bookingRef } = req.session.currentBooking;
    const isEditMode = req.session.journey.inEditMode;

    const chosenBSL = bsl ? YesNo.YES : YesNo.NO;

    return res.render(PageNames.BRITISH_SIGN_LANGUAGE, {
      chosenBSL: isEditMode ? chosenBSL : undefined,
      bookingRef,
      errors: req.errors,
    });
  }

  /* istanbul ignore next */
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
