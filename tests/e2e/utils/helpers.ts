/* eslint-disable no-nested-ternary */
/* eslint-disable import/no-cycle */
import * as dayjs from 'dayjs';
import { ClientFunction, Selector, t } from 'testcafe';
import { TARGET } from '../../../src/domain/enums';
import { TestVoiceover } from '../../../src/domain/test-voiceover';
import { SessionData } from '../data/session-data';
import * as RedisClient from './redis-client';

export const REMOVE_WHITESPACE_REGEX = /^\s+|\s+$/gm;

export const REMOVE_LINES_REGEX = /(\r\n|\n|\r)/gm;

export const getCurrentUrl = ClientFunction(() => window.location.href);

export function getFutureDate(unit: dayjs.OpUnitType, value: number) {
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

  if (futureDate.format('dddd') === 'Sunday') {
    futureDate = futureDate.add(1, 'day');
  }
  return futureDate;
}

export function createSelector(cssSelector: any): Selector {
  return Object.assign(Selector(cssSelector), { cssSelector });
}

export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function runningTestsLocally() {
  const localFlagSet = process.env.RUN_TESTS_LOCALLY || 'false';
  return localFlagSet === 'true';
}

function getSelectorObject(selector: any): Selector {
  let selectorObj: Selector;
  if (selector instanceof Selector || selector instanceof Function) {
    selectorObj = selector as Selector;
  } else if (typeof (selector) === 'string' || selector instanceof String) {
    selectorObj = createSelector(selector);
  } else {
    throw new Error(`Unknown type for ${selector} - ${selector.constructor.name}`);
  }
  return selectorObj;
}

function getErrorMessage(text: string, selectorObj: any, index = 0): string {
  return `Problem locating element: ${selectorObj.cssSelector} at index ${index} - ${text}`;
}

export async function getText(selector: any, index = 0): Promise<string> {
  const selectorObj = getSelectorObject(selector);
  const text = await selectorObj.nth(index).innerText;
  return text.replace(REMOVE_WHITESPACE_REGEX, '');
}

export async function verifyActualEqualsExpectedText(actualText: string, expectedText: string): Promise<void> {
  await t.expect(actualText.replace(REMOVE_WHITESPACE_REGEX, '')).eql(expectedText);
}

export async function verifyExactText(selector: any, expectedText: string, index = 0, timeout = 5000): Promise<void> {
  await t.expect((
    await getText(selector, index))).eql(expectedText, { timeout });
}

export async function verifyTitleContainsText(expectedText: string): Promise<void> {
  await t.expect((
    await getText('title', 0)).replace(REMOVE_LINES_REGEX, ' ')).contains(expectedText);
}

export async function verifyContainsText(selector: any, expectedText: string, index = 0, timeout = 5000): Promise<void> {
  await t.expect((
    await getText(selector, index))).contains(expectedText, { timeout });
}

export async function verifyNotContainsText(selector: any, expectedText: string, index = 0): Promise<void> {
  await t.expect((
    await getText(selector, index))).notContains(expectedText);
}

export async function verifyIsVisible(selector: any, index = 0, timeout = 10000): Promise<void> {
  const selectorObj = getSelectorObject(selector);
  const errorMessage = getErrorMessage('expected element to be visible', selectorObj, index);

  await t.expect(
    await isVisible(selector, index, timeout),
  ).eql(true, errorMessage, { timeout });
}

export async function verifyIsNotVisible(selector: any, index = 0, timeout = 5000): Promise<void> {
  const selectorObj = getSelectorObject(selector);
  const errorMessage = getErrorMessage('expected element to not be visible', selectorObj, index);

  await t.expect(
    await isVisible(selector, index, timeout),
  ).eql(false, errorMessage, { timeout });
}

export async function isVisible(selector: any, index = 0, timeout = 10000): Promise<boolean> {
  const selectorObj = getSelectorObject(selector);
  return await Selector(selectorObj.nth(index), { timeout })().filterVisible().count !== 0;
}

export async function enter(selector: any, value: string): Promise<void> {
  const selectorObj = getSelectorObject(selector);
  const errorMessage = getErrorMessage('expected element to be visible', selectorObj);

  await t
    .expect(selectorObj.visible).ok(errorMessage)
    .selectText(selectorObj)
    .typeText(selectorObj, value, { paste: true, replace: true });
}

export async function clearField(selector: any): Promise<void> {
  const selectorObj = getSelectorObject(selector);
  const errorMessage = getErrorMessage('expected element to be visible', selectorObj);

  await t
    .expect(selectorObj.visible).ok(errorMessage)
    .selectText(selectorObj)
    .pressKey('delete');
}

export async function select(selector: any, value: string): Promise<void> {
  const selectorObj = getSelectorObject(selector);
  const errorMessage = getErrorMessage('expected element to be visible', selectorObj);

  await t
    .expect(selectorObj.visible).ok(errorMessage)
    .click(selectorObj.withAttribute('value', value));
}

export async function click(selector: any, index = 0): Promise<void> {
  const selectorObj = getSelectorObject(selector);
  const errorMessage = getErrorMessage('expected element to be visible', selectorObj, index);

  await t
    .expect(selectorObj.nth(index).visible).ok(errorMessage)
    .click(selectorObj.nth(index));
}

export async function clickWithText(selector: any, text: string): Promise<void> {
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

export async function setCookie(logger: RequestLogger, sessionData: SessionData): Promise<void> {
  const cookie = logger.requests[0].response.headers['set-cookie'][0];
  if (cookie) {
    let sessionId = '';
    let signature = '';

    if (cookie.includes('ftts=')) {
      signature = cookie.substring(cookie.indexOf('.') + 1, cookie.indexOf(';'));
      const cookieStrDecoded = decodeURIComponent(cookie);
      sessionId = cookieStrDecoded.substring(cookieStrDecoded.indexOf('ftts=s:') + 7, cookieStrDecoded.indexOf('.'));
    } else {
      console.warn(`Did not find ftts cookie - ${cookie}`);
    }

    const parsedCookieData = { sessionId, signature };
    await RedisClient.writeCookieDataToRedis(parsedCookieData.sessionId, sessionData);
  }
}

export function convertDateToDisplayFormat(date: Date) {
  const displayDay = date.toLocaleDateString('en-gb', { day: 'numeric' });
  const displayMonth = date.toLocaleString('en-gb', { month: 'long' });
  const displayYear = date.toLocaleDateString('en-gb', { year: 'numeric' });
  return `${displayDay} ${displayMonth} ${displayYear}`;
}

export function convertTimeToDisplayFormat(timeDate: Date) {
  return timeDate.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true, minute: 'numeric' }).toLowerCase().replace(/\s/g, '');
}

export function deepCopy<T>(source: T): T {
  return Array.isArray(source)
    ? source.map((item) => this.deepCopy(item))
    : source instanceof Date
      ? new Date(source.getTime())
      : source && typeof source === 'object'
        ? Object.getOwnPropertyNames(source).reduce((o, prop) => {
          Object.defineProperty(o, prop, Object.getOwnPropertyDescriptor(source, prop));
          o[prop] = this.deepCopy(source[prop]);
          return o;
        }, Object.create(Object.getPrototypeOf(source)))
        : source;
}

export function getVoiceoverOption(sessionData: SessionData) {
  let voiceover = TestVoiceover.availableOptions(sessionData.target as TARGET).get(sessionData.currentBooking.voiceover);
  if (voiceover === 'None') {
    voiceover = 'No';
  }
  return voiceover;
}
