import { Request, Response, NextFunction } from 'express';
import { Locale, Target } from '../domain/enums';
import { changeLanguage, isLocaleAvailableForTarget, resetLocale } from '../helpers/language';
import { store } from '../services/session';

const setTarget = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (
    req.query.target
    && Object.values(Target).includes(req.query.target as Target)
    && !req.session.journey?.inEditMode
  ) {
    store.reset(req);
    req.session.target = req.query.target as Target;
    res.locals.target = req.query.target as Target;
    if ((req.query.lang || req.session.locale)
      && !isLocaleAvailableForTarget(req.query.lang ? req.query.lang as Locale : req.session.locale as Locale, req.query.target as Target)) {
      resetLocale(req);
      await changeLanguage(req, res);
    }
  }
  return next();
};

export {
  setTarget,
};
