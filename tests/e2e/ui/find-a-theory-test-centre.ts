/* eslint-disable security/detect-non-literal-regexp */
import { RequestLogger } from 'testcafe';
import * as Constants from '../data/constants';
import {
  verifyExactText, verifyIsVisible, setCookie, click, clearField, getCurrentUrl, runningTestsLocally, verifyTitleContainsText,
} from '../utils/helpers';
import { FindATheoryTestCentrePage } from '../pages/find-a-theory-test-centre-page';
import { FindATheoryTestCentreErrorPage } from '../pages/find-a-theory-test-centre-error-page';
import { Target, TestType } from '../../../src/domain/enums';
import { SessionData } from '../data/session-data';
import { SelectStandardSupportPage } from '../pages/select-standard-support-page';
import { VoiceoverPage } from '../pages/voiceover-page';

const findATheoryTestCentrePage = new FindATheoryTestCentrePage();
const findTestCentreErrorPage = new FindATheoryTestCentreErrorPage();
const pageUrl = `${process.env.BOOKING_APP_URL}/${findATheoryTestCentrePage.pathUrl}`;
const headerLogger = RequestLogger([new RegExp(`${process.env.BOOKING_APP_URL}`)], {
  logResponseHeaders: true,
});

fixture`Find a theory test centre`
  .page(process.env.BOOKING_APP_URL)
  .requestHooks(headerLogger)
  .before(async () => { await Constants.setRequestTimeout; })
  .beforeEach(async (t) => {
    const sessionData = new SessionData(Target.GB);
    await setCookie(headerLogger, sessionData);
    await t.navigateTo(pageUrl);
  })
  .meta('type', 'regression');

test('Verify page title and heading are displayed correctly', async () => {
  await verifyTitleContainsText(`${findATheoryTestCentrePage.pageHeading} ${Constants.generalTitle}`);
  await verifyExactText(findATheoryTestCentrePage.pageHeadingLocator, findATheoryTestCentrePage.pageHeading);
});

test('Verify Back link takes you to the select standard support page when no support selected (Car test)', async (t) => {
  const sessionData = new SessionData(Target.GB);
  sessionData.currentBooking.testType = TestType.CAR;
  sessionData.journey.shownStandardSupportPageFlag = true;
  sessionData.journey.shownVoiceoverPageFlag = false;
  await setCookie(headerLogger, sessionData);
  await t.navigateTo(pageUrl);

  await verifyTitleContainsText(`${findATheoryTestCentrePage.pageHeading} ${Constants.generalTitle}`);
  await findATheoryTestCentrePage.goBack();

  const selectStandardSupportTypePage = new SelectStandardSupportPage();
  await verifyTitleContainsText(selectStandardSupportTypePage.pageHeading);
  await verifyExactText(selectStandardSupportTypePage.pageHeadingLocator, selectStandardSupportTypePage.pageHeading);
});

test('Verify Back link takes you to the voiceover page if it was selected (Car test)', async (t) => {
  const sessionData = new SessionData(Target.GB);
  sessionData.currentBooking.testType = TestType.CAR;
  sessionData.journey.shownStandardSupportPageFlag = true;
  sessionData.journey.shownVoiceoverPageFlag = true;
  await setCookie(headerLogger, sessionData);
  await t.navigateTo(pageUrl);

  await verifyTitleContainsText(`${findATheoryTestCentrePage.pageHeading} ${Constants.generalTitle}`);
  await findATheoryTestCentrePage.goBack();

  const voiceoverPage = new VoiceoverPage();
  await verifyTitleContainsText(voiceoverPage.pageHeading);
  await verifyExactText(voiceoverPage.pageHeadingLocator, voiceoverPage.pageHeading);
});

test('Verify Back link takes you to the voiceover page (LGV test)', async (t) => {
  const sessionData = new SessionData(Target.GB);
  sessionData.currentBooking.testType = TestType.LGVHPT;
  await setCookie(headerLogger, sessionData);
  await t.navigateTo(pageUrl);

  await verifyTitleContainsText(`${findATheoryTestCentrePage.pageHeading} ${Constants.generalTitle}`);
  await findATheoryTestCentrePage.goBack();

  const voiceoverPage = new VoiceoverPage();
  await verifyTitleContainsText(voiceoverPage.pageHeading);
  await verifyExactText(voiceoverPage.pageHeadingLocator, voiceoverPage.pageHeading);
});

test('Verify the user is able to search for a theory test centre using a valid partial postcode', async () => {
  const chooseATestCentrePage = await findATheoryTestCentrePage.findATheoryTestCentre(Constants.searchWithPartialPostcode);

  await verifyExactText(chooseATestCentrePage.searchQueryValue, Constants.searchWithPartialPostcode);
  await verifyExactText(chooseATestCentrePage.testCentreCount, '5');
});

test('Verify the user is able to search for a theory test centre using a valid area name', async () => {
  const chooseATestCentrePage = await findATheoryTestCentrePage.findATheoryTestCentre(Constants.searchWithAreaName);

  await verifyExactText(chooseATestCentrePage.searchQueryValue, Constants.searchWithAreaName);
  await verifyExactText(chooseATestCentrePage.testCentreCount, '5');
});

