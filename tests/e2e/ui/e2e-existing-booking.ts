import { RequestLogger, t } from 'testcafe';
import dayjs from 'dayjs';
import * as Constants from '../data/constants';
import { SessionData } from '../data/session-data';
import {
  Locale, Origin, PreferredDay, PreferredLocation, SupportType, Target, Voiceover,
} from '../../../src/domain/enums';
import {
  click,
  clickLinkContainsURL,
  getText,
  runningTestsLocally, setAcceptCookies, setCookie, verifyContainsText, verifyTitleContainsText,
} from '../utils/helpers';
import { CRMGateway } from '../utils/crm/crm-gateway-test';
import { dynamicsWebApiClient } from '../utils/crm/dynamics-web-api';
import { createNewBookingInCrm } from '../utils/crm/crm-data-helper';
import { BookingExistsPage } from '../pages/booking-exists-page';
import { CheckYourDetailsPage } from '../pages/check-your-details-page';
import { PaymentsPage } from '../pages/payments-page';
import { BookingConfirmationPage } from '../pages/booking-confirmation-page';
import { LoginPage } from '../pages/login-page';

const crmGateway = new CRMGateway(dynamicsWebApiClient());
const checkYourDetailsPage = new CheckYourDetailsPage();
const bookingExistsPage = new BookingExistsPage();
const paymentsPage = new PaymentsPage();
const loginPage = new LoginPage();

// eslint-disable-next-line security/detect-non-literal-regexp
const headerLogger = RequestLogger([new RegExp(`${process.env.BOOKING_APP_URL}`)], {
  logResponseHeaders: true,
});

fixture`Block duplicate Standard Accommodation bookings`
  .page(process.env.BOOKING_APP_URL)
  .requestHooks(headerLogger)
  .before(async () => { await Constants.setRequestTimeout; })
  .beforeEach(async () => { await setAcceptCookies(); })
  .afterEach(async () => {
    const { sessionData } = t.ctx;
    if (!runningTestsLocally()) {
      await crmGateway.cleanUpBookingProducts(sessionData.currentBooking.bookingProductId);
    }
  })
  .meta('type', 'e2e');

const dataSet = [
  {
    testName: 'GB candidate with an existing SA OBP booking',
    instructorBooking: false,
    nonStandardAccommodations: false,
    target: Target.GB,
    locale: Locale.GB,
    origin: Origin.CitizenPortal,
  },
  {
    testName: 'GB candidate with an existing SA CSC booking',
    instructorBooking: false,
    nonStandardAccommodations: false,
    target: Target.GB,
    locale: Locale.GB,
    origin: Origin.CustomerServiceCentre,
  },
  {
    testName: 'GB candidate with an existing NSA booking',
    instructorBooking: false,
    nonStandardAccommodations: true,
    target: Target.GB,
    locale: Locale.GB,
    origin: Origin.CitizenPortal,
  },
  {
    testName: 'GB instructor with an existing SA booking',
    instructorBooking: true,
    nonStandardAccommodations: false,
    target: Target.GB,
    locale: Locale.GB,
    origin: Origin.CitizenPortal,
  },
  {
    testName: 'NI candidate with an existing SA booking',
    instructorBooking: false,
    nonStandardAccommodations: false,
    target: Target.NI,
    locale: Locale.NI,
    origin: Origin.CitizenPortal,
  },
  {
    testName: 'NI instructor with an existing SA booking',
    instructorBooking: true,
    nonStandardAccommodations: false,
    target: Target.NI,
    locale: Locale.NI,
    origin: Origin.CitizenPortal,
  },
];

