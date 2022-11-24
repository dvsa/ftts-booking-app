import dayjs from 'dayjs';
import cy from 'dayjs/locale/cy';
import gb from 'dayjs/locale/en-gb';
import i18next from 'i18next';
import config from '../../../src/config';
import { Locale, Target } from '../../../src/domain/enums';

import {
  changeLanguage, isLocaleAvailableForTarget, setCorrectLanguage, translate,
} from '../../../src/helpers/language';

jest.mock('i18next');
jest.mock('dayjs');

describe('Language helper', () => {
  describe('Change language', () => {
    let req;
    let res;

    beforeEach(() => {
      req = {
        session: {},
      };
      res = {
        locals: {},
      };

      config.landing.gb.citizen.book = 'gb-booking-url';
      config.landing.cy.citizen.book = 'cy-booking-url';
    });

    test('Handles no language currently set', async () => {
      await changeLanguage(req, res);

      expect(dayjs.locale).toHaveBeenCalledWith(gb);
      expect(res.locals.t).toBeDefined();
      expect(res.locals.locale).toBe(Locale.GB);
      expect(res.locals.htmlLang).toBe('en');
      expect(res.locals.surveyUrl).toBe(config.survey.gb);
      expect(res.locals.headerLink).toBe(config.landing.gb.citizen.book);
    });

    test('Setting language to NI with no target set', async () => {
      req.session.locale = 'ni';

      await changeLanguage(req, res);

      expect(dayjs.locale).toHaveBeenCalledWith(gb);
      expect(res.locals.t).toBeDefined();
      expect(res.locals.locale).toBe(req.session.locale);
      expect(res.locals.htmlLang).toBe('en');
      expect(res.locals.surveyUrl).toBe(config.survey.ni);
    });

    test('Setting language to CY', async () => {
      req.session.locale = 'cy';

      await changeLanguage(req, res);

      expect(dayjs.locale).toHaveBeenCalledWith(cy);
      expect(res.locals.t).toBeDefined();
      expect(res.locals.locale).toBe(req.session.locale);
      expect(res.locals.htmlLang).toBe('cy');
      expect(res.locals.surveyUrl).toBe(config.survey.cy);
      expect(res.locals.headerLink).toBe(config.landing.cy.citizen.book);
    });

    test('Setting language to EN', async () => {
      req.session.locale = 'en';

      await changeLanguage(req, res);

      expect(dayjs.locale).toHaveBeenCalledWith(gb);
      expect(res.locals.t).toBeDefined();
      expect(res.locals.locale).toBe(req.session.locale);
      expect(res.locals.htmlLang).toBe('en');
      expect(res.locals.headerLink).toBe(config.landing.gb.citizen.book);
    });
  });

  describe('Translate', () => {
    // eslint-disable-next-line @typescript-eslint/require-await
    test('translate wired up', async () => {
      translate('test');
      expect(i18next.t).toHaveBeenCalledWith('test');
    });
  });

  describe('isLocaleAvailableForTarget', () => {
    // eslint-disable-next-line @typescript-eslint/require-await
    test('returns true for languages that match target', async () => {
      expect(isLocaleAvailableForTarget(Locale.GB, Target.GB)).toBeTruthy();
      expect(isLocaleAvailableForTarget(Locale.CY, Target.GB)).toBeTruthy();
      expect(isLocaleAvailableForTarget(Locale.NI, Target.NI)).toBeTruthy();
    });

    // eslint-disable-next-line @typescript-eslint/require-await
    test('returns false for languages that do not match target', async () => {
      expect(isLocaleAvailableForTarget(Locale.GB, Target.NI)).toBeFalsy();
      expect(isLocaleAvailableForTarget(Locale.CY, Target.NI)).toBeFalsy();
      expect(isLocaleAvailableForTarget(Locale.NI, Target.GB)).toBeFalsy();
    });
  });

  describe('setCorrectLanguage', () => {
    let req;
    let res;

    beforeEach(() => {
      req = {
        session: {},
        query: {},
      };
      res = {
        locals: {},
      };
    });

    test.each([
      [Locale.GB, Target.GB, Locale.GB],
      [Locale.GB, Target.NI, Locale.NI],
      [Locale.NI, Target.GB, Locale.GB],
      [Locale.NI, Target.NI, Locale.NI],
      [Locale.CY, Target.GB, Locale.CY],
      [Locale.CY, Target.NI, Locale.NI],
      [undefined, Target.GB, Locale.GB],
      [undefined, Target.NI, Locale.NI],
    ])('changes i18n language and returns correct one', async (lang: Locale | undefined, target: Target, expectedLang: Locale) => {
      req.query.lang = lang;
      const actualLang = await setCorrectLanguage(req, res, target);
      expect(actualLang).toEqual(expectedLang);
      expect(i18next.changeLanguage).toHaveBeenCalledWith(expectedLang);
    });
  });
});
