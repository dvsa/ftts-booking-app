import { TestType } from '../../../../src/domain/enums';
import { TestTypeController } from '../../../../src/pages/common/test-type';
import { store } from '../../../../src/services/session';

jest.mock('../../../../src/helpers/language', () => ({
  translate: () => 'translated-label',
}));

describe('Test type controller', () => {
  let controller: TestTypeController;
  let req: any;
  let res: any;

  beforeEach(() => {
    controller = new TestTypeController();
    req = {
      body: {
        testType: TestType.Car,
      },
      session: {
        candidate: {
          firstnames: 'WENDY',
          surname: 'JONES',
          dateOfBirth: '2002-11-10',
          entitlements: 'AM,A1',
          licenceNumber: 'JONES061102W97YT',
        },
        currentBooking: {},
        journey: {},
      },
    };

    res = {
      res_params: {},
      res_redirect: '',
      res_status: 200,
      res_template: '',
      status: (status: number): object => {
        res.res_status = status;
        return res;
      },
      render: (template: string, params: any): void => {
        res.res_template = template;
        res.res_params = params;
      },
      redirect: (url: string): void => {
        res.res_redirect = url;
      },
      locals: {
        t: jest.fn().mockReturnValue('translated-label'),
      },
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET request', () => {
    describe('When the candidate has not requested support', () => {
      test('renders test-type view', async () => {
        await controller.get(req, res);

        expect(res.res_template).toBe('common/test-type');
        expect(res.res_params).toEqual({
          backLink: 'contact-details',
          errors: undefined,
          tests: [
            {
              hint: {
                text: '£23',
              },
              label: {
                classes: 'govuk-label--s',
              },
              text: 'translated-label',
              value: TestType.Car,
              checked: false,
            },
            {
              hint: {
                text: '£23',
              },
              label: {
                classes: 'govuk-label--s',
              },
              text: 'translated-label',
              value: TestType.Motorcycle,
              checked: false,
            },
          ],
        });
      });
    });

    describe('When the candidate has requested support', () => {
      test('renders test-type view', async () => {
        store.journey.update(req, {
          support: true,
        });
        await controller.get(req, res);

        expect(res.res_template).toBe('common/test-type');
        expect(res.res_params).toEqual({
          backLink: undefined,
          errors: undefined,
          tests: [
            {
              hint: {
                text: '£23',
              },
              label: {
                classes: 'govuk-label--s',
              },
              text: 'translated-label',
              value: TestType.Car,
              checked: false,
            },
            {
              hint: {
                text: '£23',
              },
              label: {
                classes: 'govuk-label--s',
              },
              text: 'translated-label',
              value: TestType.Motorcycle,
              checked: false,
            },
          ],
        });
      });
    });
  });

  describe('POST request', () => {
    test('renders test-type view when bad request', async () => {
      req.session.currentBooking = {
        testType: TestType.Car,
      };

      req.hasErrors = true;
      req.errors = [{ msg: 'Test error', location: {}, param: '' }];

      await controller.post(req, res);

      expect(res.res_template).toBe('common/test-type');
      expect(res.res_params).toEqual({
        backLink: 'contact-details',
        errors: [{
          msg: 'Test error',
          location: {},
          param: '',
        }],
        tests: [
          {
            hint: {
              text: '£23',
            },
            label: {
              classes: 'govuk-label--s',
            },
            text: 'translated-label',
            value: TestType.Car,
            checked: true,
          },
          {
            hint: {
              text: '£23',
            },
            label: {
              classes: 'govuk-label--s',
            },
            text: 'translated-label',
            value: TestType.Motorcycle,
            checked: false,
          },
        ],
      });
    });

    test('redirects to test-language', async () => {
      await controller.post(req, res);

      expect(res.res_redirect).toBe('test-language');
    });

    describe('if journey edit mode is set', () => {
      test('clears the existing booking session data and switches off edit mode', async () => {
        req.session.journey.inEditMode = true;

        await controller.post(req, res);

        expect(req.session.journey.inEditMode).toBe(false);
        expect(req.session.currentBooking.booking).toMatchObject({});
        expect(req.session.currentBooking.test).toMatchObject({});
        expect(req.session.testCentreSearch).toMatchObject({});
      });
    });
  });
});
