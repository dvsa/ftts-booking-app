/* eslint-disable @typescript-eslint/no-explicit-any */
import { AzureFunction, Context } from '@azure/functions';
import awsServerlessExpress from 'aws-serverless-express';
import url from 'url';

import app from './app';

const server = awsServerlessExpress.createServer(app, undefined, ['*/*']);

const httpTrigger: AzureFunction = (context: Context, req): void => {
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

export default httpTrigger;
