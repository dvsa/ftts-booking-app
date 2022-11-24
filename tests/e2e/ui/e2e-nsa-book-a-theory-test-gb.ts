import { Selector } from 'testcafe';
import * as Constants from '../data/constants';
import { NavigationHelperNSA } from '../utils/navigation-helper-nsa';
import { SessionData } from '../data/session-data';
import {
  Locale, SupportType, Target, TestType, Voiceover,
} from '../../../src/domain/enums';
import { NavigationHelper } from '../utils/navigation-helper';
import { verifyTitleContainsText } from '../utils/helpers';
import { SelectSupportTypePage } from '../pages/select-support-type-page';
import { testPayment } from '../data/constants';

fixture`Book a candidate theory test in GB - Non-standard accommodations`
  .page(process.env.BOOKING_APP_URL)
  .before(async () => { await Constants.setRequestTimeout; })
  .meta('type', 'e2e');

test('Verify an NSA request can be completed for a GB candidate - Car test in English with Non-Standard accommodations (Voiceover, Extra time, Other support)', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, false, true);

  sessionData.journey.standardAccommodation = false;
  sessionData.currentBooking.selectSupportType = [SupportType.VOICEOVER, SupportType.EXTRA_TIME, SupportType.READING_SUPPORT, SupportType.OTHER];
  sessionData.currentBooking.voiceover = Voiceover.ENGLISH;
  sessionData.currentBooking.customSupport = 'Please arrange for the support';

  const navigationHelper = new NavigationHelperNSA(sessionData);
  await navigationHelper.sendNsaBookingRequest();
});

test('Verify an NSA request can be completed for a GB candidate - Motorcycle test in Welsh with Non-Standard accommodations (Voiceover, Extra time, Other support)', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, false, true);

  sessionData.currentBooking.testType = TestType.MOTORCYCLE;
  sessionData.journey.standardAccommodation = false;
  sessionData.meaningfulSupportRequest = true;
  sessionData.currentBooking.selectSupportType = [SupportType.VOICEOVER, SupportType.EXTRA_TIME, SupportType.OTHER];
  sessionData.currentBooking.voiceover = Voiceover.WELSH;
  sessionData.currentBooking.customSupport = 'Please arrange for the support';

  const navigationHelper = new NavigationHelperNSA(sessionData);
  await navigationHelper.sendNsaBookingRequest();
});

test('Verify an NSA request can be completed for a GB candidate - LGV - multiple choice test in English with Non-Standard accommodations (Voiceover, Extra time, Other support)', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, false, true);

  sessionData.currentBooking.testType = TestType.LGVMC;
  sessionData.journey.standardAccommodation = false;
  sessionData.meaningfulSupportRequest = true;
  sessionData.currentBooking.selectSupportType = [SupportType.VOICEOVER, SupportType.EXTRA_TIME, SupportType.OTHER];
  sessionData.currentBooking.voiceover = Voiceover.ENGLISH;

  const navigationHelper = new NavigationHelperNSA(sessionData);
  await navigationHelper.sendNsaBookingRequest();
});

test('Verify an NSA request can be completed for a GB candidate - LGV - hazard perception test in Welsh with Non-Standard accommodations (Voiceover, Other support)', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, false, true);

  sessionData.currentBooking.testType = TestType.LGVHPT;
  sessionData.journey.standardAccommodation = false;
  sessionData.meaningfulSupportRequest = true;
  sessionData.currentBooking.selectSupportType = [SupportType.VOICEOVER, SupportType.OTHER];
  sessionData.currentBooking.voiceover = Voiceover.WELSH;

  const navigationHelper = new NavigationHelperNSA(sessionData);
  await navigationHelper.sendNsaBookingRequest();
});

