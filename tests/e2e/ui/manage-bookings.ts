import { t } from 'testcafe';
import dayjs from 'dayjs';
import * as Constants from '../data/constants';
import {
  verifyExactText, runningTestsLocally, verifyIsNotVisible, verifyContainsText, getFutureDate, verifyTitleContainsText, verifyIsVisible, setAcceptCookies,
} from '../utils/helpers';
import ManageBookingsPage from '../pages/manage-bookings-page';
import { LoginPage } from '../pages/login-page';
import { ChangeBookingPage } from '../pages/change-booking-page';
import { Target } from '../../../src/domain/enums';
import { generalTitle } from '../data/constants';
import { SessionData } from '../data/session-data';
import { createNewBookingInCrm } from '../utils/crm/crm-data-helper';
import { dynamicsWebApiClient } from '../utils/crm/dynamics-web-api';
import { CRMGateway } from '../utils/crm/crm-gateway-test';

const crmGateway = new CRMGateway(dynamicsWebApiClient());
const loginPage = new LoginPage();
const changeBookingPage = new ChangeBookingPage();
const pageUrl = `${process.env.BOOKING_APP_URL}/${loginPage.pathUrl}`;

fixture`Manage bookings`
  .page(`${pageUrl}?target=${Target.GB}`)
  .before(async () => { await Constants.setRequestTimeout; })
  .beforeEach(async () => { await setAcceptCookies(); })
  .afterEach(async () => {
    const { sessionData } = t.ctx;
    if (!runningTestsLocally()) {
      const { bookingProductId } = sessionData.currentBooking;
      if (sessionData.compensationBooking) {
        await crmGateway.setCompensationBookingAssigned(sessionData.currentBooking.bookingId, null);
      } else {
        await crmGateway.cleanUpBookingProducts(bookingProductId);
      }
    }
  })
  .meta('type', 'manage-booking');

test('Verify page title, heading and UI contents of Manage bookings page', async () => {
  const sessionData = new SessionData(Target.GB);
  t.ctx.sessionData = sessionData;
  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
  }
  const { bookingRef } = sessionData.currentBooking;
  const { licenceNumber } = sessionData.candidate;
  await loginPage.login(bookingRef, licenceNumber);

  await verifyTitleContainsText(`${ManageBookingsPage.pageHeading} ${generalTitle}`);
  await verifyExactText(ManageBookingsPage.pageHeadingLocator, ManageBookingsPage.pageHeading);
  await verifyExactText(ManageBookingsPage.tableHead, ManageBookingsPage.column1, 0);
  await verifyExactText(ManageBookingsPage.tableHead, ManageBookingsPage.column2, 1);
  await verifyExactText(ManageBookingsPage.tableHead, ManageBookingsPage.column3, 2);
  await verifyExactText(ManageBookingsPage.tableHead, ManageBookingsPage.column4, 3);
  await verifyExactText(ManageBookingsPage.tableHead, ManageBookingsPage.column5, 4);
  await verifyContainsText(ManageBookingsPage.bookedLabel, 'BOOKED');
});

test('Verify selecting a booking goes to Change theory test booking page (GB)', async () => {
  const sessionData = new SessionData(Target.GB);
  t.ctx.sessionData = sessionData;
  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
  }
  const { bookingRef } = sessionData.currentBooking;
  const { licenceNumber } = sessionData.candidate;
  await loginPage.login(bookingRef, licenceNumber);

  await ManageBookingsPage.viewTestWithBookingReference(bookingRef);
  await verifyExactText(changeBookingPage.pageHeadingLocator, changeBookingPage.pageHeading);
});

test('Verify selecting a booking goes to Change theory test booking page (NI)', async () => {
  await t.navigateTo(`${pageUrl}?target=${Target.NI}`);
  const sessionData = new SessionData(Target.NI);
  t.ctx.sessionData = sessionData;
  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
  }
  const { bookingRef } = sessionData.currentBooking;
  const { licenceNumber } = sessionData.candidate;
  await loginPage.login(bookingRef, licenceNumber);

  await ManageBookingsPage.viewTestWithBookingReference(bookingRef);
  await verifyContainsText(changeBookingPage.pageHeadingLocator, changeBookingPage.pageHeading);
});

test('Verify Back link takes you to the Login page', async () => {
  const sessionData = new SessionData(Target.GB);
  t.ctx.sessionData = sessionData;
  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
  }
  const { bookingRef } = sessionData.currentBooking;
  const { licenceNumber } = sessionData.candidate;
  await loginPage.login(bookingRef, licenceNumber);

  await ManageBookingsPage.goBack();
  await verifyExactText(loginPage.pageHeadingLocator, loginPage.pageHeading);
});

const dataSetPreviousBookings = [
  {
    testName: 'Previously passed test',
    drivingLicence: Constants.drivingLicenceGBPrevPassed,
    target: Target.GB,
  },
  {
    testName: 'Previously failed test',
    drivingLicence: Constants.drivingLicenceGBPrevFailed,
    target: Target.GB,
  },
];

