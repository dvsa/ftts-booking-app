import { BasePage } from './base-page';
import { click, link } from '../utils/helpers';

export class CookieBanner extends BasePage {
  headingLocator = '.govuk-cookie-banner__heading';

  contentLocator = '.govuk-cookie-banner__content > p';

  heading = 'Use of cookies';

  content1 = 'We use some essential cookies to make this service work.';

  content2 = 'We’d also like to use analytics cookies so we can understand how you use the service and make improvements.';

  acceptCookiesButton = 'button[name="cookies"]';

  cookieLinkText = 'View cookies';

  async acceptCookies(): Promise<void> {
    await click(this.acceptCookiesButton);
  }

  async viewCookies(): Promise<void> {
    await link(this.cookieLinkText);
  }
}
