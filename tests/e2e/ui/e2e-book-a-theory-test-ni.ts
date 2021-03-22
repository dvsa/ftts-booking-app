import * as Constants from '../data/constants';
import { NavigationHelper } from '../utils/navigation-helper';
import { SessionData } from '../data/session-data';
import { TARGET, TestType } from '../../../src/domain/enums';

fixture`Book a theory test in NI`
  .page(`${process.env.BOOKING_APP_URL}?target=${TARGET.NI}`)
  .before(async () => { await Constants.setRequestTimeout; })
  .meta('type', 'e2e');

test('Verify a booking journey can be completed for a NI candidate', async () => {
  const sessionData = new SessionData(TARGET.NI);

  await new NavigationHelper(sessionData).createANewBooking();
});

test('Verify a booking journey can be completed for a NI candidate - Motorcycle test in English with no additional support', async () => {
  const sessionData = new SessionData(TARGET.NI);
  sessionData.currentBooking.testType = TestType.Motorcycle;
  sessionData.journey.support = false;
  sessionData.currentBooking.bsl = false;

  await new NavigationHelper(sessionData).createANewBooking();
});
