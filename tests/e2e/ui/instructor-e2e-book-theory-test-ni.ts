import * as Constants from '../data/constants';
import { Locale, Target, TestType } from '../../../src/domain/enums';
import { runningTestsLocally } from '../utils/helpers';
import { CRMGateway } from '../utils/crm/crm-gateway-test';
import { dynamicsWebApiClient } from '../utils/crm/dynamics-web-api';
import { NavigationHelperInstructor } from '../utils/navigation-helper-instructor';
import { SessionData } from '../data/session-data';

const crmGateway = new CRMGateway(dynamicsWebApiClient());

fixture`Instructor - Book a theory test in NI - Standard Accommodations`
  .page(process.env.BOOKING_APP_URL)
  .before(async () => { await Constants.setRequestTimeout; })
  .afterEach(async (t) => {
    const { sessionData } = t.ctx;
    if (!runningTestsLocally()) {
      await crmGateway.cleanUpBookingProductsByBookingRef(sessionData.currentBooking.bookingRef);
    }
  })
  .meta('type', 'instructor');

test('Verify a booking journey can be completed for a NI instructor candidate - ADI Part 1', async (t) => {
  const sessionData = new SessionData(Target.NI, Locale.NI, false, true, true);
  sessionData.currentBooking.testType = TestType.ADIP1DVA;
  sessionData.candidate.paymentReceiptNumber = '92647';
  t.ctx.sessionData = sessionData;
  await new NavigationHelperInstructor(sessionData).createANewBooking();
});

test('Verify a booking journey can be completed for a NI instructor candidate - AMI Part 1', async (t) => {
  const sessionData = new SessionData(Target.NI, Locale.NI, false, true, true);
  sessionData.currentBooking.testType = TestType.AMIP1;
  sessionData.candidate.paymentReceiptNumber = '95436';
  t.ctx.sessionData = sessionData;
  await new NavigationHelperInstructor(sessionData).createANewBooking();
});
