import dayjs from 'dayjs';
import * as Constants from '../data/constants';
import { SessionData } from '../data/session-data';
import { ChangeBookingPage } from '../pages/change-booking-page';
import { LoginPage } from '../pages/login-page';
import ManageBookingsPage from '../pages/manage-bookings-page';
import {
  verifyExactText, verifyContainsText, runningTestsLocally, click, verifyIsVisible, getFutureDate, verifyTitleContainsText, verifyIsNotVisible, setAcceptCookies,
} from '../utils/helpers';
import {
  Language, Locale, Target, Voiceover,
} from '../../../src/domain/enums';
import { ChangeConfirmedPage } from '../pages/change-confirmed-page';
import { CheckChangePage } from '../pages/check-change-page';
import { generalTitle, generalTitleNI } from '../data/constants';
import { createNewBookingInCrm } from '../utils/crm/crm-data-helper';
import { dynamicsWebApiClient } from '../utils/crm/dynamics-web-api';
import { CRMGateway } from '../utils/crm/crm-gateway-test';

const crmGateway = new CRMGateway(dynamicsWebApiClient());

const changeBookingPage = new ChangeBookingPage();
const loginPage = new LoginPage();
const checkChangePage = new CheckChangePage();
const changeConfirmedPage = new ChangeConfirmedPage();

const pageUrl = `${process.env.BOOKING_APP_URL}/${loginPage.pathUrl}`;

fixture`Change booking`
  .page(pageUrl)
  .before(async () => { await Constants.setRequestTimeout; })
  .beforeEach(async () => { await setAcceptCookies(); })
  .afterEach(async (t) => {
    const { sessionData } = t.ctx;
    if (!runningTestsLocally()) {
      await crmGateway.cleanUpBookingProductsByBookingRef(sessionData.currentBooking.bookingRef);
    }
  })
  .meta('type', 'manage-booking');

if (!runningTestsLocally()) {
  test('Verify a user cannot cancel a test on the same day of booking it', async (t) => {
    const sessionData = new SessionData(Target.GB);
    sessionData.overrideCreatedOnDate = false; // leave it as todays date
    t.ctx.sessionData = sessionData;

    if (!runningTestsLocally()) {
      await createNewBookingInCrm(sessionData);
    }

    const { bookingRef } = sessionData.currentBooking;
    const drivingLicence = sessionData.candidate.licenceNumber;
    await t.navigateTo(`${pageUrl}?target=${Target.GB}`);
    await loginPage.login(bookingRef, drivingLicence);
    await ManageBookingsPage.viewTestWithBookingReference(bookingRef);

    await verifyContainsText(changeBookingPage.warningMessageLocator, changeBookingPage.refundWarningMessageTextBookingToday);
    await verifyIsNotVisible(changeBookingPage.cancelTestButton);
  });
}

const dataSet = [
  {
    testName: 'GB Bookings',
    target: Target.GB,
    locale: Locale.GB,
    licenceNumber: Constants.drivingLicenceGBMultipleBookings,
    title: generalTitle,
  },
  {
    testName: 'NI Bookings',
    target: Target.NI,
    locale: Locale.NI,
    licenceNumber: Constants.drivingLicenceNIMultipleBookings,
    title: generalTitleNI,
  },
];

dataSet.forEach((data) => {
  // eslint-disable-next-line testcafe-community/noIdenticalTitle
  test(`Verify the UI contents of Change booking page for tests greater than 3 days away - ${data.testName}`, async (t) => {
    const sessionData = new SessionData(data.target);
    t.ctx.sessionData = sessionData;

    if (!runningTestsLocally()) {
      await createNewBookingInCrm(sessionData);
    }

    const { bookingRef } = sessionData.currentBooking;
    const drivingLicence = sessionData.candidate.licenceNumber;
    await t.navigateTo(`${pageUrl}?target=${data.target}`);
    await loginPage.login(bookingRef, drivingLicence);
    await ManageBookingsPage.viewTestWithBookingReference(bookingRef);
    await verifyTitleContainsText(`${changeBookingPage.pageHeading} ${data.title}`);
    await verifyContainsText(changeBookingPage.pageHeadingLocator, changeBookingPage.pageHeading);
    await verifyContainsText(changeBookingPage.warningMessageLocator, changeBookingPage.refundWarningMessageText);
    await changeBookingPage.checkDataMatchesSession(sessionData);
    await changeBookingPage.checkChangeActions(sessionData, Constants.ManageBookingActionTypes.STANDARD_BOOKING);
  });
});

