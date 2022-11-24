import { Selector, t } from 'testcafe';
import { BasePage } from './base-page';
import {
  click, clickWithText, verifyContainsText, verifyNotContainsText,
} from '../utils/helpers';
import { TestType } from '../../../src/domain/enums';
import { isZeroCostTest } from '../../../src/domain/eligibility';

export class TestTypePage extends BasePage {
  pathUrl = 'test-type';

  // selectors
  pageHeadingLocator = '.govuk-fieldset__heading';

  backLink = '.govuk-back-link';

  testCategoryOptionSelector = 'input[data-automation-id="<>"]';

  testCategoryButtonCar = 'input[value=car]';

  continueButton = 'button[data-automation-id=submit]';

  cancelButton = 'a[data-automation-id="cancel"]';

  testCategoryRadio = 'input[name="testType"]';

  vehicleCategoriesExplainedLink = '.govuk-details__summary-text';

  errorMessageRadioLocator = '#testType-error';

  errorMessageLocator = '#error-summary-title';

  errorMessageList = '.govuk-list.govuk-error-summary__list';

  errorLink = 'a[href="#testType"]';

  subHeading = '.govuk-heading-l';

  bodyTextLocator = '.govuk-body';

  bookingOtherTypesOfTestsLink = 'a[href="https://www.gov.uk/driving-licence-categories"]';

  warningIcon = 'span.govuk-warning-text__icon';

  warningMessageLocator = '.govuk-warning-text__text';

  updateTestTypeBanner = 'div.alert';

  compensationHintTextLocator = '#testType-item-hint';

  // content
  pageHeading = 'Which theory test are you booking?';

  pageHeadingNSA = 'Which theory test type do you need support for?';

  bookingOtherTypesOfTestsHeader = 'Booking other types of theory tests';

  bookingOtherTypesOfTestsText = 'You must have a category entitlement on your driving licence for any type of vehicle you want to drive.';

  errorMessageHeader = 'There is a problem';

  errorMessageText = 'You need to select a theory test';

  updateTestTypeBannerText = 'You can change the test type or keep your existing choice.';

  updateTestTypeButtonText = 'Confirm change and continue';

  cancelTestTypeButtonText = 'Cancel and keep existing test type';

  cancelTestTypeLinkText = 'keep your existing choice';

  warningText = 'Important: if you change the test type and continue, you will need to enter the booking details again.';

  compensationText1 = 'You recently had a theory test cancelled. Select this option to book a replacement test.';

  compensationText2 = 'Request a refund if you no longer need a theory test.';

  async editTestCategory(testType: string): Promise<void> {
    await clickWithText('label', testType);
  }

  getTestTypeSelector(testType: TestType): string {
    return this.testCategoryOptionSelector.replace('<>', testType.valueOf());
  }

  async selectTestCategory(testType: TestType): Promise<void> {
    const selector = this.getTestTypeSelector(testType);
    await click(selector);
    await click(this.continueButton);
  }

  async verifyCompensationTextShown(testType: TestType): Promise<void> {
    const selector = this.getTestTypeSelector(testType);
    await t.expect(Selector(selector).getAttribute('data-is-compensation')).eql('true');
    await verifyContainsText(this.compensationHintTextLocator, this.compensationText1);

    const isTestTypeZeroCost = isZeroCostTest(testType);
    if (isTestTypeZeroCost) {
      await verifyNotContainsText(this.compensationHintTextLocator, this.compensationText2);
    } else {
      await verifyContainsText(this.compensationHintTextLocator, this.compensationText2);
    }
  }

  async clickErrorLink(): Promise<void> {
    await click(this.errorLink);
  }

  async goBack(): Promise<void> {
    await click(this.backLink);
  }
}
