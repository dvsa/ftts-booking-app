/* eslint-disable no-await-in-loop */
/* eslint-disable security/detect-non-literal-regexp */
import { RequestLogger, Selector } from 'testcafe';
import * as Constants from '../data/constants';
import {
  verifyExactText, verifyContainsText, click, getText, verifyIsNotVisible, verifyIsVisible, createSelector, isVisible, setCookie, verifyTitleContainsText,
} from '../utils/helpers';
import { ChooseATestCentrePage } from '../pages/choose-a-test-centre-page';
import { FindATheoryTestCentrePage } from '../pages/find-a-theory-test-centre-page';
import { PreferredDatePage } from '../pages/preferred-date-page';
import { TARGET } from '../../../src/domain/enums';
import { SessionData } from '../data/session-data';
import { generalTitle } from '../data/constants';

const chooseATestCentrePage = new ChooseATestCentrePage();
const pageUrl = `${process.env.BOOKING_APP_URL}/${chooseATestCentrePage.pathUrl}`;
const headerLogger = RequestLogger([new RegExp(`${process.env.BOOKING_APP_URL}`)], {
  logResponseHeaders: true,
});
const sessionData = new SessionData(TARGET.GB);

fixture`Choose a theory test centre`
  .page(process.env.BOOKING_APP_URL)
  .requestHooks(headerLogger)
  .before(async () => { await Constants.setRequestTimeout; })
  .beforeEach(async (t) => {
    await setCookie(headerLogger, sessionData);
    await t.navigateTo(pageUrl);
  })
  .meta('type', 'regression');

test('Verify page title and heading are displayed correctly', async () => {
  await verifyTitleContainsText(`${chooseATestCentrePage.pageTitle} ${generalTitle}`);
  await verifyExactText(chooseATestCentrePage.pageTitleLocator, chooseATestCentrePage.pageHeading);
});

test('Verify that 5 test centre results are shown initially', async (t) => {
  await verifyExactText(chooseATestCentrePage.testCentreCount, '5');

  const testCentreCount = await createSelector(chooseATestCentrePage.testCentres).count;
  await t.expect(testCentreCount).eql(5);
});

test('Verify that the entered search term is displayed', async () => {
  await verifyExactText(chooseATestCentrePage.searchQueryValue, sessionData.testCentreSearch.searchQuery);
});

test('Verify back link takes you to the find test centre page', async () => {
  await chooseATestCentrePage.goBack();

  const findATheoryTestCentrePage: FindATheoryTestCentrePage = new FindATheoryTestCentrePage();
  await verifyExactText(findATheoryTestCentrePage.pageTitleLocator, findATheoryTestCentrePage.pageHeading);
});

test('Verify change search location link takes you to the find test centre page', async () => {
  await chooseATestCentrePage.changeSearchLocationTerm();

  const findATheoryTestCentrePage: FindATheoryTestCentrePage = new FindATheoryTestCentrePage();
  await verifyExactText(findATheoryTestCentrePage.pageTitleLocator, findATheoryTestCentrePage.pageHeading);
});

test('Verify that distance in Miles is shown by default in ascending order', async (t) => {
  const centreDistances: Selector = createSelector(chooseATestCentrePage.centreDistance);
  const centreDistancesCount = await centreDistances.count;
  await t.expect(centreDistancesCount).eql(5);

  await checkAscendingOrderByDistance(t, centreDistances, centreDistancesCount, 'miles');
});

test('Verify after clicking the \'See kilometres\' link it shows the \'See miles\' link', async () => {
  await verifyExactText(chooseATestCentrePage.changeUnitsLink, chooseATestCentrePage.seeKilometresLinkText);

  await chooseATestCentrePage.toggleDistanceUnits();

  await verifyExactText(chooseATestCentrePage.changeUnitsLink, chooseATestCentrePage.seeMilesLinkText);
});

test('Verify that when distance is shown in Kilometres, test centres are shown in ascending order', async (t) => {
  await chooseATestCentrePage.toggleDistanceUnits();
  const centreDistances: Selector = createSelector(chooseATestCentrePage.centreDistance);
  const centreDistancesCount = await centreDistances.count;
  await t.expect(centreDistancesCount).eql(5);

  await checkAscendingOrderByDistance(t, centreDistances, centreDistancesCount, 'km');
});

