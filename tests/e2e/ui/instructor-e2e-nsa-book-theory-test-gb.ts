import { Selector } from 'testcafe';
import * as Constants from '../data/constants';
import { NavigationHelperInstructorNSA } from '../utils/navigation-helper-instructor-nsa';
import {
  Language, Locale, SupportType, Target, TestType, Voiceover,
} from '../../../src/domain/enums';
import { NavigationHelperInstructor } from '../utils/navigation-helper-instructor';
import { SessionData } from '../data/session-data';
import { SelectSupportTypePage } from '../pages/select-support-type-page';
import { verifyTitleContainsText } from '../utils/helpers';
import { NavigationHelper } from '../utils/navigation-helper';
import { testPayment } from '../data/constants';

fixture`Instructor - Book NSA theory test in GB - Non-Standard Accommodations`
  .page(process.env.BOOKING_APP_URL)
  .before(async () => { await Constants.setRequestTimeout; })
  .meta('type', 'instructor');

test('Verify an NSA request for a GB instructor candidate - ADI Part 1 in English with Voiceover, Extra time, Other support', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, true, true);
  sessionData.journey.support = true;
  sessionData.currentBooking.testType = TestType.ADIP1;
  sessionData.currentBooking.language = Language.ENGLISH;
  sessionData.candidate.personalReferenceNumber = '321971';
  sessionData.journey.standardAccommodation = false;
  sessionData.currentBooking.selectSupportType = [SupportType.VOICEOVER, SupportType.EXTRA_TIME, SupportType.READING_SUPPORT, SupportType.OTHER];
  sessionData.currentBooking.voiceover = Voiceover.ENGLISH;
  sessionData.currentBooking.customSupport = 'Please arrange for the support';

  const navigationHelper = new NavigationHelperInstructorNSA(sessionData);
  await navigationHelper.sendNsaBookingRequest();
});

test('Verify an NSA request for a GB instructor candidate - ADI hazard perception in Welsh with Voiceover, Other support', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, true, true);
  sessionData.journey.support = true;
  sessionData.currentBooking.testType = TestType.ADIHPT;
  sessionData.currentBooking.language = Language.WELSH;
  sessionData.candidate.personalReferenceNumber = '859736';
  sessionData.journey.standardAccommodation = false;
  sessionData.currentBooking.selectSupportType = [SupportType.VOICEOVER, SupportType.READING_SUPPORT, SupportType.OTHER];
  sessionData.currentBooking.voiceover = Voiceover.WELSH;
  sessionData.currentBooking.customSupport = 'Please arrange for the support';

  const navigationHelper = new NavigationHelperInstructorNSA(sessionData);
  await navigationHelper.sendNsaBookingRequest();
});

test('Verify an NSA request for a GB instructor candidate - Enhanced Rider Scheme in English with Voiceover, Extra time, Other support', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, true, true);
  sessionData.journey.support = true;
  sessionData.currentBooking.testType = TestType.ERS;
  sessionData.currentBooking.language = Language.ENGLISH;
  sessionData.candidate.personalReferenceNumber = '621309';
  sessionData.journey.standardAccommodation = false;
  sessionData.currentBooking.selectSupportType = [SupportType.VOICEOVER, SupportType.EXTRA_TIME, SupportType.READING_SUPPORT, SupportType.OTHER];
  sessionData.currentBooking.voiceover = Voiceover.ENGLISH;
  sessionData.currentBooking.customSupport = 'Please arrange for the support';

  const navigationHelper = new NavigationHelperInstructorNSA(sessionData);
  await navigationHelper.sendNsaBookingRequest();
});

test('Verify if only standard accommodations are requested, we can complete an NSA booking (only Voiceover)', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, true, true);
  sessionData.journey.support = true;
  sessionData.currentBooking.testType = TestType.ERS;
  sessionData.currentBooking.language = Language.ENGLISH;
  sessionData.candidate.personalReferenceNumber = '621309';
  sessionData.journey.standardAccommodation = false;
  sessionData.currentBooking.customSupport = '';
  sessionData.currentBooking.selectSupportType = [SupportType.VOICEOVER];
  sessionData.currentBooking.voiceover = Voiceover.ENGLISH;

  const navigationHelper = new NavigationHelperInstructorNSA(sessionData);
  await navigationHelper.sendNsaBookingRequest();
});

