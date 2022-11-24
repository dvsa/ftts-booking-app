import { t } from 'testcafe';
import dayjs from 'dayjs';
import * as Constants from '../data/constants';
import {
  verifyExactText, runningTestsLocally, verifyContainsText, verifyIsVisible, setAcceptCookies, clickLinkContainsURL, verifyIsNotVisible,
} from '../utils/helpers';
import ManageBookingsPage from '../pages/manage-bookings-page';
import { LoginPage } from '../pages/login-page';
import {
  Locale, Origin, PreferredDay, PreferredLocation, SupportType, Target, Voiceover,
} from '../../../src/domain/enums';
import { SessionData } from '../data/session-data';
import { createNewBookingInCrm } from '../utils/crm/crm-data-helper';
import { dynamicsWebApiClient } from '../utils/crm/dynamics-web-api';
import { CRMGateway } from '../utils/crm/crm-gateway-test';

const crmGateway = new CRMGateway(dynamicsWebApiClient());
const loginPage = new LoginPage();
const pageUrl = `${process.env.BOOKING_APP_URL}/${loginPage.pathUrl}`;

fixture`Manage bookings - Compensation tests`
  .page(`${pageUrl}?target=${Target.GB}`)
  .before(async () => { await Constants.setRequestTimeout; })
  .beforeEach(async () => { await setAcceptCookies(); })
  .afterEach(async () => {
    const { sessionData } = t.ctx;
    if (!runningTestsLocally()) {
      const { bookingProductId } = sessionData.currentBooking;
      if (sessionData.isCompensationBooking) {
        await crmGateway.setCompensationBookingAssigned(sessionData.currentBooking.bookingId, dayjs().toISOString());
        await crmGateway.setCompensationBookingRecognised(sessionData.currentBooking.bookingId, dayjs().toISOString());
      } else {
        await crmGateway.cleanUpBookingProducts(bookingProductId);
      }
    }
  })
  .meta('type', 'bulk-compensation');

const dataSetCompensationBookings = [
  {
    testName: 'GB candidate with a future dated cancelled Standard accommodation booking',
    testTimeDate: dayjs().add(1, 'month').toISOString(),
    nonStandardAccommodations: false,
    instructorBooking: false,
    target: Target.GB,
    locale: Locale.GB,
    origin: Origin.CitizenPortal,
    drivingLicenceNumber: Constants.drivingLicenceBulkCompensationGB1,
  },
  {
    testName: 'GB candidate with a past dated cancelled Standard accommodation booking',
    testTimeDate: dayjs().subtract(1, 'month').toISOString(),
    nonStandardAccommodations: false,
    instructorBooking: false,
    target: Target.GB,
    locale: Locale.GB,
    origin: Origin.CitizenPortal,
    drivingLicenceNumber: Constants.drivingLicenceBulkCompensationGB2,
  },
  {
    testName: 'GB candidate with a future dated cancelled Non-Standard accommodation booking',
    testTimeDate: dayjs().add(1, 'month').toISOString(),
    nonStandardAccommodations: true,
    instructorBooking: false,
    target: Target.GB,
    locale: Locale.GB,
    origin: Origin.CitizenPortal,
    drivingLicenceNumber: Constants.drivingLicenceBulkCompensationGB3,
  },
  {
    testName: 'GB candidate with a past dated cancelled Non-Standard accommodation booking',
    testTimeDate: dayjs().subtract(1, 'month').toISOString(),
    nonStandardAccommodations: true,
    instructorBooking: false,
    target: Target.GB,
    locale: Locale.GB,
    origin: Origin.CitizenPortal,
    drivingLicenceNumber: Constants.drivingLicenceBulkCompensationGB1,
  },
  {
    testName: 'GB candidate with a future dated cancelled Standard accommodation CSC booking',
    testTimeDate: dayjs().add(1, 'month').toISOString(),
    nonStandardAccommodations: false,
    instructorBooking: false,
    target: Target.GB,
    locale: Locale.GB,
    origin: Origin.CustomerServiceCentre,
    drivingLicenceNumber: Constants.drivingLicenceBulkCompensationGB2,
  },
  {
    testName: 'GB instructor with a future dated cancelled Standard accommodation booking',
    testTimeDate: dayjs().add(1, 'month').toISOString(),
    nonStandardAccommodations: false,
    instructorBooking: true,
    target: Target.GB,
    locale: Locale.GB,
    origin: Origin.CitizenPortal,
    drivingLicenceNumber: Constants.drivingLicenceBulkCompensationGB3,
  },
  {
    testName: 'GB instructor with a future dated cancelled Non-Standard accommodation booking',
    testTimeDate: dayjs().add(1, 'month').toISOString(),
    nonStandardAccommodations: true,
    instructorBooking: true,
    target: Target.GB,
    locale: Locale.GB,
    origin: Origin.CitizenPortal,
    drivingLicenceNumber: Constants.drivingLicenceBulkCompensationGB1,
  },
  {
    testName: 'NI candidate with a future dated cancelled Standard accommodation booking',
    testTimeDate: dayjs().add(1, 'month').toISOString(),
    nonStandardAccommodations: false,
    instructorBooking: false,
    target: Target.NI,
    locale: Locale.NI,
    origin: Origin.CitizenPortal,
    drivingLicenceNumber: Constants.drivingLicenceBulkCompensationNI1,
  },
  {
    testName: 'NI candidate with a past dated cancelled Standard accommodation booking',
    testTimeDate: dayjs().subtract(1, 'month').toISOString(),
    nonStandardAccommodations: false,
    instructorBooking: false,
    target: Target.NI,
    locale: Locale.NI,
    origin: Origin.CitizenPortal,
    drivingLicenceNumber: Constants.drivingLicenceBulkCompensationNI2,
  },
  {
    testName: 'NI candidate with a future dated cancelled Non-Standard accommodation booking',
    testTimeDate: dayjs().add(1, 'month').toISOString(),
    nonStandardAccommodations: true,
    instructorBooking: false,
    target: Target.NI,
    locale: Locale.NI,
    origin: Origin.CitizenPortal,
    drivingLicenceNumber: Constants.drivingLicenceBulkCompensationNI3,
  },
  {
    testName: 'NI candidate with a past dated cancelled Non-Standard accommodation booking',
    testTimeDate: dayjs().subtract(1, 'month').toISOString(),
    nonStandardAccommodations: true,
    instructorBooking: false,
    target: Target.NI,
    locale: Locale.NI,
    origin: Origin.CitizenPortal,
    drivingLicenceNumber: Constants.drivingLicenceBulkCompensationNI1,
  },
  {
    testName: 'NI candidate with a future dated cancelled Standard accommodation CSC booking',
    testTimeDate: dayjs().add(1, 'month').toISOString(),
    nonStandardAccommodations: false,
    instructorBooking: false,
    target: Target.NI,
    locale: Locale.NI,
    origin: Origin.CustomerServiceCentre,
    drivingLicenceNumber: Constants.drivingLicenceBulkCompensationNI2,
  },
  {
    testName: 'NI instructor with a future dated cancelled Standard accommodation booking',
    testTimeDate: dayjs().add(1, 'month').toISOString(),
    nonStandardAccommodations: false,
    instructorBooking: true,
    target: Target.NI,
    locale: Locale.NI,
    origin: Origin.CitizenPortal,
    drivingLicenceNumber: Constants.drivingLicenceBulkCompensationNI3,
  },
];

