/* eslint-disable no-shadow */
/* eslint-disable security/detect-non-literal-regexp */
import * as Constants from '../data/constants';
import {
  verifyExactText, verifyTitleContainsText, click, verifyContainsText, verifyIsVisible,
} from '../utils/helpers';
import { generalTitle } from '../data/constants';
import { ChooseSupportPage } from '../pages/choose-support-page';
import { StartPage } from '../pages/start-page';

const chooseSupportPage = new ChooseSupportPage();
const pageUrl = `${process.env.BOOKING_APP_URL}/${chooseSupportPage.pathUrl}`;

fixture`Choose support page`
  .page(process.env.BOOKING_APP_URL)
  .before(async () => { await Constants.setRequestTimeout; })
  .beforeEach(async (t) => {
    await t.navigateTo(pageUrl);
  })
  .meta('type', 'regression');

test('Verify page title and heading are displayed correctly', async () => {
  await verifyTitleContainsText(`${chooseSupportPage.pageTitle} ${generalTitle}`);
  await verifyExactText(chooseSupportPage.pageTitleLocator, chooseSupportPage.pageHeading);
});

test('Verify error prefix appears in the title when there is an error', async () => {
  await click(chooseSupportPage.continueButton);
  await verifyTitleContainsText(`Error: ${chooseSupportPage.pageTitle} ${Constants.generalTitle}`);
});

test('Verify the user is unable to proceed without selecting an option and an error message is displayed, clicking on the link takes user to the field', async () => {
  await click(chooseSupportPage.continueButton);
  await verifyExactText(chooseSupportPage.errorMessageLocator, chooseSupportPage.errorMessageHeader);
  await verifyExactText(chooseSupportPage.errorMessageList, chooseSupportPage.errorMessageText);
  await verifyContainsText(chooseSupportPage.errorMessageRadioLocator, chooseSupportPage.errorMessageText);
  await verifyIsVisible(chooseSupportPage.errorLink);
  await chooseSupportPage.clickErrorLink();
});

test('Verify the Back link takes you to the start page', async () => {
  await chooseSupportPage.goBack();
  const startPage = new StartPage();
  await verifyExactText(startPage.pageTitleLocator, startPage.pageTitle);
});
