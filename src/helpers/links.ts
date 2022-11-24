import { Request } from 'express';
import { Locale, Target } from '../domain/enums';
import { sanitizeLocale } from './language';

export const getErrorPageLink = (dest: string, req: Request): string => {
  let sourcePath = '/';
  const target = req?.session?.target === Target.NI ? Target.NI : Target.GB;
  const locale = req?.session?.locale ? req?.session?.locale : Locale.GB;
  const lang = sanitizeLocale(locale);
  const path = req?.originalUrl;
  if (path) {
    if (path.startsWith('/manage-booking')) {
      sourcePath = '/manage-booking';
    } else if (path.startsWith('/instructor')) {
      sourcePath = '/instructor';
    }
  }
  return `${dest}?source=${sourcePath}&target=${target}&lang=${lang}`;
};

export const getStartAgainLink = (target: Target, lang: Locale, source: string): string => {
  let startAgainLink = `/choose-support?target=${target}&lang=${lang}`;
  if (source?.startsWith('/manage-booking')) {
    startAgainLink = `/manage-booking?target=${target}&lang=${lang}`;
  } else if (source?.startsWith('/instructor')) {
    startAgainLink = `/instructor?target=${target}&lang=${lang}`;
  }
  return startAgainLink;
};
