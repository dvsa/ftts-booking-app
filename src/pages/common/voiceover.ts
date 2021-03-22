import { Request, Response } from 'express';
import { TARGET, Voiceover } from '../../domain/enums';
import { TestVoiceover } from '../../domain/test-voiceover';
import '../../libraries/request';
import { ValidatorSchema } from '../../middleware/request-validator';
import { store } from '../../services/session';
import { translate } from '../../helpers/language';

export class VoiceoverController {
  public get = (req: Request, res: Response): void => {
    if (store.journey.get(req).inManagedBookingEditMode) {
      store.manageBookingEdits.reset(req);
    }
    return this.renderPage(req, res);
  };

  public post = (req: Request, res: Response): void => {
    const { target } = res.locals;
    const { inEditMode, inManagedBookingEditMode } = store.journey.get(req);

    if (req.hasErrors) {
      if (target === TARGET.NI && inManagedBookingEditMode) {
        req.errors.forEach((error) => {
          error.msg = translate('voiceover.editMode.validationError');
        });
      }
      return this.renderPage(req, res);
    }

    const { voiceover } = req.body;

    if (inManagedBookingEditMode) {
      store.manageBookingEdits.update(req, { voiceover });
      return res.redirect('check-change');
    }

    store.currentBooking.update(req, {
      voiceover,
    });

    if (inEditMode) {
      return res.redirect('check-your-answers');
    }

    return this.renderPage(req, res); // TODO FTT-6801 Change this to redirect when handling NSA logic.
  };

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
    const { inManagedBookingEditMode, inEditMode } = store.journey.get(req);
    const currentBooking = store.currentBooking.get(req);

    if (currentBooking.voiceover === undefined && inEditMode) {
      currentBooking.voiceover = Voiceover.NONE;
    }

    const availableOptionsMap = TestVoiceover.availableOptions(req?.res?.locals?.target as TARGET).entries();
    let availableOptionsArray = Array.from(availableOptionsMap, ([value, text]) => ({
      value, text, checked: false, attributes: { 'data-automation-id': '' },
    }));

    const { target } = res.locals;
    const chosenLanguage = inEditMode ? currentBooking.voiceover : undefined;

    if (!(inEditMode || inManagedBookingEditMode)) {
      availableOptionsArray = availableOptionsArray.filter((option) => option.value !== Voiceover.NONE);
      availableOptionsArray.forEach((option) => {
        option.text = translate(`generalContent.language.${option.value.toLowerCase()}`);
      });
    } else {
      availableOptionsArray.forEach((option) => {
        if (chosenLanguage && option.value === chosenLanguage) {
          option.checked = true;
        }

        if (option.value === Voiceover.NONE) {
          option.text = translate('voiceover.editMode.noOption');
        } else if (target === TARGET.GB) {
          option.text = `${translate('voiceover.editMode.yesOptionPrefix')} ${translate(`generalContent.language.${option.value.toLowerCase()}`)}`;
        } else {
          option.text = translate(`generalContent.language.${option.value.toLowerCase()}`);
        }
      });
    }

    availableOptionsArray.forEach((option) => {
      option.attributes['data-automation-id'] = `voiceover-checkbox-${availableOptionsArray.indexOf(option) + 1}`;
    });

    return res.render('common/voiceover', {
      chosenLanguage,
      inManagedBookingEditMode,
      availableOptionsArray,
      bookingRef: currentBooking.bookingRef,
      errors: req.errors,
    });
  }
}

export default new VoiceoverController();
