/* eslint-disable security/detect-non-literal-regexp */
import { RequestLogger, Selector, t } from 'testcafe';
import * as Constants from '../data/constants';
import {
  verifyExactText, click, setCookie, clearField, verifyTitleContainsText,
} from '../utils/helpers';
import { PreferredDatePage } from '../pages/preferred-date-page';
import { ChooseATestCentrePage } from '../pages/choose-a-test-centre-page';
import { ChooseAppointmentPage } from '../pages/choose-appointment-page';
import { TARGET } from '../../../src/domain/enums';
import { SessionData } from '../data/session-data';

const preferredDatePage = new PreferredDatePage();
const pageUrl = `${process.env.BOOKING_APP_URL}/${preferredDatePage.pathUrl}`;
const headerLogger = RequestLogger([new RegExp(`${process.env.BOOKING_APP_URL}`)], {
  logResponseHeaders: true,
});

fixture`Preferred test date`
  .page(process.env.BOOKING_APP_URL)
  .requestHooks(headerLogger)
  .before(async () => { await Constants.setRequestTimeout; })
  .beforeEach(async () => {
    await setCookie(headerLogger, new SessionData(TARGET.GB));
    await t.navigateTo(pageUrl);
  })
  .meta('type', 'regression');

test('Verify page title, heading and UI contents are displayed correctly', async () => {
  await verifyTitleContainsText(`${preferredDatePage.pageTitle} ${Constants.generalTitle}`);
  await verifyExactText(preferredDatePage.pageTitleLocator, preferredDatePage.pageHeading);
  await verifyExactText(preferredDatePage.pageContentLocator, preferredDatePage.pageContent);
  await verifyExactText(preferredDatePage.dayTextBoxLabel, 'Day');
  await verifyExactText(preferredDatePage.monthTextBoxLabel, 'Month');
  await verifyExactText(preferredDatePage.yearTextBoxLabel, 'Year');
});

test('Verify the Back link takes you to the choose a test centre page', async () => {
  await preferredDatePage.goBack();
  const chooseATestCentrePage: ChooseATestCentrePage = new ChooseATestCentrePage();
  await verifyExactText(chooseATestCentrePage.pageTitleLocator, chooseATestCentrePage.pageHeading);
});

test('Verify that an error is displayed when entering no date and submitting', async () => {
  await clearField(preferredDatePage.dayTextBox);
  await clearField(preferredDatePage.monthTextBox);
  await clearField(preferredDatePage.yearTextBox);
  await click(preferredDatePage.continueButton);

  await verifyExactText(preferredDatePage.errorMessageLocator, preferredDatePage.errorMessageHeader);
  await verifyExactText(preferredDatePage.errorMessageList, 'Enter a valid date');
  await click(preferredDatePage.errorLinkDate);
});

test('Verify that an error is displayed when entering an invalid date', async () => {
  await preferredDatePage.enterPreferredDateAndSubmit('01', '13', '2020');

  await verifyExactText(preferredDatePage.errorMessageLocator, preferredDatePage.errorMessageHeader);
  await verifyExactText(preferredDatePage.errorMessageList, 'Enter a valid date');
  await click(preferredDatePage.errorLinkDate);
});

test('Verify that an error is displayed when missing the day from the date', async () => {
  await preferredDatePage.enterPreferredDate('01', '12', '2020');
  await clearField(preferredDatePage.dayTextBox);
  await click(preferredDatePage.continueButton);

  await verifyExactText(preferredDatePage.errorMessageLocator, preferredDatePage.errorMessageHeader);
  await verifyExactText(preferredDatePage.errorMessageList, 'You need to enter a day');
  await click(preferredDatePage.errorLinkDay);
});

test('Verify that an error is displayed when missing the month from the date', async () => {
  await preferredDatePage.enterPreferredDate('01', '12', '2020');
  await clearField(preferredDatePage.monthTextBox);
  await click(preferredDatePage.continueButton);

  await verifyExactText(preferredDatePage.errorMessageLocator, preferredDatePage.errorMessageHeader);
  await verifyExactText(preferredDatePage.errorMessageList, 'You need to enter a month');
  await click(preferredDatePage.errorLinkMonth);
});

test('Verify that an error is displayed when missing the year from the date', async () => {
  await preferredDatePage.enterPreferredDate('01', '12', '2020');
  await clearField(preferredDatePage.yearTextBox);
  await click(preferredDatePage.continueButton);

  await verifyExactText(preferredDatePage.errorMessageLocator, preferredDatePage.errorMessageHeader);
  await verifyExactText(preferredDatePage.errorMessageList, 'You need to enter a year');
  await click(preferredDatePage.errorLinkYear);
});

