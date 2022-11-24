import { PageNames } from '@constants';
import { InstructorPreferredDayController } from '@pages/instructor-preferred-day/instructor-preferred-day';
import { PreferredDay } from '../../../../src/domain/enums';

describe('Instructor Preferred Day controller', () => {
  let preferredDayController: InstructorPreferredDayController;
  let res;
  let req;

  beforeEach(() => {
    preferredDayController = new InstructorPreferredDayController();

    req = {
      session: {
        currentBooking: {
          preferredDay: 'mockSavedPreferredDay',
          preferredDayOption: PreferredDay.ParticularDay,
        },
        journey: {
          inEditMode: false,
        },
      },
      hasErrors: false,
      errors: [],
      body: {
        dayInput: 'mockPreferredDay',
        preferredDayOption: PreferredDay.ParticularDay,
      },
    };

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET request', () => {
    test('renders the preferred day page with saved text & options', () => {
      req.body.dayInput = undefined;
      req.body.preferredDayOption = undefined;

      preferredDayController.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_PREFERRED_DAY, {
        errors: [],
        savedPreferredDay: 'mockSavedPreferredDay',
        preferredDayOption: PreferredDay.ParticularDay,
        backLink: 'staying-nsa',
      });
    });

    test('edit mode - renders the preferred day page with saved text & options', () => {
      req.body.dayInput = undefined;
      req.body.preferredDayOption = undefined;
      req.session.journey.inEditMode = true;

      preferredDayController.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_PREFERRED_DAY, {
        errors: [],
        savedPreferredDay: 'mockSavedPreferredDay',
        preferredDayOption: PreferredDay.ParticularDay,
        backLink: 'check-your-details',
      });
    });
  });

  describe('POST request', () => {
    test('post validation schema - setting particular day', () => {
      req.body.preferredDayOption = PreferredDay.ParticularDay;

      const schema = preferredDayController.postSchemaValidation(req);

      expect(schema).toStrictEqual({
        dayInput: {
          in: ['body'],
          isLength: {
            options: { max: 4000 },
            errorMessage: expect.anything(),
          },
        },
      });
    });

    test('post validation schema - particular option not set', () => {
      req.body.preferredDayOption = PreferredDay.DecideLater;

      const schema = preferredDayController.postSchemaValidation(req);

      expect(schema).toStrictEqual({
        preferredDayOption: {
          in: ['body'],
          errorMessage: expect.anything(),
          custom: {
            options: expect.anything(),
          },
        },
      });
    });

    test('renders the preferred day page if there are errors', () => {
      const longString = new Array(4001 + 1).join('a');
      req.body.dayInput = longString;
      req.hasErrors = true;

      preferredDayController.post(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_PREFERRED_DAY, {
        errors: [],
        savedPreferredDay: longString,
        preferredDayOption: PreferredDay.ParticularDay,
        backLink: 'staying-nsa',
      });
    });

    test('selecting decide later will still save the users text', () => {
      req.body.dayInput = 'new text';
      req.body.preferredDayOption = PreferredDay.DecideLater;

      preferredDayController.post(req, res);

      expect(req.session.currentBooking.preferredDay).toStrictEqual('new text');
      expect(res.redirect).toHaveBeenCalledWith('preferred-location');
    });

    test('navigate to next page', () => {
      req.body.dayInput = 'changed day preference';

      preferredDayController.post(req, res);

      expect(req.session.currentBooking.preferredDay).toStrictEqual('changed day preference');
      expect(res.redirect).toHaveBeenCalledWith('preferred-location');
    });

    test('edit mode - navigate to check your details page', () => {
      req.body.dayInput = 'changed day preference';
      req.session.journey.inEditMode = true;

      preferredDayController.post(req, res);

      expect(req.session.currentBooking.preferredDay).toStrictEqual('changed day preference');
      expect(res.redirect).toHaveBeenCalledWith('check-your-details');
    });
  });
});
