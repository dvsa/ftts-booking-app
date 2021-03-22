import { Request, Response } from 'express';
import logger from '../helpers/logger';

export function pageNotFound(req: Request, res: Response): void {
  res.status(404);
  logger.info(`ERROR 404: Page not found: ${req.path}`);
  return res.render('error404', { errors: true });
}

export function internalServerError(err: Error, req: Request, res: Response): void {
  logger.error(err);
  logger.info(err.message);
  res.status(500);
  return res.render('error500', { errors: true });
}

export function asyncErrorHandler(handler: Function) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      return await handler(req, res);
    } catch (err) {
      return internalServerError(err, req, res);
    }
  };
}