test('Verify if only standard accommodations are requested, we can continue to complete a SA booking (only Voiceover)', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, true, true);
  sessionData.journey.support = true;
  sessionData.currentBooking.testType = TestType.ADIP1;
  sessionData.currentBooking.language = Language.WELSH;
  sessionData.candidate.personalReferenceNumber = '321971';
  sessionData.journey.standardAccommodation = true;
  sessionData.currentBooking.customSupport = '';
  sessionData.currentBooking.selectSupportType = [SupportType.VOICEOVER];
  sessionData.currentBooking.voiceover = Voiceover.WELSH;

  const navigationHelper = new NavigationHelperInstructorNSA(sessionData);
  await navigationHelper.navigateToStayingOrLeavingNsaPage();

  sessionData.hasComeFromNsaJourney = true;
  sessionData.testCentreSearch.searchQuery = Constants.searchWithCityName;
  sessionData.currentBooking.centre.name = 'Birmingham';
  sessionData.paymentDetails = testPayment;
  const navigationHelperSA = new NavigationHelperInstructor(sessionData);
  await navigationHelperSA.createANewBooking();
});

test('Verify if standard accommodations are requested & Other type of support is populated with something not meaningful, we are directed to the SA booking', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, true, true);
  sessionData.currentBooking.testType = TestType.ADIP1;
  sessionData.candidate.personalReferenceNumber = '321971';
  sessionData.journey.standardAccommodation = true;
  sessionData.journey.confirmingSupport = false;
  sessionData.meaningfulSupportRequest = false;
  sessionData.currentBooking.language = Language.WELSH;
  sessionData.currentBooking.customSupport = 'I dont need any.';
  sessionData.currentBooking.selectSupportType = [SupportType.VOICEOVER, SupportType.OTHER];
  sessionData.currentBooking.voiceover = Voiceover.WELSH;

  const navigationHelper = new NavigationHelperInstructorNSA(sessionData);
  await navigationHelper.navigateToStayingOrLeavingNsaPage();

  sessionData.hasComeFromNsaJourney = true;
  sessionData.testCentreSearch.searchQuery = Constants.searchWithCityName;
  sessionData.currentBooking.centre.name = 'Birmingham';
  sessionData.paymentDetails = testPayment;
  const navigationHelperSA = new NavigationHelperInstructor(sessionData);
  await navigationHelperSA.createANewBooking();
});

test('Verify if standard accommodations are requested & Other type of support is populated with something meaningful, we will stay on the NSA journey', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, true, true);
  sessionData.currentBooking.testType = TestType.ADIHPT;
  sessionData.candidate.personalReferenceNumber = '859736';
  sessionData.journey.standardAccommodation = false;
  sessionData.journey.confirmingSupport = false;
  sessionData.meaningfulSupportRequest = true;
  sessionData.currentBooking.customSupport = 'Please can I wear a Pikachu costume';
  sessionData.currentBooking.selectSupportType = [SupportType.VOICEOVER, SupportType.OTHER];
  sessionData.currentBooking.voiceover = Voiceover.WELSH;

  const navigationHelper = new NavigationHelperInstructorNSA(sessionData);
  await navigationHelper.sendNsaBookingRequest();
});

test('Verify when only Other type of support is requested and is populated with something not meaningful, then we can choose to continue with the NSA journey', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, true, true);
  sessionData.currentBooking.testType = TestType.ERS;
  sessionData.candidate.personalReferenceNumber = '621309';
  sessionData.journey.standardAccommodation = false;
  sessionData.journey.confirmingSupport = true;
  sessionData.meaningfulSupportRequest = false;
  sessionData.currentBooking.customSupport = 'NOTHING REQUIRED';
  sessionData.currentBooking.selectSupportType = [SupportType.OTHER];
  sessionData.currentBooking.voiceover = Voiceover.NONE;

  const navigationHelper = new NavigationHelperInstructorNSA(sessionData);
  await navigationHelper.sendNsaBookingRequest();
});

