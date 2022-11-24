/* eslint-disable security/detect-non-literal-regexp */
import { Selector } from 'testcafe';
import * as Constants from '../data/constants';
import { ChangeBookingPage } from '../pages/change-booking-page';
import { LoginPage } from '../pages/login-page';
import ManageBookingsPage from '../pages/manage-bookings-page';
import { SessionData } from '../data/session-data';
import {
  click, getFutureDate, link, runningTestsLocally, setAcceptCookies, verifyContainsText, verifyExactText, verifyIsNotVisible, verifyIsVisible, verifyTitleContainsText,
} from '../utils/helpers';
import { Target } from '../../../src/domain/enums';
import { WhatDoYouWantToChangePage } from '../pages/what-do-you-want-to-change-page';
import { CheckChangePage } from '../pages/check-change-page';
import { ChangeConfirmedPage } from '../pages/change-confirmed-page';
import { createNewBookingInCrm } from '../utils/crm/crm-data-helper';
import { dynamicsWebApiClient } from '../utils/crm/dynamics-web-api';
import { CRMGateway } from '../utils/crm/crm-gateway-test';

const crmGateway = new CRMGateway(dynamicsWebApiClient());

const changeBookingPage = new ChangeBookingPage();
const loginPage = new LoginPage();
const whatDoYouWantToChangePage = new WhatDoYouWantToChangePage();
const checkChangePage = new CheckChangePage();
const changeConfirmedPage = new ChangeConfirmedPage();
const pageUrl = `${process.env.BOOKING_APP_URL}/${loginPage.pathUrl}`;

fixture`Reschedule booking - GB`
  .page(process.env.BOOKING_APP_URL)
  .before(async () => { await Constants.setRequestTimeout; })
  .beforeEach(async (t) => {
    await setAcceptCookies();
    const sessionData = new SessionData(Target.GB);
    if (!runningTestsLocally()) {
      await createNewBookingInCrm(sessionData);
    }
    t.ctx.sessionData = sessionData;

    const { bookingRef } = sessionData.currentBooking;
    const drivingLicence = sessionData.candidate.licenceNumber;
    await t.navigateTo(`${pageUrl}?target=${Target.GB}`);
    await loginPage.login(bookingRef, drivingLicence);
    await ManageBookingsPage.viewTestWithBookingReference(bookingRef);
    await changeBookingPage.rescheduleTest();
  })
  .afterEach(async (t) => {
    const { sessionData } = t.ctx;
    if (!runningTestsLocally()) {
      const { bookingProductId } = sessionData.currentBooking;
      await crmGateway.cleanUpBookingProducts(bookingProductId);
    }
  })
  .meta('type', 'manage-booking');

test('Reschedule time date location - What do you want to change page - the correct content is displayed', async (t) => {
  await verifyTitleContainsText(`${whatDoYouWantToChangePage.pageHeading} ${Constants.generalTitle}`);
  await verifyExactText(whatDoYouWantToChangePage.pageHeadingLocator, whatDoYouWantToChangePage.pageHeading);

  await verifyIsNotVisible(whatDoYouWantToChangePage.backLink);

  await verifyExactText(whatDoYouWantToChangePage.hintLocator, whatDoYouWantToChangePage.hintText);
  await verifyExactText(whatDoYouWantToChangePage.timeOnlyHintLocator, whatDoYouWantToChangePage.timeOnlyHintText);
  await verifyExactText(whatDoYouWantToChangePage.timeAndDateOnlyHintLocator, whatDoYouWantToChangePage.timeAndDateOnlyHintText);
  await verifyExactText(whatDoYouWantToChangePage.locationOnlyHintLocator, whatDoYouWantToChangePage.locationOnlyHintText);
  await verifyExactText(whatDoYouWantToChangePage.changeAndContinueButton, whatDoYouWantToChangePage.changeAndContinueButtonText);
  await verifyExactText(whatDoYouWantToChangePage.cancelAndKeepYourSelectionButton, whatDoYouWantToChangePage.cancelAndKeepYourSelectionButtonText);

  await t.expect(Selector(whatDoYouWantToChangePage.changeTimeOnlyOption).checked).notOk();
  await t.expect(Selector(whatDoYouWantToChangePage.changeTimeAndDateOption).checked).notOk();
  await t.expect(Selector(whatDoYouWantToChangePage.changeLocationOption).checked).notOk();
});

test('Reschedule time date location - What do you want to change page - cancel using the button at the bottom, the original time date location is kept', async (t) => {
  const { sessionData } = t.ctx;

  await link(whatDoYouWantToChangePage.cancelAndKeepYourSelectionButtonText);
  await changeBookingPage.checkDataMatchesSession(sessionData);
});

