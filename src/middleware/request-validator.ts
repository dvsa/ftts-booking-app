import {
  NextFunction, Request, RequestHandler, Response,
} from 'express';
import {
  checkSchema, Location, validationResult, Schema, ValidationChain,
} from 'express-validator';

export type ValidatorSchema = Schema;
export interface RequestValidationError {
  location: Location;
  msg: string;
  param: string;
}

function processValidationResults(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  req.errors = errors.array() as RequestValidationError[];
  req.hasErrors = req.errors.length > 0;
  setResponseStatus(req, res);
  next();
}

function setResponseStatus(req: Request, res: Response): void {
  if (req.hasErrors) {
    res.status(400);
  }
}

// Seems to be a type incompatibility issue when passing this in the express routers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateRequest(validationSchema: ValidatorSchema): any[] {
  const requestValidationChain: Array<ValidationChain[] | RequestHandler> = [];
  requestValidationChain.push(checkSchema(validationSchema));
  return requestValidationChain.concat(processValidationResults);
}

// For validating against dynamically-generated schema based on request
export function conditionalValidateRequest(buildSchema: (req: Request) => ValidatorSchema) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const validations = checkSchema(buildSchema(req));
    await Promise.all(validations.map((val) => val.run(req)));
    return processValidationResults(req, res, next);
  };
}
