import * as Constants from '../data/constants';
import { SessionData } from '../data/session-data';
import { Locale, Target, TestType } from '../../../src/domain/enums';
import { NavigationHelper } from '../utils/navigation-helper';
import { runningTestsLocally } from '../utils/helpers';
import { dynamicsWebApiClient } from '../utils/crm/dynamics-web-api';
import { CRMGateway } from '../utils/crm/crm-gateway-test';

const crmGateway = new CRMGateway(dynamicsWebApiClient());

fixture`Book a candidate theory test in NI - Standard Accommodations`
  .page(`${process.env.BOOKING_APP_URL}?target=${Target.NI}`)
  .before(async () => { await Constants.setRequestTimeout; })
  .afterEach(async (t) => {
    const { sessionData } = t.ctx;
    if (!runningTestsLocally()) {
      await crmGateway.cleanUpBookingProductsByBookingRef(sessionData.currentBooking.bookingRef);
    }
  })
  .meta('type', 'e2e');

test('Verify a booking journey can be completed for a NI candidate for a car test', async (t) => {
  const sessionData = new SessionData(Target.NI, Locale.NI, false, false, true);
  t.ctx.sessionData = sessionData;
  await new NavigationHelper(sessionData).createANewBooking();
});

test('Verify a booking journey can be completed for a NI candidate - Motorcycle test in English with no additional support', async (t) => {
  const sessionData = new SessionData(Target.NI, Locale.NI, false, false, true);
  sessionData.currentBooking.testType = TestType.MOTORCYCLE;
  t.ctx.sessionData = sessionData;
  await new NavigationHelper(sessionData).createANewBooking();
});

test('Verify a booking journey can be completed for a NI candidate - LGV - multiple choice test in English with no additional support', async (t) => {
  const sessionData = new SessionData(Target.NI, Locale.NI, false, false, true);
  sessionData.currentBooking.testType = TestType.LGVMC;
  t.ctx.sessionData = sessionData;
  await new NavigationHelper(sessionData).createANewBooking();
});

test('Verify a booking journey can be completed for a NI candidate - LGV - hazard perception test in English with no additional support', async (t) => {
  const sessionData = new SessionData(Target.NI, Locale.NI, false, false, true);
  sessionData.currentBooking.testType = TestType.LGVHPT;
  t.ctx.sessionData = sessionData;
  await new NavigationHelper(sessionData).createANewBooking();
});

test('Verify a booking journey can be completed for a NI candidate - LGV - Driver Certificate of Professional Competence (CPC) test in English with no additional support', async (t) => {
  const sessionData = new SessionData(Target.NI, Locale.NI, false, false, true);
  sessionData.currentBooking.testType = TestType.LGVCPC;
  t.ctx.sessionData = sessionData;
  await new NavigationHelper(sessionData).createANewBooking();
});

test('Verify a booking journey can be completed for a NI candidate - LGV to PCV conversion test in English with no additional support', async (t) => {
  const sessionData = new SessionData(Target.NI, Locale.NI, false, false, true);
  sessionData.currentBooking.testType = TestType.LGVCPCC;
  t.ctx.sessionData = sessionData;
  await new NavigationHelper(sessionData).createANewBooking();
});

test('Verify a booking journey can be completed for a NI candidate - PCV - multiple choice test in English with no additional support', async (t) => {
  const sessionData = new SessionData(Target.NI, Locale.NI, false, false, true);
  sessionData.currentBooking.testType = TestType.PCVMC;
  t.ctx.sessionData = sessionData;
  await new NavigationHelper(sessionData).createANewBooking();
});

test('Verify a booking journey can be completed for a NI candidate - PCV - hazard perception test in English with no additional support', async (t) => {
  const sessionData = new SessionData(Target.NI, Locale.NI, false, false, true);
  sessionData.currentBooking.testType = TestType.PCVHPT;
  t.ctx.sessionData = sessionData;
  await new NavigationHelper(sessionData).createANewBooking();
});

test('Verify a booking journey can be completed for a NI candidate - PCV - Driver Certificate of Professional Competence (CPC) test in English with no additional support', async (t) => {
  const sessionData = new SessionData(Target.NI, Locale.NI, false, false, true);
  sessionData.currentBooking.testType = TestType.PCVCPC;
  t.ctx.sessionData = sessionData;
  await new NavigationHelper(sessionData).createANewBooking();
});

test('Verify a booking journey can be completed for a NI candidate - PCV to LGV conversion test in English with no additional support', async (t) => {
  const sessionData = new SessionData(Target.NI, Locale.NI, false, false, true);
  sessionData.currentBooking.testType = TestType.PCVCPCC;
  t.ctx.sessionData = sessionData;
  await new NavigationHelper(sessionData).createANewBooking();
});

test('Verify a booking journey can be completed for a NI candidate - Taxi test in English with no additional support', async (t) => {
  const sessionData = new SessionData(Target.NI, Locale.NI, false, false, true);
  sessionData.currentBooking.testType = TestType.TAXI;
  t.ctx.sessionData = sessionData;
  await new NavigationHelper(sessionData).createANewBooking();
});
