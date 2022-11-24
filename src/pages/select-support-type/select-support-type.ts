import { Request, Response } from 'express';
import { PageNames } from '@constants';
import {
  SupportType, Target, TestType, Voiceover,
} from '../../domain/enums';
import { translate } from '../../helpers/language';
import { ValidatorSchema } from '../../middleware/request-validator';
import { Booking } from '../../services/session';
import nsaNavigator from '../../helpers/nsa-navigator';
import { SupportTypeOption } from '../../domain/types';
import { getInvalidOptions, removeInvalidOptions, toSupportTypeOptions } from '../../helpers/support';
import { stringToArray } from '../../libraries/request-sanitizer';

type SelectSupportTypeBody = {
  selectSupportType: SupportType[] | SupportType;
};

class SelectSupportType {
  options: Map<string, SupportTypeOption>;

  supportTypes: SupportType[] = [
    SupportType.ON_SCREEN_BSL, SupportType.BSL_INTERPRETER, SupportType.VOICEOVER,
    SupportType.TRANSLATOR, SupportType.EXTRA_TIME, SupportType.READING_SUPPORT, SupportType.OTHER,
  ];

  constructor() {
    this.options = new Map();
  }

  get = (req: Request, res: Response): void => {
    this.render(req, res);
  };

  post = (req: Request, res: Response): void => {
    if (req.hasErrors) {
      return this.render(req, res);
    }
    if (!req.session.journey) {
      throw Error('SelectSupportType::post: No journey set');
    }

    this.resetSessionOptions(req);

    const { selectSupportType } = req.body as SelectSupportTypeBody;

    let supportTypes: SupportType[] = [];
    if (typeof selectSupportType === 'string') {
      supportTypes.push(selectSupportType);
    } else {
      supportTypes = selectSupportType;
    }

    const updatedCurrentBooking: Partial<Booking> = {
      selectSupportType: supportTypes,
    };

    if (supportTypes.includes(SupportType.ON_SCREEN_BSL)) {
      updatedCurrentBooking.bsl = true;
      updatedCurrentBooking.translator = undefined;
      updatedCurrentBooking.customSupport = undefined;
    }

    req.session.currentBooking = {
      ...req.session.currentBooking,
      ...updatedCurrentBooking,
    };
    if (req.session.journey.confirmingSupport) {
      req.session.journey.confirmingSupport = undefined;
      req.session.currentBooking.customSupport = undefined;
    }

    const { inEditMode } = req.session.journey;
    if (inEditMode) {
      req.session.journey = {
        ...req.session.journey,
        inEditMode: false,
      };
    }

    return res.redirect(nsaNavigator.getNextPage(req));
  };

  private render = (req: Request, res: Response): void => {
    if (!req.session.currentBooking) {
      throw Error('SelectSupportType::render: No currentBooking set');
    }
    this.options.clear();
    this.options = toSupportTypeOptions(this.supportTypes);

    removeInvalidOptions(this.options, req);

    const { selectSupportType } = req.session.currentBooking;
    const body = req.body as SelectSupportTypeBody;
    const supportOptions = body.selectSupportType || selectSupportType;

    const options: SupportTypeOption[] = [];
    this.options.forEach((value) => options.push(value));

    options.forEach((option) => {
      option.checked = supportOptions?.includes(option.value) || false;
      return option;
    });

    return res.render(PageNames.SELECT_SUPPORT_TYPE, {
      errors: req.errors,
      options,
      backLink: this.getBackLink(req),
    });
  };

  /* istanbul ignore next */
  public postSchemaValidation = (req: Request): ValidatorSchema => ({
    selectSupportType: {
      in: ['body'],
      custom: {
        options: this.supportTypeValidator(req),
      },
    },
  });

  public supportTypeValidator = (req: Request) => (value: string[]): string[] => {
    if (!value) {
      throw new Error(translate('selectSupportType.errors.noneSelected'));
    }
    // Not allowed to select sign language and voiceover together
    if (value.includes(SupportType.ON_SCREEN_BSL) && value.includes(SupportType.VOICEOVER)) {
      throw new Error(translate('selectSupportType.errors.badCombination'));
    }
    if (this.hasInvalidOptionSelected(req, value)) {
      throw new Error(translate('selectSupportType.errors.invalidOptionSelected'));
    }
    return value;
  };

  private getBackLink = (req: Request): string => {
    if (!req.session.journey) {
      throw Error('SelectSupportType::getBackLink: No journey set');
    }
    const { inEditMode } = req.session.journey;

    if (inEditMode) {
      return 'check-your-details';
    }

    if (req.session.journey.confirmingSupport) {
      return 'confirm-support';
    }

    // Go back to the test-type page for NI (Cannot change test language for NI)
    // Go back to test type page for ERS Tests
    if (req.session.target === Target.NI || req.session.currentBooking?.testType === TestType.ERS) {
      return 'test-type';
    }

    return 'test-language';
  };

  private resetSessionOptions = (req: Request): void => {
    if (!req.session.currentBooking) {
      throw new Error('SelectSupportType::resetSessionOptions: No journey set');
    }
    const { selectSupportType } = req.body as SelectSupportTypeBody;
    const {
      bsl, voiceover, translator, customSupport,
    } = req.session.currentBooking;

    let updatedBsl: boolean | undefined = false;
    let updatedVoiceover: Voiceover | undefined = Voiceover.NONE;
    let updatedCustomSupport: SupportType | undefined = SupportType.NONE;
    let updatedTranslator: string | undefined;

    if (selectSupportType.includes(SupportType.ON_SCREEN_BSL)) {
      updatedBsl = bsl;
    }

    if (selectSupportType.includes(SupportType.VOICEOVER)) {
      updatedVoiceover = voiceover;
    }

    if (selectSupportType.includes(SupportType.TRANSLATOR)) {
      updatedTranslator = translator;
    }

    if (selectSupportType.includes(SupportType.OTHER)) {
      updatedCustomSupport = customSupport as SupportType;
    }

    req.session.currentBooking = {
      ...req.session.currentBooking,
      bsl: updatedBsl,
      voiceover: updatedVoiceover,
      translator: updatedTranslator,
      customSupport: updatedCustomSupport,
    };
  };

  private hasInvalidOptionSelected(req: Request, value: string[]) {
    const testType = req.session.currentBooking?.testType as TestType;
    const { target } = req.session;
    const invalidOptions = getInvalidOptions(testType, target as Target);
    if (invalidOptions.length > 0) {
      const invalidOptionSelected = stringToArray(value).find((element) => invalidOptions.includes(element as SupportType));
      if (invalidOptionSelected) return true;
    }
    return false;
  }
}

export default new SelectSupportType();
