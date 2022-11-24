import { BasePage } from './base-page';

export class PageNotFoundErrorPage extends BasePage {
  pageHeadingLocator = '.govuk-heading-xl';

  pageHeading = 'This page cannot be found';

  contentLocator = 'p.govuk-body';

  contentText = 'Sorry, the page you\'re looking for cannot be found.';
}
