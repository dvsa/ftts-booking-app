import * as Constants from '../data/constants';
import { NavigationHelperNSA } from '../utils/navigation-helper-nsa';
import { SessionData } from '../data/session-data';
import {
  Locale, SupportType, Target, TestType, Voiceover,
} from '../../../src/domain/enums';
import { NavigationHelper } from '../utils/navigation-helper';
import { testPayment } from '../data/constants';

fixture`Book a candidate theory test in NI - Non-standard accommodations`
  .page(`${process.env.BOOKING_APP_URL}?target=${Target.NI}`)
  .before(async () => { await Constants.setRequestTimeout; })
  .meta('type', 'e2e');

test('Verify an NSA request can be completed for a NI candidate - Car test with Non-Standard accommodations (Voiceover, Translator, Extra time, Other support)', async () => {
  const sessionData = new SessionData(Target.NI, Locale.NI, true, false, true);

  sessionData.currentBooking.selectSupportType = [SupportType.VOICEOVER, SupportType.TRANSLATOR, SupportType.EXTRA_TIME, SupportType.READING_SUPPORT, SupportType.OTHER];
  sessionData.currentBooking.voiceover = Voiceover.PORTUGUESE;

  const navigationHelper = new NavigationHelperNSA(sessionData);
  await navigationHelper.sendNsaBookingRequest();
});

test('Verify an NSA request can be completed for a NI candidate - Motorcycle test with Non-Standard accommodations (Voiceover, Translator, Extra time, Other support)', async () => {
  const sessionData = new SessionData(Target.NI, Locale.NI, true, false, true);

  sessionData.currentBooking.testType = TestType.MOTORCYCLE;
  sessionData.currentBooking.selectSupportType = [SupportType.VOICEOVER, SupportType.TRANSLATOR, SupportType.EXTRA_TIME, SupportType.OTHER];
  sessionData.currentBooking.voiceover = Voiceover.CANTONESE;

  const navigationHelper = new NavigationHelperNSA(sessionData);
  await navigationHelper.sendNsaBookingRequest();
});

test('Verify an NSA request can be completed for a NI candidate - LGV - multiple choice test with Non-Standard accommodations (Voiceover, Translator, Extra time, Other support)', async () => {
  const sessionData = new SessionData(Target.NI, Locale.NI, true, false, true);

  sessionData.currentBooking.testType = TestType.LGVMC;
  sessionData.currentBooking.selectSupportType = [SupportType.VOICEOVER, SupportType.TRANSLATOR, SupportType.EXTRA_TIME, SupportType.OTHER];
  sessionData.currentBooking.voiceover = Voiceover.ENGLISH;

  const navigationHelper = new NavigationHelperNSA(sessionData);
  await navigationHelper.sendNsaBookingRequest();
});

test('Verify an NSA request can be completed for a NI candidate - LGV - hazard perception test with Non-Standard accommodations (Voiceover, Translator, Other support)', async () => {
  const sessionData = new SessionData(Target.NI, Locale.NI, true, false, true);

  sessionData.currentBooking.testType = TestType.LGVHPT;
  sessionData.currentBooking.selectSupportType = [SupportType.VOICEOVER, SupportType.TRANSLATOR, SupportType.OTHER];
  sessionData.currentBooking.voiceover = Voiceover.ENGLISH;

  const navigationHelper = new NavigationHelperNSA(sessionData);
  await navigationHelper.sendNsaBookingRequest();
});

test('Verify an NSA request can be completed for a NI candidate - LGV - Driver Certificate of Professional Competence (CPC) test with Non-Standard accommodations (Voiceover, Translator, Extra time, Other support)', async () => {
  const sessionData = new SessionData(Target.NI, Locale.NI, true, false, true);

  sessionData.currentBooking.testType = TestType.LGVCPC;
  sessionData.currentBooking.selectSupportType = [SupportType.VOICEOVER, SupportType.TRANSLATOR, SupportType.EXTRA_TIME, SupportType.OTHER];
  sessionData.currentBooking.voiceover = Voiceover.ENGLISH;

  const navigationHelper = new NavigationHelperNSA(sessionData);
  await navigationHelper.sendNsaBookingRequest();
});

