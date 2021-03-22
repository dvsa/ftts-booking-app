import * as Constants from '../data/constants';
import { SessionData } from '../data/session-data';
import { ChangeBookingPage } from '../pages/change-booking-page';
import { LoginPage } from '../pages/login-page';
import { ManageBookingsPage } from '../pages/manage-bookings-page';
import {
  verifyExactText, verifyContainsText, runningTestsLocally, deepCopy, click, verifyIsVisible, getFutureDate, verifyTitleContainsText,
} from '../utils/helpers';
import { NavigationHelper } from '../utils/navigation-helper';
import {
  LANGUAGE, LOCALE, TARGET, Voiceover,
} from '../../../src/domain/enums';
import { ChangeConfirmedPage } from '../pages/change-confirmed-page';
import { CheckChangePage } from '../pages/check-change-page';
import { generalTitle } from '../data/constants';

const changeBookingPage = new ChangeBookingPage();
const loginPage = new LoginPage();
const manageBookingsPage = new ManageBookingsPage();
const checkChangePage = new CheckChangePage();
const changeConfirmedPage = new ChangeConfirmedPage();

const pageUrl = `${process.env.BOOKING_APP_URL}/${loginPage.pathUrl}`;

fixture`Change booking`
  .page(pageUrl)
  .before(async () => { await Constants.setRequestTimeout; })
  .meta('type', 'e2e');

const dataSet = [
  {
    testName: 'GB Bookings',
    target: TARGET.GB,
    locale: LOCALE.GB,
    licenceNumber: Constants.drivingLicenceGBMultipleBookings,
  },
  {
    testName: 'NI Bookings',
    target: TARGET.NI,
    locale: LOCALE.NI,
    licenceNumber: Constants.drivingLicenceNIMultipleBookings,
  },
];

dataSet.forEach((data) => {
  test(`Verify the UI contents of Change booking page for tests greater than 3 days away - ${data.testName}`, async (t) => {
    const sessionData = new SessionData(data.target);

    if (!runningTestsLocally()) {
      await new NavigationHelper(sessionData).createANewBooking();
    }

    const { bookingRef } = sessionData.currentBooking;
    const drivingLicence = sessionData.candidate.licenceNumber;
    await t.navigateTo(`${pageUrl}?target=${data.target}&lang=${LOCALE.GB}`);
    await loginPage.login(bookingRef, drivingLicence);
    await manageBookingsPage.viewTestWithBookingReference(bookingRef);
    await verifyTitleContainsText(`${changeBookingPage.pageTitle} ${generalTitle}`);
    await verifyExactText(changeBookingPage.pageTitleLocator, changeBookingPage.pageHeading);
    await verifyContainsText(changeBookingPage.warningMessageLocator, changeBookingPage.refundWarningMessageText);
    await changeBookingPage.checkDataMatchesSession(sessionData);
  });
});

dataSet.forEach((data) => {
  test(`Verify the UI contents of Change booking page for tests less than 3 days away - ${data.testName}`, async (t) => {
    const sessionData = new SessionData(data.target);
    sessionData.testDateLessThan3Days = true;

    if (!runningTestsLocally()) {
      await new NavigationHelper(sessionData).createANewBooking();
    } else {
      sessionData.candidate.licenceNumber = data.licenceNumber;
      sessionData.currentBooking.dateTime = getFutureDate('day', 1).toISOString();
    }

    const { bookingRef } = sessionData.currentBooking;
    const drivingLicence = sessionData.candidate.licenceNumber;
    await t.navigateTo(`${pageUrl}?target=${data.target}&lang=${LOCALE.GB}`);
    await loginPage.login(bookingRef, drivingLicence);
    await manageBookingsPage.viewTestWithBookingReference(bookingRef);
    await verifyTitleContainsText(`${changeBookingPage.pageTitle} ${generalTitle}`);
    await verifyExactText(changeBookingPage.pageTitleLocator, changeBookingPage.pageHeading);
    await verifyContainsText(changeBookingPage.warningMessageLocator, changeBookingPage.refundWarningMessageText);
    await changeBookingPage.checkDataMatchesSession(sessionData);
  });
});

