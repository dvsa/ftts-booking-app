/* eslint-disable import/no-cycle */
import { BasePage } from './base-page';
import { click } from '../utils/helpers';

export class LeavingNsaPage extends BasePage {
  pageTitleLocator = '.govuk-heading-xl';

  headingLocator = 'button[data-automation-id="heading"]';

  continueButton = 'button[data-automation-id="continue"]';

  talkToSupportButton = 'button[data-automation-id="talk-to-support"]';

  para1Locator = 'button[data-automation-id="paragraph1"]';

  para2Locator = 'button[data-automation-id="paragraph2"]';

  bullet1Locator = 'button[data-automation-id="bullet1"]';

  bullet2Locator = 'button[data-automation-id="bullet2"]';

  bullet3Locator = 'button[data-automation-id="bullet3"]';

  backLink = 'button[data-automation-id="back"]';

  // Contents
  pageTitle = 'Leaving NSA';

  pageHeading = 'Book your theory test online now or wait and talk to us first';

  para1 = 'You can select \'Continue\' to book your theory test online now.';

  para2 = 'Or, if you prefer, select \'Talk to our support team\' and we\'ll contact you at a convenient time to:';

  bullet1 = 'talk through your needs';

  bullet2 = 'check you have the right support';

  bullet3 = 'book your test for you';

  back = 'back';

  pathUrl = 'leaving-nsa';

  async goBack(): Promise<void> {
    await click(this.backLink);
  }
}
