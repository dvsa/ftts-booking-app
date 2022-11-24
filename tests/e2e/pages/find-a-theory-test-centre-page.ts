/* eslint-disable import/no-cycle */
import { BasePage } from './base-page';
import { enter, click, link } from '../utils/helpers';
import { ChooseATestCentrePage } from './choose-a-test-centre-page';
import { CheckYourDetailsPage } from './check-your-details-page';

export class FindATheoryTestCentrePage extends BasePage {
  pathUrl = 'find-test-centre';

  // selectors
  pageHeadingLocator = 'h1[data-automation-id="heading"]';

  findButton = 'button[data-automation-id="search"]';

  searchLocationTermTextBox = 'input[data-automation-id="searchQuery"]';

  backLink = 'a[data-automation-id="back"]';

  searchContentsLocator1 = 'p';

  searchContentsLocator2 = 'li';

  searchLabelLocator = '.govuk-label';

  errorMessageLocator = 'a[href="#searchQuery"]';

  bannerLocator = 'div.alert';

  cancelButton = 'a[data-automation-id="cancel"]';

  // content
  pageHeading = 'Find a theory test centre';

  cancelLinkText = 'keep your existing choice';

  cancelButtonText = 'Cancel and keep previously selected test location';

  findButtonText = 'Find a theory test centre';

  searchContents1 = 'Find your most convenient test centre';

  searchContents2 = 'You can:';

  searchContents3 = 'see test centres on a map';

  searchContents4 = 'get test centre addresses and other information';

  searchLabel = 'Enter a postcode, town, city or region. You can also use landmarks.';

  searchLabelNI = 'Enter a postcode, town or city';

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
    await click(this.errorMessageLocator);
  }

  async cancelUsingLink(): Promise<CheckYourDetailsPage> {
    await link(this.cancelLinkText);
    return new CheckYourDetailsPage();
  }

  async cancelUsingButton(): Promise<CheckYourDetailsPage> {
    await click(this.cancelButton);
    return new CheckYourDetailsPage();
  }

  async goBack(): Promise<void> {
    await click(this.backLink);
  }
}