test('Verify an NSA request can be completed for a GB candidate - LGV - Driver Certificate of Professional Competence (CPC) test in English with Non-Standard accommodations (Voiceover, Extra time, Other support)', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, false, true);

  sessionData.currentBooking.testType = TestType.LGVCPC;
  sessionData.journey.standardAccommodation = false;
  sessionData.meaningfulSupportRequest = true;
  sessionData.currentBooking.selectSupportType = [SupportType.VOICEOVER, SupportType.EXTRA_TIME, SupportType.OTHER];
  sessionData.currentBooking.voiceover = Voiceover.ENGLISH;

  const navigationHelper = new NavigationHelperNSA(sessionData);
  await navigationHelper.sendNsaBookingRequest();
});

test('Verify an NSA request can be completed for a GB candidate - PCV - multiple choice test in English with Non-Standard accommodations (Voiceover, Extra time, Other support)', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, false, true);

  sessionData.currentBooking.testType = TestType.PCVMC;
  sessionData.journey.standardAccommodation = false;
  sessionData.meaningfulSupportRequest = true;
  sessionData.currentBooking.selectSupportType = [SupportType.VOICEOVER, SupportType.EXTRA_TIME, SupportType.OTHER];
  sessionData.currentBooking.voiceover = Voiceover.ENGLISH;

  const navigationHelper = new NavigationHelperNSA(sessionData);
  await navigationHelper.sendNsaBookingRequest();
});

test('Verify an NSA request can be completed for a GB candidate - PCV - hazard perception test in English with Non-Standard accommodations (Voiceover, Other support)', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, false, true);

  sessionData.currentBooking.testType = TestType.PCVHPT;
  sessionData.journey.standardAccommodation = false;
  sessionData.meaningfulSupportRequest = true;
  sessionData.currentBooking.selectSupportType = [SupportType.VOICEOVER, SupportType.OTHER];
  sessionData.currentBooking.voiceover = Voiceover.ENGLISH;

  const navigationHelper = new NavigationHelperNSA(sessionData);
  await navigationHelper.sendNsaBookingRequest();
});

test('Verify an NSA request can be completed for a GB candidate - PCV - Driver Certificate of Professional Competence (CPC) test in Welsh with Non-Standard accommodations (Voiceover, Extra time, Other support)', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, false, true);

  sessionData.currentBooking.testType = TestType.PCVCPC;
  sessionData.journey.standardAccommodation = false;
  sessionData.meaningfulSupportRequest = true;
  sessionData.currentBooking.selectSupportType = [SupportType.VOICEOVER, SupportType.EXTRA_TIME, SupportType.OTHER];
  sessionData.currentBooking.voiceover = Voiceover.WELSH;

  const navigationHelper = new NavigationHelperNSA(sessionData);
  await navigationHelper.sendNsaBookingRequest();
});

test('Verify if only standard accommodations are requested, we can complete a NSA booking (only Voiceover)', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, false, true);

  sessionData.journey.standardAccommodation = false;
  sessionData.currentBooking.customSupport = '';
  sessionData.currentBooking.selectSupportType = [SupportType.VOICEOVER];
  sessionData.currentBooking.voiceover = Voiceover.ENGLISH;

  const navigationHelper = new NavigationHelperNSA(sessionData);
  await navigationHelper.sendNsaBookingRequest();
});

test('Verify if only standard accommodations are requested, we can continue to complete a NSA booking (only Onscreen BSL)', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, false, true);

  sessionData.journey.standardAccommodation = false;
  sessionData.currentBooking.customSupport = '';
  sessionData.currentBooking.selectSupportType = [SupportType.ON_SCREEN_BSL];
  sessionData.currentBooking.voiceover = undefined;

  const navigationHelper = new NavigationHelperNSA(sessionData);
  await navigationHelper.sendNsaBookingRequest();
});

test('Verify if only standard accommodations are requested, we can continue to complete a SA booking (only Voiceover)', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, false, true);

  sessionData.journey.standardAccommodation = true;
  sessionData.currentBooking.bsl = false;
  sessionData.currentBooking.customSupport = '';
  sessionData.currentBooking.selectSupportType = [SupportType.VOICEOVER];
  sessionData.currentBooking.voiceover = Voiceover.ENGLISH;

  const navigationHelper = new NavigationHelperNSA(sessionData);
  await navigationHelper.navigateToStayingOrLeavingNsaPage();

  sessionData.hasComeFromNsaJourney = true;
  sessionData.testCentreSearch.searchQuery = Constants.searchWithCityName;
  sessionData.currentBooking.centre.name = 'Birmingham';
  sessionData.paymentDetails = testPayment;
  const navigationHelperSA = new NavigationHelper(sessionData);
  await navigationHelperSA.createANewBooking();
});

