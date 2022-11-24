/* eslint-disable import/no-cycle */
import dayjs, { Dayjs } from 'dayjs';
import { ClientFunction, Selector, t } from 'testcafe';
import { Voiceover } from '../../../src/domain/enums';
import { SessionData } from '../data/session-data';
import * as RedisClient from './redis-client';
import { logger } from '../../../src/helpers/logger';

export const REMOVE_WHITESPACE_REGEX = /^\s+|\s+$/gm;

export const REMOVE_LINES_REGEX = /(\r\n|\n|\r)/gm;

export const getCurrentUrl = ClientFunction(() => window.location.href);

export function getFutureDate(unit: dayjs.OpUnitType, value: number, adjustSunday = true): Dayjs {
  let futureDate: dayjs.Dayjs;
  if (unit === 'hour') {
    futureDate = dayjs().add(value, unit)
      .set('minute', 0)
      .set('second', 0)
      .set('millisecond', 0);
  } else {
    futureDate = dayjs().add(value, unit)
      .set('hour', 10)
      .set('minute', 0)
      .set('second', 0)
      .set('millisecond', 0);
  }

  if (futureDate.format('dddd') === 'Sunday' && adjustSunday) {
    futureDate = futureDate.add(1, 'day');
  }
  return futureDate;
}

export function createSelector(cssSelector: string): Selector {
  return Object.assign(Selector(cssSelector), { cssSelector });
}

export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function runningTestsLocally(): boolean {
  const localFlagSet = process.env.RUN_TESTS_LOCALLY || 'false';
  return localFlagSet === 'true';
}

function getSelectorObject(selector: any): Selector {
  let selectorObj: Selector;
  if (selector instanceof Selector || selector instanceof Function) {
    selectorObj = selector as Selector;
  } else if (typeof (selector) === 'string') {
    selectorObj = createSelector(selector);
  } else {
    throw new Error(`Unknown type for ${selector} - ${selector.constructor.name}`);
  }
  return selectorObj;
}

function getErrorMessage(text: string, selectorObj: any, index = 0): string {
  return `Problem locating element: ${selectorObj.cssSelector} at index ${index} - ${text}`;
}

export async function getText(selector: string, index = 0): Promise<string> {
  const selectorObj = getSelectorObject(selector);
  const text = await selectorObj.nth(index).innerText;
  return text.replace(REMOVE_WHITESPACE_REGEX, '');
}

export async function verifyActualEqualsExpectedText(actualText: string, expectedText: string): Promise<void> {
  await t.expect(actualText.replace(REMOVE_WHITESPACE_REGEX, '')).eql(expectedText);
}

export async function verifyExactText(selector: string, expectedText: string, index = 0, timeout = 5000): Promise<void> {
  await t.expect((
    await getText(selector, index))).eql(expectedText, { timeout });
}

export async function verifyTitleContainsText(expectedText: string, timeout = 30000): Promise<void> {
  const title = Selector('title').withText(expectedText).with({ visibilityCheck: true });
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await t.expect(title.exists).ok(`Expected title to contain '${expectedText}' but was '${await Selector('title').innerText}'`, { timeout });
}

export async function verifyContainsText(selector: string, expectedText: string, index = 0, timeout = 5000): Promise<void> {
  await t.expect((
    await getText(selector, index))).contains(expectedText, { timeout });
}

export async function verifyNotContainsText(selector: string, expectedText: string, index = 0): Promise<void> {
  await t.expect((
    await getText(selector, index))).notContains(expectedText);
}

export async function verifyValue(selector: string, expectedText: string, index = 0): Promise<void> {
  const selectorObj = getSelectorObject(selector);
  await t.expect(selectorObj.nth(index).value).eql(expectedText);
}

export async function verifyNoValue(selector: string, expectedText: string, index = 0): Promise<void> {
  const selectorObj = getSelectorObject(selector);
  await t.expect(selectorObj.nth(index).value).notEql(expectedText);
}

export async function verifyIsVisible(selector: string, index = 0, timeout = 10000): Promise<void> {
  const selectorObj = getSelectorObject(selector);
  const errorMessage = getErrorMessage('expected element to be visible', selectorObj, index);

  await t.expect(
    await isVisible(selector, index, timeout),
  ).eql(true, errorMessage, { timeout });
}

export async function verifyIsNotVisible(selector: string, index = 0, timeout = 5000): Promise<void> {
  const selectorObj = getSelectorObject(selector);
  const errorMessage = getErrorMessage('expected element to not be visible', selectorObj, index);

  await t.expect(
    await isVisible(selector, index, timeout),
  ).eql(false, errorMessage, { timeout });
}

export async function isVisible(selector: string, index = 0, timeout = 10000): Promise<boolean> {
  const selectorObj = getSelectorObject(selector);
  return await Selector(selectorObj.nth(index), { timeout })().filterVisible().count !== 0;
}

