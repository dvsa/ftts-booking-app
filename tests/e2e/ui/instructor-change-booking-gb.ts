import * as Constants from '../data/constants';
import {
  Locale, Origin, PreferredDay, PreferredLocation, SupportType, Target, TestType, Voiceover,
} from '../../../src/domain/enums';
import {
  click,
  runningTestsLocally, setAcceptCookies, verifyContainsText, verifyNoValue, verifyTitleContainsText, verifyValue,
} from '../utils/helpers';
import { CRMGateway } from '../utils/crm/crm-gateway-test';
import { dynamicsWebApiClient } from '../utils/crm/dynamics-web-api';
import { SessionData } from '../data/session-data';
import { LoginPage } from '../pages/login-page';
import { createNewBookingInCrm } from '../utils/crm/crm-data-helper';
import ManageBookingsPage from '../pages/manage-bookings-page';
import { ChangeBookingPage } from '../pages/change-booking-page';
import { CheckChangePage } from '../pages/check-change-page';
import { ChangeConfirmedPage } from '../pages/change-confirmed-page';
import { CRMTestSupportNeed } from '../../../src/services/crm-gateway/enums';

const crmGateway = new CRMGateway(dynamicsWebApiClient());
const loginPage = new LoginPage();
const changeBookingPage = new ChangeBookingPage();
const checkChangePage = new CheckChangePage();
const changeConfirmedPage = new ChangeConfirmedPage();
const pageUrl = `${process.env.BOOKING_APP_URL}/${loginPage.pathUrl}`;

fixture`Instructor - Change Booking - GB`
  .page(`${pageUrl}?target=${Target.GB}`)
  .before(async () => { await Constants.setRequestTimeout; })
  .beforeEach(async () => { await setAcceptCookies(); })
  .afterEach(async (t) => {
    const { sessionData } = t.ctx;
    if (!runningTestsLocally()) {
      const { bookingProductId } = sessionData.currentBooking;
      await crmGateway.cleanUpBookingProducts(bookingProductId);
    }
  })
  .meta('type', 'instructor');

test('Verify the UI contents of Change booking page for tests greater than 3 days away for an instructor - ADI P1', async (t) => {
  const sessionData = new SessionData(Target.GB, Locale.GB, false, true);
  sessionData.currentBooking.testType = TestType.ADIP1;
  sessionData.candidate.personalReferenceNumber = '321971';
  t.ctx.sessionData = sessionData;

  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
  } else {
    sessionData.currentBooking.bookingRef = 'A-000-000-001';
  }

  const { bookingRef } = sessionData.currentBooking;
  const { licenceNumber } = sessionData.candidate;
  await loginPage.login(bookingRef, licenceNumber);
  await ManageBookingsPage.viewTestWithBookingReference(bookingRef);
  await verifyTitleContainsText(changeBookingPage.pageHeading);
  await verifyContainsText(changeBookingPage.pageHeadingLocator, changeBookingPage.pageHeading);
  await verifyContainsText(changeBookingPage.warningMessageLocator, changeBookingPage.refundWarningMessageText);
  await changeBookingPage.checkDataMatchesSession(sessionData);
  await changeBookingPage.checkChangeActions(sessionData, Constants.ManageBookingActionTypes.STANDARD_BOOKING);
});

test('Verify the UI contents of Change booking page for tests greater than 3 days away for an instructor - ADI HPT', async (t) => {
  const sessionData = new SessionData(Target.GB, Locale.GB, false, true);
  sessionData.currentBooking.testType = TestType.ADIHPT;
  sessionData.candidate.personalReferenceNumber = '859736';
  t.ctx.sessionData = sessionData;

  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
  } else {
    sessionData.currentBooking.bookingRef = 'A-000-000-002';
  }

  const { bookingRef } = sessionData.currentBooking;
  const { licenceNumber } = sessionData.candidate;
  await loginPage.login(bookingRef, licenceNumber);
  await ManageBookingsPage.viewTestWithBookingReference(bookingRef);
  await verifyTitleContainsText(changeBookingPage.pageHeading);
  await verifyContainsText(changeBookingPage.pageHeadingLocator, changeBookingPage.pageHeading);
  await verifyContainsText(changeBookingPage.warningMessageLocator, changeBookingPage.refundWarningMessageText);
  await changeBookingPage.checkDataMatchesSession(sessionData);
  await changeBookingPage.checkChangeActions(sessionData, Constants.ManageBookingActionTypes.STANDARD_BOOKING);
});

