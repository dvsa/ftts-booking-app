/* eslint-disable import/no-cycle */
import { BasePage } from './base-page';
import { click } from '../utils/helpers';
import { ChooseAppointmentPage } from './choose-appointment-page';
import { FindATheoryTestCentrePage } from './find-a-theory-test-centre-page';
import { PreferredDatePage } from './preferred-date-page';

export class ChangeLocationTimePage extends BasePage {
  pageTitleLocator = '.govuk-fieldset__heading';

  pageTitle = 'Change test details';

  pageHeading= 'What do you want to change?';

  changeBannerLocator = 'div.alert';

  changeTimeOnlyOption = 'input[id=changeLocationOrTime]';

  changeTimeAndDateOption = 'input[id=changeLocationOrTime-2]';

  changeLocationOption = 'input[id=changeLocationOrTime-3]';

  continueButton = '#submit';

  cancelButton = '#cancel';

  pathUrl = 'change-location-time';

  changeBannerText = 'You can change your previous response here or go back and keep it.';

  cancelChangeLinkBannerText = 'go back and keep it';

  confirmChangeButtonText = 'Change and continue';

  cancelChangeButtonText = 'Cancel and keep your selection';

  async selectChangeTimeOnlyOption(): Promise<ChooseAppointmentPage> {
    await click(this.changeTimeOnlyOption);
    await click(this.continueButton);
    return new ChooseAppointmentPage();
  }

  async selectChangeTimeAndDateOption(): Promise<PreferredDatePage> {
    await click(this.changeTimeAndDateOption);
    await click(this.continueButton);
    return new PreferredDatePage();
  }

  async selectChangeLocationOption(): Promise<FindATheoryTestCentrePage> {
    await click(this.changeLocationOption);
    await click(this.continueButton);
    return new FindATheoryTestCentrePage();
  }
}