dataSet.forEach((data) => {
  // eslint-disable-next-line testcafe-community/noIdenticalTitle
  test(`Verify the UI contents of Change booking page for tests less than 3 days away - ${data.testName}`, async (t) => {
    const sessionData = new SessionData(data.target);
    t.ctx.sessionData = sessionData;
    sessionData.testDateLessThan3Days = true;
    sessionData.currentBooking.dateTime = dayjs().add(1, 'day').format('YYYY-MM-DD');

    if (!runningTestsLocally()) {
      await createNewBookingInCrm(sessionData);
    } else {
      sessionData.candidate.licenceNumber = data.licenceNumber;
      sessionData.currentBooking.dateTime = getFutureDate('day', 1).toISOString();
    }

    const { bookingRef } = sessionData.currentBooking;
    const drivingLicence = sessionData.candidate.licenceNumber;
    await t.navigateTo(`${pageUrl}?target=${data.target}`);
    await loginPage.login(bookingRef, drivingLicence);
    await ManageBookingsPage.viewTestWithBookingReference(bookingRef);
    await verifyTitleContainsText(`${changeBookingPage.pageHeading} ${data.title}`);
    await verifyContainsText(changeBookingPage.pageHeadingLocator, changeBookingPage.pageHeading);
    await verifyContainsText(changeBookingPage.warningMessageLocator, changeBookingPage.refundWarningMessageText);
    await changeBookingPage.checkDataMatchesSession(sessionData);
    await changeBookingPage.checkChangeActions(sessionData, Constants.ManageBookingActionTypes.STANDARD_BOOKING);
  });
});

dataSet.forEach((data) => {
  // eslint-disable-next-line testcafe-community/noIdenticalTitle
  test(`Verify the UI contents of Change booking page for tests today - ${data.testName}`, async (t) => {
    const sessionData = new SessionData(data.target);
    t.ctx.sessionData = sessionData;
    sessionData.testDateLessThan3Days = true;
    sessionData.currentBooking.dateTime = getFutureDate('hour', 2).toISOString();

    if (!runningTestsLocally()) {
      await createNewBookingInCrm(sessionData);
    } else {
      sessionData.currentBooking.bookingRef = Constants.bookingReference3;
      sessionData.candidate.licenceNumber = data.licenceNumber;
    }

    const { bookingRef } = sessionData.currentBooking;
    const drivingLicence = sessionData.candidate.licenceNumber;
    await t.navigateTo(`${pageUrl}?target=${data.target}`);
    await loginPage.login(bookingRef, drivingLicence);
    await ManageBookingsPage.viewTestWithBookingReference(bookingRef);
    await verifyTitleContainsText(`${changeBookingPage.pageHeading} ${data.title}`);
    await verifyContainsText(changeBookingPage.pageHeadingLocator, changeBookingPage.pageHeading);
    await verifyContainsText(changeBookingPage.warningMessageLocator, changeBookingPage.noChangeAllowedTodayText);
    await changeBookingPage.checkDataMatchesSession(sessionData);
    await changeBookingPage.checkChangeActions(sessionData, Constants.ManageBookingActionTypes.STANDARD_BOOKING);
  });
});