test('Verify the UI contents of Change booking page for tests greater than 3 days away for an instructor - ERS', async (t) => {
  const sessionData = new SessionData(Target.GB, Locale.GB, false, true);
  sessionData.currentBooking.testType = TestType.ERS;
  sessionData.candidate.personalReferenceNumber = '621309';
  t.ctx.sessionData = sessionData;

  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
  } else {
    sessionData.currentBooking.bookingRef = 'A-000-000-003';
  }

  const { bookingRef } = sessionData.currentBooking;
  const { licenceNumber } = sessionData.candidate;
  await loginPage.login(bookingRef, licenceNumber);
  await ManageBookingsPage.viewTestWithBookingReference(bookingRef);
  await verifyTitleContainsText(changeBookingPage.pageHeading);
  await verifyContainsText(changeBookingPage.pageHeadingLocator, changeBookingPage.pageHeading);
  await verifyContainsText(changeBookingPage.warningMessageLocator, changeBookingPage.refundWarningMessageText);
  await changeBookingPage.checkDataMatchesSession(sessionData);
  await changeBookingPage.checkChangeActions(sessionData, Constants.ManageBookingActionTypes.STANDARD_BOOKING);
});

test('Verify an ADI P1 instructor can change the voiceover to welsh', async (t) => {
  const sessionData = new SessionData(Target.GB, Locale.GB, false, true);
  sessionData.currentBooking.testType = TestType.ADIP1;
  sessionData.candidate.personalReferenceNumber = '321971';
  t.ctx.sessionData = sessionData;

  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
  } else {
    sessionData.currentBooking.bookingRef = 'A-000-000-001';
  }

  sessionData.currentBooking.voiceover = Voiceover.WELSH;
  const { bookingRef } = sessionData.currentBooking;
  const { licenceNumber } = sessionData.candidate;
  await loginPage.login(bookingRef, licenceNumber);
  await ManageBookingsPage.viewTestWithBookingReference(bookingRef);
  const voiceoverPage = await changeBookingPage.changeRequestVoiceover();
  await voiceoverPage.selectVoiceoverRequired(sessionData.currentBooking.voiceover);

  // check the change page
  await checkChangePage.checkUpdatedVoiceover(sessionData);
  await checkChangePage.confirmChange();

  // confirmation page
  await changeConfirmedPage.checkBookingUpdatedConfirmationPage(sessionData);
  await click(changeConfirmedPage.makeAnotherChangeButton);
  // check new confirmed changes are now displayed
  if (!runningTestsLocally()) {
    await changeBookingPage.checkDataMatchesSession(sessionData);
  }
});

test('Verify an ERS instructor can change the voiceover to English', async (t) => {
  const sessionData = new SessionData(Target.GB, Locale.GB, false, true);
  sessionData.currentBooking.testType = TestType.ERS;
  sessionData.candidate.personalReferenceNumber = '621309';
  t.ctx.sessionData = sessionData;

  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
  } else {
    sessionData.currentBooking.bookingRef = 'A-000-000-003';
  }

  sessionData.currentBooking.voiceover = Voiceover.ENGLISH;
  const { bookingRef } = sessionData.currentBooking;
  const { licenceNumber } = sessionData.candidate;
  await loginPage.login(bookingRef, licenceNumber);
  await ManageBookingsPage.viewTestWithBookingReference(bookingRef);
  const voiceoverPage = await changeBookingPage.changeRequestVoiceover();
  await voiceoverPage.selectVoiceoverRequired(sessionData.currentBooking.voiceover);

  // check the change page
  await checkChangePage.checkUpdatedVoiceover(sessionData);
  await checkChangePage.confirmChange();

  // confirmation page
  await changeConfirmedPage.checkBookingUpdatedConfirmationPage(sessionData);
  await click(changeConfirmedPage.makeAnotherChangeButton);
  // check new confirmed changes are now displayed
  if (!runningTestsLocally()) {
    await changeBookingPage.checkDataMatchesSession(sessionData);
  }
});

