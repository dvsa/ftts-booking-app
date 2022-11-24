/* eslint-disable import/no-cycle */
import { BasePage } from './base-page';
import { click, enter } from '../utils/helpers';
import { PreferredLocation } from '../../../src/domain/enums';

export class PreferredLocationNSAPage extends BasePage {
  pageHeadingLocator = 'h1[data-automation-id="heading"]';

  updateBanner = 'div.alert';

  preferredLocationRadioLocator = 'input[data-automation-id="<>"]';

  preferredLocationTextArea = 'textarea[data-automation-id="input"]';

  charCountHintText = '#locationInput-info';

  errorLinkRadio = 'a[href="#preferredLocationOption"]';

  errorLinkInput = 'a[href="#locationInput"]';

  errorMessageTextAreaLocator = '#locationInput-error';

  errorMessageRadioLocator = '#preferredLocationOption-error';

  errorMessageLocator = '#error-summary-title';

  errorMessageList = '.govuk-list.govuk-error-summary__list';

  continueButton = 'button[data-automation-id="submit"]';

  cancelButton = 'a[data-automation-id="cancel"]';

  backLink = 'a[data-automation-id="back"]';

  pathUrl = 'nsa/preferred-location';

  // Contents
  pageHeading = 'Which test locations are most convenient?';

  characterCountText = 'You have 4000 characters remaining';

  errorMessageHeader = 'There is a problem';

  errorMessageOptionNotSelectedText = 'You must select an option.';

  errorMessageTooManyCharsText = 'The text you enter here must be 4000 characters or fewer';

  updateBannerText = 'You can change your mind about this or you can keep your existing choice.';

  updateButtonText = 'Confirm change and continue';

  cancelButtonText = 'Cancel and keep your existing choice';

  cancelLinkText = 'can keep your existing choice';

  getRadioSelector(preferredLocation: PreferredLocation): string {
    return this.preferredLocationRadioLocator.replace('<>', preferredLocation.toString());
  }

  async selectPreferredLocationOption(preferredLocation: PreferredLocation): Promise<void> {
    const preferredLocationOption = this.getRadioSelector(preferredLocation);
    await click(`${preferredLocationOption} + label`);
    await click(`${preferredLocationOption} + label`);
  }

  async enterPreferredLocationInformation(locationText: string): Promise<void> {
    await enter(this.preferredLocationTextArea, locationText);
    await click(this.continueButton);
  }

  async goBack(): Promise<void> {
    await click(this.backLink);
  }
}
