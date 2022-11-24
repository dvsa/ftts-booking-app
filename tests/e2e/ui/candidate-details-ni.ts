import * as Constants from '../data/constants';
import {
  enter, verifyTitleContainsText, verifyContainsText, click, verifyExactText, verifyIsNotVisible, verifyValue,
} from '../utils/helpers';
import { ContactDetailsPage } from '../pages/contact-details-page';
import { SessionData } from '../data/session-data';
import { Target, TestType } from '../../../src/domain/enums';
import { NavigationHelper } from '../utils/navigation-helper';
import { MAX_TIMEOUT } from '../data/constants';
import { ChooseSupportPage } from '../pages/choose-support-page';
import { EligibilityErrorPage } from '../pages/eligibility-error-page';

let sessionData = new SessionData(Target.NI);
let navigationHelper = new NavigationHelper(sessionData);

fixture`Candidate details NI`
  .page(`${process.env.BOOKING_APP_URL}?target=${Target.NI}`)
  .before(async () => { await Constants.setRequestTimeout; })
  .meta('type', 'regression');

test('Verify page title and heading are displayed correctly', async () => {
  const candidateDetailsPage = await navigationHelper.navigateToCandidateDetailsPage();

  await verifyContainsText(candidateDetailsPage.pageHeadingLocator, candidateDetailsPage.pageHeading);
  await verifyContainsText(candidateDetailsPage.licenceNumberHint, candidateDetailsPage.licenceNumberHintTextNI);
});

test('Verify Back link takes you to the choose support page', async () => {
  const candidateDetailsPage = await navigationHelper.navigateToCandidateDetailsPage();
  await candidateDetailsPage.goBack();
  const chooseSupportPage: ChooseSupportPage = new ChooseSupportPage();
  await verifyContainsText(chooseSupportPage.pageHeadingLocator, chooseSupportPage.pageHeading);
});

test('Verify the user is able enter valid NI drivers details and navigate to the contact details page', async () => {
  const candidateDetailsPage = await navigationHelper.navigateToCandidateDetailsPage();
  await candidateDetailsPage.enterCandidateDetailsAndSubmit(sessionData.candidate);
  const contactDetailsPage: ContactDetailsPage = new ContactDetailsPage();
  await verifyTitleContainsText(`${contactDetailsPage.pageHeading} ${Constants.generalTitleNI}`);
  await verifyContainsText(contactDetailsPage.pageHeadingLocator, contactDetailsPage.pageHeading);
});

test('Verify the user is able enter valid NI drivers details with white spaces and still navigate to the contact details page as they are trimmed', async () => {
  const candidateDetailsPage = await navigationHelper.navigateToCandidateDetailsPage();
  await candidateDetailsPage.enterCandidateDetailsWithSpaces(sessionData.candidate);
  await candidateDetailsPage.submitDetails();
  const contactDetailsPage: ContactDetailsPage = new ContactDetailsPage();
  await verifyTitleContainsText(`${contactDetailsPage.pageHeading} ${Constants.generalTitleNI}`);
  await verifyContainsText(contactDetailsPage.pageHeadingLocator, contactDetailsPage.pageHeading);
});

test('Verify the user gets an error when GB licence is detected (16 characters)', async () => {
  const sessionDataGB = new SessionData(Target.GB);
  const candidateDetailsPage = await navigationHelper.navigateToCandidateDetailsPage();
  await candidateDetailsPage.enterCandidateDetails(sessionDataGB.candidate);
  await candidateDetailsPage.submitDetails();

  await verifyContainsText(candidateDetailsPage.errorMessageLocator, candidateDetailsPage.errorMessage);
});

test('Verify the user gets an error when entering an invalid first name', async () => {
  const candidateDetailsPage = await navigationHelper.navigateToCandidateDetailsPage();
  await candidateDetailsPage.enterCandidateDetails(sessionData.candidate);
  await enter(candidateDetailsPage.firstNameTextBox, 'Test First Name');
  await candidateDetailsPage.submitDetails();

  await verifyContainsText(candidateDetailsPage.errorMessageLocator, candidateDetailsPage.errorMessage);
});

test('Verify the user gets an error when entering an invalid surname', async () => {
  const candidateDetailsPage = await navigationHelper.navigateToCandidateDetailsPage();
  await candidateDetailsPage.enterCandidateDetails(sessionData.candidate);
  await enter(candidateDetailsPage.surnameTextBox, 'Test Surname');
  await candidateDetailsPage.submitDetails();

  await verifyContainsText(candidateDetailsPage.errorMessageLocator, candidateDetailsPage.errorMessage);
});

test('Verify the user gets an error when entering an invalid licence number', async () => {
  const candidateDetailsPage = await navigationHelper.navigateToCandidateDetailsPage();
  await candidateDetailsPage.enterCandidateDetails(sessionData.candidate);
  await enter(candidateDetailsPage.drivingLicenceTextBox, 'A1B2C3D4E5F67890');
  await candidateDetailsPage.submitDetails();

  await verifyContainsText(candidateDetailsPage.errorMessageLocator, candidateDetailsPage.errorMessage);
});

