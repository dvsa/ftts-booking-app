import * as Constants from '../data/constants';
import { NavigationHelperNSA } from '../utils/navigation-helper-nsa';
import { SessionData } from '../data/session-data';
import { TARGET, Voiceover } from '../../../src/domain/enums';

fixture`Non-standard accommodations - Book a theory test in GB`
  .page(process.env.BOOKING_APP_URL)
  .before(async () => { await Constants.setRequestTimeout; })
  .meta('type', 'e2e');

test('Verify a booking journey can be completed for a GB candidate - Car test in English with BSL & Welsh voiceover additional support', async () => {
  // Just a placeholder test for now to test the NSA journey so far
  const sessionData = new SessionData(TARGET.GB);
  sessionData.journey.support = true;
  sessionData.currentBooking.bsl = true;
  sessionData.currentBooking.voiceover = Voiceover.WELSH;

  await new NavigationHelperNSA(sessionData).createANewBooking();
});
