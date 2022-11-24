import { Request, Response, NextFunction } from 'express';
import {
  KnownUser,
  RequestValidationResult,
  Utils,
  QueueEventConfig,
} from 'queueit-knownuser';
import crypto from 'crypto';
import config from '../../config';
import { QueueItImplementation } from '../../domain/enums';
import { logger } from '../../helpers/logger';
import { initialiseExpressHttpContextProvider } from './queue-it-helper';

const setupQueueIt = (req: Request, res: Response, next: NextFunction): void => {
  if (config.queueit.enabled === QueueItImplementation.KnownUser) {
    setupQueueItKnownUser(req, res, next);
  } else if (config.queueit.enabled === QueueItImplementation.JSImplementation) {
    setupQueueItJSImplementation(req, res, next);
  } else {
    next();
  }
};

/**
 * **QueueIt Server Side Implementation**
 * Controlled by the constant: { QueueItImplementation.KnownUser }
 *
 * This method is used to support the QueueIt server side implementation. It works in the following way:
 * 1. Firstly we create a {RequestValidationResult} to check the session is valid with QueueIt
 * 2. When {RequestValidationResult} is NOT valid we will redirect the user to the url provided by QueueIt and place them in the Queue
 * 3. When {RequestValidationResult} is valid we will redirect the user to the requested url
 */
const setupQueueItKnownUser = (req: Request, res: Response, next: NextFunction): void => {
  try {
    //  HTTP Provider
    const httpContextProvider = initialiseExpressHttpContextProvider(req, res);

    //  Setup
    configureKnownUserHashing();
    const queueConfig = new QueueEventConfig(
      config.queueit.eventId,
      config.queueit.layoutName,
      config.queueit.culture,
      config.queueit.queueDomain,
      config.queueit.extendCookieValidity,
      config.queueit.cookieValidityMinute,
      config.queueit.cookieDomain,
      config.queueit.version,
    );
    // Get Token from Request Query String;
    const token = req.query[KnownUser.QueueITTokenKey];
    // Defining Response Url to use when QueueIt has been confirmed
    const requestUrl = httpContextProvider.getHttpRequest().getAbsoluteUri();
    // eslint-disable-next-line security/detect-non-literal-regexp
    const requestUrlWithoutToken = requestUrl.replace(new RegExp(`([?&])(${KnownUser.QueueITTokenKey}=[^&]*)`, 'i'), '');

    // Creating Validation
    const result: RequestValidationResult = KnownUser.resolveQueueRequestByLocalConfig(
      requestUrlWithoutToken,
      token as string,
      queueConfig,
      config.queueit.customerId,
      config.queueit.secretKey,
      httpContextProvider,
    );

    //  Validates whether a redirect is required to the Queue It service
    if (result.doRedirect()) {
      logger.debug('setupQueueItKnownUser:: Redirecting Candidate to the QueueIt Service', { redirectUrl: result.redirectUrl });
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        Pragma: 'no-cache',
        Expires: 'Fri, 01 Jan 1990 00:00:00 GMT',
      });
      res.redirect(result.redirectUrl);
      return;
    }

    //  Checks if current request url contains the Queue It token and removes it
    if (requestUrl !== requestUrlWithoutToken && result.actionType === 'Queue') {
      logger.debug('setupQueueItKnownUser:: Removing Queue It Token and Redirecting', { requestedUrl: requestUrlWithoutToken });
      // Hide the token from queue it in the query string
      res.redirect(requestUrlWithoutToken);
      return;
    }

    logger.debug('setupQueueItKnownUser:: Request does not contain Queue It token and can continue', { requestedUrl: requestUrlWithoutToken });
    next();
  } catch (err) {
    logger.error(err as Error, 'setupQueueItKnownUser:: Error');
    throw err;
  }
};

/**
 * **QueueIt JS Implementation**
 * Controlled by the constant: { queueItImplementation.JSImplementation }
 */
const setupQueueItJSImplementation = (req: Request, res: Response, next: NextFunction): void => {
  res.locals.queueItCustomerId = config.queueit.customerId;
  res.locals.queueItImplementation = QueueItImplementation.JSImplementation;
  next();
};

/**
 * Defines the implementation of QueueIt SHA256 hashing function
 */
function configureKnownUserHashing(): void {
  Utils.generateSHA256Hash = (secretKey, stringToHash) => {
    const hash = crypto.createHmac('sha256', secretKey)
      .update(stringToHash)
      .digest('hex');
    return hash;
  };
}

export {
  setupQueueIt,
};
