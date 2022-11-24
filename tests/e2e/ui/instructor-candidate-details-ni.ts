import * as Constants from '../data/constants';
import {
  verifyTitleContainsText, verifyContainsText, verifyExactText, enter, click, verifyValue, clickLinkContainsURL,
} from '../utils/helpers';
import { Locale, Target, TestType } from '../../../src/domain/enums';
import { NavigationHelperInstructor } from '../utils/navigation-helper-instructor';
import { SessionData } from '../data/session-data';
import { ContactDetailsPage } from '../pages/contact-details-page';

const contactDetailsPage = new ContactDetailsPage();

fixture`Instructor - Candidate details - NI`
  .page(`${process.env.BOOKING_APP_URL}?target=${Target.NI}`)
  .before(async () => { await Constants.setRequestTimeout; })
  .meta('type', 'instructor');

test('Verify page title and heading are displayed correctly', async () => {
  const sessionData = new SessionData(Target.NI, Locale.NI, false, true);
  const navigationHelper = new NavigationHelperInstructor(sessionData);
  const candidateDetailsPage = await navigationHelper.navigateToCandidateDetailsPage();
  await verifyExactText(candidateDetailsPage.pageHeadingLocator, candidateDetailsPage.pageHeading);
  await verifyContainsText(candidateDetailsPage.licenceNumberHint, candidateDetailsPage.licenceNumberHintTextNI);
});

test('Verify Back link takes you to the NI Direct instructor page', async () => {
  const sessionData = new SessionData(Target.NI, Locale.NI, false, true);
  const navigationHelper = new NavigationHelperInstructor(sessionData);
  await navigationHelper.navigateToCandidateDetailsPage();
  await clickLinkContainsURL('Back', 'https://www.nidirect.gov.uk/services/adi-theory-test-part-one-hazard-perception-test');
});

test('Verify the user is able enter valid drivers details with white spaces and still navigate to the contact details page as they are trimmed', async () => {
  const sessionData = new SessionData(Target.NI, Locale.NI, false, true);
  const candidateDetailsPage = await new NavigationHelperInstructor(sessionData).navigateToCandidateDetailsPage();
  sessionData.candidate.paymentReceiptNumber = '92647';
  await candidateDetailsPage.enterInstructorCandidateDetailsWithSpaces(sessionData.candidate, sessionData.target as Target);
  await candidateDetailsPage.submitDetails();
  await verifyContainsText(contactDetailsPage.pageHeadingLocator, contactDetailsPage.pageHeading);
});

test('Verify the user is able enter licence number in lower case and navigate to the contact details page', async () => {
  const sessionData = new SessionData(Target.NI, Locale.NI, false, true);
  const candidateDetailsPage = await new NavigationHelperInstructor(sessionData).navigateToCandidateDetailsPage();
  await candidateDetailsPage.enterInstructorCandidateDetails(sessionData.candidate, sessionData.target as Target);
  await enter(candidateDetailsPage.drivingLicenceTextBox, sessionData.candidate.licenceNumber.toLowerCase());
  await candidateDetailsPage.submitDetails();
  await verifyExactText(contactDetailsPage.pageHeadingLocator, contactDetailsPage.pageHeading);
});

test('Verify the user gets an error if the Payment Receipt Number does not match with Eligibility', async () => {
  const sessionData = new SessionData(Target.NI, Locale.NI, false, true);
  sessionData.candidate.paymentReceiptNumber = '112233';
  const candidateDetailsPage = await new NavigationHelperInstructor(sessionData).navigateToCandidateDetailsPage();
  await candidateDetailsPage.enterInstructorCandidateDetailsAndSubmit(sessionData.candidate, sessionData.target as Target);
  await verifyContainsText(candidateDetailsPage.errorMessageLocator, candidateDetailsPage.errorMessage);
  await verifyTitleContainsText('Error:');
  await verifyTitleContainsText(`${candidateDetailsPage.pageHeading} ${Constants.generalTitleNI}`);
});

test('Verify the user is able to open all See example links', async () => {
  const sessionData = new SessionData(Target.NI, Locale.NI, false, true);
  const candidateDetailsPage = await new NavigationHelperInstructor(sessionData).navigateToCandidateDetailsPage();
  await click(candidateDetailsPage.firstnamesExampleLink);
  await click(candidateDetailsPage.surnameExampleLink);
  await click(candidateDetailsPage.drivingLicenceTextBox);

  await verifyContainsText(candidateDetailsPage.candidateDetailsContentLocator3, candidateDetailsPage.seeExampleText, 0);
  await verifyContainsText(candidateDetailsPage.candidateDetailsContentLocator3, candidateDetailsPage.seeExampleText, 1);
  await verifyContainsText(candidateDetailsPage.candidateDetailsContentLocator3, candidateDetailsPage.seeExampleText, 2);

  await candidateDetailsPage.checkExampleImagesAreVisible();
});

test('Verify if the candidate has already booked a AMP1 test cannot book a new AMP1 test again', async () => {
  const sessionData = new SessionData(Target.NI);
  Constants.getNICandidateWithBookedTest(sessionData);
  sessionData.candidate.paymentReceiptNumber = '95436';
  sessionData.currentBooking.testType = TestType.AMIP1;
  const navigationHelper = new NavigationHelperInstructor(sessionData);
  const candidateDetailsPage = await navigationHelper.navigateToCandidateDetailsPage();
  await candidateDetailsPage.enterInstructorCandidateDetailsAndSubmit(sessionData.candidate, sessionData.target as Target);
  await verifyExactText(candidateDetailsPage.errorMessageLocator, candidateDetailsPage.errorMessage);
  await verifyTitleContainsText('Error:');
  await verifyTitleContainsText(`${candidateDetailsPage.pageHeading} ${Constants.generalTitleNI}`);
});

test('Verify if the candidate has already booked a AMP1 test, should be able to book a ADI P1 test', async () => {
  const sessionData = new SessionData(Target.NI);
  Constants.getNICandidateWithBookedTest(sessionData);
  sessionData.candidate.paymentReceiptNumber = '92647';
  sessionData.currentBooking.testType = TestType.ADIP1DVA;
  const navigationHelper = new NavigationHelperInstructor(sessionData);
  const testTypePage = await navigationHelper.navigateToNiTestTypePage();
  await verifyTitleContainsText(`${testTypePage.pageHeading}`);
  await verifyExactText(testTypePage.pageHeadingLocator, testTypePage.pageHeading);
  await verifyValue(testTypePage.testCategoryRadio, 'adip1dva', 0);
});
