import { Request, Response, NextFunction } from 'express';
import { Locale, Target } from '../domain/enums';
import { changeLanguage, isLocaleAvailableForTarget, resetLocale } from '../helpers/language';

const internationalisation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.session.locale) {
    resetLocale(req);
  }

  if (req.query.lang
    && Object.values(Locale).includes(req.query.lang as Locale)
    && isLocaleAvailableForTarget(req.query.lang as Locale, req.query.target ? req.query.target as Target : req.session.target as Target)) {
    req.session.locale = req.query.lang as Locale;
  }

  await changeLanguage(req, res);

  return next();
};

export {
  internationalisation,
};