test('Verify the user is able to search for a theory test centre using a valid city name', async () => {
  const chooseATestCentrePage = await findATheoryTestCentrePage.findATheoryTestCentre(Constants.searchWithCityName);

  await verifyExactText(chooseATestCentrePage.searchQueryValue, Constants.searchWithCityName);
  await verifyExactText(chooseATestCentrePage.testCentreCount, '5');
});

test('Verify the user is able to search for a theory test centre using a valid long search term', async () => {
  const chooseATestCentrePage = await findATheoryTestCentrePage.findATheoryTestCentre(Constants.searchWithLongTerm);

  await verifyExactText(chooseATestCentrePage.searchQueryValue, Constants.searchWithLongTerm);
  await verifyExactText(chooseATestCentrePage.testCentreCount, '5');
});

test('Verify the app does not execute Javascript entered in the search term', async (t) => {
  await findATheoryTestCentrePage.enterSearchTerm(Constants.searchWithEscapeJavaScript);
  await click(findATheoryTestCentrePage.findButton);

  const alert = await t.getNativeDialogHistory();
  await t.expect(alert.length).eql(0);

  if (runningTestsLocally()) {
    await verifyExactText(findATheoryTestCentrePage.errorMessageLocator, findATheoryTestCentrePage.errorMessage);
  } else {
    await verifyTitleContainsText(findTestCentreErrorPage.pageHeading, Constants.MEDIUM_TIMEOUT);
    await verifyExactText(findTestCentreErrorPage.pageHeadingLocator, findTestCentreErrorPage.pageHeading);
    await verifyExactText(findTestCentreErrorPage.contentLocator, findTestCentreErrorPage.contentText);
  }
});

test('Verify if no results returned for search term then an error message is displayed', async () => {
  await findATheoryTestCentrePage.enterSearchTerm(Constants.searchWithZeroReults);
  await click(findATheoryTestCentrePage.findButton);
  await verifyTitleContainsText('Error', Constants.MEDIUM_TIMEOUT);
  await verifyExactText(findATheoryTestCentrePage.errorMessageLocator, findATheoryTestCentrePage.errorMessage);
});

test('Verify the user is unable to search for a theory test centre using an invalid 2 characters search term and get an error message', async () => {
  await findATheoryTestCentrePage.enterSearchTerm(Constants.searchWithInvalid2Characters);
  await click(findATheoryTestCentrePage.findButton);
  await verifyTitleContainsText('Error', Constants.MEDIUM_TIMEOUT);
  await verifyExactText(findATheoryTestCentrePage.errorMessageLocator, findATheoryTestCentrePage.errorMessage);
});

test('Verify the user is unable to search for a theory test centre using an invalid 513 characters search term and get an error message', async () => {
  await findATheoryTestCentrePage.enterSearchTerm(Constants.searchWithInvalid513Characters);
  await click(findATheoryTestCentrePage.findButton);
  await verifyTitleContainsText('Error', Constants.MEDIUM_TIMEOUT);
  await verifyExactText(findATheoryTestCentrePage.errorMessageLocator, findATheoryTestCentrePage.errorMessage, 0, Constants.MEDIUM_TIMEOUT);
});

test('Verify the user is unable to search for a theory test centre without entering a search term and get an error message', async () => {
  await clearField(findATheoryTestCentrePage.searchLocationTermTextBox);
  await click(findATheoryTestCentrePage.findButton);
  await verifyTitleContainsText('Error', Constants.MEDIUM_TIMEOUT);
  await verifyTitleContainsText(`${findATheoryTestCentrePage.pageHeading} ${Constants.generalTitle}`);
  await verifyExactText(findATheoryTestCentrePage.errorMessageLocator, findATheoryTestCentrePage.errorMessage);
});

test('Verify the error message links to the search field for the user to navigate to', async () => {
  await clearField(findATheoryTestCentrePage.searchLocationTermTextBox);
  await click(findATheoryTestCentrePage.findButton);
  await verifyTitleContainsText('Error', Constants.MEDIUM_TIMEOUT);
  await verifyIsVisible(findATheoryTestCentrePage.errorMessageLocator);
  await findATheoryTestCentrePage.clickErrorLink();
});

test('Verify the correct error page is displayed in the case of a failure calling the Location API', async (t) => {
  const chooseATestCentrePage = await findATheoryTestCentrePage.findATheoryTestCentre(Constants.searchWithError);
  await t.expect(getCurrentUrl()).contains(chooseATestCentrePage.pathUrl);
  await verifyTitleContainsText(findTestCentreErrorPage.pageHeading);
  await verifyExactText(findTestCentreErrorPage.pageHeadingLocator, findTestCentreErrorPage.pageHeading);
  await verifyExactText(findTestCentreErrorPage.contentLocator, findTestCentreErrorPage.contentText);
});

test('Verify the Back link on the error page takes you back to the find a test centre page', async () => {
  await findATheoryTestCentrePage.findATheoryTestCentre(Constants.searchWithError);
  await verifyTitleContainsText(findTestCentreErrorPage.pageHeading);
  await verifyExactText(findTestCentreErrorPage.pageHeadingLocator, findTestCentreErrorPage.pageHeading);
  await findTestCentreErrorPage.goBack();
  await verifyExactText(findATheoryTestCentrePage.pageHeadingLocator, findATheoryTestCentrePage.pageHeading);
});
