import { ValidatorSchema } from '../../../../src/middleware/request-validator';
import { stringToArray } from '../../../../src/libraries/request-sanitizer';
import { TARGET } from '../../../../src/domain/enums';
import * as CentreGateway from '../../../../src/services/centre-gateway';

import selectTestCentre from '../../../../src/pages/select-test-centre/select-test-centre';
import { mockCentres } from '../../../../src/repository/mock-data';
import { mockCurrentBooking } from '../../../mocks/data/manage-bookings';

jest.mock('../../../../src/services/centre-gateway');

describe('Select Test Centre controller', () => {
  describe('check validation schema for', () => {
    test('GET request', () => {
      const expectedValidationSchema: ValidatorSchema = {
        centre: {
          in: ['query'],
          optional: true,
          customSanitizer: {
            options: stringToArray,
          },
        },
      };
      expect(selectTestCentre.getSchemaValidation()).toStrictEqual(expectedValidationSchema);
    });

    test('POST request', () => {
      const expectedValidationSchema: ValidatorSchema = {
        centre: {
          in: ['body'],
          isEmpty: {
            errorMessage: 'Please choose a centre',
            negated: true,
          },
        },
      };
      expect(selectTestCentre.postSchemaValidation()).toStrictEqual(expectedValidationSchema);
    });
  });

  describe('Requests', () => {
    let req;
    let res;

    const mockCentreGateway = CentreGateway as jest.Mocked<typeof CentreGateway>;

    beforeEach(() => {
      req = {
        query: {
          searchQuery: '112 Upper Parliament Str, Nottingham',
          distanceUom: 'km',
        },
        body: {
          centre: JSON.stringify(mockCentres[0]),
        },
        hasErrors: false,
        errors: [],
        session: {
          journey: {},
        },
      };

      res = {
        res_params: {
          searchQuery: 'temp',
          distanceUom: 'temp',
          centres: [],
        },
        res_url: '',
        res_status: 200,
        res_template: '',
        status: (status: number): object => {
          res.res_status = status;
          return res;
        },
        redirect: (url: string): void => {
          res.res_url = url;
          res.res_status = 302;
        },
        render: (template: string, params: any): void => {
          res.res_template = template;
          res.res_params = params;
        },
      };
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    describe('GET', () => {
      describe('valid input', () => {
        beforeEach(() => {
          mockCentreGateway.fetchCentres.mockResolvedValue(['mockCentre1', 'mockCentre2'] as any);
        });

        test('without query params, with session params uses session values', async () => {
          req.query = {};
          req.session.testCentreSearch = { searchQuery: 'queryFromSession' };

          await selectTestCentre.get(req, res);

          expect(res.res_template).toBe('select-test-centre');
          expect(res.res_params.searchQuery).toBe('queryFromSession');
          expect(res.res_params.distanceUom).toBe('miles');
          expect(req.session.testCentreSearch.zeroCentreResults).toBe(false);
        });

        test('with query params uses param values', async () => {
          await selectTestCentre.get(req, res);

          expect(res.res_template).toBe('select-test-centre');
          expect(res.res_params.searchQuery).toBe('112 Upper Parliament Str, Nottingham');
          expect(res.res_params.distanceUom).toBe('km');
          expect(req.session.testCentreSearch.zeroCentreResults).toBe(false);
        });

        test('with session param target ni', async () => {
          req.session.target = TARGET.NI;

          await selectTestCentre.get(req, res);

          expect(CentreGateway.fetchCentres).toHaveBeenCalledWith(String(req.query.searchQuery), TARGET.NI, 5);
          expect(res.res_template).toBe('select-test-centre');
          expect(res.res_params.searchQuery).toBe('112 Upper Parliament Str, Nottingham');
          expect(res.res_params.distanceUom).toBe('km');
        });

        test('renders with centres', async () => {
          await selectTestCentre.get(req, res);

          expect(res.res_params.centres.length).toBeGreaterThan(0);
        });

        test('with unknown distanceUom defaults distanceUom to miles', async () => {
          req.query = {
            searchQuery: '112 Upper Parliament Str, Nottingham',
            distanceUom: 'unknown',
          };

          await selectTestCentre.get(req, res);

          expect(res.res_params.distanceUom).toBe('miles');
        });

        test('with numberOfResults query param for changing amount of results', async () => {
          const expectedCount = 15;
          req.query = {
            ...req.query,
            numberOfResults: expectedCount,
          };

          await selectTestCentre.get(req, res);

          expect(CentreGateway.fetchCentres).toBeCalledWith(String(req.query.searchQuery), TARGET.GB, expectedCount);
          expect(res.res_template).toStrictEqual('select-test-centre');
        });
      });

      describe('error with loc-api', () => {
        test('error retrieving centres renders the error page', async () => {
          mockCentreGateway.fetchCentres.mockRejectedValue(new Error());

          await selectTestCentre.get(req, res);

          expect(res.res_template).toStrictEqual('select-test-centre-error');
        });
      });

      describe('invalid requests', () => {
        test('without query redirects back to find-test-centre', async () => {
          req.query = {};

          await selectTestCentre.get(req, res);

          expect(res.res_url).toStrictEqual('/find-test-centre');
          expect(req.session.testCentreSearch.zeroCentreResults).toBe(true);
        });

        test('with no results redirects back to find-test-centre', async () => {
          const expectedCount = 5;
          mockCentreGateway.fetchCentres.mockResolvedValue([] as any);

          await selectTestCentre.get(req, res);

          expect(CentreGateway.fetchCentres).toBeCalledWith(String(req.query.searchQuery), TARGET.GB, expectedCount);
          expect(res.res_url).toStrictEqual('/find-test-centre');
        });
      });
    });

    describe('POST', () => {
      test('redirects to select date for successful request', () => {
        selectTestCentre.post(req, res);

        expect(res.res_status).toBe(302);
        expect(res.res_url).toBe('select-date');
      });

      test('when in manage booking mode, redirects to select date for successful request', () => {
        req.session.journey.inManagedBookingEditMode = true;
        req.session.currentBooking = mockCurrentBooking();

        selectTestCentre.post(req, res);

        expect(res.res_status).toBe(302);
        expect(res.res_url).toBe('/manage-booking/select-date');
      });
    });
  });
});