if (runningTestsLocally()) {
  dataSet.forEach((data) => {
    test(`Verify the UI contents of Change booking page for tests today - ${data.testName}`, async (t) => {
      const sessionData = new SessionData(data.target);
      sessionData.currentBooking.bookingRef = Constants.bookingReference3;
      sessionData.testDateLessThan3Days = true;
      sessionData.candidate.licenceNumber = data.licenceNumber;
      sessionData.currentBooking.dateTime = getFutureDate('hour', 1).toISOString();

      const { bookingRef } = sessionData.currentBooking;
      const drivingLicence = sessionData.candidate.licenceNumber;
      await t.navigateTo(`${pageUrl}?target=${data.target}&lang=${LOCALE.GB}`);
      await loginPage.login(bookingRef, drivingLicence);
      await manageBookingsPage.viewTestWithBookingReference(bookingRef);
      await verifyTitleContainsText(`${changeBookingPage.pageTitle} ${generalTitle}`);
      await verifyExactText(changeBookingPage.pageTitleLocator, changeBookingPage.pageHeading);
      await verifyContainsText(changeBookingPage.warningMessageLocator, changeBookingPage.noChangeAllowedWarningMessageText);
      await changeBookingPage.checkDataMatchesSession(sessionData);
    });
  });

  test('Verify the Back link takes you to the Manage bookings page', async (t) => {
    const drivingLicence = Constants.drivingLicenceGB;
    const bookingRef = Constants.bookingReference1;

    await t.navigateTo(`${pageUrl}?target=${TARGET.GB}&lang=${LOCALE.GB}`);
    await loginPage.login(bookingRef, drivingLicence);
    await manageBookingsPage.viewTestWithBookingReference(bookingRef);
    await changeBookingPage.goBack();
    await verifyExactText(manageBookingsPage.pageTitleLocator, manageBookingsPage.pageTitle);
  });
}

test('Change Language for GB bookings greater than 3 days away - verify the user is unable to proceed without selecting the language and an error message is displayed', async (t) => {
  const sessionData = new SessionData(TARGET.GB);

  if (!runningTestsLocally()) {
    await new NavigationHelper(sessionData).createANewBooking();
  }

  const { bookingRef } = sessionData.currentBooking;
  const drivingLicence = sessionData.candidate.licenceNumber;
  await t.navigateTo(`${pageUrl}?target=${TARGET.GB}&lang=${LOCALE.GB}`);
  await loginPage.login(bookingRef, drivingLicence);
  await manageBookingsPage.viewTestWithBookingReference(bookingRef);
  const languagePage = await changeBookingPage.changeTestLanguage();
  await click(languagePage.continueButton);
  await verifyExactText(languagePage.errorMessageLocator, languagePage.errorMessageHeader);
  await verifyExactText(languagePage.errorMessageList, languagePage.errorMessageText);
  await verifyContainsText(languagePage.errorMessageRadioLocator, languagePage.errorMessageText);
  await verifyIsVisible(languagePage.errorLink);
  await languagePage.clickErrorLink();
});

test('Change Language for GB bookings greater than 3 days away - verify new Language is displayed and saved when confirming change', async (t) => {
  const sessionData = new SessionData(TARGET.GB);

  if (!runningTestsLocally()) {
    await new NavigationHelper(sessionData).createANewBooking();
  }

  const { bookingRef } = sessionData.currentBooking;
  const drivingLicence = sessionData.candidate.licenceNumber;
  sessionData.currentBooking.language = LANGUAGE.WELSH; // change language to welsh
  await t.navigateTo(`${pageUrl}?target=${TARGET.GB}&lang=${LOCALE.GB}`);
  await loginPage.login(bookingRef, drivingLicence);
  await manageBookingsPage.viewTestWithBookingReference(bookingRef);
  const languagePage = await changeBookingPage.changeTestLanguage();
  await languagePage.selectTestLanguage(Constants.LANGUAGES.get(sessionData.currentBooking.language));

  // check the change page
  await verifyTitleContainsText(`${checkChangePage.pageTitle} ${generalTitle}`);
  await verifyExactText(checkChangePage.pageTitleLocator, checkChangePage.pageHeading);
  await checkChangePage.checkUpdatedLanguage(sessionData);
  await checkChangePage.confirmChange();

  // confirmation page
  await changeConfirmedPage.checkBookingUpdatedConfirmationPage(sessionData);
  await click(changeConfirmedPage.makeAnotherChangeButton);

  // back on change booking page
  await verifyExactText(changeBookingPage.pageTitleLocator, changeBookingPage.pageHeading);
  await verifyContainsText(changeBookingPage.warningMessageLocator, changeBookingPage.refundWarningMessageText);
  // TODO - enabled when backend changes have been completed
  // check new confirmed changes are now displayed
  // if (!runningTestsLocally()) {
  //   await changeBookingPage.checkDataMatchesSession(sessionData);
  // }
});