test('Verify the Back link takes you to the Manage bookings page', async (t) => {
  const sessionData = new SessionData(Target.GB);
  t.ctx.sessionData = sessionData;

  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
  } else {
    sessionData.currentBooking.bookingRef = Constants.bookingReference1;
    sessionData.candidate.licenceNumber = Constants.drivingLicenceGB;
  }

  const { bookingRef } = sessionData.currentBooking;
  const drivingLicence = sessionData.candidate.licenceNumber;
  await t.navigateTo(`${pageUrl}?target=${Target.GB}`);
  await loginPage.login(bookingRef, drivingLicence);
  await ManageBookingsPage.viewTestWithBookingReference(bookingRef);
  await changeBookingPage.goBack();
  await verifyExactText(ManageBookingsPage.pageHeadingLocator, ManageBookingsPage.pageHeading);
});

test('Change Language for GB bookings greater than 3 days away - verify the user is unable to proceed without selecting the language and an error message is displayed', async (t) => {
  const sessionData = new SessionData(Target.GB);
  t.ctx.sessionData = sessionData;

  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
  }

  const { bookingRef } = sessionData.currentBooking;
  const drivingLicence = sessionData.candidate.licenceNumber;
  await t.navigateTo(`${pageUrl}?target=${Target.GB}`);
  await loginPage.login(bookingRef, drivingLicence);
  await ManageBookingsPage.viewTestWithBookingReference(bookingRef);
  const languagePage = await changeBookingPage.changeTestLanguage();
  await click(languagePage.continueButton);
  await verifyExactText(languagePage.errorMessageLocator, languagePage.errorMessageHeader);
  await verifyExactText(languagePage.errorMessageList, languagePage.errorMessageText);
  await verifyContainsText(languagePage.errorMessageRadioLocator, languagePage.errorMessageText);
  await verifyIsVisible(languagePage.errorLink);
  await languagePage.clickErrorLink();
});

test('Change Language for GB bookings greater than 3 days away - verify new Language is displayed and saved when confirming change', async (t) => {
  const sessionData = new SessionData(Target.GB);
  t.ctx.sessionData = sessionData;

  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
  }

  const { bookingRef } = sessionData.currentBooking;
  const drivingLicence = sessionData.candidate.licenceNumber;
  sessionData.currentBooking.language = Language.WELSH; // change language to welsh
  await t.navigateTo(`${pageUrl}?target=${Target.GB}`);
  await loginPage.login(bookingRef, drivingLicence);
  await ManageBookingsPage.viewTestWithBookingReference(bookingRef);
  const languagePage = await changeBookingPage.changeTestLanguage();
  await languagePage.selectTestLanguage(Constants.Languages.get(sessionData.currentBooking.language));

  // check the change page
  await verifyTitleContainsText(`${checkChangePage.pageHeading} ${generalTitle}`);
  await verifyExactText(checkChangePage.pageHeadingLocator, checkChangePage.pageHeading);
  await checkChangePage.checkUpdatedLanguage(sessionData);
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

test('Change Language for GB bookings greater than 3 days away - verify old Language is displayed when cancelling change', async (t) => {
  const sessionData = new SessionData(Target.GB);
  t.ctx.sessionData = sessionData;

  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
  }

  const prevSessionData = sessionData.snapshot();
  const { bookingRef } = sessionData.currentBooking;
  const drivingLicence = sessionData.candidate.licenceNumber;
  sessionData.currentBooking.language = Language.WELSH; // change language to welsh
  await t.navigateTo(`${pageUrl}?target=${Target.GB}`);
  await loginPage.login(bookingRef, drivingLicence);
  await ManageBookingsPage.viewTestWithBookingReference(bookingRef);
  const languagePage = await changeBookingPage.changeTestLanguage();
  await languagePage.selectTestLanguage(Constants.Languages.get(sessionData.currentBooking.language));

  // check the change page
  await verifyTitleContainsText(`${checkChangePage.pageHeading} ${generalTitle}`);
  await verifyExactText(checkChangePage.pageHeadingLocator, checkChangePage.pageHeading);
  await checkChangePage.checkUpdatedLanguage(sessionData);
  await checkChangePage.cancelChange();

  await changeBookingPage.checkDataMatchesSession(prevSessionData);
});