test('Reschedule time date location - What do you want to change page - Verify the user is unable to proceed without selecting a test time date or location and an error message is displayed', async () => {
  await click(whatDoYouWantToChangePage.changeAndContinueButton);
  await verifyExactText(whatDoYouWantToChangePage.errorMessageLocator, whatDoYouWantToChangePage.errorMessageHeader);
  await verifyExactText(whatDoYouWantToChangePage.errorMessageList, whatDoYouWantToChangePage.errorMessageText);
  await verifyContainsText(whatDoYouWantToChangePage.errorMessageRadioLocator, whatDoYouWantToChangePage.errorMessageText);

  await verifyTitleContainsText('Error');
  await verifyTitleContainsText(`${whatDoYouWantToChangePage.pageHeading} ${Constants.generalTitle}`);
  await verifyIsVisible(whatDoYouWantToChangePage.errorLink);
  await whatDoYouWantToChangePage.clickErrorLink();
});

test('Reschedule time date location - change time and then decide to cancel the change - verify the old time, date and location is displayed', async (t) => {
  const { sessionData } = t.ctx;
  const prevSessionData = sessionData.snapshot();

  const chooseAppointmentPage = await whatDoYouWantToChangePage.selectTimeOnly();
  await chooseAppointmentPage.chooseAppointment(sessionData.currentBooking, 1);

  // check the change page
  await verifyTitleContainsText(`${checkChangePage.pageHeading} ${Constants.generalTitle}`);
  await verifyExactText(checkChangePage.pageHeadingLocator, checkChangePage.pageHeading);
  await checkChangePage.checkUpdatedTestDateTimeLocation(sessionData);
  await checkChangePage.cancelChange();

  await changeBookingPage.checkDataMatchesSession(prevSessionData);
});

test('Reschedule time date location - change time and confirm the change - verify the new time and old date and location is displayed', async (t) => {
  const { sessionData } = t.ctx;

  const chooseAppointmentPage = await whatDoYouWantToChangePage.selectTimeOnly();
  await chooseAppointmentPage.chooseAppointment(sessionData.currentBooking, 1);

  // check the change page
  await verifyTitleContainsText(`${checkChangePage.pageHeading} ${Constants.generalTitle}`);
  await verifyExactText(checkChangePage.pageHeadingLocator, checkChangePage.pageHeading);
  await checkChangePage.checkUpdatedTestDateTimeLocation(sessionData);
  await checkChangePage.confirmChange();

  // confirmation page
  await changeConfirmedPage.checkBookingUpdatedConfirmationPage(sessionData);
});

test('Reschedule time date location - change date, time and confirm the change - verify new date and time and old location is displayed', async (t) => {
  const { sessionData } = t.ctx;

  const preferredDatePage = await whatDoYouWantToChangePage.selectTimeAndDateOnly();
  await verifyExactText(preferredDatePage.dayTextBox, '');
  await verifyExactText(preferredDatePage.monthTextBox, '');
  await verifyExactText(preferredDatePage.yearTextBox, '');
  const newTestDate = preferredDatePage.adjustForDaysWithNoSlots(getFutureDate('month', 5));
  const chooseAppointmentPage = await preferredDatePage.enterPreferredDateAndSubmit(
    newTestDate.date().toString(),
    (newTestDate.month() + 1).toString(),
    newTestDate.year().toString(),
  );
  await chooseAppointmentPage.chooseAppointment(sessionData.currentBooking);

  // check the change page
  await verifyTitleContainsText(`${checkChangePage.pageHeading} ${Constants.generalTitle}`);
  await verifyExactText(checkChangePage.pageHeadingLocator, checkChangePage.pageHeading);
  await checkChangePage.checkUpdatedTestDateTimeLocation(sessionData);
  await checkChangePage.confirmChange();

  // confirmation page
  await changeConfirmedPage.checkBookingUpdatedConfirmationPage(sessionData);
});