test('Change Language for GB bookings greater than 3 days away - verify old Language is displayed when cancelling change', async (t) => {
  const sessionData = new SessionData(TARGET.GB);

  if (!runningTestsLocally()) {
    await new NavigationHelper(sessionData).createANewBooking();
  }

  const prevSessionData = deepCopy(sessionData);
  const { bookingRef } = sessionData.currentBooking;
  const drivingLicence = sessionData.candidate.licenceNumber;
  sessionData.currentBooking.language = LANGUAGE.WELSH; // change language to welsh
  await t.navigateTo(`${pageUrl}?target=${TARGET.GB}&lang=${LOCALE.GB}`);
  await loginPage.login(bookingRef, drivingLicence);
  await manageBookingsPage.viewTestWithBookingReference(bookingRef);
  const languagePage = await changeBookingPage.changeTestLanguage();
  await languagePage.selectTestLanguage(Constants.LANGUAGES.get(sessionData.currentBooking.language));

  // check the change page
  await verifyTitleContainsText(`${checkChangePage.pageTitle} ${generalTitle}`);
  await verifyExactText(checkChangePage.pageTitleLocator, checkChangePage.pageHeading);
  await checkChangePage.checkUpdatedLanguage(sessionData);
  await checkChangePage.cancelChange();

  await changeBookingPage.checkDataMatchesSession(prevSessionData);
});

test('Change Language for GB bookings greater than 3 days away - verify back link returns you to the booking', async (t) => {
  const sessionData = new SessionData(TARGET.GB);

  if (!runningTestsLocally()) {
    await new NavigationHelper(sessionData).createANewBooking();
  }

  const { bookingRef } = sessionData.currentBooking;
  const drivingLicence = sessionData.candidate.licenceNumber;
  await t.navigateTo(`${pageUrl}?target=${TARGET.GB}&lang=${LOCALE.GB}`);
  await loginPage.login(bookingRef, drivingLicence);
  await manageBookingsPage.viewTestWithBookingReference(bookingRef);
  const languagePage = await changeBookingPage.changeTestLanguage();
  await languagePage.goBack();

  await changeBookingPage.checkDataMatchesSession(sessionData);
});

dataSet.forEach((data) => {
  test(`Change Voiceover for ${data.testName} greater than 3 days away - verify the user is unable to proceed without selecting a voiceover option and an error message is displayed`, async (t) => {
    const sessionData = new SessionData(data.target);

    if (!runningTestsLocally()) {
      await new NavigationHelper(sessionData).createANewBooking();
    }

    const { bookingRef } = sessionData.currentBooking;
    const drivingLicence = sessionData.candidate.licenceNumber;
    await t.navigateTo(`${pageUrl}?target=${data.target}&lang=${data.locale}`);
    await loginPage.login(bookingRef, drivingLicence);
    await manageBookingsPage.viewTestWithBookingReference(bookingRef);
    const voiceoverPage = await changeBookingPage.changeRequestVoiceover();
    await click(voiceoverPage.continueButton);
    await verifyContainsText(voiceoverPage.errorMessageLocator, voiceoverPage.errorMessageHeader);
    let errorMessageText = voiceoverPage.errorMessageTextGB;
    if (data.target === TARGET.NI) {
      errorMessageText = voiceoverPage.errorMessageTextNI;
    }
    await verifyContainsText(voiceoverPage.errorMessageList, errorMessageText);
    await verifyContainsText(voiceoverPage.errorMessageRadioLocator, errorMessageText);
    await verifyIsVisible(voiceoverPage.errorLink);
    await voiceoverPage.clickErrorLink();
  });
});

