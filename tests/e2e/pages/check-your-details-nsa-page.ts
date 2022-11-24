/* eslint-disable no-await-in-loop */
/* eslint-disable import/no-cycle */
import { BasePage } from './base-page';
import {
  capitalizeFirstLetter, click, convertDateToDisplayFormat, getVoiceoverOption, verifyContainsText, verifyExactText, verifyIsNotVisible, verifyIsVisible, verifyTitleContainsText,
} from '../utils/helpers';
import { ContactDetailsPage } from './contact-details-page';
import { LanguagePage } from './language-page';
import { TestTypePage } from './test-type-page';
import { SessionData } from '../data/session-data';
import { Languages, SupportTypeText, TestTypeName } from '../data/constants';
import { YesOrNo } from '../../../src/value-objects/yes-or-no';
import { PaymentsPage } from './payments-page';
import { SupportType, Target } from '../../../src/domain/enums';
import { ChooseSupportPage } from './choose-support-page';
import { SelectSupportTypePage } from './select-support-type-page';
import { CustomSupportPage } from './custom-support-page';
import { TranslatorPage } from './translator-page';
import { PreferredDayNSAPage } from './preferred-day-nsa-page';
import { PreferredLocationNSAPage } from './preferred-location-nsa-page';
import { NsaVoiceoverPage } from './nsa-voiceover-page';
import { NsaVoicemailPage } from './nsa-voicemail-page';
import { NsaTelephoneContactPage } from './nsa-telephone-contact-page';

export class CheckYourDetailsNsaPage extends BasePage {
  pageHeadingLocator = 'h1[data-automation-id="heading"]';

  pageHeading = 'Check your details';

  backLink = 'a[data-automation-id="back"]';

  personalDetailsHeadingLocator = 'h2[data-automation-id="personal-details-heading"]';

  personalDetailsLocator = '.govuk-summary-list:nth-of-type(1)';

  personalDetailsKey = `${this.personalDetailsLocator} dt.govuk-summary-list__key`;

  personalDetailsValue = `${this.personalDetailsLocator} dd.govuk-summary-list__value`;

  changeTelephoneLink = 'a[data-automation-id="telephone"]';

  changeEmailLink = 'a[data-automation-id="email"]';

  changeVoicemailConsentLink = 'a[data-automation-id="phone-message-consent"]';

  testDetailsHeadingLocator = 'h2[data-automation-id="test-details-heading"]';

  testDetailsLocator = '.govuk-summary-list:nth-of-type(2)';

  testDetailsKey = `${this.testDetailsLocator} dt.govuk-summary-list__key`;

  testDetailsValue = `${this.testDetailsLocator} dd.govuk-summary-list__value`;

  changeTestTypeLink = 'a[data-automation-id="test-type"]';

  changeOnscreenLanguageLink = 'a[data-automation-id="test-language"]';

  supportDetailsHeadingLocator = 'h2[data-automation-id="support-heading"]';

  supportDetailsLocator = '.govuk-summary-list:nth-of-type(3)';

  supportDetailsKey = `${this.supportDetailsLocator} dt.govuk-summary-list__key`;

  supportDetailsValue = `${this.supportDetailsLocator} dd.govuk-summary-list__value`;

  changeSupportRequestedLink = 'a[data-automation-id="support-requested"]';

  changeSupportTypesLink = 'a[data-automation-id="support-types"]';

  changeTranslatorLanguageLink = 'a[data-automation-id="translator"]';

  changeOtherSupportLink = 'a[data-automation-id="support-details"]';

  changePreferredDayLink = 'a[data-automation-id="preferred-day"]';

  changePreferredLocationLink = 'a[data-automation-id="preferred-location"]';

  changeVoiceoverLink = 'a[data-automation-id="voiceover"]';

  continueButton = 'button[data-automation-id="continue"]';

  pathUrl = 'nsa/check-your-details';

  async continueBooking(): Promise<PaymentsPage> {
    await click(this.continueButton);
    return new PaymentsPage();
  }

  async changeTelephone(): Promise<NsaTelephoneContactPage> {
    await click(this.changeTelephoneLink);
    return new NsaTelephoneContactPage();
  }

  async changeVoicemail(): Promise<NsaVoicemailPage> {
    await click(this.changeVoicemailConsentLink);
    return new NsaVoicemailPage();
  }

  async changeEmail(): Promise<ContactDetailsPage> {
    await click(this.changeEmailLink);
    return new ContactDetailsPage();
  }

  async changeOnscreenLanguage(): Promise<LanguagePage> {
    await click(this.changeOnscreenLanguageLink);
    return new LanguagePage();
  }

  async changeTestType(): Promise<TestTypePage> {
    await click(this.changeTestTypeLink);
    return new TestTypePage();
  }

