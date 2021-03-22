/* eslint-disable import/no-cycle */
import { BasePage } from './base-page';
import { click } from '../utils/helpers';
import { AdditionalSupportVoiceoverPage } from './additional-support-voiceover-page';
import { YesOrNo } from '../../../src/value-objects/yes-or-no';

export class AdditionalSupportBslPage extends BasePage {
  // locators
  pageTitleLocator = '.govuk-heading-xl';

  bslYesNo = 'input[name=bsl][value=<>]';

  continueButton = '#submit';

  cancelButton = '#cancel';

  backLink = '.govuk-back-link';

  errorLink = 'a[href="#bsl"]';

  errorMessageRadioLocator = '#bsl-error';

  errorMessageLocator = '#error-summary-title';

  errorMessageList = '.govuk-list.govuk-error-summary__list';

  updateBslBanner = 'div.alert';

  pathUrl = 'bsl';

  // content
  pageTitle = 'Choose BSL';

  pageHeading = 'Do you want British Sign Language?';

  pageHeadingManageBooking = 'Do you want British Sign Language used during the test?';

  cancelButtonText = 'Cancel and keep your choice';

  cancelChangeLinkBannerText = 'go back and keep your previous choice';

  changeBannerText = `You can change your mind about including British Sign Language in this theory test or ${this.cancelChangeLinkBannerText}.`;

  confirmChangeButtonText = 'Confirm change and continue';

  cancelChangeButtonText = 'Cancel and keep your existing choice';

  errorMessageHeader = 'There is a problem';

  errorMessageText = 'You need to select an option.';

  async selectBslRequired(yesOrNo: boolean): Promise<AdditionalSupportVoiceoverPage> {
    const bslSelector = this.bslYesNo.replace('<>', YesOrNo.fromBoolean(yesOrNo).toString());
    await click(bslSelector);
    await click(this.continueButton);
    return new AdditionalSupportVoiceoverPage();
  }

  async goBack(): Promise<void> {
    await click(this.backLink);
  }

  async clickErrorLink(): Promise<void> {
    await click(this.errorLink);
  }
}
