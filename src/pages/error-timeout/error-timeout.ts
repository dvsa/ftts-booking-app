import { Request, Response } from 'express';
import { PageNames } from '@constants';
import { Locale, Target } from '../../domain/enums';
import {
  changeLanguageToLocale, getDefaultLocale, isLocaleAvailableForTarget, sanitizeLocale,
} from '../../helpers/language';
import { BusinessTelemetryEvents, logger } from '../../helpers/logger';
import { store } from '../../services/session';

export class TimeoutErrorController {
  public get = async (req: Request, res: Response): Promise<void> => {
    logger.event(BusinessTelemetryEvents.SESSION_TIMEOUT, 'TimeoutErrorController::get: session timeout', {
      candidateId: req.session.candidate?.candidateId,
      bookingId: req.session.currentBooking?.bookingId,
    });
    const source = String(req?.query?.source);
    store.reset(req, res);
    const target = req?.query?.target === Target.NI ? Target.NI : Target.GB;

    res.locals.target = target;

    const localeInput = req?.query?.lang ? req.query.lang as Locale : Locale.GB;
    const locale = sanitizeLocale(localeInput);
    let lang = locale;
    await changeLanguageToLocale(req, res, locale);
    if (!isLocaleAvailableForTarget(locale, target)) {
      const defaultLocale = getDefaultLocale(target);
      lang = defaultLocale;
      await changeLanguageToLocale(req, res, defaultLocale);
    }

    let startAgainLink = `/choose-support?target=${target}&lang=${lang}`;
    if (source?.startsWith('/manage-booking')) {
      startAgainLink = `/manage-booking?target=${target}&lang=${lang}`;
    } else if (source?.startsWith('/instructor')) {
      startAgainLink = `/instructor?target=${target}&lang=${lang}`;
    }
    return res.render(PageNames.ERROR_TIMEOUT, {
      startAgainLink,
    });
  };
}

export default new TimeoutErrorController();
