import * as Constants from '../data/constants';
import { SessionData } from '../data/session-data';
import {
  Language, Locale, Target, TestType,
} from '../../../src/domain/enums';
import { NavigationHelper } from '../utils/navigation-helper';
import { runningTestsLocally } from '../utils/helpers';
import { CRMGateway } from '../utils/crm/crm-gateway-test';
import { dynamicsWebApiClient } from '../utils/crm/dynamics-web-api';

const crmGateway = new CRMGateway(dynamicsWebApiClient());

fixture`Book a candidate theory test in GB - Standard Accommodations`
  .page(process.env.BOOKING_APP_URL)
  .before(async () => { await Constants.setRequestTimeout; })
  .afterEach(async (t) => {
    const { sessionData } = t.ctx;
    if (!runningTestsLocally()) {
      await crmGateway.cleanUpBookingProductsByBookingRef(sessionData.currentBooking.bookingRef);
    }
  })
  .meta('type', 'e2e');

test('Verify a booking journey can be completed for a GB candidate for a car test', async (t) => {
  const sessionData = new SessionData(Target.GB, Locale.GB, false, false, true);
  t.ctx.sessionData = sessionData;
  await new NavigationHelper(sessionData).createANewBooking();
});

test('Verify a booking journey can be completed for a NI candidate in GB using DVSA service', async (t) => {
  const sessionData = new SessionData(Target.GB, Locale.GB, false, false, true);
  sessionData.candidate.licenceNumber = '98765411';
  t.ctx.sessionData = sessionData;
  await new NavigationHelper(sessionData).createANewBooking();
});

test('Verify a booking journey can be completed for a GB candidate - Motorcycle test in Welsh with no additional support', async (t) => {
  const sessionData = new SessionData(Target.GB, Locale.GB, false, false, true);
  sessionData.currentBooking.testType = TestType.MOTORCYCLE;
  sessionData.currentBooking.language = Language.WELSH;
  sessionData.journey.support = false;
  sessionData.currentBooking.bsl = false;
  t.ctx.sessionData = sessionData;
  await new NavigationHelper(sessionData).createANewBooking();
});

test('Verify a booking journey can be completed for a GB candidate - LGV - multiple choice test in English with no additional support', async (t) => {
  const sessionData = new SessionData(Target.GB, Locale.GB, false, false, true);
  sessionData.currentBooking.testType = TestType.LGVMC;
  sessionData.currentBooking.language = Language.ENGLISH;
  sessionData.journey.support = false;
  sessionData.currentBooking.bsl = false;
  t.ctx.sessionData = sessionData;
  await new NavigationHelper(sessionData).createANewBooking();
});

test('Verify a booking journey can be completed for a GB candidate - LGV - hazard perception test in English with no additional support', async (t) => {
  const sessionData = new SessionData(Target.GB, Locale.GB, false, false, true);
  sessionData.currentBooking.testType = TestType.LGVHPT;
  sessionData.currentBooking.language = Language.ENGLISH;
  sessionData.journey.support = false;
  sessionData.currentBooking.bsl = false;
  t.ctx.sessionData = sessionData;
  await new NavigationHelper(sessionData).createANewBooking();
});

test('Verify a booking journey can be completed for a GB candidate - LGV - Driver Certificate of Professional Competence (CPC) test in English with no additional support', async (t) => {
  const sessionData = new SessionData(Target.GB, Locale.GB, false, false, true);
  sessionData.currentBooking.testType = TestType.LGVCPC;
  sessionData.currentBooking.language = Language.ENGLISH;
  sessionData.journey.support = false;
  sessionData.currentBooking.bsl = false;
  t.ctx.sessionData = sessionData;
  await new NavigationHelper(sessionData).createANewBooking();
});

test('Verify a booking journey can be completed for a GB candidate - PCV - multiple choice test in English with no additional support', async (t) => {
  const sessionData = new SessionData(Target.GB, Locale.GB, false, false, true);
  sessionData.currentBooking.testType = TestType.PCVMC;
  sessionData.currentBooking.language = Language.ENGLISH;
  sessionData.journey.support = false;
  sessionData.currentBooking.bsl = false;
  t.ctx.sessionData = sessionData;
  await new NavigationHelper(sessionData).createANewBooking();
});

test('Verify a booking journey can be completed for a GB candidate - PCV - hazard perception test in English with no additional support', async (t) => {
  const sessionData = new SessionData(Target.GB, Locale.GB, false, false, true);
  sessionData.currentBooking.testType = TestType.PCVHPT;
  sessionData.currentBooking.language = Language.ENGLISH;
  sessionData.journey.support = false;
  sessionData.currentBooking.bsl = false;
  t.ctx.sessionData = sessionData;
  await new NavigationHelper(sessionData).createANewBooking();
});

test('Verify a booking journey can be completed for a GB candidate - PCV - Driver Certificate of Professional Competence (CPC) test in English with no additional support', async (t) => {
  const sessionData = new SessionData(Target.GB, Locale.GB, false, false, true);
  sessionData.currentBooking.testType = TestType.PCVCPC;
  sessionData.currentBooking.language = Language.ENGLISH;
  sessionData.journey.support = false;
  sessionData.currentBooking.bsl = false;
  t.ctx.sessionData = sessionData;
  await new NavigationHelper(sessionData).createANewBooking();
});