test('Verify an ADI P1 instructor can only see all 3 options English, Welsh and No voiceover', async (t) => {
  const sessionData = new SessionData(Target.GB, Locale.GB, false, true);
  sessionData.currentBooking.testType = TestType.ADIP1;
  sessionData.candidate.personalReferenceNumber = '321971';
  t.ctx.sessionData = sessionData;

  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
  } else {
    sessionData.currentBooking.bookingRef = 'A-000-000-001';
  }

  sessionData.currentBooking.voiceover = Voiceover.ENGLISH;
  const { bookingRef } = sessionData.currentBooking;
  const { licenceNumber } = sessionData.candidate;
  await loginPage.login(bookingRef, licenceNumber);
  await ManageBookingsPage.viewTestWithBookingReference(bookingRef);
  const voiceoverPage = await changeBookingPage.changeRequestVoiceover();

  // check voiceover options
  await verifyValue(voiceoverPage.voiceoverRadio, 'english', 0);
  await verifyValue(voiceoverPage.voiceoverRadio, 'welsh', 1);
  await verifyValue(voiceoverPage.voiceoverRadio, 'none', 2);
});

test('Verify an ADI HPT instructor can only see all 3 options English, Welsh and No voiceover', async (t) => {
  const sessionData = new SessionData(Target.GB, Locale.GB, false, true);
  sessionData.currentBooking.testType = TestType.ADIHPT;
  sessionData.candidate.personalReferenceNumber = '859736';
  t.ctx.sessionData = sessionData;

  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
  } else {
    sessionData.currentBooking.bookingRef = 'A-000-000-002';
  }

  sessionData.currentBooking.voiceover = Voiceover.ENGLISH;
  const { bookingRef } = sessionData.currentBooking;
  const { licenceNumber } = sessionData.candidate;
  await loginPage.login(bookingRef, licenceNumber);
  await ManageBookingsPage.viewTestWithBookingReference(bookingRef);
  const voiceoverPage = await changeBookingPage.changeRequestVoiceover();

  // check voiceover options
  await verifyValue(voiceoverPage.voiceoverRadio, 'english', 0);
  await verifyValue(voiceoverPage.voiceoverRadio, 'welsh', 1);
  await verifyValue(voiceoverPage.voiceoverRadio, 'none', 2);
});

test('Verify an ERS instructor can only see 2 options English or No voiceover and cannot see Welsh language', async (t) => {
  const sessionData = new SessionData(Target.GB, Locale.GB, false, true);
  sessionData.currentBooking.testType = TestType.ERS;
  sessionData.candidate.personalReferenceNumber = '621309';
  t.ctx.sessionData = sessionData;

  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
  } else {
    sessionData.currentBooking.bookingRef = 'A-000-000-003';
  }

  sessionData.currentBooking.voiceover = Voiceover.ENGLISH;
  const { bookingRef } = sessionData.currentBooking;
  const { licenceNumber } = sessionData.candidate;
  await loginPage.login(bookingRef, licenceNumber);
  await ManageBookingsPage.viewTestWithBookingReference(bookingRef);
  const voiceoverPage = await changeBookingPage.changeRequestVoiceover();

  // check voiceover options
  await verifyValue(voiceoverPage.voiceoverRadio, 'english', 0);
  await verifyValue(voiceoverPage.voiceoverRadio, 'none', 1);
  await verifyNoValue(voiceoverPage.voiceoverRadio, 'welsh', 1);
});

