import { BasePage } from './base-page';
import { click } from '../utils/helpers';
import { RefundRequestedPage } from './refund-requested-page';

export class RequestRefundPage extends BasePage {
  pageHeadingLocator = '.govuk-heading-xl';

  backLink = '.govuk-back-link';

  confirmRefundButtonLocator = '#confirm-refund';

  bookCompensationTestButtonLocator = '#book-compensation-test';

  // Content
  pageHeading = 'Request refund for a cancelled test';

  bookCompensationTestText = 'Use my fee to pay for a replacement test';

  async confirmRefundRequest(): Promise<RefundRequestedPage> {
    await click(this.confirmRefundButtonLocator);
    return new RefundRequestedPage();
  }

  async bookCompensationTest(): Promise<void> {
    await click(this.bookCompensationTestButtonLocator);
  }

  async goBack(): Promise<void> {
    await click(this.backLink);
  }
}