test('Verify an NSA request can be completed for a NI candidate - LGV to PCV Conversion test with Non-Standard accommodations (Voiceover, Translator, Extra time, Other support)', async () => {
  const sessionData = new SessionData(Target.NI, Locale.NI, true, false, true);

  sessionData.currentBooking.testType = TestType.LGVCPCC;
  sessionData.currentBooking.selectSupportType = [SupportType.VOICEOVER, SupportType.TRANSLATOR, SupportType.EXTRA_TIME, SupportType.OTHER];
  sessionData.currentBooking.voiceover = Voiceover.ENGLISH;

  const navigationHelper = new NavigationHelperNSA(sessionData);
  await navigationHelper.sendNsaBookingRequest();
});

test('Verify an NSA request can be completed for a NI candidate - PCV - multiple choice test with Non-Standard accommodations (Voiceover, Translator, Extra time, Other support)', async () => {
  const sessionData = new SessionData(Target.NI, Locale.NI, true, false, true);

  sessionData.currentBooking.testType = TestType.PCVMC;
  sessionData.currentBooking.selectSupportType = [SupportType.VOICEOVER, SupportType.TRANSLATOR, SupportType.EXTRA_TIME, SupportType.OTHER];
  sessionData.currentBooking.voiceover = Voiceover.ENGLISH;

  const navigationHelper = new NavigationHelperNSA(sessionData);
  await navigationHelper.sendNsaBookingRequest();
});

test('Verify an NSA request can be completed for a NI candidate - PCV - hazard perception test with Non-Standard accommodations (Voiceover, Translator Other support)', async () => {
  const sessionData = new SessionData(Target.NI, Locale.NI, true, false, true);

  sessionData.currentBooking.testType = TestType.PCVHPT;
  sessionData.currentBooking.selectSupportType = [SupportType.VOICEOVER, SupportType.TRANSLATOR, SupportType.OTHER];
  sessionData.currentBooking.voiceover = Voiceover.ENGLISH;

  const navigationHelper = new NavigationHelperNSA(sessionData);
  await navigationHelper.sendNsaBookingRequest();
});

test('Verify an NSA request can be completed for a NI candidate - PCV - Driver Certificate of Professional Competence (CPC) test with Non-Standard accommodations (Voiceover, Translator, Extra time, Other support)', async () => {
  const sessionData = new SessionData(Target.NI, Locale.NI, true, false, true);

  sessionData.currentBooking.testType = TestType.PCVCPC;
  sessionData.currentBooking.selectSupportType = [SupportType.VOICEOVER, SupportType.TRANSLATOR, SupportType.EXTRA_TIME, SupportType.OTHER];
  sessionData.currentBooking.voiceover = Voiceover.ENGLISH;

  const navigationHelper = new NavigationHelperNSA(sessionData);
  await navigationHelper.sendNsaBookingRequest();
});

test('Verify an NSA request can be completed for a NI candidate - PCV to LGV Conversion test with Non-Standard accommodations (Voiceover, Translator, Extra time, Other support)', async () => {
  const sessionData = new SessionData(Target.NI, Locale.NI, true, false, true);

  sessionData.currentBooking.testType = TestType.PCVCPCC;
  sessionData.currentBooking.selectSupportType = [SupportType.VOICEOVER, SupportType.TRANSLATOR, SupportType.EXTRA_TIME, SupportType.OTHER];
  sessionData.currentBooking.voiceover = Voiceover.ENGLISH;

  const navigationHelper = new NavigationHelperNSA(sessionData);
  await navigationHelper.sendNsaBookingRequest();
});