const dataSetSingleBookings = [
  {
    testName: 'GB Booking',
    drivingLicence: Constants.drivingLicenceGBSingleBooking,
    target: Target.GB,
  },
  {
    testName: 'NI Booking',
    drivingLicence: Constants.drivingLicenceNISingleBooking,
    target: Target.NI,
  },
  {
    testName: 'CSC Booking',
    drivingLicence: Constants.drivingLicenceGBCSCBookingSuccess,
    target: Target.GB,
  },
];

const dataSetMultipleBookings = [
  {
    testName: 'GB Bookings',
    drivingLicence: Constants.drivingLicenceGBMultipleBookings,
    target: Target.GB,
  },
  {
    testName: 'NI Bookings',
    drivingLicence: Constants.drivingLicenceNIMultipleBookings,
    target: Target.NI,
  },
];

// More in depth tests to run against locally mocked data
if (runningTestsLocally()) {
  dataSetPreviousBookings.forEach((data) => {
    // eslint-disable-next-line testcafe-community/noIdenticalTitle
    test(`Verify when only previous bookings are available, no tests are shown - ${data.testName}`, async () => {
      await t.navigateTo(`${pageUrl}?target=${data.target}`);
      await loginPage.login(Constants.bookingReference1, data.drivingLicence);
      await verifyExactText(ManageBookingsPage.pageHeadingLocator, ManageBookingsPage.pageHeading);
      await verifyIsNotVisible(ManageBookingsPage.table);
    });
  });

  dataSetSingleBookings.forEach((data) => {
    // eslint-disable-next-line testcafe-community/noIdenticalTitle
    test(`Verify a single future test is shown correctly - ${data.testName}`, async () => {
      await t.navigateTo(`${pageUrl}?target=${data.target}`);
      await loginPage.login(Constants.bookingReference1, data.drivingLicence);
      await checkTableData(1, 'Car', 'month', 4, Constants.bookingReference1);
    });
  });

  dataSetMultipleBookings.forEach((data) => {
    // eslint-disable-next-line testcafe-community/noIdenticalTitle
    test(`Verify multiple future tests are shown correctly by date ascending - ${data.testName}`, async () => {
      await t.navigateTo(`${pageUrl}?target=${data.target}`);
      await loginPage.login(Constants.bookingReference1, data.drivingLicence);

      // row 1
      await checkTableData(1, 'Car', 'hour', 1, Constants.bookingReference3);

      // row 2
      await checkTableData(2, 'Car', 'day', 1, Constants.bookingReference1);

      // row 3
      await checkTableData(3, 'Motorcycle', 'day', 3, Constants.bookingReference2);

      // row 4
      await checkTableData(4, 'PCV - hazard perception', 'month', 4, Constants.bookingReference4);
    });
  });

  test('Verify the user can see an information banner about a failed booking reference in \'Change In Progress\' status (from a previously failed reschedule)', async () => {
    await t.navigateTo(`${pageUrl}?target=${Target.GB}`);
    await loginPage.login(Constants.bookingReference4, Constants.drivingLicenceErrorHandling);

    await verifyIsVisible(ManageBookingsPage.bookingsWithErrorsBanner);
    await verifyExactText(ManageBookingsPage.bookingsWithErrorsBannerTitle, 'Important');
    await verifyExactText(ManageBookingsPage.bookingsWithErrorsBannerHeader, ManageBookingsPage.infoBannerHeaderText);
    await verifyContainsText(ManageBookingsPage.bookingsWithErrorsBannerBookingRefList, Constants.bookingReference4);
  });
}

async function checkTableData(rowNumber: number, expTestType: string, unitInFuture: dayjs.OpUnitType, valueInFuture: number, bookingRef: string) {
  const rowOffset = (rowNumber - 1) * 4;
  await verifyContainsText(ManageBookingsPage.tableCell, expTestType, ManageBookingsPage.TEST_TYPE_INDEX + rowOffset);
  const testDate = getFutureDate(unitInFuture, valueInFuture);
  const expTestTime = testDate.format('h:mma');
  const expTestDate = testDate.format('D MMMM YYYY');
  await verifyContainsText(ManageBookingsPage.tableCell, expTestTime, ManageBookingsPage.TEST_DATE_INDEX + rowOffset);
  await verifyContainsText(ManageBookingsPage.tableCell, expTestDate, ManageBookingsPage.TEST_DATE_INDEX + rowOffset);
  await verifyContainsText(ManageBookingsPage.tableCell, bookingRef, ManageBookingsPage.BOOKING_REFERENCE_INDEX + rowOffset);
  await verifyContainsText(ManageBookingsPage.tableCell, 'BOOKED', ManageBookingsPage.STATUS_INDEX + rowOffset);
  await verifyContainsText(ManageBookingsPage.tableCell, 'View booking', ManageBookingsPage.ACTIONS_INDEX + rowOffset);
}