test('Verify that an error is displayed when entering a past date', async () => {
  const yesterdaysDate = new Date(new Date().getDate() - 1);
  await preferredDatePage.enterPreferredDateAndSubmit(
    yesterdaysDate.getDate().toString(),
    (yesterdaysDate.getMonth() + 1).toString(),
    yesterdaysDate.getFullYear().toString(),
  );

  await verifyExactText(preferredDatePage.errorMessageLocator, preferredDatePage.errorMessageHeader);
  await verifyExactText(preferredDatePage.errorMessageList, 'Date must be in the future');
  await click(preferredDatePage.errorLinkDate);
});

test('Verify that an error is displayed when entering a date more than 6 months in the future', async () => {
  const todaysDate = new Date();
  const overSixMonthsDate = new Date(todaysDate.setMonth(todaysDate.getMonth() + 6));
  overSixMonthsDate.setDate(overSixMonthsDate.getDate() + 1);
  await preferredDatePage.enterPreferredDateAndSubmit(
    overSixMonthsDate.getDate().toString(),
    (overSixMonthsDate.getMonth() + 1).toString(),
    overSixMonthsDate.getFullYear().toString(),
  );

  await verifyExactText(preferredDatePage.errorMessageLocator, preferredDatePage.errorMessageHeader);
  await verifyExactText(preferredDatePage.errorMessageList, 'Date must be within 6 months of today');
  await click(preferredDatePage.errorLinkDate);
});

test('Verify that an error is displayed when entering a date of today', async () => {
  const todaysDate = new Date();
  await preferredDatePage.enterPreferredDateAndSubmit(
    todaysDate.getDate().toString(),
    (todaysDate.getMonth() + 1).toString(),
    todaysDate.getFullYear().toString(),
  );

  await verifyExactText(preferredDatePage.errorMessageLocator, preferredDatePage.errorMessageHeader);
  await verifyExactText(preferredDatePage.errorMessageList, 'No test slots are available today. Try another date.');
  await click(preferredDatePage.errorLinkDate);
});

test('Verify that we can proceed to the appointment selection page when entering a valid date exactly 6 months in the future', async () => {
  const todaysDate = new Date();
  const sixMonthsDate = new Date(todaysDate.setMonth(todaysDate.getMonth() + 6));
  await preferredDatePage.enterPreferredDateAndSubmit(
    sixMonthsDate.getDate().toString(),
    (sixMonthsDate.getMonth() + 1).toString(),
    sixMonthsDate.getFullYear().toString(),
  );

  const chooseAppointmentPage = new ChooseAppointmentPage();
  await verifyExactText(chooseAppointmentPage.pageTitleLocator, chooseAppointmentPage.pageHeading);
});

// Test not run in IE11 due to the date picker not working
test('Verify that we can proceed to the appointment selection page when selecting a valid date using the date picker widget', async () => {
  if (t.browser.name.toLowerCase() !== 'internet explorer') {
    await preferredDatePage.showDatePicker();
    await preferredDatePage.selectDateOnDatePicker();
    await click(preferredDatePage.continueButton);

    const chooseAppointmentPage = new ChooseAppointmentPage();
    await verifyExactText(chooseAppointmentPage.pageTitleLocator, chooseAppointmentPage.pageHeading);
  } else {
    console.log('Test skipped for IE11');
  }
});

// Test not run in IE11 due to the date picker not working
test('Verify that todays date is disabled on the date picker widget', async () => {
  if (t.browser.name.toLowerCase() !== 'internet explorer') {
    await preferredDatePage.showDatePicker();
    const todaysDateClass = Selector(preferredDatePage.datePickerToday).getAttribute('class');
    await t.expect(todaysDateClass).contains('is-disabled', 'Todays date was not disabled');
  } else {
    console.log('Test skipped for IE11');
  }
});

test('Verify error prefix appears in the title when there is an error', async () => {
  await clearField(preferredDatePage.dayTextBox);
  await clearField(preferredDatePage.monthTextBox);
  await clearField(preferredDatePage.yearTextBox);
  await click(preferredDatePage.continueButton);
  await verifyTitleContainsText(`Error: ${preferredDatePage.pageTitle} ${Constants.generalTitle}`);
});
