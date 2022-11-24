/* eslint-disable implicit-arrow-linebreak */
import { Request } from 'express';
import { bslIsAvailable } from '../domain/bsl';
import {
  nonStandardSupportTypes, SupportType, Target, TestType, Voiceover,
} from '../domain/enums';
import { SupportTypeOption } from '../domain/types';
import { translate } from './language';

export const canChangeBsl = (voiceover?: Voiceover): boolean => voiceover === undefined || voiceover === Voiceover.NONE;

export const canChangeVoiceover = (bsl?: boolean): boolean => !bsl;

export const canShowBslChangeButton = (bsl?: boolean, voiceover?: Voiceover): boolean => {
  const canChangeBslOption = canChangeBsl(voiceover);
  const canChangeVoiceoverOption = canChangeVoiceover(bsl);

  return canChangeBslOption || (!canChangeBslOption && !canChangeVoiceoverOption);
};

export const canShowVoiceoverChangeButton = (voiceover?: Voiceover, bsl?: boolean): boolean => {
  const canChangeVoiceoverOption = canChangeVoiceover(bsl);
  const canChangeBslOption = canChangeBsl(voiceover);

  return canChangeVoiceoverOption || (!canChangeBslOption && !canChangeVoiceoverOption);
};

export const isNonStandardSupportSelected = (selectedSupportTypes: SupportType[]): boolean =>
  selectedSupportTypes.some((supportType) => nonStandardSupportTypes.includes(supportType));

export const isOnlyStandardSupportSelected = (selectedSupportTypes: SupportType[]): boolean =>
  !(selectedSupportTypes.some((supportType) => (nonStandardSupportTypes.includes(supportType)) || supportType === SupportType.OTHER));

export const isOnlyCustomSupportSelected = (selectedSupportTypes: SupportType[]): boolean =>
  selectedSupportTypes.includes(SupportType.OTHER) && selectedSupportTypes.length === 1;

export const getInvalidOptions = (testType: TestType, target: Target): SupportType[] => {
  const invalidOptions = [];

  if (target === Target.GB) {
    // Remove translator option as it is NI specific
    invalidOptions.push(SupportType.TRANSLATOR);

    if ([TestType.LGVHPT, TestType.PCVHPT, TestType.ADIHPT].includes(testType)) {
      invalidOptions.push(SupportType.EXTRA_TIME);
      invalidOptions.push(SupportType.BSL_INTERPRETER);
    }
  } else if (target === Target.NI) {
    if ([TestType.LGVHPT, TestType.PCVHPT].includes(testType)) {
      invalidOptions.push(SupportType.EXTRA_TIME);
      invalidOptions.push(SupportType.BSL_INTERPRETER);
    }
  }

  if (!bslIsAvailable(testType)) {
    invalidOptions.push(SupportType.ON_SCREEN_BSL);
  }
  return invalidOptions;
};

export const removeInvalidOptions = (supportTypeOptions: Map<string, SupportTypeOption>, req: Request): void => {
  const testType = req.session.currentBooking?.testType as TestType;
  const { target } = req.session;
  getInvalidOptions(testType, target as Target).forEach((invalidOption: SupportType) => {
    supportTypeOptions.delete(invalidOption);
  });
};

export const toSupportTypeOptions = (supportTypes: SupportType[]): Map<string, SupportTypeOption> => {
  const supportTypeOptions: Map<string, SupportTypeOption> = new Map();
  supportTypes.forEach((val) => {
    supportTypeOptions.set(val, {
      attributes: {
        'data-automation-id': `support-${val}`,
      },
      checked: false,
      value: val,
      text: translate(`selectSupportType.${val}`),
    });
  });
  return supportTypeOptions;
};