test('Verify if only standard accommodations are requested, we can continue to complete a SA booking (only Onscreen BSL)', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, false, true);

  sessionData.journey.standardAccommodation = true;
  sessionData.currentBooking.bsl = true;
  sessionData.currentBooking.customSupport = '';
  sessionData.currentBooking.selectSupportType = [SupportType.ON_SCREEN_BSL];
  sessionData.currentBooking.voiceover = Voiceover.NONE;

  const navigationHelper = new NavigationHelperNSA(sessionData);
  await navigationHelper.navigateToStayingOrLeavingNsaPage();

  sessionData.hasComeFromNsaJourney = true;
  sessionData.testCentreSearch.searchQuery = Constants.searchWithCityName;
  sessionData.currentBooking.centre.name = 'Birmingham';
  sessionData.paymentDetails = testPayment;
  const navigationHelperSA = new NavigationHelper(sessionData);
  await navigationHelperSA.createANewBooking();
});

test('Verify if standard accommodations are requested & Other type of support is populated with something not meaningful, we are directed to the SA booking', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, false, true);

  sessionData.journey.standardAccommodation = true;
  sessionData.journey.confirmingSupport = false;
  sessionData.meaningfulSupportRequest = false;
  sessionData.currentBooking.bsl = true;
  sessionData.currentBooking.customSupport = 'N/A';
  sessionData.currentBooking.selectSupportType = [SupportType.ON_SCREEN_BSL, SupportType.OTHER];
  sessionData.currentBooking.voiceover = Voiceover.NONE;

  const navigationHelper = new NavigationHelperNSA(sessionData);
  await navigationHelper.navigateToStayingOrLeavingNsaPage();

  sessionData.hasComeFromNsaJourney = true;
  sessionData.testCentreSearch.searchQuery = Constants.searchWithCityName;
  sessionData.currentBooking.centre.name = 'Birmingham';
  sessionData.paymentDetails = testPayment;
  const navigationHelperSA = new NavigationHelper(sessionData);
  await navigationHelperSA.createANewBooking();
});

test('Verify if standard accommodations are requested & Other type of support is populated with something meaningful, we will stay on the NSA journey', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, false, true);

  sessionData.currentBooking.testType = TestType.PCVCPC;
  sessionData.journey.standardAccommodation = false;
  sessionData.journey.confirmingSupport = false;
  sessionData.meaningfulSupportRequest = true;
  sessionData.currentBooking.customSupport = 'Please can I wear a Pikachu costume';
  sessionData.currentBooking.selectSupportType = [SupportType.VOICEOVER, SupportType.OTHER];
  sessionData.currentBooking.voiceover = Voiceover.WELSH;

  const navigationHelper = new NavigationHelperNSA(sessionData);
  await navigationHelper.sendNsaBookingRequest();
});

test('Verify when only Other type of support is requested and is populated with something not meaningful, then we can choose to continue with the NSA journey', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, false, true);

  sessionData.currentBooking.testType = TestType.MOTORCYCLE;
  sessionData.journey.standardAccommodation = false;
  sessionData.journey.confirmingSupport = true;
  sessionData.meaningfulSupportRequest = false;
  sessionData.currentBooking.customSupport = 'NOTHING REQUIRED';
  sessionData.currentBooking.selectSupportType = [SupportType.OTHER];
  sessionData.currentBooking.voiceover = Voiceover.NONE;

  const navigationHelper = new NavigationHelperNSA(sessionData);
  await navigationHelper.sendNsaBookingRequest();
});

