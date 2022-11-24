import { Selector, t } from 'testcafe';
import dayjs from 'dayjs';
import * as Constants from '../data/constants';
import { SessionData } from '../data/session-data';
import {
  Locale, Origin, PreferredDay, PreferredLocation, SupportType, Target, Voiceover,
} from '../../../src/domain/enums';
import { NavigationHelper } from '../utils/navigation-helper';
import { NavigationHelperNSA } from '../utils/navigation-helper-nsa';
import { NavigationHelperInstructor } from '../utils/navigation-helper-instructor';
import { NavigationHelperInstructorNSA } from '../utils/navigation-helper-instructor-nsa';
import ManageBookingsPage from '../pages/manage-bookings-page';
import {
  runningTestsLocally, setAcceptCookies, verifyContainsText, verifyExactText, verifyIsNotVisible, verifyIsVisible, verifyTitleContainsText,
} from '../utils/helpers';
import { CRMGateway } from '../utils/crm/crm-gateway-test';
import { dynamicsWebApiClient } from '../utils/crm/dynamics-web-api';
import { createNewBookingInCrm } from '../utils/crm/crm-data-helper';
import { LoginPage } from '../pages/login-page';
import { ChangeBookingPage } from '../pages/change-booking-page';

const crmGateway = new CRMGateway(dynamicsWebApiClient());
const loginPage = new LoginPage();
const changeBookingPage = new ChangeBookingPage();
const manageBookingPageUrl = `${process.env.BOOKING_APP_URL}/${loginPage.pathUrl}`;

fixture`Compensation tests - Book a compensation theory test`
  .page(process.env.BOOKING_APP_URL)
  .before(async () => { await Constants.setRequestTimeout; })
  .beforeEach(async () => { await setAcceptCookies(); })
  .afterEach(async () => {
    const { sessionData } = t.ctx;
    if (!runningTestsLocally()) {
      if (sessionData.isCompensationBooking) {
        await crmGateway.setCompensationBookingAssigned(sessionData.currentBooking.bookingId, dayjs().toISOString());
        await crmGateway.setCompensationBookingRecognised(sessionData.currentBooking.bookingId, dayjs().toISOString());
      }
      await crmGateway.cleanUpBookingProductsByBookingRef(sessionData.currentBooking.bookingRef);
    }
  })
  .meta('type', 'bulk-compensation');

const dataSetCompensationBookingsSA = [
  {
    testName: 'GB candidate with a cancelled Standard accommodation booking',
    nonStandardAccommodations: false,
    instructorBooking: false,
    target: Target.GB,
    locale: Locale.GB,
    origin: Origin.CitizenPortal,
    drivingLicenceNumber: Constants.drivingLicenceBulkCompensationGB1,
  },
  {
    testName: 'GB candidate with a cancelled Standard accommodation CSC booking',
    nonStandardAccommodations: false,
    instructorBooking: false,
    target: Target.GB,
    locale: Locale.GB,
    origin: Origin.CustomerServiceCentre,
    drivingLicenceNumber: Constants.drivingLicenceBulkCompensationGB2,
  },
  {
    testName: 'GB instructor with a cancelled Standard accommodation booking',
    nonStandardAccommodations: false,
    instructorBooking: true,
    target: Target.GB,
    locale: Locale.GB,
    origin: Origin.CitizenPortal,
    drivingLicenceNumber: Constants.drivingLicenceBulkCompensationGB3,
  },
  {
    testName: 'NI candidate with a cancelled Standard accommodation booking',
    nonStandardAccommodations: false,
    instructorBooking: false,
    target: Target.NI,
    locale: Locale.NI,
    origin: Origin.CitizenPortal,
    drivingLicenceNumber: Constants.drivingLicenceBulkCompensationNI1,
  },
  {
    testName: 'NI candidate with a cancelled Standard accommodation CSC booking',
    nonStandardAccommodations: false,
    instructorBooking: false,
    target: Target.NI,
    locale: Locale.NI,
    origin: Origin.CustomerServiceCentre,
    drivingLicenceNumber: Constants.drivingLicenceBulkCompensationNI2,
  },
  {
    testName: 'NI instructor with a cancelled Standard accommodation booking',
    nonStandardAccommodations: false,
    instructorBooking: true,
    target: Target.NI,
    locale: Locale.NI,
    origin: Origin.CitizenPortal,
    drivingLicenceNumber: Constants.drivingLicenceBulkCompensationNI3,
  },
];

