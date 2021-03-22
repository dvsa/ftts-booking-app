/* eslint-disable no-shadow */
/* eslint-disable security/detect-non-literal-regexp */
import { RequestLogger } from 'testcafe';
import * as Constants from '../data/constants';
import {
  verifyExactText, setCookie, verifyTitleContainsText,
} from '../utils/helpers';
import { TARGET } from '../../../src/domain/enums';
import { SessionData } from '../data/session-data';
import { generalTitle } from '../data/constants';
import { StayingNSAPage } from '../pages/staying-nsa-page';

const stayingNSA = new StayingNSAPage();
const pageUrl = `${process.env.BOOKING_APP_URL}/${stayingNSA.pathUrl}`;
const headerLogger = RequestLogger([new RegExp(`${process.env.BOOKING_APP_URL}`)], {
  logResponseHeaders: true,
});

fixture`Staying on Non-Standard Accommodation booking`
  .page(process.env.BOOKING_APP_URL)
  .requestHooks(headerLogger)
  .before(async () => { await Constants.setRequestTimeout; })
  .beforeEach(async (t) => {
    const sessionData = new SessionData(TARGET.GB);
    sessionData.journey.support = true;
    await setCookie(headerLogger, sessionData);
    await t.navigateTo(pageUrl);
  })
  .meta('type', 'regression');

test('Verify page title and heading are displayed correctly', async () => {
  await verifyTitleContainsText(`${stayingNSA.pageTitle} ${generalTitle}`);
  await verifyExactText(stayingNSA.pageHeadingLocator, stayingNSA.pageHeading);
});
