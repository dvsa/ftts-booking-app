import MockDate from 'mockdate';
import selectDateController from '@pages/select-date/select-date';
import { PageNames } from '@constants';
import { Target, TestType } from '../../../../src/domain/enums';

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
        candidate: {
          eligibilities: [{
            testType: TestType.CAR,
            eligible: true,
            eligibleFrom: '2020-01-01',
            eligibleTo: '2040-01-01',
          }],
        },
        currentBooking: {
          testType: TestType.CAR,
        },
        journey: {
          inEditMode: false,
        },
      },
    };

    res = {
      redirect: jest.fn(),
      render: jest.fn(),
      locals: {
        target: Target.GB,
      },
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET', () => {
    test('renders the view with correct data', () => {
      selectDateController.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.SELECT_DATE, {
        selectTestCentreLink: '/select-test-centre',
        minDate: 1577923200000,
        maxDate: 1593471600000,
        isManagedBookingSession: false,
      });
    });

    test('populates the selected date if it exists in the session', () => {
      const sessionDateString = '2021-08-10';
      req.session.testCentreSearch = {
        selectedDate: sessionDateString,
      };

      selectDateController.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.SELECT_DATE, {
        selectTestCentreLink: '/select-test-centre',
        minDate: 1577923200000,
        maxDate: 1593471600000,
        day: '10',
        month: '08',
        year: '2021',
        isManagedBookingSession: false,
      });
    });

    test('does NOT populate the booking date fields when in edit mode', () => {
      req.session.journey.inEditMode = true;
      const oldSearchDateString = '2021-01-10';
      req.session.testCentreSearch = {
        selectedDate: oldSearchDateString,
      };
      const bookingDateTime = '2021-08-16T09:00:00.000Z';
      req.session.currentBooking.dateTime = bookingDateTime;

      selectDateController.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.SELECT_DATE, {
        selectTestCentreLink: '/select-test-centre',
        minDate: 1577923200000,
        maxDate: 1593471600000,
        isManagedBookingSession: false,
      });
    });

    test('does NOT populate the booking date fields when in managed booking mode', () => {
      req.session.journey.inManagedBookingEditMode = true;
      req.url = '/manage-booking/select-date';
      const oldSearchDateString = '2021-01-10';
      req.session.testCentreSearch = {
        selectedDate: oldSearchDateString,
      };
      const bookingDateTime = '2021-08-16T09:00:00.000Z';
      req.session.currentBooking = {
        ...req.session.currentBooking,
        dateTime: bookingDateTime,
        bookingRef: '123456789',
      };

      selectDateController.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.SELECT_DATE, {
        selectTestCentreLink: 'manage-change-location-time/123456789',
        minDate: 1577923200000,
        maxDate: 1593471600000,
        isManagedBookingSession: true,
      });
    });

    test('does NOT populate the booking date fields when in managed booking mode for an instructor booking', () => {
      req.session.journey.inManagedBookingEditMode = true;
      req.url = '/manage-booking/select-date';
      const oldSearchDateString = '2021-01-10';
      req.session.candidate.eligibilities[0].testType = TestType.ADIP1;
      req.session.testCentreSearch = {
        selectedDate: oldSearchDateString,
      };
      const bookingDateTime = '2021-08-16T09:00:00.000Z';
      req.session.currentBooking = {
        ...req.session.currentBooking,
        dateTime: bookingDateTime,
        bookingRef: '123456789',
        testType: TestType.ADIP1,
      };

      selectDateController.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.SELECT_DATE, {
        selectTestCentreLink: 'manage-change-location-time/123456789',
        minDate: 1577923200000,
        maxDate: 1593471600000,
        isManagedBookingSession: true,
      });
    });

    test('throws error if journey is not set', () => {
      delete req.session.journey;

      expect(() => selectDateController.get(req, res)).toThrow(new Error('SelectDateController::get: No journey set'));
    });
  });

  describe('POST', () => {
    test('redirects to the next page', () => {
      selectDateController.post(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/choose-appointment');
    });

    test('sets the selected date in the session', () => {
      const expectedDateString = '2020-02-01';

      selectDateController.post(req, res);

      expect(req.session.testCentreSearch.selectedDate).toEqual(expectedDateString);
    });

    test('sets the first selected test date in session if not already set', () => {
      const expectedDateString = '2020-02-01';

      selectDateController.post(req, res);

      expect(req.session.currentBooking.firstSelectedDate).toEqual(expectedDateString);
    });

    test('does not override the first selected test date if it is already set', () => {
      req.session.currentBooking.firstSelectedDate = '2020-02-02';

      selectDateController.post(req, res);

      expect(req.session.currentBooking.firstSelectedDate).toEqual('2020-02-02');
    });

    test('when in managed booking mode sets the selected date in the session', () => {
      req.session.journey.inManagedBookingEditMode = true;
      req.url = '/manage-booking/select-date';
      res.redirect = jest.fn();
      const expectedDateString = '2020-02-01';

      selectDateController.post(req, res);

      expect(req.session.manageBookingEdits.dateTime).toEqual(expectedDateString);
      expect(res.redirect).toHaveBeenCalledWith('/manage-booking/choose-appointment?selectedDate=2020-02-01');
    });

    test('selecting todays date throws error', () => {
      req.body.day = '01';
      req.body.month = '01';
      req.body.year = '2020';

      expect(() => selectDateController.post(req, res))
        .toThrow(new Error('dateIsTodayOrTomorrow'));
    });

    test('selecting tomorrows date throws error', () => {
      req.body.day = '02';
      req.body.month = '01';
      req.body.year = '2020';

      expect(() => selectDateController.post(req, res))
        .toThrow(new Error('dateIsTodayOrTomorrow'));
    });

    test('re-renders the view with the first error if validation fails', () => {
      req.hasErrors = true;
      req.errors = [
        { param: 'day', msg: 'dayEmpty' },
        { param: 'month', msg: 'monthEmpty' },
      ];

      selectDateController.post(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.SELECT_DATE, {
        selectTestCentreLink: '/select-test-centre',
        errors: [{ param: 'day', msg: 'translated' }],
        minDate: 1577923200000,
        maxDate: 1593471600000,
        isManagedBookingSession: false,
        ...req.body,
      });
    });

    test('sets the error to dateNotValid if there are more than 2 errors present', () => {
      req.body = {
        year: '1999',
        month: '06',
        day: '19',
      };
      req.hasErrors = true;

      req.errors = [{}, {}, {}];

      selectDateController.post(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.SELECT_DATE, {
        selectTestCentreLink: '/select-test-centre',
        errors: [{ param: 'date', msg: 'translated' }],
        maxDate: expect.any(Number),
        minDate: expect.any(Number),
        isManagedBookingSession: false,
        ...req.body,
      });
    });

    test('throws error if no current booking is set', () => {
      delete req.session.currentBooking;

      expect(() => selectDateController.post(req, res)).toThrow(new Error('SelectDateController::post: No currentBooking set'));
    });
  });
});