test('Verify the user gets an error when entering an invalid day', async () => {
  const candidateDetailsPage = await navigationHelper.navigateToCandidateDetailsPage();
  await candidateDetailsPage.enterCandidateDetails(sessionData.candidate);
  await enter(candidateDetailsPage.dobDayTextBox, '11');
  await candidateDetailsPage.submitDetails();

  await verifyContainsText(candidateDetailsPage.errorMessageLocator, candidateDetailsPage.errorMessage);
});

test('Verify the user gets an error when entering an invalid month', async () => {
  const candidateDetailsPage = await navigationHelper.navigateToCandidateDetailsPage();
  await candidateDetailsPage.enterCandidateDetails(sessionData.candidate);
  await enter(candidateDetailsPage.dobMonthTextBox, '13');
  await candidateDetailsPage.submitDetails();

  await verifyContainsText(candidateDetailsPage.errorMessageLocator, candidateDetailsPage.errorMessage);
});

test('Verify the user gets an error when entering an invalid year', async () => {
  const candidateDetailsPage = await navigationHelper.navigateToCandidateDetailsPage();
  await candidateDetailsPage.enterCandidateDetails(sessionData.candidate);
  await enter(candidateDetailsPage.dobYearTextBox, '2003');
  await candidateDetailsPage.submitDetails();

  await verifyContainsText(candidateDetailsPage.errorMessageLocator, candidateDetailsPage.errorMessage);
});

test('Verify the user gets an error on submitting an empty candidate details form', async () => {
  const candidateDetailsPage = await navigationHelper.navigateToCandidateDetailsPage();
  await candidateDetailsPage.submitDetails();
  await verifyContainsText(candidateDetailsPage.errorMessageLocator, candidateDetailsPage.errorMessage, 0, MAX_TIMEOUT);
});

test('Verify error prefix appears in the title when there is an error', async () => {
  const candidateDetailsPage = await navigationHelper.navigateToCandidateDetailsPage();
  await candidateDetailsPage.submitDetails();
  await verifyTitleContainsText('Error:');
  await verifyTitleContainsText(`${candidateDetailsPage.pageHeading} ${Constants.generalTitleNI}`);
});

test('Verify the user is able to open all See example links', async () => {
  const candidateDetailsPage = await navigationHelper.navigateToCandidateDetailsPage();
  await click(candidateDetailsPage.firstnamesExampleLink);
  await click(candidateDetailsPage.surnameExampleLink);
  await click(candidateDetailsPage.drivingLicenceTextBox);

  await verifyContainsText(candidateDetailsPage.candidateDetailsContentLocator3, candidateDetailsPage.seeExampleText, 0);
  await verifyContainsText(candidateDetailsPage.candidateDetailsContentLocator3, candidateDetailsPage.seeExampleText, 1);
  await verifyContainsText(candidateDetailsPage.candidateDetailsContentLocator3, candidateDetailsPage.seeExampleText, 2);

  await candidateDetailsPage.checkExampleImagesAreVisible();
});

test('Verify if the candidate is not eligible to book online an error page is displayed', async () => {
  const sessionDataNoElig = new SessionData(Target.NI);
  sessionDataNoElig.candidate.licenceNumber = '69062660';
  sessionDataNoElig.candidate.firstnames = 'Caroline Firth';
  sessionDataNoElig.candidate.surname = 'Samuels';
  sessionDataNoElig.candidate.dateOfBirth = '1988-02-05';
  const navigationHelperNoElig = new NavigationHelper(sessionDataNoElig);
  const candidateDetailsPage = await navigationHelperNoElig.navigateToCandidateDetailsPage();
  await candidateDetailsPage.enterCandidateDetailsAndSubmit(sessionDataNoElig.candidate);
  const eligibilityErrorPage: EligibilityErrorPage = new EligibilityErrorPage();
  await verifyTitleContainsText(`${eligibilityErrorPage.pageHeading} ${Constants.generalTitleNI}`);
  await verifyContainsText(eligibilityErrorPage.pageHeadingLocator, eligibilityErrorPage.pageHeading);
  await verifyContainsText(eligibilityErrorPage.messageLocator, eligibilityErrorPage.text1DVA, 0);
});

test('Verify if the candidate has already booked a motorcycle test cannot book a new motorcycle test again', async () => {
  sessionData = new SessionData(Target.NI);
  Constants.getNICandidateWithBookedTest(sessionData);
  sessionData.currentBooking.testType = TestType.MOTORCYCLE;
  navigationHelper = new NavigationHelper(sessionData);
  const testTypePage = await navigationHelper.navigateToNiTestTypePage();
  await verifyTitleContainsText(`${testTypePage.pageHeading}`);
  await verifyExactText(testTypePage.pageHeadingLocator, testTypePage.pageHeading);
  const motorcycleRadioOption = testTypePage.testCategoryOptionSelector.replace('<>', 'motorcycle');
  await verifyIsNotVisible(motorcycleRadioOption);
});

test('Verify if the candidate has already booked a motorcycle test, should be able to book a car test', async () => {
  sessionData = new SessionData(Target.NI);
  Constants.getNICandidateWithBookedTest(sessionData);
  navigationHelper = new NavigationHelper(sessionData);
  const testTypePage = await navigationHelper.navigateToNiTestTypePage();
  await verifyTitleContainsText(`${testTypePage.pageHeading}`);
  await verifyExactText(testTypePage.pageHeadingLocator, testTypePage.pageHeading);
  await verifyValue(testTypePage.testCategoryRadio, 'car', 0);
});
