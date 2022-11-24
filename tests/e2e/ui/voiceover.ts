/* eslint-disable security/detect-non-literal-regexp */
import { RequestLogger, t } from 'testcafe';
import * as Constants from '../data/constants';
import {
  verifyExactText, setCookie, verifyTitleContainsText, click, verifyContainsText,
} from '../utils/helpers';
import { Locale, Target, Voiceover } from '../../../src/domain/enums';
import { SessionData } from '../data/session-data';
import { generalTitle, generalTitleNI } from '../data/constants';
import { NsaVoiceoverPage } from '../pages/nsa-voiceover-page';
import { SelectSupportTypePage } from '../pages/select-support-type-page';

const nsaVoiceoverPage = new NsaVoiceoverPage();
const headerLogger = RequestLogger([new RegExp(`${process.env.BOOKING_APP_URL}`)], {
  logResponseHeaders: true,
});

fixture`Voiceover - Non-standard accommodations`
  .page(process.env.BOOKING_APP_URL)
  .requestHooks(headerLogger)
  .before(async () => { await Constants.setRequestTimeout; })
  .meta('type', 'regression');

async function navigateToNsaVoiceover(target: Target, locale: Locale) {
  await setCookie(headerLogger, new SessionData(target, locale, true));
  await t.navigateTo(`${process.env.BOOKING_APP_URL}/${nsaVoiceoverPage.pathUrl}`);
}

test('Verify page title and heading are displayed correctly - GB Non-Standard Accommodation', async () => {
  await navigateToNsaVoiceover(Target.GB, Locale.GB);
  await verifyTitleContainsText(`${nsaVoiceoverPage.pageHeading} ${generalTitle}`);
  await verifyExactText(nsaVoiceoverPage.pageHeadingLocator, nsaVoiceoverPage.pageHeading);
});

test('Verify page title and heading are displayed correctly - NI Non-Standard Accommodation', async () => {
  await navigateToNsaVoiceover(Target.NI, Locale.NI);
  await verifyTitleContainsText(`${nsaVoiceoverPage.pageHeading} ${generalTitleNI}`);
  await verifyContainsText(nsaVoiceoverPage.pageHeadingLocator, nsaVoiceoverPage.pageHeading);
});

test('Verify request translator link takes you back to Select support type page - NI Non-Standard Accommodation', async () => {
  await navigateToNsaVoiceover(Target.NI, Locale.NI);
  await nsaVoiceoverPage.goBackAndRequestTranslator();
  const selectSupportTypePage = new SelectSupportTypePage();
  await verifyTitleContainsText(selectSupportTypePage.pageHeading);
});

test('Verify error prefix appears in the title when there is an error - NI Non-Standard Accommodation', async () => {
  const sessionData = new SessionData(Target.NI, Locale.NI, true);
  sessionData.currentBooking.voiceover = Voiceover.NONE;
  await setCookie(headerLogger, sessionData);
  await t.navigateTo(`${process.env.BOOKING_APP_URL}/${nsaVoiceoverPage.pathUrl}`);
  await click(nsaVoiceoverPage.continueButton);
  await verifyTitleContainsText('Error:');
  await verifyTitleContainsText(`${nsaVoiceoverPage.pageHeading} ${Constants.generalTitleNI}`);
});