test('Verify an instructor candidate is able to change the time of their booking', async (t) => {
  const sessionData = new SessionData(Target.GB, Locale.GB, false, true);
  sessionData.currentBooking.testType = TestType.ADIP1;
  sessionData.candidate.personalReferenceNumber = '321971';
  t.ctx.sessionData = sessionData;

  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
  } else {
    sessionData.currentBooking.bookingRef = 'A-000-000-001';
  }

  const { bookingRef } = sessionData.currentBooking;
  const drivingLicence = sessionData.candidate.licenceNumber;
  await t.navigateTo(`${pageUrl}?target=${Target.GB}`);
  await loginPage.login(bookingRef, drivingLicence);
  await ManageBookingsPage.viewTestWithBookingReference(bookingRef);

  const reschedulePage = await changeBookingPage.rescheduleTest();
  const chooseAppointment = await reschedulePage.selectTimeOnly();
  await chooseAppointment.chooseAppointment(sessionData.currentBooking);

  const checkChange = new CheckChangePage();
  await checkChange.confirmChange();

  // confirmation page
  await changeConfirmedPage.checkBookingUpdatedConfirmationPage(sessionData);
  await click(changeConfirmedPage.makeAnotherChangeButton);

  // back on change booking page
  await verifyContainsText(changeBookingPage.pageHeadingLocator, changeBookingPage.pageHeading);
  await verifyContainsText(changeBookingPage.warningMessageLocator, changeBookingPage.refundWarningMessageText);

  if (!runningTestsLocally()) {
    await changeBookingPage.checkDataMatchesSession(sessionData);
  }
});

test('Verify an instructor candidate is able to change the date and time of their booking', async (t) => {
  const sessionData = new SessionData(Target.GB, Locale.GB, false, true);
  sessionData.currentBooking.testType = TestType.ADIP1;
  sessionData.candidate.personalReferenceNumber = '321971';
  t.ctx.sessionData = sessionData;

  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
  } else {
    sessionData.currentBooking.bookingRef = 'A-000-000-001';
  }

  const { bookingRef } = sessionData.currentBooking;
  const drivingLicence = sessionData.candidate.licenceNumber;
  await t.navigateTo(`${pageUrl}?target=${Target.GB}`);
  await loginPage.login(bookingRef, drivingLicence);
  await ManageBookingsPage.viewTestWithBookingReference(bookingRef);

  const reschedulePage = await changeBookingPage.rescheduleTest();
  const timeAndDateOnly = await reschedulePage.selectTimeAndDateOnly();
  const chooseAppointment = await timeAndDateOnly.selectPreferredDateWithAppointments(sessionData.testCentreSearch);
  await chooseAppointment.chooseAppointment(sessionData.currentBooking);

  const checkChange = new CheckChangePage();
  await checkChange.confirmChange();

  // confirmation page
  await changeConfirmedPage.checkBookingUpdatedConfirmationPage(sessionData);
  await click(changeConfirmedPage.makeAnotherChangeButton);

  // back on change booking page
  await verifyContainsText(changeBookingPage.pageHeadingLocator, changeBookingPage.pageHeading);
  await verifyContainsText(changeBookingPage.warningMessageLocator, changeBookingPage.refundWarningMessageText);

  if (!runningTestsLocally()) {
    await changeBookingPage.checkDataMatchesSession(sessionData);
  }
});

