import { Request, Response } from 'express';
import { PageNames } from '@constants';
import { SupportType, Target, Voiceover } from '../../domain/enums';
import { translate } from '../../helpers/language';
import { ValidatorSchema } from '../../middleware/request-validator';
import { bslIsAvailable } from '../../domain/bsl';

type SupportOption = {
  attributes: {
    'data-automation-id': string;
  };
  checked: boolean;
  text: string;
  value: SupportType;
};
class SelectStandardSupportController {
  supportOptions: Map<string, SupportOption>;

  supportTypes: SupportType[] = [
    SupportType.ON_SCREEN_BSL, SupportType.VOICEOVER, SupportType.NO_SUPPORT_WANTED,
  ];

  constructor() {
    this.supportOptions = new Map();
  }

  get = (req: Request, res: Response): void => {
    if (!req.session.journey) {
      throw Error('SelectStandardSupportController::get: No journey set');
    }
    if (!req.session.currentBooking) {
      throw Error('SelectStandardSupportController::get: No currentBooking set');
    }
    // if the user comes back to select standard support page, reset shown voiceover page flag
    req.session.journey.shownVoiceoverPageFlag = false;

    this.render(req, res);
  };

  post = (req: Request, res: Response): void => {
    if (!req.session.journey) {
      throw Error('SelectStandardSupportController::post: No journey set');
    }
    if (req.hasErrors) {
      return this.render(req, res);
    }

    const { selectStandardSupportType } = req.body;

    if (selectStandardSupportType === SupportType.ON_SCREEN_BSL) {
      req.session.currentBooking = {
        ...req.session.currentBooking,
        bsl: true,
        voiceover: Voiceover.NONE,
        selectStandardSupportType,
      };
      req.session.lastPage = 'select-standard-support';
      return res.redirect('find-test-centre');
    }

    if (selectStandardSupportType === SupportType.VOICEOVER) {
      req.session.currentBooking = {
        ...req.session.currentBooking,
        bsl: false,
        selectStandardSupportType,
      };
      return res.redirect('change-voiceover');
    }

    if (selectStandardSupportType === SupportType.NO_SUPPORT_WANTED) {
      req.session.currentBooking = {
        ...req.session.currentBooking,
        bsl: false,
        voiceover: Voiceover.NONE,
        selectStandardSupportType,
      };
    }

    req.session.currentBooking = {
      ...req.session.currentBooking,
      bsl: false,
      voiceover: Voiceover.NONE,
      selectStandardSupportType,
    };

    const { inEditMode } = req.session.journey;
    if (inEditMode) {
      req.session.journey = {
        ...req.session.journey,
        inEditMode: false,
      };
    }
    req.session.lastPage = 'select-standard-support';
    return res.redirect('find-test-centre');
  };

  private render = (req: Request, res: Response): void => {
    if (!req.session.currentBooking) {
      throw Error('SelectStandardSupportController::render: No currentBooking set');
    }
    if (!req.session.journey) {
      throw Error('SelectStandardSupportController::render: No journey set');
    }

    const { testType } = req.session.currentBooking;
    if (!bslIsAvailable(testType)) {
      return res.redirect('change-voiceover');
    }
    req.session.journey.shownStandardSupportPageFlag = true;
    this.supportOptions.clear();
    this.supportTypes.forEach((val) => {
      this.supportOptions.set(val, {
        attributes: {
          'data-automation-id': `support-${val}`,
        },
        checked: val === req.session.currentBooking?.selectStandardSupportType,
        value: val,
        text: translate(`selectStandardSupportType.${val}`),
      });
    });

    const options: SupportOption[] = [];
    this.supportOptions.forEach((value) => options.push(value));

    return res.render(PageNames.SELECT_STANDARD_SUPPORT, {
      errors: req.errors,
      options,
      backLink: this.getBackLink(req),
    });
  };

  // private isSupportTypeChecked(supportType: SupportType, req: Request): boolean {
  //   // const bslSelected = req.session.currentBooking?.bsl;
  //   // if (supportType === SupportType.ON_SCREEN_BSL && bslSelected) {
  //   //   return true;
  //   // }

  //   // const voiceoverSelected = !req.session.currentBooking?.voiceover || req.session.currentBooking?.voiceover !== Voiceover.NONE;
  //   // if (supportType === SupportType.VOICEOVER && voiceoverSelected) {
  //   //   return true;
  //   // }

  //   // if (supportType === SupportType.NO_SUPPORT_WANTED && !bslSelected && !voiceoverSelected) {
  //   //   return true;
  //   // }

  //   // return false;
  //   if (supportType === req.session.currentBooking?.selectStandardSupportType) {
  //     return true;
  //   }
  //   return false;
  // }

  /* istanbul ignore next */
  public postSchemaValidation = (): ValidatorSchema => ({
    selectStandardSupportType: {
      in: ['body'],
      custom: {
        options: this.supportTypeValidator,
      },
    },
  });

  public supportTypeValidator = (value: string): string => {
    if (!value) {
      throw new Error(translate('voicemail.errorBannerNotification'));
    }
    return value;
  };

  private getBackLink = (req: Request): string => {
    if (!req.session.journey) {
      throw Error('SelectStandardSupportController::getBackLink: No journey set');
    }
    if (req.session.target === Target.GB) {
      return 'test-language';
    }

    // DVA
    if (req.session.journey.receivedSupportRequestPageFlag) {
      return 'received-support-request';
    }
    return 'test-type';
  };
}

export default new SelectStandardSupportController();
