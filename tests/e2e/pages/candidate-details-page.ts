import * as dayjs from 'dayjs';
import { BasePage } from './base-page';
import { enter, click } from '../utils/helpers';
import { ContactDetailsPage } from './contact-details-page';
import { Candidate } from '../data/session-data';

export class CandidateDetailsPage extends BasePage {
  pageTitleLocator = '.govuk-fieldset__heading';

  submitButton = 'button[data-automation-id="submit"]';

  firstNameTextBox = '#firstnames';

  surnameTextBox = '#surname';

  drivingLicenceTextBox = '#licenceNumber';

  dobDayTextBox = '#dobDay';

  dobMonthTextBox = '#dobMonth';

  dobYearTextBox = '#dobYear';

  backLink = '.govuk-back-link';

  errorMessageLocator = '.govuk-error-message';

  candidateDetailsContentLocator1 = '.govuk-body';

  candidateDetailsContentLocator2 = '.govuk-hint';

  candidateDetailsContentLocator3 = '.govuk-details__summary-text';

  exampleImage = 'img[alt="example"]';

  pathUrl = 'candidate-details';

  // Content
  pageTitle = 'Candidate details';

  pageHeading = 'Details of the person taking the theory test';

  pageHeadingSupport = 'Provide a few details to get the right support';

  errorMessage = 'The details entered aren\'t correct. Please enter the details exactly as they appear on the licence';

  candidateDetailsContent1 = 'Enter the driving licence details of the person taking the test.';

  candidateDetailsContent2 = 'These details are checked and used to show information about the candidate\'s available tests and any test history.';

  candidateDetailsContent3 = 'It\'s important the information is entered exactly as it looks on the driving licence.';

  candidateDetailsContent4 = 'Enter the first and any middle names of the person taking the test. Do not include Miss, Ms, Mrs or Mr.';

  candidateDetailsContent5 = 'Enter the surname of the person taking the test.';

  candidateDetailsContent6 = 'Enter the 16-digit driving licence number of the person taking the test.';

  candidateDetailsContent7 = 'Enter the date of birth of the person taking the test.';

  candidateDetailsContent8 = 'For example, 12 11 2007';

  candidateDetailsContent9 = 'See section 2 of the driving licence';

  candidateDetailsContent10 = 'See section 1 of the driving licence';

  candidateDetailsContent11 = 'See section 5 of the driving licence';

  candidateDetailsContent12 = 'See example';

  async enterCandidateDetails(candidate: Candidate): Promise<void> {
    await enter(this.firstNameTextBox, candidate.firstnames);
    await enter(this.surnameTextBox, candidate.surname);
    await enter(this.drivingLicenceTextBox, candidate.licenceNumber);
    await enter(this.dobDayTextBox, dayjs(candidate.dateOfBirth).format('DD'));
    await enter(this.dobMonthTextBox, dayjs(candidate.dateOfBirth).format('MM'));
    await enter(this.dobYearTextBox, dayjs(candidate.dateOfBirth).format('YYYY'));
  }

  async enterCandidateDetailsAndSubmit(candidate: Candidate): Promise<void> {
    await this.enterCandidateDetails(candidate);
    await this.submitDetails();
  }

  async submitDetails(): Promise<ContactDetailsPage> {
    await click(this.submitButton);
    return new ContactDetailsPage();
  }

  async clickAllSeeExampleLinks(): Promise<void> {
    await click(this.candidateDetailsContentLocator3, 0);
    await click(this.candidateDetailsContentLocator3, 1);
    await click(this.candidateDetailsContentLocator3, 2);
  }

  async goBack(): Promise<void> {
    await click(this.backLink);
  }
}
