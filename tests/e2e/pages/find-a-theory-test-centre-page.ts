/* eslint-disable import/no-cycle */
import { BasePage } from './base-page';
import { enter, click, link } from '../utils/helpers';
import { ChooseATestCentrePage } from './choose-a-test-centre-page';
import { CheckYourAnswersPage } from './check-your-answers-page';

export class FindATheoryTestCentrePage extends BasePage {
  pathUrl = 'find-test-centre';

  // selectors
  pageTitleLocator = '.govuk-fieldset__heading';

  findButton = '#submit';

  searchLocationTermTextBox = '#searchQuery';

  backLink = '.govuk-back-link';

  searchContentsLocator1 = 'p';

  searchContentsLocator2 = 'li';

  searchLabelLocator = '.govuk-label';

  errorMessageLocator = '#searchQuery-error';

  errorLink = `a[href="${this.searchLocationTermTextBox}"]`;

  bannerLocator = 'div.alert';

  cancelButton = '#cancel';

  // content
  pageTitle = 'Find test centre';

  pageHeading = 'Choose a theory test centre';

  cancelLinkText = 'keep your existing choice';

  cancelButtonText = 'Cancel and keep previously selected test location';

  findButtonText = 'Find';

  searchContents1 = 'Find your nearest driving theory test centre';

  searchContents2 = 'You can:';

  searchContents3 = 'get a map and directions to the centre';

  searchContents4 = 'check any special instructions for using the centre';

  searchLabel = 'Enter a postcode, town or city name or region. You can also use landmarks';

  errorMessage = 'No location results match your search. Please try again.';

  // Change banner content

  changeBannerText = 'You can change the test location here or keep your existing choice.';

  cancelChangeLinkBannerText = 'keep your existing choice';

  changeBannerWarningText = 'If you select a new location here, it will replace your previous choice. Date and time slots will still be subject to availability.';

  async enterSearchTerm(searchTerm: string): Promise<void> {
    await enter(this.searchLocationTermTextBox, searchTerm);
  }

  async findATheoryTestCentre(searchTerm: string): Promise<ChooseATestCentrePage> {
    await this.enterSearchTerm(searchTerm);
    await click(this.findButton);
    return new ChooseATestCentrePage();
  }

  async clickErrorLink(): Promise<void> {
    await click(this.errorLink);
  }

  async cancelUsingLink(): Promise<CheckYourAnswersPage> {
    await link(this.cancelLinkText);
    return new CheckYourAnswersPage();
  }

  async cancelUsingButton(): Promise<CheckYourAnswersPage> {
    await click(this.cancelButton);
    return new CheckYourAnswersPage();
  }

  async goBack(): Promise<void> {
    await click(this.backLink);
  }
}
