import { NextFunction, Request, Response } from 'express';
import { BusinessTelemetryEvents, logger } from '../helpers/logger';

export const paymentRedirect = (req: Request, res: Response, next: NextFunction): void => {
  if (!req?.session?.currentBooking?.bookingRef) {
    logger.event(
      BusinessTelemetryEvents.PAYMENT_REDIRECT_SESSION_FAIL,
      'paymentRedirect: Redirected back to an invalid or expired session from payments',
      { bookingReference: req?.params?.bookingReference },
    );
  }

  return next();
};
