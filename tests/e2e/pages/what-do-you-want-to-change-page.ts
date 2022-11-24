/* eslint-disable import/no-cycle */
import { BasePage } from './base-page';
import { click } from '../utils/helpers';
import { FindATheoryTestCentrePage } from './find-a-theory-test-centre-page';
import { ChooseAppointmentPage } from './choose-appointment-page';
import { PreferredDatePage } from './preferred-date-page';

export class WhatDoYouWantToChangePage extends BasePage {
  pageHeadingLocator = '.govuk-fieldset__heading';

  changeTimeOnlyOption = '#changeLocationOrTime';

  changeTimeAndDateOption = '#changeLocationOrTime-2';

  changeLocationOption = '#changeLocationOrTime-3';

  changeAndContinueButton = '#continueButton';

  cancelAndKeepYourSelectionButton = '#cancel';

  bannerTextLocator = '#editModeBanner';

  hintLocator = '#changeLocationOrTime-hint';

  timeOnlyHintLocator = '#changeLocationOrTime-item-hint';

  timeAndDateOnlyHintLocator = '#changeLocationOrTime-2-item-hint';

  locationOnlyHintLocator = '#changeLocationOrTime-3-item-hint';

  backLink = '.govuk-back-link';

  errorMessageRadioLocator = '#changeLocationOrTime-error';

  errorMessageLocator = '#error-summary-title';

  errorMessageList = '.govuk-list.govuk-error-summary__list';

  errorLink = 'a[href="#changeLocationOrTime"]';

  pathUrl = 'change-location-time';

  // Contents
  pageHeading = 'What do you want to change?';

  bannerText = 'You can change your previous response here or go back and keep it.';

  goBackAndKeepItLinkText = 'go back and keep it';

  hintText = 'Select one option. Your existing booking will be held until you make and confirm any changes.';

  timeOnlyHintText = 'New time slots on your existing test day may not be available.';

  timeAndDateOnlyHintText = 'Your existing time slot may be unavailable on a different day.';

  locationOnlyHintText = 'Your existing date and time slot may be unavailable at a different location.';

  changeAndContinueButtonText = 'Change and continue';

  cancelAndKeepYourSelectionButtonText = 'Cancel and keep your selection';

  errorMessageHeader = 'There is a problem';

  errorMessageText = 'Please select what you want to change';

  async selectTimeOnly(): Promise<ChooseAppointmentPage> {
    await click(this.changeTimeOnlyOption);
    await click(this.changeAndContinueButton);
    return new ChooseAppointmentPage();
  }

  async selectTimeAndDateOnly(): Promise<PreferredDatePage> {
    await click(this.changeTimeAndDateOption);
    await click(this.changeAndContinueButton);
    return new PreferredDatePage();
  }

  async selectLocationOnly(): Promise<FindATheoryTestCentrePage> {
    await click(this.changeLocationOption);
    await click(this.changeAndContinueButton);
    return new FindATheoryTestCentrePage();
  }

  async clickErrorLink(): Promise<void> {
    await click(this.errorLink);
  }
}
