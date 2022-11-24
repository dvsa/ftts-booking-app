/* eslint-disable security/detect-non-literal-fs-filename */
import dayjs from 'dayjs';
import { Selector, t } from 'testcafe';
import { BasePage } from './base-page';
import { enter, click } from '../utils/helpers';
import { ContactDetailsPage } from './contact-details-page';
import { Candidate } from '../data/session-data';
import { Target } from '../../../src/domain/enums';

export class CandidateDetailsPage extends BasePage {
  pageHeadingLocator = '.govuk-heading-xl';

  submitButton = 'button[data-automation-id="submit"]';

  firstNameTextBox = 'input[data-automation-id="firstnames"]';

  surnameTextBox = 'input[data-automation-id="surname"]';

  drivingLicenceTextBox = 'input[data-automation-id="licenceNumber"]';

  dobDayTextBox = 'input[data-automation-id="day"]';

  dobMonthTextBox = 'input[data-automation-id="month"]';

  dobYearTextBox = 'input[data-automation-id="year"]';

  backLink = 'a[data-automation-id="back"]';

  errorMessageLocator = '.govuk-error-message';

  candidateDetailsContentLocator1 = '.govuk-body';

  candidateDetailsContentLocator2 = '.govuk-hint';

  candidateDetailsContentLocator3 = '.govuk-details__summary-text';

  firstnamesExampleLink = 'details[data-automation-id="firstnames-example-link"]';

  surnameExampleLink = 'details[data-automation-id="surname-example-link"]';

  licenceNumberExampleLink = 'details[data-automation-id="licenceNumber-example-link"]';

  exampleImageFirstNamesAltText = 'img[alt="Image showing where to find first and middle names on a driving licence"]';

  exampleImageSurnameAltText = 'img[alt="Image showing where to find last name on a driving licence"]';

  exampleImageLicenceNumnberAltText = 'img[alt="Image showing where to find driving licence number on a driving licence"]';

  instructorPersonalReferenceTextBox = 'input[data-automation-id="personalReference"]';

  licenceNumberHint = '#licenceNumber-hint';

  pathUrl = 'candidate-details';

  // Content
  pageHeading = 'Details of the person taking the theory test';

  pageHeadingSupport = 'Provide a few details to get the right support';

  errorMessage = 'You must enter these details as they appear on the driving licence. Please check them carefully and try again.';

  seeExampleText = 'See example';

  licenceNumberHintTextGB = 'Enter the 16-digit driving licence number of the person taking the test.';

  licenceNumberHintTextNI = 'Enter the 8-digit driving licence number of the person taking the test.';

  async enterCandidateDetails(candidate: Candidate): Promise<void> {
    await enter(this.firstNameTextBox, candidate.firstnames);
    await enter(this.surnameTextBox, candidate.surname);
    await enter(this.drivingLicenceTextBox, candidate.licenceNumber);
    await enter(this.dobDayTextBox, dayjs(candidate.dateOfBirth).format('DD'));
    await enter(this.dobMonthTextBox, dayjs(candidate.dateOfBirth).format('MM'));
    await enter(this.dobYearTextBox, dayjs(candidate.dateOfBirth).format('YYYY'));
  }

  async enterCandidateDetailsWithSpaces(candidate: Candidate): Promise<void> {
    await enter(this.firstNameTextBox, `       ${candidate.firstnames}     `);
    await enter(this.surnameTextBox, `       ${candidate.surname}         `);
    await enter(this.drivingLicenceTextBox, `       ${candidate.licenceNumber}       `);
    await enter(this.dobDayTextBox, dayjs(candidate.dateOfBirth).format('DD'));
    await enter(this.dobMonthTextBox, dayjs(candidate.dateOfBirth).format('MM'));
    await enter(this.dobYearTextBox, dayjs(candidate.dateOfBirth).format('YYYY'));
  }

  async enterInstructorCandidateDetails(candidate: Candidate, target: Target): Promise<void> {
    await this.enterCandidateDetails(candidate);
    if (target === Target.GB) {
      await enter(this.instructorPersonalReferenceTextBox, candidate.personalReferenceNumber);
    } else if (target === Target.NI) {
      await enter(this.instructorPersonalReferenceTextBox, candidate.paymentReceiptNumber);
    }
  }

  async enterInstructorCandidateDetailsWithSpaces(candidate: Candidate, target: Target): Promise<void> {
    await this.enterCandidateDetailsWithSpaces(candidate);
    if (target === Target.GB) {
      await enter(this.instructorPersonalReferenceTextBox, `      ${candidate.personalReferenceNumber}      `);
    } else if (target === Target.NI) {
      await enter(this.instructorPersonalReferenceTextBox, `       ${candidate.paymentReceiptNumber}       `);
    }
  }

  async enterCandidateDetailsAndSubmit(candidate: Candidate): Promise<void> {
    await this.enterCandidateDetails(candidate);
    await this.submitDetails();
  }

  async enterInstructorCandidateDetailsAndSubmit(candidate: Candidate, target: Target): Promise<void> {
    await this.enterInstructorCandidateDetails(candidate, target);
    await this.submitDetails();
  }

  async submitDetails(): Promise<ContactDetailsPage> {
    await click(this.submitButton);
    return new ContactDetailsPage();
  }

  async goBack(): Promise<void> {
    await click(this.backLink);
  }

  async checkExampleImagesAreVisible(): Promise<void> {
    const image1 = Selector(this.exampleImageFirstNamesAltText).nth(0).with({ visibilityCheck: true });
    await t.expect(image1.exists).ok('', { timeout: 20000 });

    const image2 = Selector(this.exampleImageSurnameAltText).nth(0).with({ visibilityCheck: true });
    await t.expect(image2.exists).ok('', { timeout: 20000 });

    const image3 = Selector(this.exampleImageLicenceNumnberAltText).nth(0).with({ visibilityCheck: true });
    await t.expect(image3.exists).ok('', { timeout: 20000 });
  }
}
