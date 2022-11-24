import * as Constants from '../data/constants';
import { Locale, Target, TestType } from '../../../src/domain/enums';
import { runningTestsLocally } from '../utils/helpers';
import { CRMGateway } from '../utils/crm/crm-gateway-test';
import { dynamicsWebApiClient } from '../utils/crm/dynamics-web-api';
import { NavigationHelperInstructor } from '../utils/navigation-helper-instructor';
import { SessionData } from '../data/session-data';

const crmGateway = new CRMGateway(dynamicsWebApiClient());

fixture`Instructor - Book a theory test in GB - Standard Accommodations`
  .page(process.env.BOOKING_APP_URL)
  .before(async () => { await Constants.setRequestTimeout; })
  .afterEach(async (t) => {
    const { sessionData } = t.ctx;
    if (!runningTestsLocally()) {
      await crmGateway.cleanUpBookingProductsByBookingRef(sessionData.currentBooking.bookingRef);
    }
  })
  .meta('type', 'instructor');

test('Verify a booking journey can be completed for a GB instructor candidate - ADI Part 1', async (t) => {
  const sessionData = new SessionData(Target.GB, Locale.GB, false, true, true);
  sessionData.currentBooking.testType = TestType.ADIP1;
  sessionData.candidate.personalReferenceNumber = '321971';
  t.ctx.sessionData = sessionData;
  await new NavigationHelperInstructor(sessionData).createANewBooking();
});

test('Verify a booking journey can be completed for a GB instructor candidate - ADI hazard perception', async (t) => {
  const sessionData = new SessionData(Target.GB, Locale.GB, false, true, true);
  sessionData.currentBooking.testType = TestType.ADIHPT;
  sessionData.candidate.personalReferenceNumber = '859736';
  t.ctx.sessionData = sessionData;
  await new NavigationHelperInstructor(sessionData).createANewBooking();
});

test('Verify a booking journey can be completed for a GB instructor candidate - Enhanced Rider Scheme', async (t) => {
  const sessionData = new SessionData(Target.GB, Locale.GB, false, true, true);
  sessionData.currentBooking.testType = TestType.ERS;
  sessionData.candidate.personalReferenceNumber = '621309';
  t.ctx.sessionData = sessionData;
  await new NavigationHelperInstructor(sessionData).createANewBooking();
});