test('Verify an instructor candidate is able to change the location of their booking', async (t) => {
  const sessionData = new SessionData(Target.GB, Locale.GB, false, true);
  sessionData.currentBooking.testType = TestType.ADIP1;
  sessionData.candidate.personalReferenceNumber = '321971';
  t.ctx.sessionData = sessionData;

  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
  } else {
    sessionData.currentBooking.bookingRef = 'A-000-000-001';
  }

  const { bookingRef } = sessionData.currentBooking;
  const drivingLicence = sessionData.candidate.licenceNumber;
  await t.navigateTo(`${pageUrl}?target=${Target.GB}`);
  await loginPage.login(bookingRef, drivingLicence);
  await ManageBookingsPage.viewTestWithBookingReference(bookingRef);

  const reschedulePage = await changeBookingPage.rescheduleTest();
  const findATheoryTestCentrePage = await reschedulePage.selectLocationOnly();
  const chooseATestCentrePage = await findATheoryTestCentrePage.findATheoryTestCentre('Birmingham');
  const preferredDatePage = await chooseATestCentrePage.selectATestCentre(sessionData.currentBooking.centre);
  const chooseAppointment = await preferredDatePage.selectPreferredDateWithAppointments(sessionData.testCentreSearch);
  await chooseAppointment.chooseAppointment(sessionData.currentBooking);

  const checkChange = new CheckChangePage();
  await checkChange.confirmChange();

  // confirmation page
  await changeConfirmedPage.checkBookingUpdatedConfirmationPage(sessionData);
  await click(changeConfirmedPage.makeAnotherChangeButton);

  // back on change booking page
  await verifyContainsText(changeBookingPage.pageHeadingLocator, changeBookingPage.pageHeading);
  await verifyContainsText(changeBookingPage.warningMessageLocator, changeBookingPage.refundWarningMessageText);

  if (!runningTestsLocally()) {
    await changeBookingPage.checkDataMatchesSession(sessionData);
  }
});

test('Verify an instructor candidate is NOT able to change their NSA booking and Test Support needs are shown', async (t) => {
  const sessionData = new SessionData(Target.GB, Locale.GB, false, true);
  sessionData.currentBooking.testType = TestType.ADIP1;
  sessionData.currentBooking.origin = Origin.CitizenPortal;
  sessionData.journey.standardAccommodation = false;
  sessionData.currentBooking.selectSupportType = [SupportType.VOICEOVER, SupportType.EXTRA_TIME, SupportType.READING_SUPPORT, SupportType.OTHER];
  sessionData.currentBooking.voiceover = Voiceover.ENGLISH;
  sessionData.currentBooking.customSupport = 'Please arrange for the support';
  sessionData.currentBooking.voicemail = true;
  sessionData.currentBooking.preferredDayOption = PreferredDay.ParticularDay;
  sessionData.currentBooking.preferredDay = 'I only want to have tests on Mondays';
  sessionData.currentBooking.preferredLocationOption = PreferredLocation.ParticularLocation;
  sessionData.currentBooking.preferredLocation = 'I only want to have tests in the City Centre';
  sessionData.currentBooking.testSupportNeeds = [CRMTestSupportNeed.SpecialTestingEquipment, CRMTestSupportNeed.HomeTest, CRMTestSupportNeed.SeperateRoom];
  t.ctx.sessionData = sessionData;

  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
  }

  const { bookingRef } = sessionData.currentBooking;
  const drivingLicence = sessionData.candidate.licenceNumber;
  await t.navigateTo(`${pageUrl}?target=${Target.GB}`);
  await loginPage.login(bookingRef, drivingLicence);
  await ManageBookingsPage.viewTestWithBookingReference(bookingRef);
  await verifyTitleContainsText(changeBookingPage.pageHeading);
  await verifyContainsText(changeBookingPage.pageHeadingLocator, changeBookingPage.pageHeading);
  await verifyContainsText(changeBookingPage.warningMessageLocator, changeBookingPage.noChangeAllowedTextDVSA);

  await changeBookingPage.checkDataMatchesSession(sessionData);
  await changeBookingPage.checkChangeActions(sessionData, Constants.ManageBookingActionTypes.NON_STANDARD_BOOKING);
});
