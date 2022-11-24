import * as Constants from '../data/constants';
import {
  click, enter, verifyContainsText, verifyExactText, verifyTitleContainsText,
} from '../utils/helpers';
import { Locale, Target, TestType } from '../../../src/domain/enums';
import { NavigationHelperInstructor } from '../utils/navigation-helper-instructor';
import { ChooseSupportPage } from '../pages/choose-support-page';
import { SessionData } from '../data/session-data';
import { ContactDetailsPage } from '../pages/contact-details-page';

let contactDetailsPage = new ContactDetailsPage();

fixture`Instructor - Candidate details - GB`
  .page(process.env.BOOKING_APP_URL)
  .before(async () => { await Constants.setRequestTimeout; })
  .meta('type', 'instructor');

test('Verify page title and heading are displayed correctly', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, false, true);
  const navigationHelper = new NavigationHelperInstructor(sessionData);
  const candidateDetailsPage = await navigationHelper.navigateToCandidateDetailsPage();
  await verifyExactText(candidateDetailsPage.pageHeadingLocator, candidateDetailsPage.pageHeading);
  await verifyContainsText(candidateDetailsPage.licenceNumberHint, candidateDetailsPage.licenceNumberHintTextGB);
});

test('Verify Back link takes you to the choose support page', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, false, true);
  const navigationHelper = new NavigationHelperInstructor(sessionData);
  const candidateDetailsPage = await navigationHelper.navigateToCandidateDetailsPage();
  await candidateDetailsPage.goBack();
  const chooseSupportPage: ChooseSupportPage = new ChooseSupportPage();
  await verifyExactText(chooseSupportPage.pageHeadingLocator, chooseSupportPage.pageHeading);
});

test('Verify the user is able enter valid drivers details with white spaces and still navigate to the contact details page as they are trimmed', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, false, true);
  const candidateDetailsPage = await new NavigationHelperInstructor(sessionData).navigateToCandidateDetailsPage();
  sessionData.candidate.personalReferenceNumber = '321971';
  await candidateDetailsPage.enterInstructorCandidateDetailsWithSpaces(sessionData.candidate, sessionData.target as Target);
  await candidateDetailsPage.submitDetails();
  await verifyExactText(contactDetailsPage.pageHeadingLocator, contactDetailsPage.pageHeading);
});

test('Verify the user is able enter licence number in lower case and navigate to the contact details page', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, false, true);
  const candidateDetailsPage = await new NavigationHelperInstructor(sessionData).navigateToCandidateDetailsPage();
  await candidateDetailsPage.enterInstructorCandidateDetails(sessionData.candidate, sessionData.target as Target);
  await enter(candidateDetailsPage.drivingLicenceTextBox, sessionData.candidate.licenceNumber.toLowerCase());
  await candidateDetailsPage.submitDetails();
  await verifyExactText(contactDetailsPage.pageHeadingLocator, contactDetailsPage.pageHeading);
});

test('Verify the user gets an error if the Personal Reference Number does not match with Eligibility', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, false, true);
  sessionData.candidate.personalReferenceNumber = '112233';
  const candidateDetailsPage = await new NavigationHelperInstructor(sessionData).navigateToCandidateDetailsPage();
  await candidateDetailsPage.enterInstructorCandidateDetailsAndSubmit(sessionData.candidate, sessionData.target as Target);
  await verifyExactText(candidateDetailsPage.errorMessageLocator, candidateDetailsPage.errorMessage);
  await verifyTitleContainsText('Error:');
  await verifyTitleContainsText(`${candidateDetailsPage.pageHeading} ${Constants.generalTitle}`);
});

test('Verify the user is able to open all See example links', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, false, true);
  const candidateDetailsPage = await new NavigationHelperInstructor(sessionData).navigateToCandidateDetailsPage();
  await click(candidateDetailsPage.firstnamesExampleLink);
  await click(candidateDetailsPage.surnameExampleLink);
  await click(candidateDetailsPage.drivingLicenceTextBox);

  await verifyContainsText(candidateDetailsPage.candidateDetailsContentLocator3, candidateDetailsPage.seeExampleText, 0);
  await verifyContainsText(candidateDetailsPage.candidateDetailsContentLocator3, candidateDetailsPage.seeExampleText, 1);
  await verifyContainsText(candidateDetailsPage.candidateDetailsContentLocator3, candidateDetailsPage.seeExampleText, 2);

  await candidateDetailsPage.checkExampleImagesAreVisible();
});

test('Verify if the candidate has already booked an ERS test cannot book an ERS test again and an error page is displayed', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, false, true);
  sessionData.candidate.personalReferenceNumber = '621309';
  Constants.getGBCandidateWithBookedTest(sessionData);
  const candidateDetailsPage = await new NavigationHelperInstructor(sessionData).navigateToCandidateDetailsPage();
  await candidateDetailsPage.enterInstructorCandidateDetailsAndSubmit(sessionData.candidate, sessionData.target as Target);
  await verifyExactText(candidateDetailsPage.errorMessageLocator, candidateDetailsPage.errorMessage);
  await verifyTitleContainsText('Error:');
  await verifyTitleContainsText(`${candidateDetailsPage.pageHeading} ${Constants.generalTitle}`);
});

test('Verify if the candidate has already booked an ERS test, should be able to book an ADI P1 test', async () => {
  const sessionData = new SessionData(Target.GB, Locale.GB, false, true);
  sessionData.candidate.personalReferenceNumber = '321971';
  Constants.getGBCandidateWithBookedTest(sessionData);
  sessionData.currentBooking.testType = TestType.MOTORCYCLE;
  const candidateDetailsPage = await new NavigationHelperInstructor(sessionData).navigateToCandidateDetailsPage();
  await candidateDetailsPage.enterInstructorCandidateDetailsAndSubmit(sessionData.candidate, sessionData.target as Target);
  contactDetailsPage = new ContactDetailsPage();
  await verifyTitleContainsText(`${contactDetailsPage.pageHeading} ${Constants.generalTitle}`);
  await verifyExactText(contactDetailsPage.pageHeadingLocator, contactDetailsPage.pageHeading);
});