dataSetCompensationBookings.forEach((data) => {
  // eslint-disable-next-line testcafe-community/noIdenticalTitle
  test(`Verify user can re-book test or request refund when owed compensation booking - ${data.testName}`, async () => {
    const sessionData = new SessionData(data.target, data.locale, false, data.instructorBooking);
    t.ctx.sessionData = sessionData;
    sessionData.candidate.licenceNumber = data.drivingLicenceNumber;
    sessionData.isCompensationBooking = true;
    sessionData.currentBooking.origin = data.origin;
    if (data.nonStandardAccommodations) {
      sessionData.journey.standardAccommodation = false;
      sessionData.currentBooking.selectSupportType = [SupportType.VOICEOVER, SupportType.EXTRA_TIME, SupportType.READING_SUPPORT, SupportType.OTHER];
      sessionData.currentBooking.voiceover = Voiceover.ENGLISH;
      sessionData.currentBooking.customSupport = 'Please arrange for the support';
      sessionData.currentBooking.voicemail = true;
      sessionData.currentBooking.preferredDayOption = PreferredDay.ParticularDay;
      sessionData.currentBooking.preferredDay = 'I only want to have tests on Mondays';
      sessionData.currentBooking.preferredLocationOption = PreferredLocation.ParticularLocation;
      sessionData.currentBooking.preferredLocation = 'I only want to have tests in the City Centre';
    }
    if (!runningTestsLocally()) {
      await createNewBookingInCrm(sessionData);
    }
    const { bookingRef } = sessionData.currentBooking;
    const { licenceNumber } = sessionData.candidate;

    await t.navigateTo(`${pageUrl}?target=${data.target}`);
    await loginPage.login(bookingRef, licenceNumber);

    await verifyIsVisible(ManageBookingsPage.compensationBanner);
    await verifyExactText(ManageBookingsPage.compensationBannerTitle, 'Important');
    await verifyExactText(ManageBookingsPage.compensationBannerHeader, ManageBookingsPage.compensationBannerText);
    await verifyExactText(ManageBookingsPage.compensationBannerBookTestLink, ManageBookingsPage.compensationBannerBookTestLinkText);
    await verifyContainsText(ManageBookingsPage.cancelledCompensationBookingLabel, 'CANCELLED');

    const bookReplacementTestLink = ManageBookingsPage.bookReplacementTestLink.replace('<BookingReference>', bookingRef);
    await verifyIsVisible(bookReplacementTestLink);

    const requestRefundLink = ManageBookingsPage.requestRefundLink.replace('<BookingReference>', bookingRef);
    if (data.instructorBooking && data.target === Target.NI) {
      await verifyIsNotVisible(requestRefundLink);
    } else {
      await verifyIsVisible(requestRefundLink);
    }

    const expBookReplacementTestURL = data.instructorBooking ? '/instructor' : '/';
    await clickLinkContainsURL(ManageBookingsPage.compensationBannerBookTestLinkText, expBookReplacementTestURL);
    await clickLinkContainsURL(ManageBookingsPage.bookCompensationTestLinkText, expBookReplacementTestURL);
  });
});
