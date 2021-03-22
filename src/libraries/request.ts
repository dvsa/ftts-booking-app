/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { RequestValidationError } from '../middleware/request-validator';

declare global {
  namespace Express {
    interface Request {
      hasErrors: boolean;
      errors: RequestValidationError[];
    }
  }
}
