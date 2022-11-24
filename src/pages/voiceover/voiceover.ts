import { Request, Response } from 'express';
import { PageNames } from '@constants';
import { Target, Voiceover } from '../../domain/enums';
import { TestVoiceover } from '../../domain/test-voiceover';
import { ValidatorSchema } from '../../middleware/request-validator';
import { translate } from '../../helpers/language';
import nsaNavigator from '../../helpers/nsa-navigator';
import { isNonStandardJourney } from '../../helpers/journey-helper';
import RadioButtonItem from '../../interfaces/radio-button-item';

export interface VoiceoverBody {
  voiceover: Voiceover;
}
export class VoiceoverController {
  public get = (req: Request, res: Response): void => {
    if (!req.session.journey) {
      throw Error('VoiceoverController::get: No journey set');
    }
    if (req.session.journey?.inManagedBookingEditMode) {
      req.session.manageBookingEdits = undefined;
    }
    return this.renderPage(req, res);
  };

  public post = (req: Request, res: Response): void => {
    if (!req.session.journey) {
      throw Error('VoiceoverController::post: No journey set');
    }
    const { target } = req.session;
    const { inEditMode, inManagedBookingEditMode } = req.session.journey;

    if (req.hasErrors) {
      if (target === Target.NI && inManagedBookingEditMode) {
        req.errors.forEach((error) => {
          error.msg = translate('voiceover.editMode.validationError');
        });
      }
      return this.renderPage(req, res);
    }
    req.session.journey.shownVoiceoverPageFlag = true;

    const { voiceover } = req.body as VoiceoverBody;

    if (inManagedBookingEditMode) {
      req.session.manageBookingEdits = {
        ...req.session.manageBookingEdits,
        voiceover,
      };
      return res.redirect('check-change');
    }

    req.session.currentBooking = {
      ...req.session.currentBooking,
      voiceover,
    };

    if (inEditMode) {
      return isNonStandardJourney(req) ? res.redirect('check-your-details') : res.redirect('check-your-answers');
    }

    if (!isNonStandardJourney(req) && (req.session.journey.shownStandardSupportPageFlag || req.session.journey.shownVoiceoverPageFlag)) {
      req.session.lastPage = 'change-voiceover';
      return res.redirect('find-test-centre');
    }

    return res.redirect(nsaNavigator.getNextPage(req));
  };

  /* istanbul ignore next */
  public voiceoverPostSchema = (): ValidatorSchema => ({
    voiceover: {
      in: ['body'],
      errorMessage: (): string => translate('voiceover.validationError'),
      isEmpty: {
        negated: true,
      },
    },
  });

  private renderPage(req: Request, res: Response): void {
    if (!req.session.journey) {
      throw new Error('VoiceoverController::renderPage: No Journey object found in session');
    }
    if (!req.session.currentBooking) {
      throw new Error('VoiceoverController::renderPage: No Current Booking object found in session');
    }
    const { inManagedBookingEditMode } = req.session.journey;
    const { currentBooking } = req.session;
    let chosenOption: Voiceover | undefined;

    const target = req.session.target ?? Target.GB;
    const { testType } = currentBooking;
    if (!testType) {
      throw new Error('VoiceoverController::renderPage: Missing test type in session current booking');
    }

    const availableOptions = TestVoiceover.availableOptions(target, testType);

    if (currentBooking.voiceover && req.session.journey.shownVoiceoverPageFlag) {
      chosenOption = currentBooking.voiceover;
    }

    const radioItems: RadioButtonItem[] = [];
    availableOptions.forEach((option) => {
      let optionText = translate(`generalContent.language.${option}`);
      if (!isNonStandardJourney(req)) {
        optionText = `${translate('voiceover.editMode.yesOptionPrefix')} ${translate(`generalContent.language.${option}`)}`;
      }
      radioItems.push({
        value: option,
        text: optionText,
        checked: inManagedBookingEditMode ? false : chosenOption === option,
      });
    });
    if (!isNonStandardJourney(req)) {
      radioItems.push({
        value: Voiceover.NONE,
        text: translate('voiceover.editMode.noOption'),
        checked: inManagedBookingEditMode ? false : chosenOption === Voiceover.NONE,
      });
    }

    return res.render(PageNames.VOICEOVER, {
      inManagedBookingEditMode,
      isNonStandardJourney: isNonStandardJourney(req),
      radioItems,
      bookingRef: currentBooking.bookingRef,
      receivedSupportRequestPageFlag: req.session.journey.receivedSupportRequestPageFlag,
      backLink: this.getBackLink(req),
      errors: req.errors,
    });
  }

  private getBackLink = (req: Request): string => {
    if (!req.session.journey) {
      throw new Error('VoiceoverController::getBackLink: No Journey object found in session');
    }
    const { inEditMode } = req.session.journey;
    if (inEditMode) {
      return isNonStandardJourney(req) ? 'check-your-details' : 'check-your-answers';
    }
    if (!isNonStandardJourney(req)) {
      if (req.session.journey.shownStandardSupportPageFlag) {
        return 'select-standard-support';
      }
      if (req.session.target === Target.GB) {
        return 'test-language';
      } if (req.session.target === Target.NI) {
        if (req.session.journey.receivedSupportRequestPageFlag) {
          return 'received-support-request';
        }
        return 'test-type';
      }
    }

    return nsaNavigator.getPreviousPage(req);
  };
}

export default new VoiceoverController();