export async function enter(selector: string, value: string): Promise<void> {
  const selectorObj = getSelectorObject(selector);
  const errorMessage = getErrorMessage('expected element to be visible', selectorObj);

  await t
    .expect(selectorObj.visible).ok(errorMessage)
    .selectText(selectorObj)
    .typeText(selectorObj, value, { paste: true, replace: true });
}

export const fillInFields = ClientFunction((cardNumber, expiryDateMonth, expiryDateYear, cscCode) => {
  function clickElement(eId) {
    const e = document.getElementById(eId);
    if (e) {
      e.scrollIntoView();
      e.click();
    }
  }

  function fillField(element, text) {
    const e = document.getElementById(element);
    if (e) {
      e.setAttribute('value', text);
    }
  }

  fillField('scp_cardPage_cardNumber_input', cardNumber);
  fillField('scp_cardPage_expiryDate_input', expiryDateMonth);
  fillField('scp_cardPage_expiryDate_input2', expiryDateYear);
  fillField('scp_cardPage_csc_input', cscCode);
  clickElement('scp_cardPage_buttonsNoBack_continue_button');
});

export async function clearField(selector: string): Promise<void> {
  const selectorObj = getSelectorObject(selector);
  const errorMessage = getErrorMessage('expected element to be visible', selectorObj);

  await t
    .expect(selectorObj.visible).ok(errorMessage)
    .selectText(selectorObj)
    .pressKey('delete');
}

export async function select(selector: string, value: string): Promise<void> {
  const selectorObj = getSelectorObject(selector);
  const errorMessage = getErrorMessage('expected element to be visible', selectorObj);

  await t
    .expect(selectorObj.visible).ok(errorMessage)
    .click(selectorObj.withAttribute('value', value));
}

export async function click(selector: string, index = 0): Promise<void> {
  const selectorObj = getSelectorObject(selector);
  const errorMessage = getErrorMessage('expected element to be visible', selectorObj, index);

  await t
    .expect(selectorObj.visible).ok(errorMessage)
    .expect(selectorObj.nth(index).visible).ok(errorMessage)
    .click(selectorObj.nth(index));
}

export async function clickWithText(selector: string, text: string): Promise<void> {
  const selectorObj = getSelectorObject(selector);
  const errorMessage = getErrorMessage(`expected element to be visible with text ${text}`, selectorObj);

  await t
    .expect(selectorObj.withText(text).visible).ok(errorMessage)
    .click(selectorObj.withText(text));
}

export async function link(value: string): Promise<void> {
  const selectorObj = getSelectorObject('a');
  const errorMessage = getErrorMessage(`expected link with value ${value} to be visible`, selectorObj);

  await t
    .expect(selectorObj.withExactText(value).visible).ok(errorMessage)
    .click(selectorObj.withExactText(value));
}

export async function clickLinkContainsURL(linkText: string, expectedUrlText: string): Promise<void> {
  const linkValue = decodeURIComponent(await Selector('a').withText(linkText).getAttribute('href'));
  await t.expect(linkValue).contains(expectedUrlText);
}

export const setAcceptCookies = ClientFunction(() => {
  document.cookie = 'cm-user-preferences=accept';
});

export async function setCookie(requestLogger: RequestLogger, sessionData: SessionData): Promise<void> {
  await setAcceptCookies();
  const cookie = requestLogger.requests[0].response.headers['set-cookie'][0];
  if (cookie) {
    let sessionId = '';
    let signature = '';

    if (cookie.includes('ftts=')) {
      signature = cookie.substring(cookie.indexOf('.') + 1, cookie.indexOf(';'));
      const cookieStrDecoded = decodeURIComponent(cookie);
      sessionId = cookieStrDecoded.substring(cookieStrDecoded.indexOf('ftts=s:') + 7, cookieStrDecoded.indexOf('.'));
      logger.info(`helper::setCookie: sessionId=${sessionId}`);
    } else {
      console.warn(`Did not find ftts cookie - ${cookie}`);
    }

    const parsedCookieData = { sessionId, signature };
    await RedisClient.writeCookieDataToRedis(parsedCookieData.sessionId, sessionData);
  }
}

export function convertDateToDisplayFormat(date: Date): string {
  const displayDay = date.toLocaleDateString('en-gb', { day: 'numeric' });
  const displayMonth = date.toLocaleString('en-gb', { month: 'long' });
  const displayYear = date.toLocaleDateString('en-gb', { year: 'numeric' });
  return `${displayDay} ${displayMonth} ${displayYear}`;
}

export function convertTimeToDisplayFormat(timeDate: Date): string {
  return timeDate.toLocaleTimeString('en-US', {
    hour: 'numeric', hour12: true, minute: 'numeric', timeZone: 'Europe/London',
  }).toLowerCase().replace(/\s/g, '');
}

export function getVoiceoverOption(sessionData: SessionData): string {
  const { voiceover } = sessionData.currentBooking;
  if (voiceover === Voiceover.NONE) {
    return 'No';
  }
  return capitalizeFirstLetter(voiceover.valueOf());
}