test('Verify the \'See 5 more\' button shows 5 more test centres', async (t) => {
  await chooseATestCentrePage.see5MoreTestCentres();

  await verifyExactText(chooseATestCentrePage.testCentreCount, '10');
  await verifyExactText(chooseATestCentrePage.searchQueryValue, sessionData.testCentreSearch.searchQuery);

  const testCentreCount = await createSelector(chooseATestCentrePage.testCentres).count;
  await t.expect(testCentreCount).eql(10);
});

test('Verify the \'See 5 more\' button is hidden when we\'ve reached 50 test centres', async (t) => {
  let expectedNumberOfTestCentres = 5;
  for (let i = 0; i < 9; i++) {
    expectedNumberOfTestCentres += 5;
    await chooseATestCentrePage.see5MoreTestCentres();
    await verifyExactText(chooseATestCentrePage.testCentreCount, expectedNumberOfTestCentres.toString());
    const testCentreCount = await createSelector(chooseATestCentrePage.testCentres).count;
    await t.expect(testCentreCount).eql(expectedNumberOfTestCentres);
  }

  await verifyIsNotVisible(chooseATestCentrePage.see5MoreButton);
});

test('Verify the \'See 5 more\' button is hidden when there are no more test centres to show (less than 50)', async (t) => {
  await t.navigateTo(`${pageUrl}?target=${TARGET.NI}`);
  await chooseATestCentrePage.see5MoreTestCentres();
  const testCentreCount = parseInt(await getText(chooseATestCentrePage.testCentreCount), 10);
  await t.expect(testCentreCount).gt(5);
  await verifyIsNotVisible(chooseATestCentrePage.see5MoreButton);
});

test('Verify that after viewing more test centres then changing the search term, resets the results to 5', async (t) => {
  await chooseATestCentrePage.see5MoreTestCentres();
  let testCentreCount = await createSelector(chooseATestCentrePage.testCentres).count;
  await t.expect(testCentreCount).eql(10);

  await chooseATestCentrePage.changeSearchLocationTerm();
  const findATheoryTestCentrePage: FindATheoryTestCentrePage = new FindATheoryTestCentrePage();
  await findATheoryTestCentrePage.findATheoryTestCentre('Scotland');
  await verifyExactText(chooseATestCentrePage.searchQueryValue, 'Scotland');
  await verifyExactText(chooseATestCentrePage.testCentreCount, '5');
  testCentreCount = await createSelector(chooseATestCentrePage.testCentres).count;
  await t.expect(testCentreCount).eql(5);
});

test('Verify the \'View on Google Maps\' link is constructed correctly', async (t) => {
  const centreAddressLine1 = await getText(chooseATestCentrePage.centreAddressLine1);
  const centrePostalCode = await getText(chooseATestCentrePage.centreAddressPostalCode);
  const linkValue = decodeURIComponent(await Selector('a').withText(chooseATestCentrePage.viewOnGoogleMapsLinkText).getAttribute('href'));

  await t.expect(linkValue).contains('https://www.google.com/maps/search/');
  await t.expect(linkValue).contains(centreAddressLine1);
  await t.expect(linkValue).contains(centrePostalCode);
});

test('Verify address details are shown for each test centre', async (t) => {
  const centreNames: Selector = createSelector(chooseATestCentrePage.centreName);
  const centreAddressLines1: Selector = createSelector(chooseATestCentrePage.centreAddressLine1);
  const centreAddressLines2: Selector = createSelector(chooseATestCentrePage.centreAddressLine2);
  const centreAddressCities: Selector = createSelector(chooseATestCentrePage.centreAddressCity);
  const centrePostalCodes: Selector = createSelector(chooseATestCentrePage.centreAddressPostalCode);
  let foundAddressLine2 = false;

  for (let i = 0; i < 5; i++) {
    await verifyIsVisible(centreNames, i);
    await verifyIsVisible(centreAddressLines1, i);
    await verifyIsVisible(centreAddressCities, i);
    await verifyIsVisible(centrePostalCodes, i);
    await verifyIsVisible(centreNames, i);
    if (await isVisible(centreAddressLines2, i)) {
      foundAddressLine2 = true;
    }
  }

  // Not all data will have Address Line 2 - but check at least 1 was present
  await t.expect(foundAddressLine2).ok('Did not find at least one Address Line 2!');
});