dataSet.forEach((data) => {
  test(`Change Voiceover for ${data.testName} greater than 3 days away - verify new Voiceover is displayed when confirming change`, async (t) => {
    const sessionData = new SessionData(data.target);

    if (!runningTestsLocally()) {
      await new NavigationHelper(sessionData).createANewBooking();
    }

    const { bookingRef } = sessionData.currentBooking;
    const drivingLicence = sessionData.candidate.licenceNumber;
    sessionData.currentBooking.voiceover = Voiceover.WELSH; // change voiceover to welsh
    if (data.target === TARGET.NI) {
      sessionData.currentBooking.voiceover = Voiceover.PORTUGUESE; // change language to portuguese
    }
    await t.navigateTo(`${pageUrl}?target=${data.target}&lang=${data.locale}`);
    await loginPage.login(bookingRef, drivingLicence);
    await manageBookingsPage.viewTestWithBookingReference(bookingRef);
    const voiceoverPage = await changeBookingPage.changeRequestVoiceover();
    await voiceoverPage.selectVoiceoverRequired(sessionData.currentBooking.voiceover);

    // check the change page
    await checkChangePage.checkUpdatedVoiceover(sessionData);
    await checkChangePage.confirmChange();

    // confirmation page
    // TODO - uncomment when backend changes are completed
    // await changeConfirmedPage.checkBookingUpdatedConfirmationPage(sessionData);
    // await click(changeConfirmedPage.makeAnotherChangeButton);
    // // check new confirmed changes are now displayed
    // if (!runningTestsLocally()) {
    //   await changeBookingPage.checkDataMatchesSession(sessionData);
    // }
  });
});

test('Change Voiceover for GB bookings greater than 3 days away - verify old Voiceover is displayed when cancelling change', async (t) => {
  const sessionData = new SessionData(TARGET.GB);

  if (!runningTestsLocally()) {
    await new NavigationHelper(sessionData).createANewBooking();
  }

  const prevSessionData = deepCopy(sessionData);
  const { bookingRef } = sessionData.currentBooking;
  const drivingLicence = sessionData.candidate.licenceNumber;
  sessionData.currentBooking.voiceover = Voiceover.WELSH; // change voiceover to welsh
  await t.navigateTo(`${pageUrl}?target=${TARGET.GB}&lang=${LOCALE.GB}`);
  await loginPage.login(bookingRef, drivingLicence);
  await manageBookingsPage.viewTestWithBookingReference(bookingRef);
  const voiceoverPage = await changeBookingPage.changeRequestVoiceover();
  await voiceoverPage.selectVoiceoverRequired(sessionData.currentBooking.voiceover);

  // check the change page
  await verifyTitleContainsText(`${checkChangePage.pageTitle} ${generalTitle}`);
  await verifyExactText(checkChangePage.pageTitleLocator, checkChangePage.pageHeading);
  await checkChangePage.checkUpdatedVoiceover(sessionData);
  await checkChangePage.cancelChange();

  await changeBookingPage.checkDataMatchesSession(prevSessionData);
});

test('Change Voiceover for GB bookings greater than 3 days away - verify back link returns you to the booking', async (t) => {
  const sessionData = new SessionData(TARGET.GB);

  if (!runningTestsLocally()) {
    await new NavigationHelper(sessionData).createANewBooking();
  }

  const { bookingRef } = sessionData.currentBooking;
  const drivingLicence = sessionData.candidate.licenceNumber;
  await t.navigateTo(`${pageUrl}?target=${TARGET.GB}&lang=${LOCALE.GB}`);
  await loginPage.login(bookingRef, drivingLicence);
  await manageBookingsPage.viewTestWithBookingReference(bookingRef);
  const voiceoverPage = await changeBookingPage.changeRequestVoiceover();
  await voiceoverPage.goBack();

  await changeBookingPage.checkDataMatchesSession(sessionData);
});

test('Change BSL for GB bookings greater than 3 days away - verify the user is unable to proceed without selecting a BSL option and an error message is displayed', async (t) => {
  const sessionData = new SessionData(TARGET.GB);

  if (!runningTestsLocally()) {
    await new NavigationHelper(sessionData).createANewBooking();
  }

  const { bookingRef } = sessionData.currentBooking;
  const drivingLicence = sessionData.candidate.licenceNumber;
  await t.navigateTo(`${pageUrl}?target=${TARGET.GB}&lang=${LOCALE.GB}`);
  await loginPage.login(bookingRef, drivingLicence);
  await manageBookingsPage.viewTestWithBookingReference(bookingRef);
  const bslPage = await changeBookingPage.changeRequestBsl();
  await verifyTitleContainsText(`${bslPage.pageTitle} ${generalTitle}`);
  await verifyExactText(bslPage.pageTitleLocator, bslPage.pageHeadingManageBooking);
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
    target: TARGET.GB,
    oldBsl: true,
    newBsl: false,
  },
  {
    description: 'GB - from No to Yes',
    target: TARGET.GB,
    oldBsl: false,
    newBsl: true,
  },
  {
    description: 'NI - from Yes to No',
    target: TARGET.NI,
    oldBsl: true,
    newBsl: false,
  },
  {
    description: 'NI - from No to Yes',
    target: TARGET.NI,
    oldBsl: false,
    newBsl: true,
  },
];