test('Reschedule time date location - change location, date, time and confirm the change - verify the new location, date and time is displayed', async (t) => {
  const { sessionData } = t.ctx;

  const findTheoryTestCentrePage = await whatDoYouWantToChangePage.selectLocationOnly();
  await verifyExactText(findTheoryTestCentrePage.searchLocationTermTextBox, '');
  const chooseTheoryTestCentrePage = await findTheoryTestCentrePage.findATheoryTestCentre(sessionData.testCentreSearch.searchQuery);
  const preferredDatePage = await chooseTheoryTestCentrePage.selectANewTestCentre(sessionData.currentBooking.centre);
  await verifyExactText(preferredDatePage.dayTextBox, '');
  await verifyExactText(preferredDatePage.monthTextBox, '');
  await verifyExactText(preferredDatePage.yearTextBox, '');
  const chooseAppointmentPage = await preferredDatePage.selectPreferredDateWithAppointments(sessionData.testCentreSearch);
  await chooseAppointmentPage.chooseAppointment(sessionData.currentBooking);

  // check the change page
  await verifyTitleContainsText(`${checkChangePage.pageHeading} ${Constants.generalTitle}`);
  await verifyExactText(checkChangePage.pageHeadingLocator, checkChangePage.pageHeading);
  await checkChangePage.checkUpdatedTestDateTimeLocation(sessionData);
  await checkChangePage.confirmChange();

  // confirmation page
  await changeConfirmedPage.checkBookingUpdatedConfirmationPage(sessionData);
});

test('Reschedule time date location - go to change the time slot page but later decide to change location, date and time', async (t) => {
  const { sessionData } = t.ctx;

  const chooseAppointmentPage = await whatDoYouWantToChangePage.selectTimeOnly();
  const findTheoryTestCentrePage = await chooseAppointmentPage.changeTestCentre();
  await verifyExactText(findTheoryTestCentrePage.searchLocationTermTextBox, '');
  const chooseTheoryTestCentrePage = await findTheoryTestCentrePage.findATheoryTestCentre(sessionData.testCentreSearch.searchQuery);
  const preferredDatePage = await chooseTheoryTestCentrePage.selectANewTestCentre(sessionData.currentBooking.centre);
  await verifyExactText(preferredDatePage.dayTextBox, '');
  await verifyExactText(preferredDatePage.monthTextBox, '');
  await verifyExactText(preferredDatePage.yearTextBox, '');
  const chooseAppointmentPageAgain = await preferredDatePage.selectPreferredDateWithAppointments(sessionData.testCentreSearch);
  await chooseAppointmentPageAgain.chooseAppointment(sessionData.currentBooking, 1);

  // check the change page
  await verifyTitleContainsText(`${checkChangePage.pageHeading} ${Constants.generalTitle}`);
  await verifyExactText(checkChangePage.pageHeadingLocator, checkChangePage.pageHeading);
  await checkChangePage.checkUpdatedTestDateTimeLocation(sessionData);
  await checkChangePage.confirmChange();

  // confirmation page
  await changeConfirmedPage.checkBookingUpdatedConfirmationPage(sessionData);
});

test('Reschedule time date location - change date and time then decide to cancel the change - verify the old time, date and location is displayed', async (t) => {
  const { sessionData } = t.ctx;
  const prevSessionData = sessionData.snapshot();

  const preferredDatePage = await whatDoYouWantToChangePage.selectTimeAndDateOnly();
  await verifyExactText(preferredDatePage.dayTextBox, '');
  await verifyExactText(preferredDatePage.monthTextBox, '');
  await verifyExactText(preferredDatePage.yearTextBox, '');
  const newTestDate = preferredDatePage.adjustForDaysWithNoSlots(getFutureDate('month', 5));
  const chooseAppointmentPage = await preferredDatePage.enterPreferredDateAndSubmit(
    newTestDate.date().toString(),
    (newTestDate.month() + 1).toString(),
    newTestDate.year().toString(),
  );
  await chooseAppointmentPage.chooseAppointment(sessionData.currentBooking);

  // check the change page
  await verifyTitleContainsText(`${checkChangePage.pageHeading} ${Constants.generalTitle}`);
  await verifyExactText(checkChangePage.pageHeadingLocator, checkChangePage.pageHeading);
  await checkChangePage.checkUpdatedTestDateTimeLocation(sessionData);
  await checkChangePage.cancelChange();

  await changeBookingPage.checkDataMatchesSession(prevSessionData);
});

test('Reschedule time date location - change time - verify back link takes you to the What do you want to change? page', async () => {
  const chooseAppointmentPage = await whatDoYouWantToChangePage.selectTimeOnly();
  await chooseAppointmentPage.goBack();
  await verifyTitleContainsText(`${whatDoYouWantToChangePage.pageHeading} ${Constants.generalTitle}`);
  await verifyExactText(whatDoYouWantToChangePage.pageHeadingLocator, whatDoYouWantToChangePage.pageHeading);
});

