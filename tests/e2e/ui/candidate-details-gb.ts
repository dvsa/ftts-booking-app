import * as Constants from '../data/constants';
import {
  verifyExactText, enter, verifyTitleContainsText, click, verifyContainsText, verifyIsNotVisible, verifyValue,
} from '../utils/helpers';
import { ContactDetailsPage } from '../pages/contact-details-page';
import { SessionData } from '../data/session-data';
import { Target, TestType } from '../../../src/domain/enums';
import { NavigationHelper } from '../utils/navigation-helper';
import { ChooseSupportPage } from '../pages/choose-support-page';
import { EligibilityErrorPage } from '../pages/eligibility-error-page';
import { MAX_TIMEOUT } from '../data/constants';
import { TestTypePage } from '../pages/test-type-page';

let sessionData = new SessionData(Target.GB);
let navigationHelper = new NavigationHelper(sessionData);

fixture`Candidate details GB`
  .page(`${process.env.BOOKING_APP_URL}?target=${Target.GB}`)
  .before(async () => { await Constants.setRequestTimeout; })
  .meta('type', 'regression');

test('Verify page title and heading are displayed correctly', async () => {
  const candidateDetailsPage = await navigationHelper.navigateToCandidateDetailsPage();

  await verifyExactText(candidateDetailsPage.pageHeadingLocator, candidateDetailsPage.pageHeading);
  await verifyContainsText(candidateDetailsPage.licenceNumberHint, candidateDetailsPage.licenceNumberHintTextGB);
});

test('Verify Back link takes you to the choose support page', async () => {
  const candidateDetailsPage = await navigationHelper.navigateToCandidateDetailsPage();
  await candidateDetailsPage.goBack();
  const chooseSupportPage: ChooseSupportPage = new ChooseSupportPage();
  await verifyExactText(chooseSupportPage.pageHeadingLocator, chooseSupportPage.pageHeading);
});

test('Verify the user is able enter valid drivers details and navigate to the contact details page', async () => {
  const candidateDetailsPage = await navigationHelper.navigateToCandidateDetailsPage();
  await candidateDetailsPage.enterCandidateDetailsAndSubmit(sessionData.candidate);
  const contactDetailsPage: ContactDetailsPage = new ContactDetailsPage();
  await verifyExactText(contactDetailsPage.pageHeadingLocator, contactDetailsPage.pageHeading);
});

test('Verify the user is able enter valid drivers details with white spaces and still navigate to the contact details page as they are trimmed', async () => {
  const candidateDetailsPage = await navigationHelper.navigateToCandidateDetailsPage();
  await candidateDetailsPage.enterCandidateDetailsWithSpaces(sessionData.candidate);
  await candidateDetailsPage.submitDetails();
  const contactDetailsPage: ContactDetailsPage = new ContactDetailsPage();
  await verifyExactText(contactDetailsPage.pageHeadingLocator, contactDetailsPage.pageHeading);
});

test('Verify the user is able enter licence number in lower case and navigate to the contact details page', async () => {
  const candidateDetailsPage = await navigationHelper.navigateToCandidateDetailsPage();
  await candidateDetailsPage.enterCandidateDetails(sessionData.candidate);
  await enter(candidateDetailsPage.drivingLicenceTextBox, Constants.drivingLicenceGB.toLowerCase());
  await candidateDetailsPage.submitDetails();
  const contactDetailsPage: ContactDetailsPage = new ContactDetailsPage();
  await verifyExactText(contactDetailsPage.pageHeadingLocator, contactDetailsPage.pageHeading);
});

test('Verify the user is able enter licence number in mixed of upper and lower case and navigate to the contact details page', async () => {
  const candidateDetailsPage = await navigationHelper.navigateToCandidateDetailsPage();
  await candidateDetailsPage.enterCandidateDetails(sessionData.candidate);
  await enter(candidateDetailsPage.drivingLicenceTextBox, 'tesTR252244n93vR');
  await candidateDetailsPage.submitDetails();
  const contactDetailsPage: ContactDetailsPage = new ContactDetailsPage();
  await verifyExactText(contactDetailsPage.pageHeadingLocator, contactDetailsPage.pageHeading);
});

test('Verify the user is able enter day in DOB as a single-digit and navigate to the contact details page', async () => {
  const candidateDetailsPage = await navigationHelper.navigateToCandidateDetailsPage();
  await candidateDetailsPage.enterCandidateDetails(sessionData.candidate);
  await enter(candidateDetailsPage.dobDayTextBox, '1');
  await candidateDetailsPage.submitDetails();
  const contactDetailsPage: ContactDetailsPage = new ContactDetailsPage();
  await verifyExactText(contactDetailsPage.pageHeadingLocator, contactDetailsPage.pageHeading);
});

test('Verify the user is able enter month in DOB as a single-digit and navigate to the contact details page', async () => {
  const candidateDetailsPage = await navigationHelper.navigateToCandidateDetailsPage();
  await candidateDetailsPage.enterCandidateDetails(sessionData.candidate);
  await enter(candidateDetailsPage.dobMonthTextBox, '1');
  await candidateDetailsPage.submitDetails();
  const contactDetailsPage: ContactDetailsPage = new ContactDetailsPage();
  await verifyExactText(contactDetailsPage.pageHeadingLocator, contactDetailsPage.pageHeading);
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
  await enter(candidateDetailsPage.dobMonthTextBox, '13');
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
  await verifyExactText(candidateDetailsPage.errorMessageLocator, candidateDetailsPage.errorMessage, 0, MAX_TIMEOUT);
});

