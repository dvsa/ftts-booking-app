import { BasePage } from './base-page';

export class EligibilityErrorPage extends BasePage {
  pageHeadingLocator = '.govuk-heading-xl';

  messageLocator = '.govuk-body';

  // Content
  pageHeading = 'You are not eligible for driving theory tests';

  text1DVSA = 'Based on the information provided, you are not eligible for any tests. Contact DVSA to find out more.';

  text1DVA = 'Based on the information provided, you are not eligible for any tests. Contact DVA to find out more.';
}
