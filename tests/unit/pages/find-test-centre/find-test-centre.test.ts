import { RequestValidationError } from '../../../../src/middleware/request-validator';
import findTestCentreController from '../../../../src/pages/find-test-centre/find-test-centre';
import { mockCurrentBooking } from '../../../mocks/data/manage-bookings';

jest.mock('../../../../src/helpers/language', () => ({
  translate: () => 'internationalised',
}));

describe('Find Test Centre controller', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      query: {},
      body: {},
      errors: [],
      session: {
        testCentreSearch: {},
        journey: {},
      },
    };

    res = {
      redirect: (url: string): void => {
        res.res_url = url;
        res.res_status = 301;
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
    test('should render find-test-centre, first time', () => {
      findTestCentreController.get(req, res);

      expect(res.res_template).toBe('find-test-centre');
      expect(res.res_params).toStrictEqual({
        backLink: '/test-language',
        searchQuery: undefined,
        errors: undefined,
      });
    });

    test('should render find-test-centre, when revisted', () => {
      req.session.testCentreSearch.searchQuery = 'searchQuery';

      findTestCentreController.get(req, res);

      expect(res.res_template).toBe('find-test-centre');
      expect(res.res_params).toStrictEqual({
        backLink: '/test-language',
        searchQuery: 'searchQuery',
        errors: undefined,
      });
    });

    test('should render error if no results flag is set to true', () => {
      req.session.testCentreSearch.zeroCentreResults = true;
      req.hasErrors = true;

      findTestCentreController.get(req, res);

      expect(res.res_template).toBe('find-test-centre');
      expect(req.errors).toContainEqual({
        msg: 'internationalised',
        param: 'searchQuery',
      } as RequestValidationError);
      expect(res.res_params).toEqual({
        backLink: '/test-language',
        errors: [{ msg: 'internationalised', param: 'searchQuery' }],
      });
    });

    describe('Back button link is generated', () => {
      test('back button takes user to additional test-language', () => {
        findTestCentreController.get(req, res);

        expect(res.res_template).toBe('find-test-centre');
        expect(res.res_params).toStrictEqual({
          backLink: '/test-language',
          searchQuery: undefined,
          errors: undefined,
        });
      });

      test('when in manage booking mode, back button takes user to manage options', () => {
        req.session.journey.inManagedBookingEditMode = true;
        req.session.currentBooking = mockCurrentBooking();

        findTestCentreController.get(req, res);

        expect(res.res_template).toBe('find-test-centre');
        expect(res.res_params).toStrictEqual({
          backLink: '/manage-change-location-time/mockRef',
          searchQuery: undefined,
          errors: undefined,
        });
      });
    });
  });

  describe('POST', () => {
    beforeEach(() => {
      req.hasErrors = false;
    });

    test('should redirect you to select-test-centre if POST is successful', () => {
      findTestCentreController.post(req, res);

      expect(res.res_url).toBe('/select-test-centre');
      expect(res.res_status).toBe(301);
    });

    test('when in manage booking mode, should redirect you to manage/select-test-centre if POST is successful', () => {
      req.session.journey.inManagedBookingEditMode = true;
      req.session.currentBooking = mockCurrentBooking();

      findTestCentreController.post(req, res);

      expect(res.res_url).toBe('/manage-booking/select-test-centre');
      expect(res.res_status).toBe(301);
    });

    test('should set the search query on the candidate session if POST is successful', () => {
      const searchQuery = 'test search query';
      req.body = { searchQuery };

      findTestCentreController.post(req, res);

      expect(req.session.testCentreSearch.searchQuery).toBe(searchQuery);
    });

    test('should return to find-test-centre passing through the errors if request validation fails', () => {
      const errorsMock = [{ searchQuery: 'Search Term is invalid' }];
      req.hasErrors = true;
      req.errors = errorsMock;

      findTestCentreController.post(req, res);

      expect(res.res_template).toBe('find-test-centre');
      expect(res.res_params).toStrictEqual({
        backLink: '/test-language',
        errors: errorsMock,
      });
    });

    describe('Back button link is generated', () => {
      test('back button takes user to additional test language page', () => {
        const errorsMock = [{ searchQuery: 'Search Term is invalid' }];
        req.hasErrors = true;
        req.errors = errorsMock;

        findTestCentreController.post(req, res);

        expect(res.res_template).toBe('find-test-centre');
        expect(res.res_params).toStrictEqual({
          backLink: '/test-language',
          errors: errorsMock,
        });
      });

      test('when in manage booking mode, back button takes user to manage options', () => {
        req.session.journey.inManagedBookingEditMode = true;
        req.session.currentBooking = mockCurrentBooking();
        const errorsMock = [{ searchQuery: 'Search Term is invalid' }];
        req.hasErrors = true;
        req.errors = errorsMock;

        findTestCentreController.post(req, res);

        expect(res.res_template).toBe('find-test-centre');
        expect(res.res_params).toStrictEqual({
          backLink: '/manage-change-location-time/mockRef',
          errors: errorsMock,
        });
      });
    });
  });
});
