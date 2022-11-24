import { Request, Response } from 'express';

import { PageNames } from '@constants';
import { ValidatorSchema } from '../../middleware/request-validator';
import { YesOrNo } from '../../value-objects/yes-or-no';
import { YesNo } from '../../domain/enums';
import { translate } from '../../helpers/language';

interface BritishSignLanguageBody {
  bsl: YesNo;
}

export class InstructorBritishSignLanagugeController {
  public get = (req: Request, res: Response): void => {
    if (!req.session.journey) {
      throw Error('InstructorBritishSignLanagugeController::get: No journey set');
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
      throw Error('InstructorBritishSignLanagugeController::post: No journey set');
    }
    const { bsl } = req.body as BritishSignLanguageBody;

    req.session.currentBooking = {
      ...req.session.currentBooking,
      bsl: bsl === YesNo.YES,
    };

    return res.redirect('check-your-answers');
  };

  private renderPage(req: Request, res: Response): void {
    if (!req.session.currentBooking) {
      throw Error('InstructorBritishSignLanagugeController::renderPage: No currentBooking set');
    }
    if (!req.session.journey) {
      throw Error('InstructorBritishSignLanagugeController::renderPage: No journey set');
    }
    const { bsl, bookingRef } = req.session.currentBooking;
    const isEditMode = req.session.journey.inEditMode;

    const chosenBSL = bsl ? YesNo.YES : YesNo.NO;

    return res.render(PageNames.INSTRUCTOR_BRITISH_SIGN_LANGUAGE, {
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

export default new InstructorBritishSignLanagugeController();