test('Verify an NSA request can be completed for a NI candidate - Taxi test with Non-Standard accommodations (Voiceover, Translator, Extra time, Other support)', async () => {
  const sessionData = new SessionData(Target.NI, Locale.NI, true, false, true);

  sessionData.currentBooking.testType = TestType.TAXI;
  sessionData.currentBooking.selectSupportType = [SupportType.VOICEOVER, SupportType.TRANSLATOR, SupportType.EXTRA_TIME, SupportType.OTHER];
  sessionData.currentBooking.voiceover = Voiceover.ENGLISH;

  const navigationHelper = new NavigationHelperNSA(sessionData);
  await navigationHelper.sendNsaBookingRequest();
});

test('Verify if only standard accommodations are requested, we can continue to complete a NSA booking (only Voiceover)', async () => {
  const sessionData = new SessionData(Target.NI, Locale.NI, true, false, true);

  sessionData.journey.standardAccommodation = false;
  sessionData.currentBooking.customSupport = '';
  sessionData.currentBooking.selectSupportType = [SupportType.VOICEOVER];
  sessionData.currentBooking.voiceover = Voiceover.CANTONESE;

  const navigationHelper = new NavigationHelperNSA(sessionData);
  await navigationHelper.sendNsaBookingRequest();
});

test('Verify if only standard accommodations are requested, we can continue to complete a NSA booking (only Onscreen BSL)', async () => {
  const sessionData = new SessionData(Target.NI, Locale.NI, true, false, true);

  sessionData.journey.standardAccommodation = false;
  sessionData.currentBooking.customSupport = '';
  sessionData.currentBooking.selectSupportType = [SupportType.ON_SCREEN_BSL];
  sessionData.currentBooking.voiceover = undefined;

  const navigationHelper = new NavigationHelperNSA(sessionData);
  await navigationHelper.sendNsaBookingRequest();
});

test('Verify if only standard accommodations are requested, we can continue to complete a SA booking (only Voiceover)', async () => {
  const sessionData = new SessionData(Target.NI, Locale.NI, true, false, true);

  sessionData.journey.standardAccommodation = true;
  sessionData.currentBooking.bsl = false;
  sessionData.currentBooking.customSupport = '';
  sessionData.currentBooking.selectSupportType = [SupportType.VOICEOVER];
  sessionData.currentBooking.voiceover = Voiceover.ARABIC;

  const navigationHelper = new NavigationHelperNSA(sessionData);
  await navigationHelper.navigateToStayingOrLeavingNsaPage();

  sessionData.hasComeFromNsaJourney = true;
  sessionData.testCentreSearch.searchQuery = Constants.searchWithCityName;
  sessionData.currentBooking.centre.name = 'Belfast';
  sessionData.paymentDetails = testPayment;
  const navigationHelperSA = new NavigationHelper(sessionData);
  await navigationHelperSA.createANewBooking();
});

test('Verify if only standard accommodations are requested, we can continue to complete a SA booking (only Onscreen BSL)', async () => {
  const sessionData = new SessionData(Target.NI, Locale.NI, true, false, true);

  sessionData.journey.standardAccommodation = true;
  sessionData.currentBooking.bsl = true;
  sessionData.currentBooking.customSupport = '';
  sessionData.currentBooking.selectSupportType = [SupportType.ON_SCREEN_BSL];
  sessionData.currentBooking.voiceover = Voiceover.NONE;

  const navigationHelper = new NavigationHelperNSA(sessionData);
  await navigationHelper.navigateToStayingOrLeavingNsaPage();

  sessionData.hasComeFromNsaJourney = true;
  sessionData.testCentreSearch.searchQuery = Constants.searchWithCityName;
  sessionData.currentBooking.centre.name = 'Belfast';
  sessionData.paymentDetails = testPayment;
  const navigationHelperSA = new NavigationHelper(sessionData);
  await navigationHelperSA.createANewBooking();
});
