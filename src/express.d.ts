// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { RequestValidationError } from './middleware/request-validator';

declare global {
  namespace Express {
    interface Request {
      errors: RequestValidationError[];
      hasErrors: boolean;
    }
  }
}
