import { RequestLogger, t } from 'testcafe';
import * as Constants from '../data/constants';
import { SessionData } from '../data/session-data';
import {
  Locale, Origin, PreferredDay, PreferredLocation, SupportType, Target, Voiceover,
} from '../../../src/domain/enums';
import {
  runningTestsLocally, setAcceptCookies, setCookie, verifyContainsText, verifyTitleContainsText,
} from '../utils/helpers';
import { CRMGateway } from '../utils/crm/crm-gateway-test';
import { dynamicsWebApiClient } from '../utils/crm/dynamics-web-api';
import { createNewBookingInCrm } from '../utils/crm/crm-data-helper';
import { SelectSupportTypePage } from '../pages/select-support-type-page';
import { NavigationHelper } from '../utils/navigation-helper';
import { NsaVoiceoverPage } from '../pages/nsa-voiceover-page';
import { LeavingNsaPage } from '../pages/leaving-nsa-page';
import { ReceivedSupportRequestPage } from '../pages/received-support-request-page';
import { DuplicateSupportRequestPage } from '../pages/duplicate-support-request-page';
import { CRMBookingStatus } from '../../../src/services/crm-gateway/enums';

const crmGateway = new CRMGateway(dynamicsWebApiClient());
const selectSupportTypePage = new SelectSupportTypePage();
const voiceoverPage = new NsaVoiceoverPage();
const leavingNsaPage = new LeavingNsaPage();
const receivedSupportRequestPage = new ReceivedSupportRequestPage();
const duplicateSupportRequestPage = new DuplicateSupportRequestPage();

// eslint-disable-next-line security/detect-non-literal-regexp
const headerLogger = RequestLogger([new RegExp(`${process.env.BOOKING_APP_URL}`)], {
  logResponseHeaders: true,
});

fixture`Existing NSA request`
  .page(process.env.BOOKING_APP_URL)
  .requestHooks(headerLogger)
  .before(async () => { await Constants.setRequestTimeout; })
  .beforeEach(async () => { await setAcceptCookies(); })
  .afterEach(async () => {
    const { sessionData } = t.ctx;
    if (!runningTestsLocally()) {
      await crmGateway.cleanUpBookingProductsByBookingRef(sessionData.currentBooking.bookingRef);
    }
  })
  .meta('type', 'e2e');

const dataSet = [
  {
    testName: 'GB candidate with an existing draft NSA request',
    instructorBooking: false,
    target: Target.GB,
    locale: Locale.GB,
    origin: Origin.CitizenPortal,
  },
  {
    testName: 'GB instructor with an existing draft NSA request',
    instructorBooking: true,
    target: Target.GB,
    locale: Locale.GB,
    origin: Origin.CitizenPortal,
  },
  {
    testName: 'NI candidate with an existing draft NSA request',
    instructorBooking: false,
    target: Target.NI,
    locale: Locale.NI,
    origin: Origin.CitizenPortal,
  },
];

