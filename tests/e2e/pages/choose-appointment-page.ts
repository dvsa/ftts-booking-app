/* eslint-disable import/no-cycle */
import { Selector } from 'testcafe';
import { BasePage } from './base-page';
import { click, getText, link } from '../utils/helpers';
import { CheckYourAnswersPage } from './check-your-answers-page';
import { FindATheoryTestCentrePage } from './find-a-theory-test-centre-page';
import { CurrentBooking } from '../data/session-data';

export class ChooseAppointmentPage extends BasePage {
  // locators
  pageTitleLocator = '.govuk-heading-xl';

  pageTitle = 'Test time';

  pageHeading = 'Choose a time for the theory test';

  backLink = '.govuk-back-link';

  changeTestCenterLocator = 'p.govuk-body';

  testCentreNameLocator = 'h2.govuk-heading-l';

  morningAfternoonSlotsHeader = 'h3.govuk-heading-m';

  appointmentDayTabs = 'li[class*="tab"]';

  tabDay = '.tab-day > a';

  selectedDayTab = '.tab-0 .tab-day > a';

  selectedDate = '.tab-0 .tab-date > a';

  selectATime = 'button[data-module="govuk-button"]';

  slotId = 'input[name="slotId"]';

  warningMessageLocator = '.appointment-slots > .govuk-body';

  bannerLocator = 'div.alert';

  pathUrl = 'choose-appointment';

  // content
  changeTestCentreText = 'Check time slots at a different test centre';

  noSlotsAvailableWarningText = 'No availability. Try another day.';

  pastDaysWarningText = 'Days in the past cannot be viewed';

  futureDaysWarningText = 'This day is not yet available for booking. Check regularly as this may change.';

  prevWeekLinkText = '< Previous week';

  nextWeekLinkText = 'Next week >';

  prevDayLinkText = '< Previous';

  nextDayLinkText = 'Next >';

  // Change banner content
  changeBannerText1 = 'You can change the test time here or keep the time previously selected.';

  changeBannerText2 = 'Date and time slots are both subject to availability';

  keepTheTimePreviouslySelectedText = 'keep the time previously selected';

  async chooseAppointment(currentBooking: CurrentBooking, index = 0): Promise<CheckYourAnswersPage> {
    let slotIndex = index;
    const timeValue = (await getText(this.selectATime, slotIndex)).trim();
    if (timeValue.includes('11:00')) { // avoid 11am as TCN stub will throw error
      slotIndex += 1;
    }
    currentBooking.dateTime = await Selector(`${this.selectATime} + ${this.slotId}`).nth(slotIndex).value;
    await click(this.selectATime, slotIndex);
    return new CheckYourAnswersPage();
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
