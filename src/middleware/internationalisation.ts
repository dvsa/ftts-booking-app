import { Request, Response, NextFunction } from 'express';
import { LOCALE } from '../domain/enums';
import { changeLanguage } from '../helpers/language';
import { store } from '../services/session';

const internationalisation = (req: Request, res: Response, next: NextFunction): void => {
  if (req.query.lang && Object.values(LOCALE).includes(req.query.lang as LOCALE)) {
    store.locale.set(req, req.query.lang as LOCALE);
  }

  changeLanguage(req, res);

  return next();
};

export {
  internationalisation,
};
