/* eslint-disable import/no-cycle */
import * as dayjs from 'dayjs';
import { Dayjs } from 'dayjs';
import { BasePage } from './base-page';
import {
  link, click, enter, verifyIsVisible,
} from '../utils/helpers';
import { ChooseAppointmentPage } from './choose-appointment-page';
import { CheckYourAnswersPage } from './check-your-answers-page';
import { TestCentreSearch } from '../data/session-data';

export class PreferredDatePage extends BasePage {
  pageTitleLocator = '.govuk-fieldset__heading';

  pageContentLocator = '.govuk-fieldset > p';

  dayTextBoxLabel = 'label[for=day][class*="govuk-date-input__label"]';

  monthTextBoxLabel = 'label[for=month][class*="govuk-date-input__label"]';

  yearTextBoxLabel = 'label[for=year][class*="govuk-date-input__label"]';

  dayTextBox = '#day';

  monthTextBox = '#month';

  yearTextBox = '#year';

  errorMessageLocator = '#error-summary-title';

  errorMessageList = '.govuk-list.govuk-error-summary__list';

  errorLinkDate = 'a[href="#date"]';

  errorLinkDay = `a[href="${this.dayTextBox}"]`;

  errorLinkMonth = `a[href="${this.monthTextBox}"]`;

  errorLinkYear = `a[href="${this.yearTextBox}"]`;

  datePickerButton = '#date-picker-container';

  datePicker = '#date-picker';

  datePickerToday = '.day.is-today';

  datePickerFirstAvailableDay = 'div.day:not(.is-disabled):not(.is-weekend)';

  datePickerNextMonth = 'div.next';

  datePickerPrevMonth = 'div.prev';

  continueButton = '#submit';

  cancelButton = '#cancel';

  backLink = '.govuk-back-link';

  bannerLocator = 'div.alert';

  pathUrl = 'select-date';

  // Content
  pageTitle = 'Enter test date';

  pageHeading = 'Enter a date to check for available theory test time slots';

  changeBannerText = 'You can change the test slot here or keep the date and time previously selected.';

  changeBannerWarningText = 'If you select a new date and time here they will replace the details previously entered. Date and time slots are both subject to availability.';

  pageContent = 'If no test slots are available on this date, this service can help you find one on another day.';

  errorMessageHeader = 'There is a problem';

  cancelLinkText = 'keep the date and time previously selected';

  cancelButtonText = 'Cancel and keep previously selected date and time';

  adjustForDaysWithNoSlots(preferredDate: Dayjs) {
    const dayOfTheWeek = preferredDate.format('dddd');
    // ensure we don't select a Sunday to ensure we have appointment times from stub
    if (dayOfTheWeek === 'Sunday') {
      return dayjs(preferredDate).add(1, 'day');
    }
    return preferredDate;
  }

  async enterPreferredDate(day: string, month: string, year: string): Promise<void> {
    await enter(this.dayTextBox, day);
    await enter(this.monthTextBox, month);
    await enter(this.yearTextBox, year);
  }

  async enterPreferredDateAndSubmit(day: string, month: string, year: string): Promise<ChooseAppointmentPage> {
    await this.enterPreferredDate(day, month, year);
    await click(this.continueButton);
    return new ChooseAppointmentPage();
  }

  async selectPreferredDateWithAppointments(testCentreSearch: TestCentreSearch): Promise<ChooseAppointmentPage> {
    let preferredDate = dayjs().add(14, 'day');
    preferredDate = this.adjustForDaysWithNoSlots(preferredDate);

    testCentreSearch.selectedDate = preferredDate.format('YYYY-MM-DD');

    return this.enterPreferredDateAndSubmit(
      preferredDate.format('DD'),
      preferredDate.format('MM'),
      preferredDate.format('YYYY'),
    );
  }

  async selectPreferredDateLessThan3Days(testCentreSearch: TestCentreSearch): Promise<ChooseAppointmentPage> {
    let preferredDate = dayjs().add(1, 'day');
    preferredDate = this.adjustForDaysWithNoSlots(preferredDate);

    testCentreSearch.selectedDate = preferredDate.format('YYYY-MM-DD');

    return this.enterPreferredDateAndSubmit(
      preferredDate.format('DD'),
      preferredDate.format('MM'),
      preferredDate.format('YYYY'),
    );
  }

  async selectPreferredDateWithNoAppointments(testCentreSearch: TestCentreSearch): Promise<ChooseAppointmentPage> {
    // ensure we select a Sunday so we have no appointment times from stub
    const daysOffset = 14 - dayjs().day();
    const preferredDate = dayjs().add(daysOffset, 'day');

    testCentreSearch.selectedDate = preferredDate.format('YYYY-MM-DD');

    return this.enterPreferredDateAndSubmit(
      preferredDate.format('DD'),
      preferredDate.format('MM'),
      preferredDate.format('YYYY'),
    );
  }

  async showDatePicker(): Promise<void> {
    await click(this.datePickerButton);
    await verifyIsVisible(this.datePicker, 0, 40000);
  }

  async selectDateOnDatePicker(): Promise<void> {
    await click(this.datePickerNextMonth);
    await click(this.datePickerNextMonth);
    await click(this.datePickerFirstAvailableDay);
  }

  async cancelUsingLink(): Promise<CheckYourAnswersPage> {
    await link(this.cancelLinkText);
    return new CheckYourAnswersPage();
  }

  async cancelUsingButton(): Promise<CheckYourAnswersPage> {
    await click(this.cancelButton);
    return new CheckYourAnswersPage();
  }

  async goBack(): Promise<void> {
    await click(this.backLink);
  }
}
