/* eslint-disable import/no-cycle */
import { BasePage } from './base-page';
import { click, clickWithText } from '../utils/helpers';
import { LanguagePage } from './language-page';
import { FindATheoryTestCentrePage } from './find-a-theory-test-centre-page';

export class TestTypePage extends BasePage {
  pathUrl = 'test-type';

  // selectors
  pageTitleLocator = '.govuk-fieldset__heading';

  backLink = '.govuk-back-link';

  testCategoryOptionCar = 'label[for=testType]';

  testCategoryOptionMotorcycle = 'label[for=testType-2]';

  testCategoryButtonCar = 'input[value=car]';

  testCategoryButtonMotorcycle = 'input[value=motorcycle]';

  continueButton = '#submit';

  cancelButton = '#cancel';

  testCategoryRadio = '#testType';

  vehicleCategoriesExplainedLink = '.govuk-details__summary-text';

  errorMessageRadioLocator = '#testType-error';

  errorMessageLocator = '#error-summary-title';

  errorMessageList = '.govuk-list.govuk-error-summary__list';

  errorLink = `a[href="${this.testCategoryRadio}"]`;

  subHeading = '.govuk-heading-l';

  bodyTextLocator = '.govuk-body';

  bookingOtherTypesOfTestsLink = 'a[href="https://www.gov.uk/driving-licence-categories"]';

  warningIcon = 'span.govuk-warning-text__icon';

  warningMessageLocator = '.govuk-warning-text__text';

  updateTestTypeBanner = 'div.alert';

  // content
  pageTitle = 'Test type';

  pageHeading = 'Which theory test are you booking?';

  carOption = 'Car';

  motorcyleOption = 'Motorcycle';

  bookingOtherTypesOfTestsHeader = 'Booking other types of theory tests';

  bookingOtherTypesOfTestsText = 'driving licence categories for more information';

  errorMessageHeader = 'There is a problem';

  errorMessageText = 'You need to select an option.';

  updateTestTypeBannerText = 'You can change the test type or keep your existing choice.';

  updateTestTypeButtonText = 'Confirm change and continue';

  cancelTestTypeButtonText = 'Cancel and keep existing test type';

  cancelTestTypeLinkText = 'keep your existing choice';

  warningText = 'Important: if you change the test type here and continue to make this booking, all details previously entered will be replaced.';

  async selectTestCategoryGB(testType: string): Promise<LanguagePage> {
    await clickWithText('label', testType);
    await click(this.continueButton);
    return new LanguagePage();
  }

  async selectTestCategoryNI(testType: string): Promise<FindATheoryTestCentrePage> {
    await clickWithText('label', testType);
    await click(this.continueButton);
    return new FindATheoryTestCentrePage();
  }

  async clickErrorLink(): Promise<void> {
    await click(this.errorLink);
  }

  async goBack(): Promise<void> {
    await click(this.backLink);
  }
}
