import RadioButtonItem from '../../../../src/interfaces/radio-button-item';
import changeLocationTime from '../../../../src/pages/check-your-answers/change-location-time';
import { mockCurrentBooking, mockManageBooking } from '../../../mocks/data/manage-bookings';

jest.mock('../../../../src/helpers/language', () => ({
  translate: () => 'translated-label',
}));

describe('ChangeLocationTime', () => {
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
      res_redirect: '',
      res_template: '',
      options: {},
      render: (template: string, options: object): void => {
        res.res_template = template;
        res.options = options;
      },
      redirect: (url: string): void => {
        res.res_redirect = url;
      },
    };
  });

  describe('get', () => {
    test('renders the change location time template', () => {
      changeLocationTime.get(req, res);

      expect(res.res_template).toBe('change-location-time');
      expect(res.options).toStrictEqual({
        options: radioItems,
        checkAnswersLink: '/check-your-answers',
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

      expect(req.session.manageBookingEdits).toStrictEqual({});
      expect(res.res_template).toBe('change-location-time');
      expect(res.options).toStrictEqual({
        options: radioItems,
        checkAnswersLink: '/manage-booking/mock-booking-ref',
        errors: [],
      });
    });
  });

  describe('POST', () => {
    test('renders the check your answers template when successful', () => {
      changeLocationTime.post(req, res);

      expect(res.res_redirect).toBe('/check-your-answers');
    });

    test('renders an error on the same template when validation fails', () => {
      req.body = { changeLocationOrTime: '' };
      req.hasErrors = true;
      req.errors = [
        { param: 'changeLocationOrTime', msg: 'Please select an opption' },
      ];

      changeLocationTime.post(req, res);

      expect(res.res_template).toBe('change-location-time');
      expect(res.options).toEqual(expect.objectContaining(
        { errors: req.errors },
      ));
    });

    test.each([
      ['changeTimeOnlyOption', '/choose-appointment'],
      ['changeTimeAndDateOption', '/select-date'],
      ['changeLocationOption', '/find-test-centre'],
    ])('when the %s options is selected - redirects to the %s template', (optionSelected: string, template: string) => {
      req.body = { changeLocationOrTime: optionSelected };

      changeLocationTime.post(req, res);

      expect(res.res_redirect).toBe(template);
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
  });
});