test('Verify when only Other type of support is requested and is populated with something not meaningful, then we can go back and change support types', async (t) => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, true, true);
  sessionData.currentBooking.testType = TestType.ADIP1;
  sessionData.candidate.personalReferenceNumber = '321971';
  sessionData.journey.standardAccommodation = false;
  sessionData.journey.confirmingSupport = true;
  sessionData.meaningfulSupportRequest = false;
  sessionData.currentBooking.customSupport = 'Clicked by mistake';
  sessionData.currentBooking.selectSupportType = [SupportType.OTHER];
  sessionData.currentBooking.voiceover = Voiceover.NONE;

  const navigationHelper = new NavigationHelperInstructorNSA(sessionData);
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
  const sessionData = new SessionData(Target.GB, Locale.GB, true, true, true);
  sessionData.currentBooking.testType = TestType.ADIHPT;
  sessionData.candidate.personalReferenceNumber = '859736';
  sessionData.journey.standardAccommodation = false;
  sessionData.journey.confirmingSupport = false;
  sessionData.meaningfulSupportRequest = false;
  sessionData.currentBooking.customSupport = 'I DON\'T NEED ANY';
  sessionData.currentBooking.selectSupportType = [SupportType.OTHER];
  sessionData.currentBooking.voiceover = Voiceover.NONE;

  const navigationHelper = new NavigationHelperInstructorNSA(sessionData);
  await navigationHelper.navigateToStayingOrLeavingNsaPage();

  sessionData.hasComeFromNsaJourney = true;
  sessionData.testCentreSearch.searchQuery = Constants.searchWithCityName;
  sessionData.currentBooking.centre.name = 'Birmingham';
  sessionData.paymentDetails = testPayment;
  const navigationHelperSA = new NavigationHelper(sessionData);
  await navigationHelperSA.createANewBooking();
});

test('Verify when only Other type of support is requested and we skip providing any details, then we can choose to continue with a SA booking', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, true, true);
  sessionData.currentBooking.testType = TestType.ADIHPT;
  sessionData.candidate.personalReferenceNumber = '859736';
  sessionData.journey.standardAccommodation = false;
  sessionData.journey.confirmingSupport = false;
  sessionData.meaningfulSupportRequest = false;
  sessionData.skipSupportRequest = true;
  sessionData.currentBooking.customSupport = '';
  sessionData.currentBooking.selectSupportType = [SupportType.OTHER];
  sessionData.currentBooking.voiceover = Voiceover.NONE;

  const navigationHelper = new NavigationHelperInstructorNSA(sessionData);
  await navigationHelper.navigateToStayingOrLeavingNsaPage();

  sessionData.hasComeFromNsaJourney = true;
  sessionData.testCentreSearch.searchQuery = Constants.searchWithCityName;
  sessionData.currentBooking.centre.name = 'Birmingham';
  sessionData.paymentDetails = testPayment;
  const navigationHelperSA = new NavigationHelperInstructor(sessionData);
  await navigationHelperSA.createANewBooking();
});

test('Verify when only Other type of support is requested and we skip providing any details, then we can choose to continue with an NSA request', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true, true, true);
  sessionData.currentBooking.testType = TestType.ADIHPT;
  sessionData.candidate.personalReferenceNumber = '859736';
  sessionData.journey.standardAccommodation = false;
  sessionData.journey.confirmingSupport = true;
  sessionData.meaningfulSupportRequest = false;
  sessionData.skipSupportRequest = true;
  sessionData.currentBooking.customSupport = 'You added no details';
  sessionData.currentBooking.selectSupportType = [SupportType.OTHER];
  sessionData.currentBooking.voiceover = Voiceover.NONE;

  const navigationHelper = new NavigationHelperInstructorNSA(sessionData);
  await navigationHelper.sendNsaBookingRequest();
});
