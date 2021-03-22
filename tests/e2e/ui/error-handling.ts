import * as Constants from '../data/constants';
import { verifyExactText } from '../utils/helpers';
import { SessionData } from '../data/session-data';
import { TARGET } from '../../../src/domain/enums';
import { NavigationHelper } from '../utils/navigation-helper';

fixture`Online booking app error handling`
  .page(process.env.BOOKING_APP_URL)
  .before(async () => { await Constants.setRequestTimeout; })
  .meta('type', 'e2e');

test('Verify a booking journey can still be completed when there is an error sending the email confirmation', async () => {
  const sessionData = new SessionData(TARGET.GB);
  sessionData.candidate.email = 'error@gmail.com';
  const navigationHelper = new NavigationHelper(sessionData);
  const bookingConfirmationPage = await navigationHelper.createANewBooking();

  await verifyExactText(bookingConfirmationPage.pageHeadingLocator, bookingConfirmationPage.pageHeadingSA);
});