test('Change Language for GB bookings greater than 3 days away - verify back link returns you to the booking', async (t) => {
  const sessionData = new SessionData(Target.GB);
  t.ctx.sessionData = sessionData;

  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
  }

  const { bookingRef } = sessionData.currentBooking;
  const drivingLicence = sessionData.candidate.licenceNumber;
  await t.navigateTo(`${pageUrl}?target=${Target.GB}`);
  await loginPage.login(bookingRef, drivingLicence);
  await ManageBookingsPage.viewTestWithBookingReference(bookingRef);
  const languagePage = await changeBookingPage.changeTestLanguage();
  await languagePage.goBack();

  await changeBookingPage.checkDataMatchesSession(sessionData);
});

dataSet.forEach((data) => {
  // eslint-disable-next-line testcafe-community/noIdenticalTitle
  test(`Change Voiceover for ${data.testName} greater than 3 days away - verify the user is unable to proceed without selecting a voiceover option and an error message is displayed`, async (t) => {
    const sessionData = new SessionData(data.target);
    t.ctx.sessionData = sessionData;

    if (!runningTestsLocally()) {
      await createNewBookingInCrm(sessionData);
    }

    const { bookingRef } = sessionData.currentBooking;
    const drivingLicence = sessionData.candidate.licenceNumber;
    await t.navigateTo(`${pageUrl}?target=${data.target}`);
    await loginPage.login(bookingRef, drivingLicence);
    await ManageBookingsPage.viewTestWithBookingReference(bookingRef);
    const voiceoverPage = await changeBookingPage.changeRequestVoiceover();
    await click(voiceoverPage.continueButton);
    await verifyContainsText(voiceoverPage.errorMessageLocator, voiceoverPage.errorMessageHeader);
    let errorMessageText = voiceoverPage.errorMessageTextGB;
    if (data.target === Target.NI) {
      errorMessageText = voiceoverPage.errorMessageTextNI;
    }
    await verifyContainsText(voiceoverPage.errorMessageList, errorMessageText);
    await verifyContainsText(voiceoverPage.errorMessageRadioLocator, errorMessageText);
    await verifyIsVisible(voiceoverPage.errorLink);
    await voiceoverPage.clickErrorLink();
  });
});

dataSet.forEach((data) => {
  // eslint-disable-next-line testcafe-community/noIdenticalTitle
  test(`Change Voiceover for ${data.testName} greater than 3 days away - verify new Voiceover is displayed when confirming change`, async (t) => {
    const sessionData = new SessionData(data.target);
    t.ctx.sessionData = sessionData;

    if (!runningTestsLocally()) {
      await createNewBookingInCrm(sessionData);
    }

    const { bookingRef } = sessionData.currentBooking;
    const drivingLicence = sessionData.candidate.licenceNumber;
    sessionData.currentBooking.voiceover = Voiceover.WELSH; // change voiceover to welsh
    if (data.target === Target.NI) {
      sessionData.currentBooking.voiceover = Voiceover.PORTUGUESE; // change language to portuguese
    }
    await t.navigateTo(`${pageUrl}?target=${data.target}`);
    await loginPage.login(bookingRef, drivingLicence);
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
});

test('Change Voiceover for GB bookings greater than 3 days away - verify old Voiceover is displayed when cancelling change', async (t) => {
  const sessionData = new SessionData(Target.GB);
  t.ctx.sessionData = sessionData;

  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
  }

  const prevSessionData = sessionData.snapshot();
  const { bookingRef } = sessionData.currentBooking;
  const drivingLicence = sessionData.candidate.licenceNumber;
  sessionData.currentBooking.voiceover = Voiceover.WELSH; // change voiceover to welsh
  await t.navigateTo(`${pageUrl}?target=${Target.GB}`);
  await loginPage.login(bookingRef, drivingLicence);
  await ManageBookingsPage.viewTestWithBookingReference(bookingRef);
  const voiceoverPage = await changeBookingPage.changeRequestVoiceover();
  await voiceoverPage.selectVoiceoverRequired(sessionData.currentBooking.voiceover);

  // check the change page
  await verifyTitleContainsText(`${checkChangePage.pageHeading} ${generalTitle}`);
  await verifyExactText(checkChangePage.pageHeadingLocator, checkChangePage.pageHeading);
  await checkChangePage.checkUpdatedVoiceover(sessionData);
  await checkChangePage.cancelChange();

  await changeBookingPage.checkDataMatchesSession(prevSessionData);
});

test('Change Voiceover for GB bookings greater than 3 days away - verify back link returns you to the booking', async (t) => {
  const sessionData = new SessionData(Target.GB);
  t.ctx.sessionData = sessionData;

  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
  }

  const { bookingRef } = sessionData.currentBooking;
  const drivingLicence = sessionData.candidate.licenceNumber;
  await t.navigateTo(`${pageUrl}?target=${Target.GB}`);
  await loginPage.login(bookingRef, drivingLicence);
  await ManageBookingsPage.viewTestWithBookingReference(bookingRef);
  const voiceoverPage = await changeBookingPage.changeRequestVoiceover();
  await voiceoverPage.goBack();

  await changeBookingPage.checkDataMatchesSession(sessionData);
});

