import { BasePage } from './base-page';
import { click } from '../utils/helpers';
import { ChooseSupportPage } from './choose-support-page';

export class StartPage extends BasePage {
  pageTitleLocator = '.govuk-heading-xl';

  pageTitle = 'Book your theory test';

  startNowButton = '#startbutton';

  cookieLocator = 'p';

  cookieText = 'GOV.UK uses cookies to make the site simpler. Find out more about cookies';

  cookieLinkText = 'Find out more about cookies';

  async startBooking(): Promise<ChooseSupportPage> {
    await click(this.startNowButton);
    return new ChooseSupportPage();
  }
}
