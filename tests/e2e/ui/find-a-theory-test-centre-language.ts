/* eslint-disable security/detect-non-literal-regexp */
import { RequestLogger } from 'testcafe';
import * as Constants from '../data/constants';
import { verifyExactText, setCookie, verifyTitleContainsText } from '../utils/helpers';
import { FindATheoryTestCentrePage } from '../pages/find-a-theory-test-centre-page';
import { TARGET } from '../../../src/domain/enums';
import { SessionData } from '../data/session-data';
import { generalTitle } from '../data/constants';

const findATheoryTestCentrePage = new FindATheoryTestCentrePage();
const pageUrl = `${process.env.BOOKING_APP_URL}/${findATheoryTestCentrePage.pathUrl}`;
const headerLogger = RequestLogger([new RegExp(`${process.env.BOOKING_APP_URL}`)], {
  logResponseHeaders: true,
});

const dataSet = [
  {
    testName: 'English default',
    queryParam: '',
    contentPrefix: '',
  },
  {
    testName: 'English',
    queryParam: '?lang=gb',
    contentPrefix: '',
  },
  {
    testName: 'Welsh',
    queryParam: '?lang=cy',
    contentPrefix: 'cy-',
  },
  {
    testName: 'Northern Ireland',
    queryParam: '?lang=ni',
    contentPrefix: 'ni-',
  },
];

fixture`Find a theory test centre - language and content`
  .page(process.env.BOOKING_APP_URL)
  .requestHooks(headerLogger)
  .before(async () => { await Constants.setRequestTimeout; })
  .beforeEach(async () => { await setCookie(headerLogger, new SessionData(TARGET.GB)); })
  .meta('type', 'regression');

dataSet.forEach((data) => {
  test(`Verify UI contents are displayed correctly - ${data.testName}`, async (t) => {
    await t.navigateTo(`${pageUrl}${data.queryParam}`);

    await verifyTitleContainsText(`${data.contentPrefix}${findATheoryTestCentrePage.pageTitle}`);

    await verifyTitleContainsText(`${generalTitle}`);

    await verifyExactText(findATheoryTestCentrePage.pageTitleLocator, `${data.contentPrefix}${findATheoryTestCentrePage.pageHeading}`);

    await verifyExactText(findATheoryTestCentrePage.backLink, `${data.contentPrefix}Back`);

    await verifyExactText(findATheoryTestCentrePage.searchContentsLocator1, `${data.contentPrefix}${findATheoryTestCentrePage.searchContents1}`, 1);

    await verifyExactText(findATheoryTestCentrePage.searchContentsLocator1, `${data.contentPrefix}${findATheoryTestCentrePage.searchContents2}`, 2);

    await verifyExactText(findATheoryTestCentrePage.searchContentsLocator2, `${data.contentPrefix}${findATheoryTestCentrePage.searchContents3}`, 0);

    await verifyExactText(findATheoryTestCentrePage.searchContentsLocator2, `${data.contentPrefix}${findATheoryTestCentrePage.searchContents4}`, 1);

    await verifyExactText(findATheoryTestCentrePage.searchLabelLocator, `${data.contentPrefix}${findATheoryTestCentrePage.searchLabel}`);

    await verifyExactText(findATheoryTestCentrePage.findButton, `${data.contentPrefix}Find`);
  });
});