dataSet.forEach((data) => {
  // eslint-disable-next-line testcafe-community/noIdenticalTitle
  test(`Verify user is warned existing NSA request will be cancelled when switching from NSA to SA booking journey - ${data.testName}`, async () => {
    // create initial Draft NSA request
    const sessionData = new SessionData(data.target, data.locale, false, data.instructorBooking, true);
    sessionData.currentBooking.origin = data.origin;
    sessionData.journey.support = true;
    sessionData.journey.standardAccommodation = false;
    sessionData.currentBooking.selectSupportType = [SupportType.VOICEOVER, SupportType.EXTRA_TIME, SupportType.READING_SUPPORT, SupportType.OTHER];
    sessionData.currentBooking.voiceover = Voiceover.ENGLISH;
    sessionData.currentBooking.customSupport = 'Please arrange for some custom support';
    sessionData.currentBooking.voicemail = true;
    sessionData.currentBooking.preferredDayOption = PreferredDay.ParticularDay;
    sessionData.currentBooking.preferredDay = 'I only want to have tests on Mondays';
    sessionData.currentBooking.preferredLocationOption = PreferredLocation.ParticularLocation;
    sessionData.currentBooking.preferredLocation = 'I only want to have tests in the City Centre';
    t.ctx.sessionData = sessionData;
    if (!runningTestsLocally()) {
      await createNewBookingInCrm(sessionData, true);
      await crmGateway.updateBookingStatus(sessionData.currentBooking.bookingId, CRMBookingStatus.Draft);
    }

    // now setup another NSA request but with just Standard Accommodations
    sessionData.currentBooking.origin = data.origin;
    sessionData.journey.support = true;
    sessionData.journey.standardAccommodation = false;
    sessionData.currentBooking.selectSupportType = [SupportType.VOICEOVER];
    sessionData.currentBooking.voiceover = Voiceover.ENGLISH;

    await setCookie(headerLogger, sessionData);
    let url = `${process.env.BOOKING_APP_URL}/${selectSupportTypePage.pathUrl}`;
    if (data.instructorBooking) {
      url = `${process.env.BOOKING_APP_URL}/instructor/${selectSupportTypePage.pathUrl}`;
    }
    await t.navigateTo(url);
    await selectSupportTypePage.continue();
    await voiceoverPage.selectVoiceoverRequired(sessionData.currentBooking.voiceover);

    await verifyTitleContainsText(leavingNsaPage.pageHeading);
    await leavingNsaPage.continueBooking();

    await verifyTitleContainsText(receivedSupportRequestPage.pageHeading);
    await verifyContainsText(receivedSupportRequestPage.headingLocator, receivedSupportRequestPage.pageHeading);
    await receivedSupportRequestPage.continueAndMakeBooking();

    sessionData.journey.support = false; // set to false as we are now going into the standard accomm journey
    sessionData.hasComeFromNsaJourney = true;
    sessionData.testCentreSearch.searchQuery = Constants.searchWithCityName;
    const navigationHelperSA = new NavigationHelper(sessionData);
    await navigationHelperSA.createANewBooking();
  });
});

dataSet.forEach((data) => {
  // eslint-disable-next-line testcafe-community/noIdenticalTitle
  test(`Verify user is blocked from submitting another NSA request - ${data.testName}`, async () => {
    // create initial Draft NSA request
    const sessionData = new SessionData(data.target, data.locale, false, data.instructorBooking, true);
    sessionData.currentBooking.origin = data.origin;
    sessionData.journey.support = true;
    sessionData.journey.standardAccommodation = false;
    sessionData.currentBooking.selectSupportType = [SupportType.EXTRA_TIME, SupportType.READING_SUPPORT];
    sessionData.currentBooking.voiceover = Voiceover.NONE;
    sessionData.currentBooking.voicemail = true;
    sessionData.currentBooking.preferredDayOption = PreferredDay.ParticularDay;
    sessionData.currentBooking.preferredDay = 'I only want to have tests on Mondays';
    sessionData.currentBooking.preferredLocationOption = PreferredLocation.ParticularLocation;
    sessionData.currentBooking.preferredLocation = 'I only want to have tests in the City Centre';
    t.ctx.sessionData = sessionData;
    if (!runningTestsLocally()) {
      await createNewBookingInCrm(sessionData, true);
      await crmGateway.updateBookingStatus(sessionData.currentBooking.bookingId, CRMBookingStatus.Draft);
    }

    // attempt to create another NSA request
    await setCookie(headerLogger, sessionData);
    await t.navigateTo(`${process.env.BOOKING_APP_URL}/${selectSupportTypePage.pathUrl}`);
    await selectSupportTypePage.continue();

    await verifyTitleContainsText(duplicateSupportRequestPage.pageHeading);
    await verifyContainsText(duplicateSupportRequestPage.headingLocator, duplicateSupportRequestPage.pageHeading);
  });
});
