/* eslint-disable import/no-cycle */
import { Selector, t } from 'testcafe';
import { BasePage } from './base-page';
import {
  click, link, createSelector, getText,
} from '../utils/helpers';
import { FindATheoryTestCentrePage } from './find-a-theory-test-centre-page';
import { PreferredDatePage } from './preferred-date-page';
import { CheckYourAnswersPage } from './check-your-answers-page';
import { Centre } from '../data/session-data';

export class ChooseATestCentrePage extends BasePage {
  pathUrl = 'select-test-centre';

  // main page selectors
  pageTitleLocator = '.govuk-fieldset__heading';

  searchQueryValue = '#inputSearchQuery';

  testCentreCount = '#centreCount';

  changeLink = '#changeQuery';

  listOfCentresTab = 'a[href="#panel1"]';

  mapOfCentresTab = 'a[href="#panel2"]';

  // list of test centres tab selectors
  testCentres = 'div.test-centre';

  changeUnitsLink = '#toggleDistanceUnit';

  selectButton = 'button.select-test-centre';

  centreDistance = '.centre-distance';

  backLink = '.govuk-back-link';

  see5MoreButton = '#showMoreCentres';

  centreName = 'h2.centre-name';

  centreAddressLine1 = '.centre-address-line-1';

  centreAddressLine2 = '.centre-address-line-2';

  centreAddressCity = '.centre-address-city';

  centreAddressPostalCode = '.centre-address-postal-code';

  aboutThisTestCentreLink = 'summary.centre-summary';

  centreAdditionalInfo = '.centre-additional-info';

  centreAdditionalInfoHeading = `${this.centreAdditionalInfo} > p:nth-of-type(1)`;

  centreAdditionalInfoText = `${this.centreAdditionalInfo} > p:nth-of-type(2)`;

  // map tab selectors
  mapSelectHint = '#map-select-hint';

  googleMap = '#map';

  mapIframe = 'iframe';

  mapMarkerOther = 'div[title] > img'; // this one is used to identify map markers across all browsers/devices

  mapMarkerGeneric = 'img[src*="spotlight-poi2"]:not([usemap])'; // this one is used to identify map markers across all browsers/devices

  mapMarkerIcon = 'img[usemap] + map'; // this one only appears in certain browsers (e.g. Chrome)

  testCentreInfoCallout = '#markerCallout';

  testCentreInfoCalloutCloseButton = 'button[aria-label="Close"]';

  mapSelectedCentreDetails = 'div[id*=map-centre][style*="block"] ';

  mapSelectedCentreName = `${this.mapSelectedCentreDetails} .map-centre-name`;

  mapSelectedCentreDistance = `${this.mapSelectedCentreDetails} .map-centre-distance`;

  mapSelectedCentreAddressLine1 = `${this.mapSelectedCentreDetails} .map-centre-address-line-1`;

  mapSelectedCentreAddressLine2 = `${this.mapSelectedCentreDetails} .map-centre-address-line-2`;

  mapSelectedCentreAddressCity = `${this.mapSelectedCentreDetails} .map-centre-address-city`;

  mapSelectedCentreAddressPostalCode = `${this.mapSelectedCentreDetails} .map-centre-address-postal-code`;

  mapSelectedCenterSelectButtonDesktopClass = 'show-on-desktop';

  mapSelectedCenterSelectButtonMobileClass = 'hide-on-desktop';

  mapSelectedCentreSelectButton = 'button.map-select-centre';

  mapSelectedCentreGoogleMapsLink = 'a[href*="google"]';

  bannerLocator = 'div.alert';

  // content
  pageTitle = 'Choose test centre';

  pageHeading = 'Choose a theory test centre';

  bannerText = 'You can change the test location here or keep your existing choice.';

  cancelLinkText = 'keep your existing choice';

  seeKilometresLinkText = 'See kilometres';

  seeMilesLinkText = 'See miles';

  aboutThisTestCentreLinkText = 'About this test centre';

  viewOnGoogleMapsLinkText = 'View on Google Maps';

  listOfTestCentresTabText = 'List of centres';

  seeOnMapTabText = 'See on map';

  mapSelectHintText = 'Select a test centre on the map';

  async selectATestCentre(centre: Centre): Promise<PreferredDatePage> {
    const testCentreButton = Selector(this.selectButton).nth(0);
    const testCentreValue = await testCentreButton.value;
    Object.assign(centre, JSON.parse(testCentreValue));
    await click(testCentreButton);
    return new PreferredDatePage();
  }

  async selectANewTestCentre(centre: Centre): Promise<PreferredDatePage> {
    const testCentreButton = Selector(this.selectButton).nth(1);
    const testCentreValue = await testCentreButton.value;
    Object.assign(centre, JSON.parse(testCentreValue));
    await click(testCentreButton, 1);
    return new PreferredDatePage();
  }

  async selectATestCentreFromMapTab(): Promise<PreferredDatePage> {
    let selectTestCentreButton: Selector;

    if (t.browser.platform.toLowerCase() === 'mobile') {
      selectTestCentreButton = createSelector(`${this.mapSelectedCentreDetails} ${this.mapSelectedCentreSelectButton}[class*=${this.mapSelectedCenterSelectButtonMobileClass}]`);
    } else {
      selectTestCentreButton = createSelector(`${this.mapSelectedCentreDetails} ${this.mapSelectedCentreSelectButton}[class*=${this.mapSelectedCenterSelectButtonDesktopClass}]`);
    }
    await click(selectTestCentreButton);
    return new PreferredDatePage();
  }

  async changeSearchLocationTerm(): Promise<FindATheoryTestCentrePage> {
    await click(this.changeLink);
    return new FindATheoryTestCentrePage();
  }

  async toggleDistanceUnits(): Promise<void> {
    await click(this.changeUnitsLink);
  }

  async see5MoreTestCentres(): Promise <void> {
    const prevCount = await getText(this.testCentreCount);
    await click(this.see5MoreButton);
    await t.expect(await getText(this.testCentreCount)).notEql(prevCount, { timeout: 30000 });
  }

  // helper method to get the right selector for Google Maps markers
  getMapMarkersSelector(): string {
    const browserName = t.browser.name.toLowerCase();
    const platform = t.browser.platform.toLowerCase();

    if (browserName === 'internet explorer') {
      return this.mapMarkerOther;
    } if (platform === 'mobile' && browserName === 'chrome') {
      return this.mapMarkerOther;
    } if (platform === 'mobile' && browserName === 'safari') {
      return this.mapMarkerOther;
    }
    return this.mapMarkerIcon; // chrome desktop, safari desktop, firefox desktop, edge desktop
  }

  async cancelUsingLink(): Promise<CheckYourAnswersPage> {
    await link(this.cancelLinkText);
    return new CheckYourAnswersPage();
  }

  async aboutThisTestCentre(): Promise<void> {
    await link(this.aboutThisTestCentreLinkText);
  }

  async goBack(): Promise<void> {
    await click(this.backLink);
  }
}