// TODO enable when NSA journey is finalised
bslDataSet.forEach((data) => {
  test.skip(`Change BSL for bookings greater than 3 days away - ${data.description} - verify new BSL selection is displayed when confirming change`, async (t) => {
    const sessionData = new SessionData(data.target);
    sessionData.currentBooking.bsl = data.oldBsl;
    sessionData.journey.support = data.oldBsl;

    if (!runningTestsLocally()) {
      await new NavigationHelper(sessionData).createANewBooking();
    }

    const { bookingRef } = sessionData.currentBooking;
    const drivingLicence = sessionData.candidate.licenceNumber;
    sessionData.currentBooking.bsl = data.newBsl; // change BSL
    await t.navigateTo(`${pageUrl}?target=${data.target}&lang=${LOCALE.GB}`);
    await loginPage.login(bookingRef, drivingLicence);
    await manageBookingsPage.viewTestWithBookingReference(bookingRef);
    const bslPage = await changeBookingPage.changeRequestBsl();
    await bslPage.selectBslRequired(sessionData.currentBooking.bsl);

    // check the change page
    await verifyTitleContainsText(`${checkChangePage.pageTitle} ${generalTitle}`);
    await verifyExactText(checkChangePage.pageTitleLocator, checkChangePage.pageHeading);
    await checkChangePage.checkUpdatedBsl(sessionData);
    await checkChangePage.confirmChange();

    // confirmation page
    await changeConfirmedPage.checkBookingUpdatedConfirmationPage(sessionData);
    await click(changeConfirmedPage.makeAnotherChangeButton);

    // back on change booking page
    await verifyExactText(changeBookingPage.pageTitleLocator, changeBookingPage.pageHeading);
    await verifyContainsText(changeBookingPage.warningMessageLocator, changeBookingPage.refundWarningMessageText);

    if (!runningTestsLocally()) {
      await changeBookingPage.checkDataMatchesSession(sessionData);
    }
  });
});

test('Change BSL for GB bookings greater than 3 days away - verify old BSL selection is displayed when cancelling change', async (t) => {
  const sessionData = new SessionData(TARGET.GB);

  if (!runningTestsLocally()) {
    await new NavigationHelper(sessionData).createANewBooking();
  }

  const prevSessionData = deepCopy(sessionData);
  const { bookingRef } = sessionData.currentBooking;
  const drivingLicence = sessionData.candidate.licenceNumber;
  sessionData.currentBooking.bsl = true; // change BSL
  await t.navigateTo(`${pageUrl}?target=${TARGET.GB}&lang=${LOCALE.GB}`);
  await loginPage.login(bookingRef, drivingLicence);
  await manageBookingsPage.viewTestWithBookingReference(bookingRef);
  const bslPage = await changeBookingPage.changeRequestBsl();
  await bslPage.selectBslRequired(sessionData.currentBooking.bsl);

  // check the change page
  await verifyTitleContainsText(`${checkChangePage.pageTitle} ${generalTitle}`);
  await verifyExactText(checkChangePage.pageTitleLocator, checkChangePage.pageHeading);
  await checkChangePage.checkUpdatedBsl(sessionData);
  await checkChangePage.cancelChange();

  await changeBookingPage.checkDataMatchesSession(prevSessionData);
});

test('Change BSL for GB bookings greater than 3 days away - verify back link returns you to the booking', async (t) => {
  const sessionData = new SessionData(TARGET.GB);

  if (!runningTestsLocally()) {
    await new NavigationHelper(sessionData).createANewBooking();
  }

  const { bookingRef } = sessionData.currentBooking;
  const drivingLicence = sessionData.candidate.licenceNumber;
  await t.navigateTo(`${pageUrl}?target=${TARGET.GB}&lang=${LOCALE.GB}`);
  await loginPage.login(bookingRef, drivingLicence);
  await manageBookingsPage.viewTestWithBookingReference(bookingRef);
  const bslPage = await changeBookingPage.changeRequestBsl();
  await bslPage.goBack();

  await changeBookingPage.checkDataMatchesSession(sessionData);
});