dataSetCompensationBookingsSA.forEach((data) => {
  // eslint-disable-next-line testcafe-community/noIdenticalTitle
  test(`Verify user can book an owed compensation test - ${data.testName}`, async () => {
    // create compensation booking first
    const sessionData = new SessionData(data.target, data.locale, false, data.instructorBooking);
    t.ctx.sessionData = sessionData;
    sessionData.candidate.licenceNumber = data.drivingLicenceNumber;
    sessionData.isCompensationBooking = true;
    sessionData.currentBooking.origin = data.origin;
    if (!runningTestsLocally()) {
      await createNewBookingInCrm(sessionData);
    }
    const { bookingRef } = sessionData.currentBooking;
    const { licenceNumber } = sessionData.candidate;

    const oldBookingRef = bookingRef;
    if (data.instructorBooking) {
      await new NavigationHelperInstructor(sessionData).createANewBooking();
    } else {
      await new NavigationHelper(sessionData).createANewBooking();
    }
    const newBookingRef = sessionData.currentBooking.bookingRef;

    // login to manage booking using new booking ref
    await t.navigateTo(`${manageBookingPageUrl}?target=${data.target}`);
    await loginPage.login(newBookingRef, licenceNumber);
    await verifyTitleContainsText(ManageBookingsPage.pageHeading);
    await verifyExactText(ManageBookingsPage.pageHeadingLocator, ManageBookingsPage.pageHeading);
    await t.expect(Selector(ManageBookingsPage.table).innerText).notContains(oldBookingRef);
    await t.expect(Selector(ManageBookingsPage.table).innerText).contains(newBookingRef);
    await ManageBookingsPage.viewTestWithBookingReference(newBookingRef);
    await verifyTitleContainsText(changeBookingPage.pageHeading);
    await verifyContainsText(changeBookingPage.warningMessageLocator, changeBookingPage.refundWarningMessageTextBookingToday);
    await verifyIsNotVisible(changeBookingPage.cancelTestButton);
    await changeBookingPage.checkDataMatchesSession(sessionData);
  });
});

const dataSetCompensationBookingsNSA = [
  {
    testName: 'GB candidate with a cancelled Non-Standard accommodation booking',
    nonStandardAccommodations: true,
    instructorBooking: false,
    target: Target.GB,
    locale: Locale.GB,
    origin: Origin.CitizenPortal,
    drivingLicenceNumber: Constants.drivingLicenceBulkCompensationGB1,
  },
  {
    testName: 'GB candidate with a cancelled Non-Standard accommodation CSC booking',
    nonStandardAccommodations: true,
    instructorBooking: false,
    target: Target.GB,
    locale: Locale.GB,
    origin: Origin.CustomerServiceCentre,
    drivingLicenceNumber: Constants.drivingLicenceBulkCompensationGB2,
  },
  {
    testName: 'GB instructor with a cancelled Non-Standard accommodation booking',
    nonStandardAccommodations: true,
    instructorBooking: true,
    target: Target.GB,
    locale: Locale.GB,
    origin: Origin.CitizenPortal,
    drivingLicenceNumber: Constants.drivingLicenceBulkCompensationGB3,
  },
  {
    testName: 'NI candidate with a cancelled Non-Standard accommodation booking',
    nonStandardAccommodations: true,
    instructorBooking: false,
    target: Target.NI,
    locale: Locale.NI,
    origin: Origin.CitizenPortal,
    drivingLicenceNumber: Constants.drivingLicenceBulkCompensationNI1,
  },
];

dataSetCompensationBookingsNSA.forEach((data) => {
  // eslint-disable-next-line testcafe-community/noIdenticalTitle
  test(`Verify user can book an owed compensation test - ${data.testName}`, async () => {
    // create compensation booking first
    const sessionData = new SessionData(data.target, data.locale, false, data.instructorBooking);
    t.ctx.sessionData = sessionData;
    sessionData.candidate.licenceNumber = data.drivingLicenceNumber;
    sessionData.isCompensationBooking = true;
    sessionData.currentBooking.origin = data.origin;

    sessionData.journey.support = true;
    sessionData.journey.standardAccommodation = false;
    sessionData.currentBooking.selectSupportType = [SupportType.VOICEOVER, SupportType.EXTRA_TIME, SupportType.READING_SUPPORT, SupportType.OTHER];
    sessionData.currentBooking.voiceover = Voiceover.ENGLISH;
    sessionData.currentBooking.customSupport = 'Please arrange for the support';
    sessionData.currentBooking.voicemail = true;
    sessionData.currentBooking.preferredDayOption = PreferredDay.ParticularDay;
    sessionData.currentBooking.preferredDay = 'I only want to have tests on Mondays';
    sessionData.currentBooking.preferredLocationOption = PreferredLocation.ParticularLocation;
    sessionData.currentBooking.preferredLocation = 'I only want to have tests in the City Centre';

    if (!runningTestsLocally()) {
      await createNewBookingInCrm(sessionData);
    }
    const { bookingRef } = sessionData.currentBooking;
    const { licenceNumber } = sessionData.candidate;

    const oldBookingRef = bookingRef;
    if (data.instructorBooking) {
      await new NavigationHelperInstructorNSA(sessionData).sendNsaBookingRequest();
    } else {
      await new NavigationHelperNSA(sessionData).sendNsaBookingRequest();
    }
    const newBookingRef = sessionData.currentBooking.bookingRef;

    // login to manage booking still using old booking ref as new booking ref would still be in draft
    await t.navigateTo(`${manageBookingPageUrl}?target=${data.target}`);
    await loginPage.login(oldBookingRef, licenceNumber);
    await verifyTitleContainsText(ManageBookingsPage.pageHeading);
    await verifyExactText(ManageBookingsPage.pageHeadingLocator, ManageBookingsPage.pageHeading);
    await verifyIsVisible(ManageBookingsPage.compensationBanner);
    await t.expect(Selector(ManageBookingsPage.table).innerText).notContains(newBookingRef);
    await t.expect(Selector(ManageBookingsPage.table).innerText).contains(oldBookingRef);
  });
});
