import { InternalAccessDeniedError } from '@dvsa/egress-filtering';
import { NextFunction, Request, Response } from 'express';
import { PageNames } from '../constants';
import { BusinessTelemetryEvents, logger } from '../helpers/logger';

export function pageNotFound(req: Request, res: Response): void {
  res.status(404);
  logger.info(`errorHandler::pageNotFound: ERROR 404: ${req.path}`, { path: req.path });
  return res.render(PageNames.NOT_FOUND, { errors: true });
}

// This has been ignored because the express error handler requires all four parameters defined below.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function internalServerError(err: Error, req: Request, res: Response, next: NextFunction): void {
  res.status(500);
  if (err instanceof InternalAccessDeniedError) {
    logger.security('errorHandler::internalServerError: url is not whitelisted so it cannot be called', {
      host: err.host,
      port: err.port,
      reason: JSON.stringify(err),
    });
    logger.event(BusinessTelemetryEvents.NOT_WHITELISTED_URL_CALL, err.message, {
      host: err.host,
      port: err.port,
    });
  } else {
    logger.error(err, 'errorHandler::internalServerError: error caught', {
      errorMessage: err.message,
    });
  }
  return res.render(PageNames.INTERNAL_SERVER_ERROR, { errors: true });
}

export function asyncErrorHandler(handler: (req: Request, res: Response, next: NextFunction) => Promise<void>): (req: Request, res: Response, next: NextFunction) => void {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      return await handler(req, res, next);
    } catch (err) {
      return internalServerError(err, req, res, () => {});
    }
  };
}
