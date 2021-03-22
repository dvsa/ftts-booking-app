import { t } from 'testcafe';
import * as dayjs from 'dayjs';
import * as Constants from '../data/constants';
import {
  verifyExactText, runningTestsLocally, verifyIsNotVisible, verifyContainsText, getFutureDate, verifyTitleContainsText, verifyIsVisible,
} from '../utils/helpers';
import { ManageBookingsPage } from '../pages/manage-bookings-page';
import { LoginPage } from '../pages/login-page';
import { ChangeBookingPage } from '../pages/change-booking-page';
import { TARGET } from '../../../src/domain/enums';
import { generalTitle } from '../data/constants';

const loginPage = new LoginPage();
const manageBookingsPage = new ManageBookingsPage();
const changeBookingPage = new ChangeBookingPage();
const pageUrl = `${process.env.BOOKING_APP_URL}/${loginPage.pathUrl}`;

const { drivingLicenceGB } = Constants;
const { drivingLicenceNI } = Constants;
const bookingRefGB = runningTestsLocally() ? Constants.bookingReference1 : Constants.bookingReferenceGB;
const bookingRefNI = runningTestsLocally() ? Constants.bookingReference1 : Constants.bookingReferenceNI;

fixture`Manage bookings`
  .page(pageUrl)
  .before(async () => { await Constants.setRequestTimeout; })
  .meta('type', 'regression');

test('Verify page title, heading and UI contents of Manage bookings page', async () => {
  await loginPage.login(bookingRefGB, drivingLicenceGB);
  await verifyTitleContainsText(`${manageBookingsPage.pageTitle} ${generalTitle}`);
  await verifyExactText(manageBookingsPage.pageTitleLocator, manageBookingsPage.pageTitle);
  await verifyContainsText(manageBookingsPage.contentLocator, 'You have', 0);
  await verifyContainsText(manageBookingsPage.contentLocator, 'theory tests booked.', 0);
  await verifyExactText(manageBookingsPage.contentLocator, manageBookingsPage.bookAnotherTestText, 1);
  await verifyExactText(manageBookingsPage.tableHead, manageBookingsPage.column1, 0);
  await verifyExactText(manageBookingsPage.tableHead, manageBookingsPage.column2, 1);
  await verifyExactText(manageBookingsPage.tableHead, manageBookingsPage.column3, 2);
  await verifyExactText(manageBookingsPage.buttonViewLocator, manageBookingsPage.buttonView, 0);
});

test('Verify selecting a booking goes to Change theory test booking page (GB)', async () => {
  await loginPage.login(bookingRefGB, drivingLicenceGB);

  await manageBookingsPage.viewTestWithBookingReference(bookingRefGB);
  await verifyExactText(changeBookingPage.pageTitleLocator, changeBookingPage.pageHeading);
});

test('Verify selecting a booking goes to Change theory test booking page (NI)', async () => {
  await t.navigateTo(`${pageUrl}?target=${TARGET.NI}`);
  await loginPage.login(bookingRefNI, drivingLicenceNI);

  await manageBookingsPage.viewTestWithBookingReference(bookingRefNI);
  await verifyExactText(changeBookingPage.pageTitleLocator, changeBookingPage.pageHeading);
});

test('Verify link to book another theory test takes you to the \'Get the right support page\'', async () => {
  await loginPage.login(bookingRefGB, drivingLicenceGB);

  const chooseSupportPage = await manageBookingsPage.bookAnotherTest();
  await verifyExactText(chooseSupportPage.pageTitleLocator, chooseSupportPage.pageHeading);
});

test('Verify Back link takes you to the Login page', async () => {
  await loginPage.login(bookingRefGB, drivingLicenceGB);

  await manageBookingsPage.goBack();
  await verifyExactText(loginPage.pageTitleLocator, loginPage.pageHeading);
});

const dataSetPreviousBookings = [
  {
    testName: 'Previously passed test',
    drivingLicence: Constants.drivingLicenceGBPrevPassed,
    target: TARGET.GB,
  },
  {
    testName: 'Previously failed test',
    drivingLicence: Constants.drivingLicenceGBPrevFailed,
    target: TARGET.GB,
  },
];

const dataSetSingleBookings = [
  {
    testName: 'GB Booking',
    drivingLicence: Constants.drivingLicenceGBSingleBooking,
    target: TARGET.GB,
  },
  {
    testName: 'NI Booking',
    drivingLicence: Constants.drivingLicenceNISingleBooking,
    target: TARGET.NI,
  },
  {
    testName: 'CSC Booking',
    drivingLicence: Constants.drivingLicenceGBCSCBookingSuccess,
    target: TARGET.GB,
  },
];