test('Change BSL for GB bookings greater than 3 days away - verify the user is unable to proceed without selecting a BSL option and an error message is displayed', async (t) => {
  const sessionData = new SessionData(Target.GB);
  t.ctx.sessionData = sessionData;

  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
  }

  const { bookingRef } = sessionData.currentBooking;
  const drivingLicence = sessionData.candidate.licenceNumber;
  await t.navigateTo(`${pageUrl}?target=${Target.GB}`);
  await loginPage.login(bookingRef, drivingLicence);
  await ManageBookingsPage.viewTestWithBookingReference(bookingRef);
  const bslPage = await changeBookingPage.changeRequestBsl();
  await verifyTitleContainsText(`${bslPage.pageHeadingManageBooking} ${generalTitle}`);
  await verifyExactText(bslPage.pageHeadingLocator, bslPage.pageHeadingManageBooking);
  await click(bslPage.continueButton);
  await verifyExactText(bslPage.errorMessageLocator, bslPage.errorMessageHeader);
  await verifyExactText(bslPage.errorMessageList, bslPage.errorMessageText);
  await verifyContainsText(bslPage.errorMessageRadioLocator, bslPage.errorMessageText);
  await verifyIsVisible(bslPage.errorLink);
  await bslPage.clickErrorLink();
});

const bslDataSet = [
  {
    description: 'GB - from Yes to No',
    target: Target.GB,
    locale: Locale.GB,
    oldBsl: true,
    newBsl: false,
  },
  {
    description: 'GB - from No to Yes',
    target: Target.GB,
    locale: Locale.GB,
    oldBsl: false,
    newBsl: true,
  },
  {
    description: 'NI - from Yes to No',
    target: Target.NI,
    locale: Locale.NI,
    oldBsl: true,
    newBsl: false,
  },
  {
    description: 'NI - from No to Yes',
    target: Target.NI,
    locale: Locale.NI,
    oldBsl: false,
    newBsl: true,
  },
];

