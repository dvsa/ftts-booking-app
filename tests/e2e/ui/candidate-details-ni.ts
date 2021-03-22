import * as Constants from '../data/constants';
import { verifyExactText, enter, verifyTitleContainsText } from '../utils/helpers';
import { ContactDetailsPage } from '../pages/contact-details-page';
import { SessionData } from '../data/session-data';
import { TARGET } from '../../../src/domain/enums';
import { NavigationHelper } from '../utils/navigation-helper';
import { generalTitle } from '../data/constants';
import { ChooseSupportPage } from '../pages/choose-support-page';

const sessionData = new SessionData(TARGET.NI);
const navigationHelper = new NavigationHelper(sessionData);

fixture`Candidate details NI`
  .page(`${process.env.BOOKING_APP_URL}?target=${TARGET.NI}`)
  .before(async () => { await Constants.setRequestTimeout; })
  .meta('type', 'regression');

test('Verify page title and heading are displayed correctly', async () => {
  const candidateDetailsPage = await navigationHelper.navigateToCandidateDetailsPage();

  await verifyExactText(candidateDetailsPage.pageTitleLocator, candidateDetailsPage.pageHeading);
});

test('Verify Back link takes you to the choose support page', async () => {
  const candidateDetailsPage = await navigationHelper.navigateToCandidateDetailsPage();
  await candidateDetailsPage.goBack();
  const chooseSupportPage: ChooseSupportPage = new ChooseSupportPage();
  await verifyExactText(chooseSupportPage.pageTitleLocator, chooseSupportPage.pageHeading);
});

test('Verify the user is able enter valid NI drivers details and navigate to the contact details page', async () => {
  const candidateDetailsPage = await navigationHelper.navigateToCandidateDetailsPage();
  await candidateDetailsPage.enterCandidateDetailsAndSubmit(sessionData.candidate);
  const contactDetailsPage: ContactDetailsPage = new ContactDetailsPage();
  await verifyTitleContainsText(`${contactDetailsPage.pageTitle} ${generalTitle}`);
  await verifyExactText(contactDetailsPage.pageTitleLocator, contactDetailsPage.pageHeading);
});

test('Verify the user gets an error when GB licence is detected (16 characters)', async () => {
  const sessionDataGB = new SessionData(TARGET.GB);
  const candidateDetailsPage = await navigationHelper.navigateToCandidateDetailsPage();
  await candidateDetailsPage.enterCandidateDetails(sessionDataGB.candidate);
  await candidateDetailsPage.submitDetails();

  await verifyExactText(candidateDetailsPage.errorMessageLocator, candidateDetailsPage.errorMessage);
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

test('Verify error prefix appears in the title when there is an error', async () => {
  const candidateDetailsPage = await navigationHelper.navigateToCandidateDetailsPage();
  await candidateDetailsPage.submitDetails();
  await verifyTitleContainsText(`Error: ${candidateDetailsPage.pageTitle} ${Constants.generalTitle}`);
});

test('Verify the user is able to open all See example links', async () => {
  const candidateDetailsPage = await navigationHelper.navigateToCandidateDetailsPage();
  await candidateDetailsPage.clickAllSeeExampleLinks();
  await verifyExactText(candidateDetailsPage.candidateDetailsContentLocator3, candidateDetailsPage.candidateDetailsContent12, 0);
  await verifyExactText(candidateDetailsPage.candidateDetailsContentLocator3, candidateDetailsPage.candidateDetailsContent12, 1);
  await verifyExactText(candidateDetailsPage.candidateDetailsContentLocator3, candidateDetailsPage.candidateDetailsContent12, 2);
});
