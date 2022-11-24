import { PageNames } from '@constants';
import changeLocationTime from '@pages/instructor-change-location-time/instructor-change-location-time';
import RadioButtonItem from '../../../../src/interfaces/radio-button-item';
import { mockCurrentBooking, mockManageBooking } from '../../../mocks/data/manage-bookings';

jest.mock('../../../../src/helpers/language', () => ({
  translate: () => 'translated-label',
}));

describe('InstructorChangeLocationTime', () => {
  const radioOptionValues = ['changeTimeOnlyOption', 'changeTimeAndDateOption', 'changeLocationOption'];

  const commonRadioAttributes: Partial<RadioButtonItem> = {
    text: 'translated-label',
    label: {
      classes: 'govuk-label--s',
    },
    hint: {
      text: 'translated-label',
    },
    checked: false,
  };

  const radioItems = radioOptionValues.map((val) => ({
    ...commonRadioAttributes,
    value: val,
  }));

  let res: any;
  let req: any;

  beforeEach(() => {
    req = {
      hasErrors: false,
      body: {},
      errors: [],
      params: {},
      url: '',
      session: {
        journey: {},
        manageBookingEdits: {},
      },
    };

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
    };
  });

  describe('get', () => {
    test('renders the change location time template', () => {
      changeLocationTime.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_CHANGE_LOCATION_TIME, {
        options: radioItems,
        checkAnswersLink: 'check-your-answers',
        errors: [],
      });
    });
    test('resets the manage bookings edit session and renders the correct template when in managed edit mode', () => {
      req.session.journey.inManagedBookingEditMode = true;
      req.session.manageBookingEdits = {
        bsl: true,
      };
      req.url = '/manage-change-location-time';
      req.params.ref = 'mock-booking-ref';

      changeLocationTime.get(req, res);

      expect(req.session.manageBookingEdits).toBeUndefined();
      expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_CHANGE_LOCATION_TIME, {
        options: radioItems,
        checkAnswersLink: '/manage-booking/mock-booking-ref',
        errors: [],
      });
    });
  });

  describe('POST', () => {
    test('renders the check your answers template when successful', () => {
      changeLocationTime.post(req, res);

      expect(res.redirect).toHaveBeenCalledWith('check-your-answers');
    });

    test('renders an error on the same template when validation fails', () => {
      req.body = { changeLocationOrTime: '' };
      req.hasErrors = true;
      req.errors = [
        { param: 'changeLocationOrTime', msg: 'Please select an opption' },
      ];

      changeLocationTime.post(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_CHANGE_LOCATION_TIME, expect.objectContaining({
        errors: req.errors,
      }));
    });

    test.each([
      ['changeTimeOnlyOption', 'choose-appointment'],
      ['changeTimeAndDateOption', 'select-date'],
      ['changeLocationOption', 'find-test-centre'],
    ])('when the %s options is selected - redirects to the %s template', (optionSelected: string, template: string) => {
      req.body = { changeLocationOrTime: optionSelected };

      changeLocationTime.post(req, res);

      expect(res.redirect).toHaveBeenCalledWith(template);
    });

    test.each([
      ['changeTimeAndDateOption', '/manage-booking/select-date'],
      ['changeLocationOption', '/manage-booking/find-test-centre'],
    ])('when the %s options is selected - redirects to the %s template when managing a booking', (optionSelected: string, template: string) => {
      req.url = '/manage-change-location-time';
      req.body = {
        changeLocationOrTime: optionSelected,
      };
      req.session.manageBookings = {
        bookings: [
          mockManageBooking(),
        ],
      };
      req.session.currentBooking = mockCurrentBooking();

      changeLocationTime.post(req, res);

      expect(res.redirect).toHaveBeenCalledWith(template);
    });

    describe('manage booking', () => {
      let booking;
      let currentBooking;
      beforeEach(() => {
        booking = mockManageBooking();
        currentBooking = mockCurrentBooking();
        req.session.manageBookings = {
          bookings: [
            booking,
          ],
        };
        req.session.currentBooking = currentBooking;
      });

      test('set manage booking mode on', () => {
        req.session.journey.inManagedBookingEditMode = true;
        req.url = '/manage-change-location-time';
        req.params.ref = booking.reference;

        changeLocationTime.post(req, res);

        expect(req.session.journey.inManagedBookingEditMode).toStrictEqual(true);
        expect(req.session.currentBooking).toStrictEqual(currentBooking);
      });
    });

    test('handles missing journey', () => {
      delete req.session.journey;
      req.url = '/manage-change-location-time';

      expect(() => changeLocationTime.post(req, res)).toThrow(Error('setManageBookingEditMode:: No journey set'));
    });
  });
});
