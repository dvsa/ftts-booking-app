import MockDate from 'mockdate';
import selectDateController from '../../../../src/pages/select-date/select-date';

jest.mock('../../../../src/helpers/language', () => ({
  translate: () => 'translated',
}));

describe('Select Date controller', () => {
  beforeEach(() => {
    MockDate.set('2020-01-01'); // Set fixed date for 'today'
  });

  afterEach(() => {
    MockDate.reset();
  });

  let req;
  let res;

  beforeEach(() => {
    req = {
      query: {},
      body: {
        day: '01',
        month: '02',
        year: '2020',
      },
      hasErrors: false,
      errors: [],
      session: {
        currentBooking: {},
        journey: {
          inEditMode: false,
        },
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
    test('renders the view with correct data', () => {
      selectDateController.get(req, res);

      expect(res.res_template).toBe('select-date');
      expect(res.res_params).toStrictEqual({
        selectTestCentreLink: '/select-test-centre',
        minDate: 1577923200000,
        maxDate: expect.any(Number),
      });
    });

    test('populates the selected date if it exists in the session', () => {
      const sessionDateString = '2021-08-10';
      req.session.testCentreSearch = { selectedDate: sessionDateString };

      selectDateController.get(req, res);

      expect(res.res_template).toBe('select-date');
      expect(res.res_params).toStrictEqual({
        selectTestCentreLink: '/select-test-centre',
        minDate: 1577923200000,
        maxDate: expect.any(Number),
        day: '10',
        month: '08',
        year: '2021',
      });
    });

    test('does NOT populate the booking date fields when in edit mode', () => {
      req.session.journey.inEditMode = true;
      const oldSearchDateString = '2021-01-10';
      req.session.testCentreSearch = { selectedDate: oldSearchDateString };
      const bookingDateTime = '2021-08-16T09:00:00.000Z';
      req.session.currentBooking.dateTime = bookingDateTime;

      selectDateController.get(req, res);

      expect(res.res_template).toBe('select-date');
      expect(res.res_params).toStrictEqual({
        selectTestCentreLink: '/select-test-centre',
        minDate: 1577923200000,
        maxDate: expect.any(Number),
      });
    });

    test('does NOT populate the booking date fields when in managed booking mode', () => {
      req.session.journey.inManagedBookingEditMode = true;
      req.url = '/manage-booking/select-date';
      const oldSearchDateString = '2021-01-10';
      req.session.testCentreSearch = { selectedDate: oldSearchDateString };
      const bookingDateTime = '2021-08-16T09:00:00.000Z';
      req.session.currentBooking.dateTime = bookingDateTime;

      selectDateController.get(req, res);

      expect(res.res_template).toBe('select-date');
      expect(res.res_params).toStrictEqual({
        selectTestCentreLink: '/manage-booking/select-test-centre',
        minDate: 1577923200000,
        maxDate: expect.any(Number),
      });
    });
  });

  describe('POST', () => {
    test('redirects to the next page', () => {
      selectDateController.post(req, res);

      expect(res.res_url).toStrictEqual('/choose-appointment');
      expect(res.res_status).toBe(301);
    });

    test('sets the selected date in the session', () => {
      const expectedDateString = '2020-02-01';

      selectDateController.post(req, res);

      expect(req.session.testCentreSearch.selectedDate).toEqual(expectedDateString);
    });

    test('when in managed booking mode sets the selected date in the session', () => {
      req.session.journey.inManagedBookingEditMode = true;
      req.url = '/manage-booking/select-date';
      res.redirect = jest.fn();
      const expectedDateString = '2020-02-01';

      selectDateController.post(req, res);

      expect(req.session.manageBookingEdits.dateTime).toEqual(expectedDateString);
      expect(res.redirect).toHaveBeenCalledWith('/manage-booking/choose-appointment?selectedDate=2020-02-01T00:00:00.000Z');
    });

    test('re-renders the view with the first error if validation fails', () => {
      req.hasErrors = true;
      req.errors = [
        { param: 'day', msg: 'dayEmpty' },
        { param: 'month', msg: 'monthEmpty' },
      ];

      selectDateController.post(req, res);

      expect(res.res_template).toBe('select-date');
      expect(res.res_params).toStrictEqual({
        selectTestCentreLink: '/select-test-centre',
        errors: [{ param: 'day', msg: 'translated' }],
        maxDate: expect.any(Number),
        minDate: expect.any(Number),
        ...req.body,
      });
    });
  });
});
