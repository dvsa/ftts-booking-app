/* eslint-disable import/no-cycle */
import { BasePage } from './base-page';
import { click, enter } from '../utils/helpers';
import { PreferredLocation } from '../../../src/domain/enums';
import { SessionData } from '../data/session-data';

export class PreferredLocationNSAPage extends BasePage {
  pageHeadingLocator = '.govuk-heading-xl';

  preferredLocationRadioLocator = 'input[data-automation-id="<>"] + label';

  preferredLocationTextArea = 'textarea[data-automation-id="input"]';

  charCountHintText = '#locationInput-info';

  errorLinkRadio = 'a[href="#preferredLocationOption"]';

  errorLinkInput = 'a[href="#locationInput"]';

  errorMessageTextAreaLocator = '#locationInput-error';

  errorMessageRadioLocator = '#preferredLocationOption-error';

  errorMessageLocator = '#error-summary-title';

  errorMessageList = '.govuk-list.govuk-error-summary__list';

  continueButton = 'button[data-automation-id="continue"]';

  backLink = 'a[data-automation-id="back"]';

  pathUrl = 'preferred-location';

  // Contents
  pageTitle = 'Preferred Location';

  pageHeading = 'Do you know which test locations you want?';

  characterCountText = 'You have 4000 characters remaining';

  errorMessageHeader = 'There is a problem';

  errorMessageOptionNotSelectedText = 'You must select an option.';

  errorMessageTooManyCharsText = 'The text you enter here must be 4000 characters or fewer';

  getRadioSelector(preferredLocation: PreferredLocation): string {
    return this.preferredLocationRadioLocator.replace('<>', preferredLocation.toString());
  }

  async selectPreferredLocationOption(sessionData: SessionData, preferredLocation: PreferredLocation): Promise<void> {
    sessionData.currentBooking.preferredLocationOption = preferredLocation;
    const preferredLocationOption = this.getRadioSelector(preferredLocation);
    await click(preferredLocationOption);
  }

  async enterPreferredLocationInformation(sessionData: SessionData, locationText: string): Promise<void> {
    sessionData.currentBooking.preferredDay = locationText;
    await enter(this.preferredLocationTextArea, locationText);
    await click(this.continueButton);
  }

  async goBack(): Promise<void> {
    await click(this.backLink);
  }
}