test('Verify the \'About this test centre\' shows additional information for each test centre', async (t) => {
  const aboutThisTestCentreLinks: Selector = createSelector(chooseATestCentrePage.aboutThisTestCentreLink);
  const testCentreAdditionalInfos: Selector = createSelector(chooseATestCentrePage.centreAdditionalInfo);

  for (let i = 0; i < 5; i++) {
    await click(aboutThisTestCentreLinks, i);
    await verifyIsVisible(testCentreAdditionalInfos, i);
    await verifyContainsText(chooseATestCentrePage.centreAdditionalInfoHeading, 'Description:', i);
    await t.expect(await getText(chooseATestCentrePage.centreAdditionalInfoText, i)).notEql('');
  }
});

test('Verify that 2 tabs are visible when JavaScript is enabled: \'List of centres\' and \'See on map\'', async () => {
  await verifyIsVisible(chooseATestCentrePage.listOfCentresTab);
  await verifyExactText(chooseATestCentrePage.listOfCentresTab, chooseATestCentrePage.listOfTestCentresTabText);

  await verifyIsVisible(chooseATestCentrePage.mapOfCentresTab);
  await verifyExactText(chooseATestCentrePage.mapOfCentresTab, chooseATestCentrePage.seeOnMapTabText);
});

test('Verify when no test centres have been selected on the \'See on map\' tab, it displays a hint text', async () => {
  await click(chooseATestCentrePage.mapOfCentresTab);
  await verifyExactText(chooseATestCentrePage.mapSelectHint, chooseATestCentrePage.mapSelectHintText);
});

test('Verify the \'See on map\' tab tab has rendered the map with the correct number of markers as the \'List of centres\' tab', async (t) => {
  let testCentreCount = parseInt(await getText(chooseATestCentrePage.testCentreCount), 10);

  await click(chooseATestCentrePage.mapOfCentresTab);
  await verifyIsVisible(chooseATestCentrePage.googleMap);

  let testCentreMapMarkers = createSelector(chooseATestCentrePage.getMapMarkersSelector());
  await t.expect(testCentreMapMarkers.count).eql(5, { timeout: 10000 });

  // go back and show 5 more test centres
  await click(chooseATestCentrePage.listOfCentresTab);
  await click(chooseATestCentrePage.see5MoreButton);
  testCentreCount = parseInt(await getText(chooseATestCentrePage.testCentreCount), 10);
  await t.expect(testCentreCount).eql(10, { timeout: 10000 });

  // check map markers have updated to the same
  await click(chooseATestCentrePage.mapOfCentresTab);
  await verifyIsVisible(chooseATestCentrePage.googleMap);
  testCentreMapMarkers = createSelector(chooseATestCentrePage.getMapMarkersSelector());
  await t.expect(testCentreMapMarkers.count).eql(testCentreCount);
});

