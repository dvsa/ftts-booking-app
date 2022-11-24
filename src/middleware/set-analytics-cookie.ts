import { Request, Response, NextFunction } from 'express';
import { setCookieHeader } from '../helpers/cookie-helper';

const setAnalyticsCookie = (req: Request, res: Response, next: NextFunction): void => {
  const acceptLabel = 'accept';
  const rejectLabel = 'reject';

  res.locals.cookiePreferenceSet = false;
  res.locals.cookiesEnabled = false;
  if (req?.query?.cookies === acceptLabel && req?.query?.cookies !== undefined) {
    setCookieHeader(res, 'cm-user-preferences', acceptLabel, {
      maxAge: 31536000, // 1 year =  31,536,000 seconds
      httpOnly: true,
      secure: true,
    });
    res.locals.cookiePreferenceSet = true;
    res.locals.cookiesEnabled = true;
  } else if (req?.query?.cookies === rejectLabel && req?.query?.cookies !== undefined) {
    setCookieHeader(res, 'cm-user-preferences', rejectLabel, {
      maxAge: 0,
      httpOnly: true,
      secure: true,
    });
    res.locals.cookiePreferenceSet = true;
    res.locals.cookiesEnabled = false;
  }

  if (req.cookies['cm-user-preferences'] === acceptLabel && !res.locals.cookiePreferenceSet) { // Check if we still have cookies enabled or not if we haven't changed preferences in this request.
    res.locals.cookiesEnabled = true;
  }

  if (req?.query?.viewCookies === 'redirect') {
    return res.redirect('/view-cookies');
  }

  return next();
};

export {
  setAnalyticsCookie,
};
