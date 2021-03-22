import { verifyExactText } from '../utils/helpers';
import { NavigationHelper } from '../utils/navigation-helper';
import { setRequestTimeout } from '../data/constants';
import { SessionData } from '../data/session-data';
import { TARGET } from '../../../src/domain/enums';

fixture.skip`Online payments`
  .page(process.env.BOOKING_APP_URL)
  .before(async () => { await setRequestTimeout; })
  .meta('type', 'regression');

test('Verify page title and heading are displayed correctly', async () => {
  const sessionData = new SessionData(TARGET.GB);
  const navigationHelper = new NavigationHelper(sessionData);
  const makePaymentPage = await navigationHelper.navigateToPaymentsPage();
  await verifyExactText(makePaymentPage.pageTitleLocator, makePaymentPage.pageTitle);
});
