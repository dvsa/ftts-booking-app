/* eslint-disable security/detect-non-literal-regexp */
import { RequestLogger } from 'testcafe';
import * as Constants from '../data/constants';
import {
  verifyExactText, setCookie, verifyContainsText, clearField, click, verifyIsNotVisible, verifyTitleContainsText, verifyIsVisible,
} from '../utils/helpers';
import { ContactDetailsPage } from '../pages/contact-details-page';
import { TestTypePage } from '../pages/test-type-page';
import { Locale, Target } from '../../../src/domain/enums';
import { SessionData } from '../data/session-data';

const contactDetailsPage = new ContactDetailsPage();
const pageUrl = `${process.env.BOOKING_APP_URL}/${contactDetailsPage.pathUrl}`;
const pageUrlNsa = `${process.env.BOOKING_APP_URL}/${contactDetailsPage.pathUrlNsa}`;
const headerLogger = RequestLogger([new RegExp(`${process.env.BOOKING_APP_URL}`)], {
  logResponseHeaders: true,
});

fixture`Contact details`
  .page(process.env.BOOKING_APP_URL)
  .requestHooks(headerLogger)
  .before(async () => { await Constants.setRequestTimeout; })
  .beforeEach(async (t) => {
    await setCookie(headerLogger, new SessionData(Target.GB));
    await t.navigateTo(pageUrl);
  })
  .meta('type', 'regression');

test('Verify page title heading are displayed correctly - Standard Accommodations', async () => {
  await verifyExactText(contactDetailsPage.pageHeadingLocator, contactDetailsPage.pageHeading);
});

test('Verify page title heading are displayed correctly - Non-Standard Accommodations', async (t) => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true);
  await setCookie(headerLogger, sessionData);
  await t.navigateTo(pageUrlNsa);
  await verifyExactText(contactDetailsPage.pageHeadingLocator, contactDetailsPage.pageHeadingNSA);
});

test('Verify that the Back link is not visible - Standard Accommodations', async () => {
  await verifyIsNotVisible(contactDetailsPage.backLink);
});

test('Verify that the Back link is visible - Non-Standard Accommodations', async (t) => {
  const sessionData = new SessionData(Target.GB, Locale.GB, true);
  await setCookie(headerLogger, sessionData);
  await t.navigateTo(pageUrlNsa);
  await verifyIsVisible(contactDetailsPage.backLink);
});

test('Verify that when entering no details, an error is displayed', async () => {
  await clearField(contactDetailsPage.emailAddressTextBox);
  await clearField(contactDetailsPage.confirmEmailAddressTextBox);
  await click(contactDetailsPage.continueButton);

  await verifyExactText(contactDetailsPage.errorMessageLocator, contactDetailsPage.errorMessageHeader);
  await verifyContainsText(contactDetailsPage.errorMessageList, contactDetailsPage.invalidEmailErrorText);
  await verifyContainsText(contactDetailsPage.errorMessageList, contactDetailsPage.invalidConfirmationEmailErrorText);
  await verifyContainsText(contactDetailsPage.errorMessageList, contactDetailsPage.confirmEmailMatchesErrorText);

  await contactDetailsPage.clickEmailErrorLink();
  await contactDetailsPage.clickConfirmEmailErrorLink();
});

test('Verify that when both email addresses are invalid but match, an error is displayed', async () => {
  await contactDetailsPage.enterContactDetails('test@test', 'test@test');

  await verifyExactText(contactDetailsPage.errorMessageLocator, contactDetailsPage.errorMessageHeader);
  await verifyContainsText(contactDetailsPage.errorMessageList, contactDetailsPage.invalidEmailErrorText);
  await verifyContainsText(contactDetailsPage.errorMessageList, contactDetailsPage.invalidConfirmationEmailErrorText);

  await contactDetailsPage.clickConfirmEmailErrorLink();
});

test('Verify that when the email addresses don\'t match, an error is displayed', async () => {
  await contactDetailsPage.enterContactDetails('test@test.com', 'test1@test.com');

  await verifyExactText(contactDetailsPage.errorMessageLocator, contactDetailsPage.errorMessageHeader);
  await verifyExactText(contactDetailsPage.errorMessageList, contactDetailsPage.confirmEmailMatchesErrorText);

  await contactDetailsPage.clickConfirmEmailErrorLink();
});

test('Verify that when entering an email address over 100 characters, an error is displayed', async () => {
  await contactDetailsPage.enterContactDetails('12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012@test.com',
    '12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012@test.com');

  await verifyExactText(contactDetailsPage.errorMessageLocator, contactDetailsPage.errorMessageHeader);
  await verifyContainsText(contactDetailsPage.errorMessageList, contactDetailsPage.over100CharsErrorText);

  await contactDetailsPage.clickConfirmEmailErrorLink();
});

const validEmailDataSet = [
  {
    email: 'test@test.com',
  },
  // {
  //   email: 'wildwezyr@fahrvergnügen.net',
  // },
  // {
  //   email: 'nathan@学生优惠.com',
  // },
  // {
  //   email: '"email..email"@domain.com',
  // },
  {
    email: 'aaa!#$%&\'*+-/=?^_`{|}~@example.com',
  },
];

validEmailDataSet.forEach((data) => {
  test(`Verify that when both email addresses are valid and match, we can proceed with the booking - ${data.email}`, async () => {
    await contactDetailsPage.enterContactDetails(data.email, data.email);
    const testTypePage = new TestTypePage();
    await verifyExactText(testTypePage.pageHeadingLocator, testTypePage.pageHeading);
  });
});

test('Verify error prefix appears in the title when there is an error', async () => {
  await clearField(contactDetailsPage.emailAddressTextBox);
  await clearField(contactDetailsPage.confirmEmailAddressTextBox);
  await click(contactDetailsPage.continueButton);

  await verifyExactText(contactDetailsPage.errorMessageLocator, contactDetailsPage.errorMessageHeader);
  await verifyTitleContainsText('Error:');
  await verifyTitleContainsText(`${contactDetailsPage.pageHeading} ${Constants.generalTitle}`);
});
