import { Response } from 'express';
import helmet from 'helmet';

// Helmet does not export the config type - This is the way the recommend getting it on GitHub.
const helmetConfiguration: Parameters<typeof helmet>[0] = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        'fonts.googleapis.com',
      ],
      scriptSrc: [
        "'self'",
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        (req, res): string => `'nonce-${(res as Response).locals.scriptNonce}'`,
        'maps.googleapis.com',
      ],
      imgSrc: [
        "'self'",
        'maps.gstatic.com',
        'maps.googleapis.com',
        'data:',
      ],
      fontSrc: [
        "'self'",
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
