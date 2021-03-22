import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import cy from 'dayjs/locale/cy';
import gb from 'dayjs/locale/en-gb';
import { Request, Response } from 'express';
import i18next from 'i18next';
import { LOCALE } from '../domain/enums';

dayjs.extend(utc);

export const changeLanguage = (req: Request, res: Response): void => {
  const locale = req.session?.locale;
  dayjs.locale(locale === LOCALE.CY ? cy : gb);
  i18next.changeLanguage(locale);
  res.locals.t = i18next.t.bind(i18next);
};

export const translate = (key: string): string => i18next.t(key);
