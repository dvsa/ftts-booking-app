import { NextFunction, Request, Response } from 'express';
import { validateRequest, conditionalValidateRequest, ValidatorSchema } from '../../../src/middleware/request-validator';

describe('Validation middleware helpers', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      body: { },
      hasErrors: false,
      errors: [],
    };
    mockRes = {
      status: jest.fn(),
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('validateRequest', () => {
    const mockStaticSchema: ValidatorSchema = {
      exampleField: {
        in: ['body'],
        notEmpty: {
          errorMessage: 'exampleField error',
        },
      },
    };

    test('returns a middleware array to validate request against static schema', () => {
      const result = validateRequest(mockStaticSchema);

      expect(Array.isArray(result)).toBe(true);
      expect(Array.isArray(result[0])).toBe(true); // Validation chain
      expect(typeof result[1]).toBe('function'); // Process results
    });

    test('correctly sets the validation errors on a request when used', async () => {
      mockReq.body.exampleField = '';

      const middleware = validateRequest(mockStaticSchema);
      await Promise.all(middleware[0].map((m: (req: Request, res: Response, next: NextFunction) => void) => m(mockReq, mockRes, mockNext))); // Validation chain
      await middleware[1](mockReq, mockRes, mockNext); // Process results

      expect(mockReq.errors).toStrictEqual([
        {
          value: '',
          msg: 'exampleField error',
          param: 'exampleField',
          location: 'body',
        },
      ]);
      expect(mockReq.hasErrors).toBe(true);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('conditionalValidateRequest', () => {
    const mockDynamicSchema = (req: Request): ValidatorSchema => {
      // Example conditional validation:
      // If field1 is 'set', then field2 is required
      // Else field1 should be 'not-set'
      if (req.body.field1 === 'set') {
        return {
          field2: {
            in: ['body'],
            notEmpty: {
              errorMessage: 'field2 error',
            },
          },
        };
      }
      return {
        field1: {
          in: ['body'],
          equals: {
            options: 'not-set',
            errorMessage: 'field1 error',
          },
        },
      };
    };

    test('returns a middleware function to validate request against dynamic schema', () => {
      const result = conditionalValidateRequest(mockDynamicSchema);

      expect(typeof result).toBe('function');
    });

    describe('correctly sets the validation errors on a request when used', () => {
      test('branch 1', async () => {
        mockReq.body = {
          field1: 'set',
          field2: '',
        };

        await conditionalValidateRequest(mockDynamicSchema)(mockReq, mockRes, mockNext);

        expect(mockReq.errors).toStrictEqual([
          {
            value: '',
            msg: 'field2 error',
            param: 'field2',
            location: 'body',
          },
        ]);
        expect(mockReq.hasErrors).toBe(true);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockNext).toHaveBeenCalled();
      });

      test('branch 2', async () => {
        mockReq.body = {
          field1: '',
        };

        await conditionalValidateRequest(mockDynamicSchema)(mockReq, mockRes, mockNext);

        expect(mockReq.errors).toStrictEqual([
          {
            value: '',
            msg: 'field1 error',
            param: 'field1',
            location: 'body',
          },
        ]);
        expect(mockReq.hasErrors).toBe(true);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockNext).toHaveBeenCalled();
      });
    });
  });
});
