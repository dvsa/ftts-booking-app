import { Request, Response, NextFunction } from 'express';
import { createNamespace } from 'cls-hooked';

const namespace = createNamespace('app');

const setupTelemetry = (req: Request, res: Response, next: NextFunction): void => {
  namespace.run(() => {
    namespace.set('sessionId', req?.session?.sessionId);
    namespace.set('X-Azure-Ref', req?.headers?.['x-azure-ref']);
    namespace.set('INCAP-REQ-ID', req?.headers?.['incap-req-id']);
    return next();
  });
};

export {
  setupTelemetry,
};
