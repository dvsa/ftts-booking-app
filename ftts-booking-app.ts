/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AzureFunction,
  Context,
  HttpRequest,
} from '@azure/functions';
import awsServerlessExpress from 'aws-serverless-express';
import { withEgressFiltering } from '@dvsa/egress-filtering';
import url from 'url';
import { httpTriggerContextWrapper } from '@dvsa/azure-logger';
import { ALLOWED_ADDRESSES } from './src/services/egress/index';

import app from './app';
import { logger } from './src/helpers/logger';
import { createAzureCookie } from './src/helpers/cookie-helper';

const server = awsServerlessExpress.createServer(app, undefined, ['*/*']);

export const httpTrigger: AzureFunction = (context: Context, req): void => {
  const path = url.parse(req.originalUrl).pathname;

  const event = {
    path,
    httpMethod: req.method,
    headers: {
      ...req.headers,
    },
    queryStringParameters: {
      ...req.query,
    },
    body: req.rawBody,
    isBase64Encoded: false,
  };

  const awsContext: any = {
    succeed(awsResponse: any): void {
      if (context.res) {
        // Need to deal with the cookies and make sure we set them correctly
        context.res.cookies = [];

        // eslint-disable-next-line no-restricted-syntax
        for (const [key, value] of Object.entries(awsResponse.headers)) {
          if (key.toLowerCase() === 'set-cookie') {
            const cookie = createAzureCookie(value as string);
            context.res.cookies.push(cookie);
            // eslint-disable-next-line security/detect-object-injection
            delete awsResponse.headers[key];
          }
        }

        context.res.status = awsResponse.statusCode;
        context.res.headers = {
          ...context.res.headers,
          ...awsResponse.headers,
        };
        context.res.body = Buffer.from(
          awsResponse.body,
          awsResponse.isBase64Encoded ? 'base64' : 'utf8',
        );
        context.res.isRaw = true;
      }

      context.done();
    },
  };
  awsServerlessExpress.proxy(server, event as any, awsContext);
};

export const index = (context: Context, req: HttpRequest): void => {
  httpTriggerContextWrapper(withEgressFiltering(httpTrigger, ALLOWED_ADDRESSES, () => {}, logger), context, req).catch((e) => { logger.error(e, 'httpTriggerContextWrapper failure'); });
};