test('Reschedule time date location - change date - verify back link takes you to the What do you want to change? page', async () => {
  const preferredDatePage = await whatDoYouWantToChangePage.selectTimeAndDateOnly();
  await preferredDatePage.goBack();
  await verifyTitleContainsText(`${whatDoYouWantToChangePage.pageHeading} ${Constants.generalTitle}`);
  await verifyExactText(whatDoYouWantToChangePage.pageHeadingLocator, whatDoYouWantToChangePage.pageHeading);
});

test('Reschedule time date location - change location - verify back link takes you to the What do you want to change? page', async () => {
  const findTheoryTestCentrePage = await whatDoYouWantToChangePage.selectLocationOnly();
  await findTheoryTestCentrePage.goBack();
  await verifyTitleContainsText(`${whatDoYouWantToChangePage.pageHeading} ${Constants.generalTitle}`);
  await verifyExactText(whatDoYouWantToChangePage.pageHeadingLocator, whatDoYouWantToChangePage.pageHeading);
});

test('Reschedule time date location - after confirmation of change, verify we can then go and make another change to the same booking', async (t) => {
  const { sessionData } = t.ctx;

  const chooseAppointmentPage = await whatDoYouWantToChangePage.selectTimeOnly();
  await chooseAppointmentPage.chooseAppointment(sessionData.currentBooking, 1);

  // check the change page
  await verifyTitleContainsText(`${checkChangePage.pageHeading} ${Constants.generalTitle}`);
  await verifyExactText(checkChangePage.pageHeadingLocator, checkChangePage.pageHeading);
  await checkChangePage.checkUpdatedTestDateTimeLocation(sessionData);
  await checkChangePage.confirmChange();

  // confirmation page
  await changeConfirmedPage.checkBookingUpdatedConfirmationPage(sessionData);
  await click(changeConfirmedPage.makeAnotherChangeButton);

  // back on change booking page
  await verifyExactText(changeBookingPage.pageHeadingLocator, changeBookingPage.pageHeading);
  await verifyContainsText(changeBookingPage.warningMessageLocator, changeBookingPage.refundWarningMessageText);

  // check new confirmed changes are now displayed
  if (!runningTestsLocally()) {
    await changeBookingPage.checkDataMatchesSession(sessionData);
  }
});

test('Reschedule time date location - after confirmation of change, verify we can then go back to the list of all bookings', async (t) => {
  const { sessionData } = t.ctx;

  const chooseAppointmentPage = await whatDoYouWantToChangePage.selectTimeOnly();
  await chooseAppointmentPage.chooseAppointment(sessionData.currentBooking, 1);

  // check the change page
  await verifyTitleContainsText(`${checkChangePage.pageHeading} ${Constants.generalTitle}`);
  await verifyExactText(checkChangePage.pageHeadingLocator, checkChangePage.pageHeading);
  await checkChangePage.checkUpdatedTestDateTimeLocation(sessionData);
  await checkChangePage.confirmChange();

  // confirmation page
  await changeConfirmedPage.checkBookingUpdatedConfirmationPage(sessionData);
  await click(changeConfirmedPage.viewAllBookingsButton);

  // back on manage bookings page
  await verifyExactText(ManageBookingsPage.pageHeadingLocator, ManageBookingsPage.pageHeading);
});

test('Reschedule time date location - confirm reschedule and verify new booking details have been saved', async (t) => {
  const { sessionData } = t.ctx;

  const findTheoryTestCentrePage = await whatDoYouWantToChangePage.selectLocationOnly();
  const chooseTheoryTestCentrePage = await findTheoryTestCentrePage.findATheoryTestCentre(sessionData.testCentreSearch.searchQuery);
  const preferredDatePage = await chooseTheoryTestCentrePage.selectANewTestCentre(sessionData.currentBooking.centre);
  const chooseAppointmentPageAgain = await preferredDatePage.selectPreferredDateWithAppointments(sessionData.testCentreSearch);
  await chooseAppointmentPageAgain.chooseAppointment(sessionData.currentBooking, 1);

  // check the change page
  await verifyExactText(checkChangePage.pageHeadingLocator, checkChangePage.pageHeading);
  await checkChangePage.checkUpdatedTestDateTimeLocation(sessionData);
  await checkChangePage.confirmChange();

  // confirmation page
  await changeConfirmedPage.checkBookingUpdatedConfirmationPage(sessionData);
  await click(changeConfirmedPage.viewAllBookingsButton);
  await ManageBookingsPage.viewTestWithBookingReference(sessionData.currentBooking.bookingRef);

  // check new confirmed changes are now displayed
  if (!runningTestsLocally()) {
    await changeBookingPage.checkDataMatchesSession(sessionData);
  }
});
