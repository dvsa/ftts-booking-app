/* eslint-disable import/no-cycle */
import { BasePage } from './base-page';
import { click } from '../utils/helpers';

export class LeavingNsaPage extends BasePage {
  pageHeadingLocator = '.govuk-heading-xl';

  headingLocator = 'button[data-automation-id="heading"]';

  continueButton = 'button[data-automation-id="submit"]';

  talkToSupportButton = 'button[data-automation-id="talk-to-support"]';

  para1Locator = 'button[data-automation-id="paragraph1"]';

  para2Locator = 'button[data-automation-id="paragraph2"]';

  bullet1Locator = 'button[data-automation-id="bullet1"]';

  bullet2Locator = 'button[data-automation-id="bullet2"]';

  bullet3Locator = 'button[data-automation-id="bullet3"]';

  backLink = 'a[data-automation-id="back"]';

  // Contents
  pageHeading = 'You do not need to provide evidence for the support type you selected';

  para1 = 'You can select \'Continue\' to book your theory test online now.';

  para2 = 'Or, if you prefer, select \'Ask us to contact you about support\' and we\'ll contact you to:';

  bullet1 = 'match your needs to the right support';

  bullet2 = 'help you book your test';

  back = 'back';

  pathUrl = 'nsa/leaving-nsa';

  async goBack(): Promise<void> {
    await click(this.backLink);
  }

  async talkToSupport(): Promise<void> {
    await click(this.talkToSupportButton);
  }

  async continueBooking(): Promise<void> {
    await click(this.continueButton);
  }
}
