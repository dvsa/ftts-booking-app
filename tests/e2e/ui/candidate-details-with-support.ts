import * as Constants from '../data/constants';
import {
  verifyExactText, enter, verifyTitleContainsText, verifyIsVisible,
} from '../utils/helpers';
import { SessionData } from '../data/session-data';
import { TARGET } from '../../../src/domain/enums';
import { NavigationHelperNSA } from '../utils/navigation-helper-nsa';
import { ChooseSupportPage } from '../pages/choose-support-page';
import { TestTypePage } from '../pages/test-type-page';

const sessionData = new SessionData(TARGET.GB);
sessionData.journey.support = true;
const navigationHelper = new NavigationHelperNSA(sessionData);

fixture`Candidate details with support`
  .page(process.env.BOOKING_APP_URL)
  .before(async () => { await Constants.setRequestTimeout; })
  .meta('type', 'regression');

test('Verify page title and heading are displayed correctly', async () => {
  const candidateDetailsPage = await navigationHelper.navigateToCandidateDetailsPage();
  await verifyTitleContainsText(`${candidateDetailsPage.pageTitle} ${Constants.generalTitle}`);
  await verifyExactText(candidateDetailsPage.pageTitleLocator, candidateDetailsPage.pageHeadingSupport);
});

test('Verify Back link takes you to the choose support page', async () => {
  const candidateDetailsPage = await navigationHelper.navigateToCandidateDetailsPage();
  await candidateDetailsPage.goBack();
  const chooseSupportPage: ChooseSupportPage = new ChooseSupportPage();
  await verifyExactText(chooseSupportPage.pageTitleLocator, chooseSupportPage.pageHeading);
});

test('Verify the user is able enter valid drivers details and navigate to the tese type page', async () => {
  const candidateDetailsPage = await navigationHelper.navigateToCandidateDetailsPage();
  await candidateDetailsPage.enterCandidateDetailsAndSubmit(sessionData.candidate);
  const testTypePage: TestTypePage = new TestTypePage();
  await verifyExactText(testTypePage.pageTitleLocator, testTypePage.pageHeading);
});

test('Verify the user is able enter valid NI drivers details and navigate to the test type page', async () => {
  const sessionDataNI = new SessionData(TARGET.NI);
  sessionDataNI.journey.support = true;
  const navigationHelperNI = new NavigationHelperNSA(sessionDataNI);
  const candidateDetailsPage = await navigationHelperNI.navigateToCandidateDetailsPage();
  await candidateDetailsPage.enterCandidateDetailsAndSubmit(sessionDataNI.candidate);
  const testTypePage: TestTypePage = new TestTypePage();
  await verifyTitleContainsText(`${testTypePage.pageTitle} ${Constants.generalTitle}`);
  await verifyExactText(testTypePage.pageTitleLocator, testTypePage.pageHeading);
});

test('Verify any characters after the initial 16 license number should be ignored', async () => {
  const candidateDetailsPage = await navigationHelper.navigateToCandidateDetailsPage();
  await candidateDetailsPage.enterCandidateDetails(sessionData.candidate);
  await enter(candidateDetailsPage.drivingLicenceTextBox, 'JONES061102W97YTUI');
  await candidateDetailsPage.submitDetails();
  const testTypePage: TestTypePage = new TestTypePage();
  await verifyExactText(testTypePage.pageTitleLocator, testTypePage.pageHeading);
});

test('Verify the user gets an error when entering an invalid first name', async () => {
  const candidateDetailsPage = await navigationHelper.navigateToCandidateDetailsPage();
  await candidateDetailsPage.enterCandidateDetails(sessionData.candidate);
  await enter(candidateDetailsPage.firstNameTextBox, 'Test First Name');
  await candidateDetailsPage.submitDetails();
  await verifyExactText(candidateDetailsPage.errorMessageLocator, candidateDetailsPage.errorMessage);
});

test('Verify the user gets an error when entering an invalid surname', async () => {
  const candidateDetailsPage = await navigationHelper.navigateToCandidateDetailsPage();
  await candidateDetailsPage.enterCandidateDetails(sessionData.candidate);
  await enter(candidateDetailsPage.surnameTextBox, 'Test Surname');
  await candidateDetailsPage.submitDetails();
  await verifyExactText(candidateDetailsPage.errorMessageLocator, candidateDetailsPage.errorMessage);
});

test('Verify the user gets an error when entering an invalid licence number', async () => {
  const candidateDetailsPage = await navigationHelper.navigateToCandidateDetailsPage();
  await candidateDetailsPage.enterCandidateDetails(sessionData.candidate);
  await enter(candidateDetailsPage.drivingLicenceTextBox, 'A1B2C3D4E5F67890');
  await candidateDetailsPage.submitDetails();
  await verifyExactText(candidateDetailsPage.errorMessageLocator, candidateDetailsPage.errorMessage);
});

test('Verify the user gets an error when entering an invalid day', async () => {
  const candidateDetailsPage = await navigationHelper.navigateToCandidateDetailsPage();
  await candidateDetailsPage.enterCandidateDetails(sessionData.candidate);
  await enter(candidateDetailsPage.dobDayTextBox, '11');
  await candidateDetailsPage.submitDetails();
  await verifyExactText(candidateDetailsPage.errorMessageLocator, candidateDetailsPage.errorMessage);
});

test('Verify the user gets an error when entering an invalid month', async () => {
  const candidateDetailsPage = await navigationHelper.navigateToCandidateDetailsPage();
  await candidateDetailsPage.enterCandidateDetails(sessionData.candidate);
  await enter(candidateDetailsPage.dobMonthTextBox, '10');
  await candidateDetailsPage.submitDetails();
  await verifyExactText(candidateDetailsPage.errorMessageLocator, candidateDetailsPage.errorMessage);
});

test('Verify the user gets an error when entering an invalid year', async () => {
  const candidateDetailsPage = await navigationHelper.navigateToCandidateDetailsPage();
  await candidateDetailsPage.enterCandidateDetails(sessionData.candidate);
  await enter(candidateDetailsPage.dobYearTextBox, '2003');
  await candidateDetailsPage.submitDetails();
  await verifyExactText(candidateDetailsPage.errorMessageLocator, candidateDetailsPage.errorMessage);
});

test('Verify the user gets an error on submitting an empty candidate details form', async () => {
  const candidateDetailsPage = await navigationHelper.navigateToCandidateDetailsPage();
  await candidateDetailsPage.submitDetails();
  await verifyExactText(candidateDetailsPage.errorMessageLocator, candidateDetailsPage.errorMessage);
});

test.skip('Verify the example images are all visible', async () => {
  const candidateDetailsPage = await navigationHelper.navigateToCandidateDetailsPage();
  await verifyIsVisible(candidateDetailsPage.exampleImage, 0, 20000);
  await verifyIsVisible(candidateDetailsPage.exampleImage, 1, 20000);
  await verifyIsVisible(candidateDetailsPage.exampleImage, 2, 20000);
});
