import { Request, Response, NextFunction } from 'express';
import config from '../config';

const setGoogleAnalyticsId = (req: Request, res: Response, next: NextFunction): void => {
  res.locals.googleAnalyticsMeasurementId = config.googleAnalytics.measurementId;
  res.locals.googleAnalyticsBaseUrl = config.googleAnalytics.url;
  return next();
};

export {
  setGoogleAnalyticsId,
};
