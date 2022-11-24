/* eslint-disable import/no-cycle */
import { BasePage } from './base-page';
import { click, enter } from '../utils/helpers';

export class CustomSupportPage extends BasePage {
  // locators
  pageHeadingLocator = 'h1[data-automation-id="heading"]';

  updateBanner = 'div.alert';

  supportTextArea = 'textarea[data-automation-id="input"]';

  continueButton = 'button[data-automation-id="submit"]';

  skipButton = 'a[data-automation-id="skip"]';

  cancelButton = 'a[data-automation-id="cancel"]';

  backLink = 'a[data-automation-id="back"]';

  charCountHintText = '#support-info';

  errorLink = 'a[href="#support"]';

  errorMessageLocator = '#error-summary-title';

  errorMessageList = '.govuk-list.govuk-error-summary__list';

  errorMessageTextAreaLocator = '#support-error';

  pathUrl = 'nsa/custom-support';

  // content
  pageHeading = 'Tell us what support you need';

  characterCountText = 'You have 4000 characters remaining';

  errorMessageHeader = 'There is a problem';

  errorMessageText = 'The text you enter here must be 4000 characters or fewer';

  updateBannerText = 'You can tell us more about the support you need here. Or you can use the information you have already provided.';

  updateButtonText = 'Continue';

  cancelButtonText = 'Cancel and use information already provided';

  cancelLinkText = 'can use the information you have already provided';

  async enterSupportInformation(supportText: string): Promise<void> {
    await enter(this.supportTextArea, supportText);
    await click(this.continueButton);
  }

  async goBack(): Promise<void> {
    await click(this.backLink);
  }

  async clickErrorLink(): Promise<void> {
    await click(this.errorLink);
  }
}