dataSet.forEach((data) => {
  // eslint-disable-next-line testcafe-community/noIdenticalTitle
  test(`Verify user is blocked from booking same test type - ${data.testName}`, async () => {
    // create initial confirmed booking (SA or NSA)
    const sessionDataExistingBooking = new SessionData(data.target, data.locale, false, data.instructorBooking, true);
    sessionDataExistingBooking.currentBooking.origin = data.origin;
    if (data.nonStandardAccommodations) {
      sessionDataExistingBooking.journey.support = true;
      sessionDataExistingBooking.journey.standardAccommodation = false;
      sessionDataExistingBooking.currentBooking.selectSupportType = [SupportType.VOICEOVER, SupportType.EXTRA_TIME, SupportType.READING_SUPPORT];
      sessionDataExistingBooking.currentBooking.voiceover = Voiceover.ENGLISH;
      sessionDataExistingBooking.currentBooking.voicemail = true;
      sessionDataExistingBooking.currentBooking.preferredDayOption = PreferredDay.ParticularDay;
      sessionDataExistingBooking.currentBooking.preferredDay = 'I only want to have tests on Mondays';
      sessionDataExistingBooking.currentBooking.preferredLocationOption = PreferredLocation.ParticularLocation;
      sessionDataExistingBooking.currentBooking.preferredLocation = 'I only want to have tests in the City Centre';
    }
    t.ctx.sessionData = sessionDataExistingBooking;
    if (!runningTestsLocally()) {
      await createNewBookingInCrm(sessionDataExistingBooking, true);
    }

    // now attempt to book a test of the same type
    const sessionDataNewBooking = sessionDataExistingBooking.snapshot();
    sessionDataNewBooking.journey.support = false;
    sessionDataNewBooking.journey.standardAccommodation = true;
    await setCookie(headerLogger, sessionDataNewBooking);
    let pageUrl = `${process.env.BOOKING_APP_URL}/${checkYourDetailsPage.pathUrl}`;
    if (data.instructorBooking) {
      pageUrl = `${process.env.BOOKING_APP_URL}/instructor/${checkYourDetailsPage.pathUrl}`;
    }
    await t.navigateTo(pageUrl);
    if (data.target === Target.NI && data.instructorBooking) {
      await verifyTitleContainsText(checkYourDetailsPage.pageHeadingNiInstructor);
    } else {
      await verifyTitleContainsText(checkYourDetailsPage.pageHeading);
    }
    await checkYourDetailsPage.checkDataMatchesSession(sessionDataNewBooking);
    await checkYourDetailsPage.continueBooking();

    await verifyTitleContainsText(bookingExistsPage.pageHeading);
    await clickLinkContainsURL(bookingExistsPage.manageBookingLinkText, 'manage-booking/login');
    await verifyContainsText(bookingExistsPage.manageBookingLink, bookingExistsPage.manageBookingLinkText);
    await click(bookingExistsPage.manageBookingLink);
    await verifyTitleContainsText(loginPage.pageHeading);
  });
});

test('Verify user can proceed to book a new test of the same type if an existing confirmed booking is in the past', async () => {
  // create initial confirmed booking (SA or NSA)
  const sessionDataExistingBooking = new SessionData(Target.GB, Locale.GB, false, false, true);
  sessionDataExistingBooking.currentBooking.dateTime = dayjs().subtract(1, 'day').toISOString();
  t.ctx.sessionData = sessionDataExistingBooking;
  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionDataExistingBooking, true);
  }

  // now attempt to book a test of the same type
  const sessionDataNewBooking = sessionDataExistingBooking.snapshot();
  sessionDataNewBooking.currentBooking.dateTime = dayjs().add(3, 'day').toISOString();
  await setCookie(headerLogger, sessionDataNewBooking);
  await t.navigateTo(`${process.env.BOOKING_APP_URL}/${checkYourDetailsPage.pathUrl}`);
  await verifyTitleContainsText(checkYourDetailsPage.pageHeading);
  await checkYourDetailsPage.checkDataMatchesSession(sessionDataNewBooking);
  await checkYourDetailsPage.continueBooking();
  await paymentsPage.makePayment(Constants.testPayment, sessionDataNewBooking.candidate.email);
  const bookingConfirmationPage = new BookingConfirmationPage();
  await verifyTitleContainsText(`${bookingConfirmationPage.pageHeadingSA}`, Constants.MAX_TIMEOUT);
  await verifyContainsText(bookingConfirmationPage.pageHeadingLocator, bookingConfirmationPage.pageHeadingSA);
  sessionDataNewBooking.currentBooking.bookingRef = await getText(bookingConfirmationPage.bookingReferenceLocator);
  await bookingConfirmationPage.checkDataMatchesSession(sessionDataNewBooking);
});