  async changeSupportRequested(): Promise<ChooseSupportPage> {
    await click(this.changeSupportRequestedLink);
    return new ChooseSupportPage();
  }

  async changeSupportTypes(): Promise<SelectSupportTypePage> {
    await click(this.changeSupportTypesLink);
    return new SelectSupportTypePage();
  }

  async changeVoiceover(): Promise<NsaVoiceoverPage> {
    await click(this.changeVoiceoverLink);
    return new NsaVoiceoverPage();
  }

  async changeOtherSupport(): Promise<CustomSupportPage> {
    await click(this.changeOtherSupportLink);
    return new CustomSupportPage();
  }

  async changeTranslatorLanguage(): Promise<TranslatorPage> {
    await click(this.changeTranslatorLanguageLink);
    return new TranslatorPage();
  }

  async changePreferredDay(): Promise<PreferredDayNSAPage> {
    await click(this.changePreferredDayLink);
    return new PreferredDayNSAPage();
  }

  async changePreferredLocation(): Promise<PreferredLocationNSAPage> {
    await click(this.changePreferredLocationLink);
    return new PreferredLocationNSAPage();
  }

  async goBack(): Promise<void> {
    await click(this.backLink);
  }

  async checkDataMatchesSession(sessionData: SessionData): Promise<void> {
    await verifyTitleContainsText(this.pageHeading);
    // personal details
    await verifyExactText(this.personalDetailsValue, `${sessionData.candidate.firstnames} ${sessionData.candidate.surname}`, 0);
    const sessionDobDate = new Date(sessionData.candidate.dateOfBirth);
    const expDobDate = convertDateToDisplayFormat(sessionDobDate);
    await verifyExactText(this.personalDetailsValue, expDobDate, 1);
    await verifyExactText(this.personalDetailsValue, sessionData.candidate.licenceNumber, 2);
    if (sessionData.candidate.telephone !== null && sessionData.candidate.telephone.toString().length > 0) {
      await verifyExactText(this.personalDetailsValue, sessionData.candidate.telephone.toString(), 3);
      if (sessionData.currentBooking.voicemail) {
        await verifyContainsText(this.personalDetailsValue, capitalizeFirstLetter(YesOrNo.fromBoolean(sessionData.currentBooking.voicemail).toString()), 5);
      }
    } else {
      await verifyExactText(this.personalDetailsValue, 'You added no details', 3);
    }

    await verifyExactText(this.personalDetailsValue, sessionData.candidate.email, 4);

    // test details
    await verifyContainsText(this.testDetailsValue, TestTypeName.get(sessionData.currentBooking.testType), 0);
    await verifyContainsText(this.testDetailsValue, Languages.get(sessionData.currentBooking.language), 1);

    // support details
    await verifyContainsText(this.supportDetailsValue, capitalizeFirstLetter(YesOrNo.fromBoolean(sessionData.journey.support).toString()), 0);
    const supportTypes = sessionData.currentBooking.selectSupportType;
    for (let index = 0; index < supportTypes.length; index++) {
      const supportTypeAbbrevText = SupportTypeText.get(supportTypes[index]);
      await verifyContainsText(this.supportDetailsValue, supportTypeAbbrevText, 1);
    }

    // add extra offset is some options are present/not present
    let OFFSET_INDEX = 0;
    if (supportTypes.includes(SupportType.VOICEOVER)) {
      await verifyContainsText(this.supportDetailsValue, getVoiceoverOption(sessionData), 2);
    } else {
      OFFSET_INDEX--;
    }

    if (sessionData.target === Target.NI && supportTypes.includes(SupportType.TRANSLATOR)) {
      OFFSET_INDEX = 1;
      await verifyContainsText(this.supportDetailsValue, sessionData.currentBooking.translator, 3);
    }
    if (sessionData.currentBooking.customSupport) {
      await verifyContainsText(this.supportDetailsValue, sessionData.currentBooking.customSupport, 3 + OFFSET_INDEX);
    } else {
      OFFSET_INDEX--;
    }
    await verifyContainsText(this.supportDetailsValue, 'I want a particular time or day', 4 + OFFSET_INDEX);
    await verifyContainsText(this.supportDetailsValue, sessionData.currentBooking.preferredDay, 4 + OFFSET_INDEX);
    await verifyContainsText(this.supportDetailsValue, 'I know which locations I want', 5 + OFFSET_INDEX);
    await verifyContainsText(this.supportDetailsValue, sessionData.currentBooking.preferredLocation, 5 + OFFSET_INDEX);

    if (sessionData.journey.isInstructor) {
      await verifyIsNotVisible(this.changeTestTypeLink);
    } else {
      await verifyIsVisible(this.changeTestTypeLink);
    }
  }
}