test('Verify error prefix appears in the title when there is an error', async () => {
  const candidateDetailsPage = await navigationHelper.navigateToCandidateDetailsPage();
  await candidateDetailsPage.submitDetails();
  await verifyTitleContainsText('Error:');
  await verifyTitleContainsText(`${candidateDetailsPage.pageHeading} ${Constants.generalTitle}`);
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

test('Verify the user is able enter valid NI drivers details and navigate to the contact details page', async () => {
  const sessionDataNI = new SessionData(Target.GB);
  sessionDataNI.candidate.licenceNumber = Constants.drivingLicenceNI;
  sessionDataNI.candidate.firstnames = Constants.nameNI;
  sessionDataNI.candidate.surname = Constants.nameNI;
  sessionDataNI.candidate.dateOfBirth = Constants.dob;
  const navigationHelperNI = new NavigationHelper(sessionDataNI);
  const candidateDetailsPage = await navigationHelperNI.navigateToCandidateDetailsPage();
  await candidateDetailsPage.enterCandidateDetailsAndSubmit(sessionDataNI.candidate);
  const contactDetailsPage: ContactDetailsPage = new ContactDetailsPage();
  await verifyTitleContainsText(`${contactDetailsPage.pageHeading} ${Constants.generalTitle}`);
  await verifyExactText(contactDetailsPage.pageHeadingLocator, contactDetailsPage.pageHeading);
});

test('Verify if the candidate has no eligibilties on their licence an error page is displayed', async () => {
  const sessionDataNoElig = new SessionData(Target.GB);
  sessionDataNoElig.candidate.licenceNumber = 'AVILA760082T93DE';
  sessionDataNoElig.candidate.firstnames = 'Tasneem';
  sessionDataNoElig.candidate.surname = 'Avila';
  sessionDataNoElig.candidate.dateOfBirth = '1972-10-08';
  const navigationHelperNoElig = new NavigationHelper(sessionDataNoElig);
  const candidateDetailsPage = await navigationHelperNoElig.navigateToCandidateDetailsPage();
  await candidateDetailsPage.enterCandidateDetailsAndSubmit(sessionDataNoElig.candidate);
  const eligibilityErrorPage: EligibilityErrorPage = new EligibilityErrorPage();
  await verifyTitleContainsText(`${eligibilityErrorPage.pageHeading}`);
  await verifyExactText(eligibilityErrorPage.pageHeadingLocator, eligibilityErrorPage.pageHeading);
  await verifyExactText(eligibilityErrorPage.messageLocator, eligibilityErrorPage.text1DVSA, 0);
});

test('Verify if the candidate has behavioural markers but is still eligible to book online they can continue to book', async () => {
  const sessionDataEligMarkers = new SessionData(Target.GB);
  sessionDataEligMarkers.candidate.licenceNumber = 'WILLI912119D94LQ';
  sessionDataEligMarkers.candidate.firstnames = 'David';
  sessionDataEligMarkers.candidate.surname = 'Williams';
  sessionDataEligMarkers.candidate.dateOfBirth = '1999-12-11';
  const navigationHelperNoElig = new NavigationHelper(sessionDataEligMarkers);
  const candidateDetailsPage = await navigationHelperNoElig.navigateToCandidateDetailsPage();
  await candidateDetailsPage.enterCandidateDetailsAndSubmit(sessionDataEligMarkers.candidate);
  const contactDetailsPage: ContactDetailsPage = new ContactDetailsPage();
  await verifyTitleContainsText(`${contactDetailsPage.pageHeading} ${Constants.generalTitle}`);
  await verifyExactText(contactDetailsPage.pageHeadingLocator, contactDetailsPage.pageHeading);
});

test('Verify if the candidate has already booked a car test cannot book a new car test again', async () => {
  sessionData = new SessionData(Target.GB);
  Constants.getGBCandidateWithBookedTest(sessionData);
  navigationHelper = new NavigationHelper(sessionData);
  await navigationHelper.navigateToTestTypePage();
  const testTypePage = new TestTypePage();
  await verifyTitleContainsText(`${testTypePage.pageHeading}`);
  await verifyExactText(testTypePage.pageHeadingLocator, testTypePage.pageHeading);
  await verifyIsNotVisible(testTypePage.testCategoryButtonCar);
});

test('Verify if the candidate has already booked a car test, should be able to book a motorcycle test', async () => {
  sessionData = new SessionData(Target.GB);
  Constants.getGBCandidateWithBookedTest(sessionData);
  sessionData.currentBooking.testType = TestType.MOTORCYCLE;
  navigationHelper = new NavigationHelper(sessionData);
  await navigationHelper.navigateToTestTypePage();
  const testTypePage = new TestTypePage();
  await verifyTitleContainsText(`${testTypePage.pageHeading}`);
  await verifyExactText(testTypePage.pageHeadingLocator, testTypePage.pageHeading);
  await verifyValue(testTypePage.testCategoryRadio, 'motorcycle', 0);
});
