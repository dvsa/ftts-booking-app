import * as Constants from '../data/constants';
import { NavigationHelper } from '../utils/navigation-helper';
import { SessionData } from '../data/session-data';
import {
  LANGUAGE, TARGET, TestType,
} from '../../../src/domain/enums';

fixture`Book a theory test in GB`
  .page(process.env.BOOKING_APP_URL)
  .before(async () => { await Constants.setRequestTimeout; })
  .meta('type', 'e2e');

test('Verify a booking journey can be completed for a GB candidate', async () => {
  const sessionData = new SessionData(TARGET.GB);

  await new NavigationHelper(sessionData).createANewBooking();
});

test('Verify a booking journey can be completed for a NI candidate', async () => {
  const sessionData = new SessionData(TARGET.NI);

  await new NavigationHelper(sessionData).createANewBooking();
});

test('Verify a booking journey can be completed for a GB candidate - Motorcycle test in Welsh with no additional support', async () => {
  const sessionData = new SessionData(TARGET.GB);
  sessionData.currentBooking.testType = TestType.Motorcycle;
  sessionData.currentBooking.language = LANGUAGE.WELSH;
  sessionData.journey.support = false;
  sessionData.currentBooking.bsl = false;

  await new NavigationHelper(sessionData).createANewBooking();
});
