import * as Constants from '../data/constants';
import { StartPage } from '../pages/start-page';
import { verifyExactText } from '../utils/helpers';

fixture`Start to book your theory test`
  .page(process.env.BOOKING_APP_URL)
  .before(async () => { await Constants.setRequestTimeout; })
  .meta('type', 'regression');

test('Verify page title and heading are displayed correctly', async () => {
  const startPage: StartPage = new StartPage();

  await verifyExactText(startPage.pageTitleLocator, startPage.pageTitle);
});

test('Verify cookie text is displayed correctly', async () => {
  const startPage: StartPage = new StartPage();

  await verifyExactText(startPage.cookieLocator, startPage.cookieText);
});
