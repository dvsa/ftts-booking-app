/* eslint-disable import/no-cycle */
import { BasePage } from './base-page';
import { click, enter } from '../utils/helpers';
import { PreferredDay } from '../../../src/domain/enums';

export class PreferredDayNSAPage extends BasePage {
  pageHeadingLocator = 'h1[data-automation-id="heading"]';

  updateBanner = 'div.alert';

  preferredDayRadioLocator = 'input[data-automation-id="<>"]';

  preferredDayTextArea = 'textarea[data-automation-id="input"]';

  charCountHintText = '#dayInput-info';

  errorLinkRadio = 'a[href="#preferredDayOption"]';

  errorLinkInput = 'a[href="#dayInput"]';

  errorMessageLocator = '#error-summary-title';

  errorMessageList = '.govuk-list.govuk-error-summary__list';

  errorMessageTextAreaLocator = '#dayInput-error';

  errorMessageRadioLocator = '#preferredDayOption-error';

  continueButton = 'button[data-automation-id="submit"]';

  cancelButton = 'a[data-automation-id="cancel"]';

  backLink = 'a[data-automation-id="back"]';

  pathUrl = 'nsa/preferred-day';

  // Contents
  pageHeading = 'Is there a day and time that\'s best for you?';

  characterCountText = 'You have 4000 characters remaining';

  errorMessageHeader = 'There is a problem';

  errorMessageOptionNotSelectedText = 'You must select an option.';

  errorMessageTooManyCharsText = 'The text you enter here must be 4000 characters or fewer';

  updateBannerText = 'You can change your mind about this or you can keep your existing choice.';

  updateButtonText = 'Confirm change and continue';

  cancelButtonText = 'Cancel and keep your existing choice';

  cancelLinkText = 'can keep your existing choice';

  getRadioSelector(preferredDay: PreferredDay): string {
    return this.preferredDayRadioLocator.replace('<>', preferredDay.toString());
  }

  async selectPreferredDayOption(preferredDay: PreferredDay): Promise<void> {
    const preferredDayOption = this.getRadioSelector(preferredDay);
    await click(`${preferredDayOption} + label`);
    await click(`${preferredDayOption} + label`);
  }

  async enterPreferredDayInformation(dayText: string): Promise<void> {
    await enter(this.preferredDayTextArea, dayText);
    await click(this.continueButton);
  }

  async goBack(): Promise<void> {
    await click(this.backLink);
  }
}
