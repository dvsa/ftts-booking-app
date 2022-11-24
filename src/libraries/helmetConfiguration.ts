/* istanbul ignore */
import { Request, Response } from 'express';
import helmet from 'helmet';
import { IncomingMessage, ServerResponse } from 'http';

import config from '../config';

const nonceCreator: (req: Request | IncomingMessage, res: Response | ServerResponse) => string = (req, res) => `'nonce-${(res as Response).locals.scriptNonce}'`;

// Helmet does not export the config type - This is the way the recommend getting it on GitHub.
const helmetConfiguration: Parameters<typeof helmet>[0] = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        config.view.assetDomain || "'self'",
        "'unsafe-inline'",
        '*.googleapis.com',
      ],
      scriptSrc: [
        config.view.assetDomain,
        "'self'",
        nonceCreator,
        'https://*.googleapis.com',
        'https://*.google-analytics.com',
        'https://*.analytics.google.com',
        'https://*.queue-it.net',
        'https://*.googletagmanager.com',
      ],
      connectSrc: [
        "'self'",
        config.view.assetDomain,
        'https://*.google-analytics.com',
        'https://*.analytics.google.com',
        'https://*.googletagmanager.com',
        'https://*.queue-it.net',
        'https://*.googleapis.com',
      ],
      imgSrc: [
        config.view.assetDomain || "'self'",
        'maps.gstatic.com',
        '*.googleapis.com',
        '*.google-analytics.com',
        '*.analytics.google.com',
        'data:',
        '*.googletagmanager.com',
      ],
      fontSrc: [
        config.view.assetDomain || "'self'",
        'fonts.gstatic.com',
      ],
    },
  },
  dnsPrefetchControl: {
    allow: false,
  },
  frameguard: {
    action: 'deny',
  },
  hsts: {
    maxAge: 31536000, // 1 Year
    preload: false,
    includeSubDomains: true,
  },
  referrerPolicy: false,
  permittedCrossDomainPolicies: false,
  expectCt: false,
};

export default helmetConfiguration;
