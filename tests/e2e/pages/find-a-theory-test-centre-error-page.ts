import { click } from '../utils/helpers';
import { BasePage } from './base-page';

export class FindATheoryTestCentreErrorPage extends BasePage {
  pageHeadingLocator = '.govuk-heading-xl';

  pageHeading = 'That search didn\'t work';

  contentLocator = 'p.govuk-body';

  contentText = 'A technical problem interrupted the location search.';

  backLink = '.govuk-back-link';

  async goBack(): Promise<void> {
    await click(this.backLink);
  }
}
