import dayjs from 'dayjs';
import cy from 'dayjs/locale/cy';
import gb from 'dayjs/locale/en-gb';
import { Request, Response } from 'express';
import i18next from 'i18next';
import {
  Locale, Target, TARGET_LOCALE_MAP,
} from '../domain/enums';
import config from '../config';
import { logger } from './logger';

export const changeLanguage = async (req: Request, res: Response): Promise<void> => {
  const locale = req.session?.locale || Locale.GB;
  await changeLanguageToLocale(req, res, locale);
};

export const changeLanguageToLocale = async (req: Request, res: Response, locale: Locale): Promise<void> => {
  if (locale === Locale.CY) {
    dayjs.locale(cy);
    res.locals.htmlLang = 'cy';
    res.locals.surveyUrl = config.survey.cy;
    res.locals.headerLink = config.landing.cy.citizen.book;
  } else {
    dayjs.locale(gb);
    res.locals.htmlLang = 'en';
    res.locals.surveyUrl = req.session.locale === Locale.NI ? config.survey.ni : config.survey.gb;
    res.locals.headerLink = config.landing.gb.citizen.book;
  }
  try {
    await i18next.changeLanguage(locale);
  } catch (e) {
    logger.error(e as Error, 'changeLanguageToLocale:: could not change language');
    throw e;
  }
  res.locals.t = i18next.t.bind(i18next);
  res.locals.locale = locale;
};

export const translate = (key: string): string => i18next.t(key);

export const isLocaleAvailableForTarget = (locale: Locale, target: Target): boolean => {
  const availableLocales = TARGET_LOCALE_MAP.get(target);
  return availableLocales?.includes(locale) || false;
};

export const getDefaultLocale = (target: Target): Locale => (target === Target.NI ? Locale.NI : Locale.GB);

export const resetLocale = (req: Request): void => {
  const target = req?.session?.target ? req.session.target : Target.GB;
  const locale = getDefaultLocale(target);
  req.session.locale = locale;
};

export const sanitizeLocale = (locale: Locale): Locale => {
  switch (locale) {
    case Locale.NI: return Locale.NI;
    case Locale.CY: return Locale.CY;
    default: return Locale.GB;
  }
};

export const setCorrectLanguage = async (req: Request, res: Response, target: Target): Promise<Locale> => {
  const localeInput = req?.query?.lang ? req.query.lang as Locale : Locale.GB;
  const locale = sanitizeLocale(localeInput);
  let lang = locale;
  await changeLanguageToLocale(req, res, locale);
  if (!isLocaleAvailableForTarget(locale, target)) {
    const defaultLocale = getDefaultLocale(target);
    lang = defaultLocale;
    await changeLanguageToLocale(req, res, defaultLocale);
  }
  return lang;
};