test('Verify when only Other type of support is requested and is populated with something not meaningful, then we can go back and change support types', async (t) => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, false, true);

  sessionData.currentBooking.testType = TestType.MOTORCYCLE;
  sessionData.journey.standardAccommodation = false;
  sessionData.journey.confirmingSupport = true;
  sessionData.meaningfulSupportRequest = false;
  sessionData.currentBooking.customSupport = 'Clicked by mistake';
  sessionData.currentBooking.selectSupportType = [SupportType.OTHER];
  sessionData.currentBooking.voiceover = Voiceover.NONE;

  const navigationHelper = new NavigationHelperNSA(sessionData);
  await navigationHelper.navigateToConfirmSupportPage();
  const selectSupportTypePage = new SelectSupportTypePage();
  await verifyTitleContainsText(`${selectSupportTypePage.pageHeading}`);
  const supportTypes = sessionData.currentBooking.selectSupportType;
  // verify no support options are selected
  for (let index = 0; index < supportTypes.length; index++) {
    // eslint-disable-next-line no-await-in-loop
    await t.expect(
      Selector(selectSupportTypePage.getOptionSelector(supportTypes[index])).checked,
    ).notOk();
  }
});

test('Verify when only Other type of support is requested and is populated with something not meaningful, then we can choose to continue with a SA booking', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, false, true);

  sessionData.currentBooking.testType = TestType.MOTORCYCLE;
  sessionData.journey.standardAccommodation = false;
  sessionData.journey.confirmingSupport = false;
  sessionData.meaningfulSupportRequest = false;
  sessionData.currentBooking.customSupport = 'I DON\'T NEED ANY';
  sessionData.currentBooking.selectSupportType = [SupportType.OTHER];
  sessionData.currentBooking.voiceover = Voiceover.NONE;

  const navigationHelper = new NavigationHelperNSA(sessionData);
  await navigationHelper.navigateToStayingOrLeavingNsaPage();

  sessionData.hasComeFromNsaJourney = true;
  sessionData.testCentreSearch.searchQuery = Constants.searchWithCityName;
  sessionData.currentBooking.centre.name = 'Birmingham';
  sessionData.paymentDetails = testPayment;
  const navigationHelperSA = new NavigationHelper(sessionData);
  await navigationHelperSA.createANewBooking();
});

test('Verify when only Other type of support is requested and we skip providing any details, then we can choose to continue with a SA booking', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, false, true);

  sessionData.currentBooking.testType = TestType.MOTORCYCLE;
  sessionData.journey.standardAccommodation = false;
  sessionData.journey.confirmingSupport = false;
  sessionData.meaningfulSupportRequest = false;
  sessionData.skipSupportRequest = true;
  sessionData.currentBooking.customSupport = '';
  sessionData.currentBooking.selectSupportType = [SupportType.OTHER];
  sessionData.currentBooking.voiceover = Voiceover.NONE;

  const navigationHelper = new NavigationHelperNSA(sessionData);
  await navigationHelper.navigateToStayingOrLeavingNsaPage();

  sessionData.hasComeFromNsaJourney = true;
  sessionData.testCentreSearch.searchQuery = Constants.searchWithCityName;
  sessionData.currentBooking.centre.name = 'Birmingham';
  sessionData.paymentDetails = testPayment;
  const navigationHelperSA = new NavigationHelper(sessionData);
  await navigationHelperSA.createANewBooking();
});

test('Verify when only Other type of support is requested and we skip providing any details, then we can choose to continue with an NSA request', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, false, true);

  sessionData.currentBooking.testType = TestType.MOTORCYCLE;
  sessionData.journey.standardAccommodation = false;
  sessionData.journey.confirmingSupport = true;
  sessionData.meaningfulSupportRequest = false;
  sessionData.skipSupportRequest = true;
  sessionData.currentBooking.customSupport = 'You added no details';
  sessionData.currentBooking.selectSupportType = [SupportType.OTHER];
  sessionData.currentBooking.voiceover = Voiceover.NONE;

  const navigationHelper = new NavigationHelperNSA(sessionData);
  await navigationHelper.sendNsaBookingRequest();
});