bslDataSet.forEach((data) => {
  // eslint-disable-next-line testcafe-community/noIdenticalTitle
  test(`Change BSL for bookings greater than 3 days away - ${data.description} - verify new BSL selection is displayed when confirming change`, async (t) => {
    const sessionData = new SessionData(data.target);
    sessionData.currentBooking.bsl = data.oldBsl;
    t.ctx.sessionData = sessionData;

    if (!runningTestsLocally()) {
      await createNewBookingInCrm(sessionData);
    }

    const { bookingRef } = sessionData.currentBooking;
    const drivingLicence = sessionData.candidate.licenceNumber;
    sessionData.currentBooking.bsl = data.newBsl; // change BSL
    await t.navigateTo(`${pageUrl}?target=${data.target}`);
    await loginPage.login(bookingRef, drivingLicence);
    await ManageBookingsPage.viewTestWithBookingReference(bookingRef);
    const bslPage = await changeBookingPage.changeRequestBsl();
    await bslPage.selectBslRequired(sessionData.currentBooking.bsl);

    // check the change page
    await verifyTitleContainsText(`${checkChangePage.pageHeading}`);
    await verifyContainsText(checkChangePage.pageHeadingLocator, checkChangePage.pageHeading);
    await checkChangePage.checkUpdatedBsl(sessionData);
    await checkChangePage.confirmChange();

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
});

test('Change BSL for GB bookings greater than 3 days away - verify old BSL selection is displayed when cancelling change', async (t) => {
  const sessionData = new SessionData(Target.GB);
  t.ctx.sessionData = sessionData;

  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
  }

  const prevSessionData = sessionData.snapshot();
  const { bookingRef } = sessionData.currentBooking;
  const drivingLicence = sessionData.candidate.licenceNumber;
  sessionData.currentBooking.bsl = true; // change BSL
  await t.navigateTo(`${pageUrl}?target=${Target.GB}`);
  await loginPage.login(bookingRef, drivingLicence);
  await ManageBookingsPage.viewTestWithBookingReference(bookingRef);
  const bslPage = await changeBookingPage.changeRequestBsl();
  await bslPage.selectBslRequired(sessionData.currentBooking.bsl);

  // check the change page
  await verifyTitleContainsText(`${checkChangePage.pageHeading} ${generalTitle}`);
  await verifyExactText(checkChangePage.pageHeadingLocator, checkChangePage.pageHeading);
  await checkChangePage.checkUpdatedBsl(sessionData);
  await checkChangePage.cancelChange();

  await changeBookingPage.checkDataMatchesSession(prevSessionData);
});

test('Change BSL for GB bookings greater than 3 days away - verify back link returns you to the booking', async (t) => {
  const sessionData = new SessionData(Target.GB);
  t.ctx.sessionData = sessionData;

  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
  }

  const { bookingRef } = sessionData.currentBooking;
  const drivingLicence = sessionData.candidate.licenceNumber;
  await t.navigateTo(`${pageUrl}?target=${Target.GB}`);
  await loginPage.login(bookingRef, drivingLicence);
  await ManageBookingsPage.viewTestWithBookingReference(bookingRef);
  const bslPage = await changeBookingPage.changeRequestBsl();
  await bslPage.goBack();

  await changeBookingPage.checkDataMatchesSession(sessionData);
});

test('Verify a candidate who is blocked from booking online cannot create a new booking or amend their existing booking', async (t) => {
  const sessionData = new SessionData(Target.GB);
  t.ctx.sessionData = sessionData;
  sessionData.candidate.licenceNumber = '69062660';
  sessionData.candidate.firstnames = 'Caroline Firth';
  sessionData.candidate.surname = 'Samuels';
  sessionData.candidate.dateOfBirth = '1988-02-05';

  if (!runningTestsLocally()) {
    await createNewBookingInCrm(sessionData);
  }

  const { bookingRef } = sessionData.currentBooking;
  const drivingLicence = sessionData.candidate.licenceNumber;
  await t.navigateTo(`${pageUrl}?target=${Target.GB}`);
  await loginPage.login(bookingRef, drivingLicence);

  await ManageBookingsPage.viewTestWithBookingReference(bookingRef);
  await verifyContainsText(changeBookingPage.warningMessageLocator, changeBookingPage.noChangeAllowedBlockedOnlineText);
  await changeBookingPage.checkDataMatchesSession(sessionData);
  await changeBookingPage.checkChangeActions(sessionData, Constants.ManageBookingActionTypes.BLOCKED_ONLINE);
});
