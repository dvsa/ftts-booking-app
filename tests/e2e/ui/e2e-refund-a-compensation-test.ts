import { t } from 'testcafe';
import dayjs from 'dayjs';
import * as Constants from '../data/constants';
import { SessionData } from '../data/session-data';
import {
  Locale, Origin, PreferredDay, PreferredLocation, SupportType, Target, Voiceover,
} from '../../../src/domain/enums';
import ManageBookingsPage from '../pages/manage-bookings-page';
import {
  clickLinkContainsURL, runningTestsLocally, setAcceptCookies, verifyContainsText, verifyExactText, verifyIsNotVisible, verifyIsVisible, verifyTitleContainsText,
} from '../utils/helpers';
import { CRMGateway } from '../utils/crm/crm-gateway-test';
import { dynamicsWebApiClient } from '../utils/crm/dynamics-web-api';
import { createNewBookingInCrm } from '../utils/crm/crm-data-helper';
import { LoginPage } from '../pages/login-page';

const crmGateway = new CRMGateway(dynamicsWebApiClient());
const loginPage = new LoginPage();
const manageBookingPageUrl = `${process.env.BOOKING_APP_URL}/${loginPage.pathUrl}`;

fixture`Compensation tests - Request refund for a compensation theory test`
  .page(process.env.BOOKING_APP_URL)
  .before(async () => { await Constants.setRequestTimeout; })
  .beforeEach(async () => { await setAcceptCookies(); })
  .afterEach(async () => {
    const { sessionData } = t.ctx;
    if (!runningTestsLocally()) {
      if (sessionData.isCompensationBooking) {
        await crmGateway.setCompensationBookingAssigned(sessionData.currentBooking.bookingId, dayjs().toISOString());
        await crmGateway.setCompensationBookingRecognised(sessionData.currentBooking.bookingId, dayjs().toISOString());
      } else {
        await crmGateway.cleanUpBookingProductsByBookingRef(sessionData.currentBooking.bookingRef);
      }
    }
  })
  .meta('type', 'bulk-compensation');

const dataSetCompensationBookings = [
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

dataSetCompensationBookings.forEach((data) => {
  // eslint-disable-next-line testcafe-community/noIdenticalTitle
  test(`Verify user can request a refund for a compensation test - ${data.testName}`, async () => {
    // create compensation booking first
    const sessionData = new SessionData(data.target, data.locale, false, data.instructorBooking);
    t.ctx.sessionData = sessionData;
    sessionData.candidate.licenceNumber = data.drivingLicenceNumber;
    sessionData.isCompensationBooking = true;
    sessionData.currentBooking.origin = data.origin;

    if (data.nonStandardAccommodations) {
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
    }

    if (!runningTestsLocally()) {
      await createNewBookingInCrm(sessionData);
    }
    const { bookingRef } = sessionData.currentBooking;
    const { licenceNumber } = sessionData.candidate;

    await t.navigateTo(`${manageBookingPageUrl}?target=${data.target}`);
    await loginPage.login(bookingRef, licenceNumber);
    await verifyTitleContainsText(ManageBookingsPage.pageHeading);
    await verifyExactText(ManageBookingsPage.pageHeadingLocator, ManageBookingsPage.pageHeading);

    const requestRefundPage = await ManageBookingsPage.requestRefundForBookingReference(bookingRef);
    await verifyTitleContainsText(requestRefundPage.pageHeading);
    await verifyExactText(requestRefundPage.pageHeadingLocator, requestRefundPage.pageHeading);
    // check the link for booking a compensation test instead
    const expBookReplacementTestTargetURL = data.target === Target.GB ? 'gov.uk' : 'nidirect';
    const expBookReplacementTestInstructorURL = data.instructorBooking ? 'instructor' : '/';
    await clickLinkContainsURL(requestRefundPage.bookCompensationTestText, expBookReplacementTestTargetURL);
    await clickLinkContainsURL(requestRefundPage.bookCompensationTestText, expBookReplacementTestInstructorURL);

    const refundRequestedpage = await requestRefundPage.confirmRefundRequest();
    await verifyTitleContainsText(refundRequestedpage.pageHeading);
    await verifyIsVisible(refundRequestedpage.bookANewTestButtonLocator);
    await verifyExactText(refundRequestedpage.pageHeadingLocator, refundRequestedpage.pageHeading);
    await verifyContainsText(refundRequestedpage.refNumberLocator, refundRequestedpage.refNumberText);
    await verifyContainsText(refundRequestedpage.refNumberLocator, bookingRef);
    await verifyExactText(refundRequestedpage.bookANewTestButtonLocator, refundRequestedpage.bookANewTestButtonText);
    await verifyExactText(refundRequestedpage.changeAnotherBookingButtonLocator, refundRequestedpage.changeAnotherBookingButtonText);
    // check the link for booking a new test
    const expBookNewTestTargetURL = data.target === Target.GB ? 'gov.uk' : 'nidirect';
    const expBookNewTestInstructorURL = data.instructorBooking ? 'instructor' : '';
    await clickLinkContainsURL(refundRequestedpage.bookANewTestButtonText, expBookNewTestTargetURL);
    await clickLinkContainsURL(refundRequestedpage.bookANewTestButtonText, expBookNewTestInstructorURL);
    await refundRequestedpage.changeAnotherBooking();

    // verify refunded booking no longer appears in list of bookings
    await verifyContainsText(ManageBookingsPage.pageHeadingLocator, ManageBookingsPage.pageHeading);
    const changeButton = ManageBookingsPage.changeBookingWithReference.replace('<BookingReference>', bookingRef);
    const requestRefundLink = ManageBookingsPage.requestRefundLink.replace('<BookingReference>', bookingRef);
    await verifyIsNotVisible(changeButton);
    await verifyIsNotVisible(requestRefundLink);
  });
});
