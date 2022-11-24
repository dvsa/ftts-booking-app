/* eslint-disable import/no-cycle */
import { Selector, t } from 'testcafe';
import { BasePage } from './base-page';
import {
  click, link, getText,
} from '../utils/helpers';
import { FindATheoryTestCentrePage } from './find-a-theory-test-centre-page';
import { PreferredDatePage } from './preferred-date-page';
import { CheckYourDetailsPage } from './check-your-details-page';
import { Centre } from '../data/session-data';
import { MEDIUM_TIMEOUT } from '../data/constants';

export class ChooseATestCentrePage extends BasePage {
  pathUrl = 'select-test-centre';

  // main page selectors
  pageHeadingLocator = '.govuk-fieldset__heading';

  searchQueryValue = '#inputSearchQuery';

  testCentreCount = '#centreCount';

  changeLink = '#changeQuery';

  listOfCentresTab = 'a[href="#panel1"]';

  mapOfCentresTab = 'a[href="#panel2"]';

  // list of test centres tab selectors
  testCentres = 'div.test-centre';

  changeUnitsLink = '#toggleDistanceUnit';

  selectButton = 'button.select-test-centre';

  selectButtonWithTestCentreName = 'input[value*="<>"] ~ button';

  testCentrePosition = '#testCentrePosition<>';

  centreDistance = '.centre-distance';

  backLink = '.govuk-back-link';

  see5MoreButton = '#showMoreCentres';

  centreName = 'h2.centre-name';

  centreAddressLocator = '.govuk-body > ul.govuk-list';

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
  pageHeading = 'Select a theory test centre';

  bannerText = 'You can change the test location here or keep your existing choice.';

  cancelLinkText = 'keep your existing choice';

  seeKilometresLinkText = 'See kilometres';

  seeMilesLinkText = 'See miles';

  aboutThisTestCentreLinkText = 'About this test centre';

  viewOnGoogleMapsLinkText = 'test centre on Google Maps';

  listOfTestCentresTabText = 'List of centres';

  seeOnMapTabText = 'See on map';

  mapSelectHintText = 'Select a test centre on the map';

  async selectATestCentre(centre: Centre): Promise<PreferredDatePage> {
    await this.getTestCentreAddress(centre, 0);
    await click(this.selectButton);
    return new PreferredDatePage();
  }

  async selectANewTestCentre(centre: Centre): Promise<PreferredDatePage> {
    await this.getTestCentreAddress(centre, 1);
    await click(this.selectButton, 1);
    return new PreferredDatePage();
  }

  async selectATestCentreWithName(testCentreName: string, centre: Centre): Promise<PreferredDatePage> {
    const selectTestCentreButton = this.selectButtonWithTestCentreName.replace('<>', testCentreName);
    const testCentreButton = Selector(selectTestCentreButton).nth(0);
    const testCentreIdValue = await testCentreButton.value;
    const testCentrePositionSelector = Selector(this.testCentrePosition.replace('<>', testCentreIdValue));
    const testCentreIndex = Number(await testCentrePositionSelector.value) - 1;
    await this.getTestCentreAddress(centre, testCentreIndex);
    await click(selectTestCentreButton);
    return new PreferredDatePage();
  }

  async getTestCentreAddress(centre: Centre, index: number): Promise<void> {
    centre.name = await getText(this.centreName, index);
    centre.addressLine1 = await getText(this.centreAddressLine1, index);

    const addressLineCount = await Selector(this.centreAddressLocator).nth(index).childNodeCount;
    if (addressLineCount === 4) {
      centre.addressLine2 = await getText(this.centreAddressLine2, index);
    } else {
      centre.addressLine2 = null;
    }
    centre.addressCity = await getText(this.centreAddressCity, index);
    centre.addressPostalCode = await getText(this.centreAddressPostalCode, index);
  }

  async selectATestCentreFromMapTab(): Promise<PreferredDatePage> {
    if (t.browser.platform.toLowerCase() === 'mobile') {
      await click(`${this.mapSelectedCentreDetails} ${this.mapSelectedCentreSelectButton}[class*=${this.mapSelectedCenterSelectButtonMobileClass}]`);
    } else {
      await click(`${this.mapSelectedCentreDetails} ${this.mapSelectedCentreSelectButton}[class*=${this.mapSelectedCenterSelectButtonDesktopClass}]`);
    }
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
    await t.expect(await getText(this.testCentreCount)).notEql(prevCount, { timeout: MEDIUM_TIMEOUT });
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
    } if (platform === 'mobile' && browserName.includes('samsung')) {
      return this.mapMarkerOther;
    }
    return this.mapMarkerIcon; // chrome desktop, safari desktop, firefox desktop, edge desktop
  }

  async cancelUsingLink(): Promise<CheckYourDetailsPage> {
    await link(this.cancelLinkText);
    return new CheckYourDetailsPage();
  }

  async aboutThisTestCentre(): Promise<void> {
    await link(this.aboutThisTestCentreLinkText);
  }

  async goBack(): Promise<void> {
    await click(this.backLink);
  }
}
