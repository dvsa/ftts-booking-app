import { Request, Response } from 'express';
import config from '../../config';
import { setCookieHeader } from '../../helpers/cookie-helper';

interface HttpContextProvider {
  getHttpRequest: () => {
    getUserAgent: () => string,
    getHeader: (headerName: string) => string,
    getAbsoluteUri: () => string,
    getUserHostAddress: () => string,
    getCookieValue: (cookieKey: string) => string,
    getRequestBodyAsString: () => string,
  },
  getHttpResponse: () => {
    setCookie: (cookieName: string, cookieValue: string, domain: string | undefined, expiration: number) => void,
  }
}

export function initialiseExpressHttpContextProvider(req: Request, res: Response): HttpContextProvider {
  return {
    getHttpRequest() {
      return {
        getUserAgent() {
          return this.getHeader('user-agent');
        },
        getHeader(headerName: string) {
          const headerValue = req.header(headerName);
          if (!headerValue) { return ''; }
          return headerValue;
        },
        getAbsoluteUri() {
          return `${req.protocol}://${config.queueit.redirectUrl}${req.originalUrl}`;
        },
        getUserHostAddress() {
          return req.ip;
        },
        getCookieValue(cookieKey: string) {
          // This requires 'cookie-parser' node module (installed/used from app.js)
          // eslint-disable-next-line security/detect-object-injection
          return req.cookies[cookieKey] as string;
        },
        getRequestBodyAsString(): string {
          return 'NotUsed';
        },
      };
    },
    getHttpResponse() {
      return {
        setCookie(cookieName: string, cookieValue: string, domain: string | undefined, expiration: number) {
          setCookieHeader(res, cookieName, cookieValue, {
            expires: new Date(expiration * 1000),
            path: '/',
            domain: domain === '' ? undefined : domain,
            secure: true,
            httpOnly: true,
          });
        },
      };
    },
  };
}
