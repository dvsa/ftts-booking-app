/* eslint-disable import/no-cycle */
import { BasePage } from './base-page';
import { click, enter } from '../utils/helpers';
import { SessionData } from '../data/session-data';
import { PreferredDay } from '../../../src/domain/enums';

export class PreferredDayNSAPage extends BasePage {
  pageHeadingLocator = '.govuk-heading-xl';

  preferredDayRadioLocator = 'input[data-automation-id="<>"] + label';

  preferredDayTextArea = 'textarea[data-automation-id="input"]';

  charCountHintText = '#dayInput-info';

  errorLinkRadio = 'a[href="#preferredDayOption"]';

  errorLinkInput = 'a[href="#dayInput"]';

  errorMessageLocator = '#error-summary-title';

  errorMessageList = '.govuk-list.govuk-error-summary__list';

  errorMessageTextAreaLocator = '#dayInput-error';

  errorMessageRadioLocator = '#preferredDayOption-error';

  continueButton = 'button[data-automation-id="continue"]';

  backLink = 'a[data-automation-id="back"]';

  pathUrl = 'preferred-day';

  // Contents
  pageTitle = 'Preferred Date';

  pageHeading = 'Is there a day and time that\'s best for you?';

  characterCountText = 'You have 4000 characters remaining';

  errorMessageHeader = 'There is a problem';

  errorMessageOptionNotSelectedText = 'You must select an option.';

  errorMessageTooManyCharsText = 'The text you enter here must be 4000 characters or fewer';

  getRadioSelector(preferredDay: PreferredDay): string {
    return this.preferredDayRadioLocator.replace('<>', preferredDay.toString());
  }

  async selectPreferredDayOption(sessionData: SessionData, preferredDay: PreferredDay): Promise<void> {
    sessionData.currentBooking.preferredDayOption = preferredDay;
    const preferredDayOption = this.getRadioSelector(preferredDay);
    await click(preferredDayOption);
  }

  async enterPreferredDayInformation(sessionData: SessionData, dayText: string): Promise<void> {
    sessionData.currentBooking.preferredDay = dayText;
    await enter(this.preferredDayTextArea, dayText);
    await click(this.continueButton);
  }

  async goBack(): Promise<void> {
    await click(this.backLink);
  }
}