const dataSetMultipleBookings = [
  {
    testName: 'GB Bookings',
    drivingLicence: Constants.drivingLicenceGBMultipleBookings,
    target: TARGET.GB,
  },
  {
    testName: 'NI Bookings',
    drivingLicence: Constants.drivingLicenceNIMultipleBookings,
    target: TARGET.NI,
  },
];

// More in depth tests to run against locally mocked data
if (runningTestsLocally()) {
  dataSetPreviousBookings.forEach((data) => {
    test(`Verify when only previous bookings are available, no tests are shown - ${data.testName}`, async () => {
      await t.navigateTo(`${pageUrl}?target=${data.target}`);
      await loginPage.login(Constants.bookingReference1, data.drivingLicence);
      await verifyExactText(manageBookingsPage.pageTitleLocator, manageBookingsPage.pageTitle);
      const expText = manageBookingsPage.theoryTestsText.replace('X', 'no');
      await verifyExactText(manageBookingsPage.contentLocator, expText, 0);
      await verifyIsNotVisible(manageBookingsPage.table);
      await verifyTitleContainsText(`${expText} ${generalTitle}`);
    });
  });

  dataSetSingleBookings.forEach((data) => {
    test(`Verify a single future test is shown correctly - ${data.testName}`, async () => {
      await t.navigateTo(`${pageUrl}?target=${data.target}`);
      await loginPage.login(Constants.bookingReference1, data.drivingLicence);
      const expText = manageBookingsPage.theoryTestsText.replace('X', '1');
      await verifyExactText(manageBookingsPage.contentLocator, expText, 0);

      await checkTableData(1, 'Car', 'month', 1, Constants.bookingReference1);
    });
  });

  dataSetMultipleBookings.forEach((data) => {
    test(`Verify multiple future tests are shown correctly by date ascending - ${data.testName}`, async () => {
      await t.navigateTo(`${pageUrl}?target=${data.target}`);
      await loginPage.login(Constants.bookingReference1, data.drivingLicence);
      const expText = manageBookingsPage.theoryTestsText.replace('X', '3');
      await verifyExactText(manageBookingsPage.contentLocator, expText, 0);

      // row 1
      await checkTableData(1, 'Car', 'hour', 1, Constants.bookingReference3);

      // row 2
      await checkTableData(2, 'Car', 'day', 1, Constants.bookingReference1);

      // row 3
      await checkTableData(3, 'Motorcycle', 'day', 3, Constants.bookingReference2);
    });
  });

  test('Verify the user can see an information banner about a failed booking reference in \'Change In Progress\' status (from a previously failed reschedule)', async () => {
    await t.navigateTo(`${pageUrl}?target=${TARGET.GB}`);
    await loginPage.login(Constants.bookingReference4, Constants.drivingLicenceErrorHandling);

    const expText = manageBookingsPage.theoryTestsText.replace('X', 'no');
    await verifyExactText(manageBookingsPage.contentLocator, expText, 0);

    await verifyIsVisible(manageBookingsPage.infoBanner);
    await verifyExactText(manageBookingsPage.infoBanner, 'Important');
    await verifyExactText(manageBookingsPage.infoBannerHeader, manageBookingsPage.infoBannerHeaderText);
    await verifyContainsText(manageBookingsPage.infoBannerBookingRefList, Constants.bookingReference4);
  });
}

async function checkTableData(rowNumber: number, expTestType: string, unitInFuture: dayjs.OpUnitType, valueInFuture: number, bookingRef: string) {
  const rowOffset = (rowNumber - 1) * 4;
  await verifyContainsText(manageBookingsPage.tableCell, expTestType, manageBookingsPage.TEST_TYPE_INDEX + rowOffset);
  const testDate = getFutureDate(unitInFuture, valueInFuture);
  const expTestTime = testDate.format('h:mma');
  const expTestDate = testDate.format('D MMMM YYYY');
  await verifyContainsText(manageBookingsPage.tableCell, expTestTime, manageBookingsPage.TEST_DATE_INDEX + rowOffset);
  await verifyContainsText(manageBookingsPage.tableCell, expTestDate, manageBookingsPage.TEST_DATE_INDEX + rowOffset);
  await verifyContainsText(manageBookingsPage.tableCell, bookingRef, manageBookingsPage.BOOKING_REFERENCE_INDEX + rowOffset);
  await verifyExactText(manageBookingsPage.tableCell, manageBookingsPage.buttonView, manageBookingsPage.CHANGE_TEST_INDEX + rowOffset);
}
