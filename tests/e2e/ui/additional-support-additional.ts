/* eslint-disable no-shadow */
/* eslint-disable security/detect-non-literal-regexp */
import { RequestLogger, t } from 'testcafe';
import * as Constants from '../data/constants';
import {
  verifyExactText, setCookie, verifyTitleContainsText, click,
} from '../utils/helpers';
import { TARGET } from '../../../src/domain/enums';
import { SessionData } from '../data/session-data';
import { generalTitle } from '../data/constants';
// import { NavigationHelper } from '../utils/navigation-helper';
import { AdditionalSupportAdditionalPage } from '../pages/additional-support-additional-page';

const additionalSupportAdditionalPage = new AdditionalSupportAdditionalPage();
const pageUrl = `${process.env.BOOKING_APP_URL}/${additionalSupportAdditionalPage.pathUrl}`;
const headerLogger = RequestLogger([new RegExp(`${process.env.BOOKING_APP_URL}`)], {
  logResponseHeaders: true,
});

fixture`Additional support additional`
  .page(process.env.BOOKING_APP_URL)
  .requestHooks(headerLogger)
  .before(async () => { await Constants.setRequestTimeout; })
  .beforeEach(async (t) => {
    await setCookie(headerLogger, new SessionData(TARGET.GB));
    await t.navigateTo(pageUrl);
  })
  .meta('type', 'regression');

test.skip('Verify page title and heading are displayed correctly', async () => {
  await verifyTitleContainsText(`${additionalSupportAdditionalPage.pageTitle} ${generalTitle}`);
  await verifyExactText(additionalSupportAdditionalPage.pageTitleLocator, additionalSupportAdditionalPage.pageHeading);
});

test.skip('Verify error prefix appears in the title when there is an error', async () => {
  // const sessionData = new SessionData(TARGET.GB);
  // const navigationHelper = new NavigationHelper(sessionData);
  await t.navigateTo(process.env.BOOKING_APP_URL);
  await click(additionalSupportAdditionalPage.continueButton);
  await verifyTitleContainsText(`Error: ${additionalSupportAdditionalPage.pageTitle} ${Constants.generalTitle}`);
});
