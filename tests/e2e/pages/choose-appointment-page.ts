/* eslint-disable import/no-cycle */
import { Selector } from 'testcafe';
import { BasePage } from './base-page';
import { click, link } from '../utils/helpers';
import { CheckYourDetailsPage } from './check-your-details-page';
import { FindATheoryTestCentrePage } from './find-a-theory-test-centre-page';
import { Booking } from '../data/session-data';

export class ChooseAppointmentPage extends BasePage {
  // locators
  pageHeadingLocator = '.govuk-heading-xl';

  backLink = '.govuk-back-link';

  changeTestCenterLocator = 'p > a[href="find-test-centre"]';

  testCentreNameLocator = 'h2.govuk-heading-l';

  morningAfternoonSlotsHeader = 'h3.govuk-heading-m';

  userTextLocator = 'h2.govuk-heading-m';

  appointmentDayTabs = 'ol[class="appointment-tabs"] > li';

  tabDay = '.tab-day';

  selectedDayTab = '.tab-0 .tab-day > a';

  selectedDate = '.tab-0 > a';

  selectATime = '#slots button[data-module="govuk-button"]';

  slotId = 'input[name="slotId"]';

  warningMessageLocator = '.appointment-slots > .govuk-body';

  warningMessageLocator2 = '.govuk-warning-text__text';

  bannerLocator = 'div.alert';

  pathUrl = 'choose-appointment';

  // content
  pageHeading = 'Choose a time for the theory test';

  changeTestCentreText = 'Check time slots at a different test centre';

  noSlotsAvailableWarningText = 'There is no availability on this date. Try another day.';

  pastDaysWarningText = 'Days in the past cannot be viewed';

  futureDaysWarningText = 'This day is not yet available for booking. Check regularly as this may change.';

  prevWeekLinkText = '< Previous week';

  nextWeekLinkText = 'Next week >';

  prevDayLinkText = '< Previous';

  nextDayLinkText = 'Next >';

  selectAnotherDateLinkText = 'Select another date';

  // Change banner content
  changeBannerText1 = 'You can change the test time here or keep the time previously selected.';

  changeBannerText2 = 'Date and time slots are both subject to availability';

  keepTheTimePreviouslySelectedText = 'keep the time previously selected';

  async chooseAppointment(currentBooking: Booking, index = 0): Promise<CheckYourDetailsPage> {
    let slotIndex = index;
    const timeValue = await Selector(`${this.selectATime} + ${this.slotId}`).nth(slotIndex).value;
    if (timeValue.includes('11:00')) { // avoid 11am as TCN stub will throw error
      slotIndex += 1;
    }
    currentBooking.dateTime = await Selector(`${this.selectATime} + ${this.slotId}`).nth(slotIndex).value;
    await click(this.selectATime, slotIndex);
    return new CheckYourDetailsPage();
  }

  async changeTestCentre(): Promise<FindATheoryTestCentrePage> {
    await link(this.changeTestCentreText);
    return new FindATheoryTestCentrePage();
  }

  async showNextWeeksAppointments(): Promise<void> {
    await link(this.nextWeekLinkText);
  }

  async showPreviousWeeksAppointments(): Promise<void> {
    await link(this.prevWeekLinkText);
  }

  async showNextDaysAppointments(): Promise<void> {
    await link(this.nextDayLinkText);
  }

  async showPreviousDaysAppointments(): Promise<void> {
    await link(this.prevDayLinkText);
  }

  async goBack(): Promise<void> {
    await click(this.backLink);
  }
}
