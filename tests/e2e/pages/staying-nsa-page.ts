/* eslint-disable import/no-cycle */
import { BasePage } from './base-page';
import { click } from '../utils/helpers';

export class StayingNSAPage extends BasePage {
  // contents
  pageHeadingNoEvidence = 'We\'ll contact you to arrange your test with support';

  pageHeadingEvidence = 'Send us evidence and we\'ll contact you to arrange your test with support';

  pageHeadingReturningCandidate = 'We\'ll contact you about support for your theory test';

  // locators
  pageHeadingLocator = 'h1[data-automation-id="heading"]';

  continueButton = 'a[data-automation-id="submit"]';

  backLink = 'a[data-automation-id="back"]';

  pathUrl = 'nsa/staying-nsa';

  async continue(): Promise<void> {
    await click(this.continueButton);
  }

  async goBack(): Promise<void> {
    await click(this.backLink);
  }
}