// Test not run in Firefox due to an issue clicking the map markers
// The click is registered but the info window does not appear
test('Verify clicking on the map markers in the map tab shows the test centre details correctly', async (t) => {
  if (t.browser.name.toLowerCase() !== 'firefox') {
    // Loop through all 5 test centres
    for (let i = 0; i < 5; i++) {
      await click(chooseATestCentrePage.mapOfCentresTab);
      await click(chooseATestCentrePage.googleMap);
      const testCentreMapMarkers = createSelector(chooseATestCentrePage.getMapMarkersSelector());

      await click(testCentreMapMarkers, i);
      await verifyIsVisible(chooseATestCentrePage.testCentreInfoCallout, 0, 10000);
      const testCentreAddress = await getText(chooseATestCentrePage.testCentreInfoCallout);

      let hasAddressLine2 = false;
      const selectedCentreName = await getText(chooseATestCentrePage.mapSelectedCentreName);
      const selectedCentreAddressLine1 = await getText(chooseATestCentrePage.mapSelectedCentreAddressLine1);
      let selectedCentreAddressLine2;
      if (await isVisible(chooseATestCentrePage.mapSelectedCentreAddressLine2)) {
        hasAddressLine2 = true;
        selectedCentreAddressLine2 = await getText(chooseATestCentrePage.mapSelectedCentreAddressLine2);
      }
      const selectedCentreAddressCity = await getText(chooseATestCentrePage.mapSelectedCentreAddressCity);
      const selectedCentrePostcode = await getText(chooseATestCentrePage.mapSelectedCentreAddressPostalCode);

      await verifyIsVisible(chooseATestCentrePage.mapSelectedCentreDistance);
      await t.expect(testCentreAddress).contains(selectedCentreName);
      await t.expect(testCentreAddress).contains(selectedCentreAddressLine1);
      if (hasAddressLine2) {
        await t.expect(testCentreAddress).contains(selectedCentreAddressLine2);
      }
      await t.expect(testCentreAddress).contains(selectedCentreAddressCity);
      await t.expect(testCentreAddress).contains(selectedCentrePostcode);
      await t.expect(testCentreAddress).contains(selectedCentreName);

      await click(chooseATestCentrePage.testCentreInfoCalloutCloseButton);
      await click(chooseATestCentrePage.listOfCentresTab);
    }
  } else {
    console.log('Test skipped for Firefox');
  }
});

// Test not run in Firefox due to an issue clicking the map markers
// The click is registered but the info window does not appear
test('Verify the \'View on Google Maps\' link on a selected test centre is constructed correctly', async (t) => {
  if (t.browser.name.toLowerCase() !== 'firefox') {
    await click(chooseATestCentrePage.mapOfCentresTab);
    await click(chooseATestCentrePage.googleMap);
    const testCentreMapMarkers = createSelector(chooseATestCentrePage.getMapMarkersSelector());

    await click(testCentreMapMarkers);

    const selectedCentreAddressLine1 = await getText(chooseATestCentrePage.mapSelectedCentreAddressLine1);
    const selectedCentrePostcode = await getText(chooseATestCentrePage.mapSelectedCentreAddressPostalCode);
    const linkValue = decodeURIComponent(await Selector('a').withText(chooseATestCentrePage.viewOnGoogleMapsLinkText).getAttribute('href'));

    await t.expect(linkValue).contains('https://www.google.com/maps/search/');
    await t.expect(linkValue).contains(selectedCentreAddressLine1);
    await t.expect(linkValue).contains(selectedCentrePostcode);
  } else {
    console.log('Test skipped for Firefox');
  }
});

// Test not run in Firefox due to an issue clicking the map markers
// The click is registered but the info window does not appear
test('Verify you can select a test centre from the map tab to proceed with the booking', async (t) => {
  if (t.browser.name.toLowerCase() !== 'firefox') {
    await click(chooseATestCentrePage.mapOfCentresTab);
    await click(chooseATestCentrePage.googleMap);
    const testCentreMapMarkers = createSelector(chooseATestCentrePage.getMapMarkersSelector());

    await click(testCentreMapMarkers);
    await verifyIsVisible(chooseATestCentrePage.testCentreInfoCallout);

    const preferredDatePage: PreferredDatePage = await chooseATestCentrePage.selectATestCentreFromMapTab();
    await verifyTitleContainsText(`${preferredDatePage.pageTitle} ${generalTitle}`);
    await verifyExactText(preferredDatePage.pageTitleLocator, preferredDatePage.pageHeading);
  } else {
    console.log('Test skipped for Firefox');
  }
});

async function checkAscendingOrderByDistance(t: TestController, centreDistances: Selector, numOfTestCentres: number, unit: string) {
  let previousDistance = 0;
  for (let i = 0; i < numOfTestCentres; i++) {
    const distance = parseFloat(await getText(centreDistances, i));
    await t.expect(distance).gte(previousDistance);
    previousDistance = distance;
    await verifyContainsText(centreDistances.nth(i), unit);
  }
}
