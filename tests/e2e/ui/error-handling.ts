import * as Constants from '../data/constants';
import { runningTestsLocally, verifyExactText } from '../utils/helpers';
import { SessionData } from '../data/session-data';
import { Target } from '../../../src/domain/enums';
import { NavigationHelper } from '../utils/navigation-helper';
import { PageNotFoundErrorPage } from '../pages/page-not-found-error-page';

fixture`Online booking app error handling`
  .page(process.env.BOOKING_APP_URL)
  .before(async () => { await Constants.setRequestTimeout; })
  .meta('type', 'e2e');

if (runningTestsLocally()) {
  test('Verify a booking journey can still be completed when there is an error sending the email confirmation', async () => {
    const sessionData = new SessionData(Target.GB);
    sessionData.candidate.email = 'error@gmail.com';
    const navigationHelper = new NavigationHelper(sessionData);
    const bookingConfirmationPage = await navigationHelper.createANewBooking();

    await verifyExactText(bookingConfirmationPage.pageHeadingLocator, bookingConfirmationPage.pageHeadingSA);
  });
}

test('Verify 404 Not Found page displayed when navigating to an incorrect URL', async (t) => {
  await t.navigateTo(`${process.env.BOOKING_APP_URL}/i-dont-exist`);
  const pageNotFoundErrorPage = new PageNotFoundErrorPage();
  await verifyExactText(pageNotFoundErrorPage.pageHeadingLocator, pageNotFoundErrorPage.pageHeading);
  await verifyExactText(pageNotFoundErrorPage.contentLocator, pageNotFoundErrorPage.contentText);
});
