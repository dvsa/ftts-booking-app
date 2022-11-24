import dedent from 'ts-dedent';
import { translate } from '../../../../../helpers/language';
import config from '../../../../../config';

export const afterTheTest = (): string => {
  if (config.featureToggles.digitalResultsEmailInfo) {
    return dedent`

    ---
    # ${translate('bookingConfirmation.afterTheTestSubheading')}
    ${translate('bookingConfirmation.afterTheTestParagraph')}
    `;
  }
  return '';
};
