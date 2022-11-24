import { PageNames } from '@constants';
import { InstructorPreferredLocationController } from '@pages/instructor-preferred-location/instructor-preferred-location';
import { PreferredLocation } from '../../../../src/domain/enums';

describe('Preferred Location controller', () => {
  let preferredLocationController: InstructorPreferredLocationController;
  let res;
  let req;

  beforeEach(() => {
    preferredLocationController = new InstructorPreferredLocationController();

    req = {
      session: {
        currentBooking: {
          preferredLocation: 'mockSavedPreferredLocation',
          preferredLocationOption: PreferredLocation.ParticularLocation,
        },
        journey: {
          inEditMode: false,
        },
      },
      hasErrors: false,
      errors: [],
      body: {
        locationInput: 'mockPreferredLocation',
        preferredLocationOption: PreferredLocation.ParticularLocation,
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
    test('renders the preferred location page with saved text & options', () => {
      req.body.locationInput = undefined;
      req.body.preferredLocationOption = undefined;

      preferredLocationController.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_PREFERRED_LOCATION, {
        errors: [],
        savedPreferredLocation: 'mockSavedPreferredLocation',
        preferredLocationOption: PreferredLocation.ParticularLocation,
        backLink: 'preferred-day',
      });
    });

    test('edit mode - renders the preferred location page with saved text & options', () => {
      req.body.locationInput = undefined;
      req.body.preferredLocationOption = undefined;
      req.session.journey.inEditMode = true;

      preferredLocationController.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_PREFERRED_LOCATION, {
        errors: [],
        savedPreferredLocation: 'mockSavedPreferredLocation',
        preferredLocationOption: PreferredLocation.ParticularLocation,
        backLink: 'check-your-details',
      });
    });
  });

  describe('POST request', () => {
    test('post validation schema - setting particular location', () => {
      req.body.preferredLocationOption = PreferredLocation.ParticularLocation;

      const schema = preferredLocationController.postSchemaValidation(req);

      expect(schema).toStrictEqual(expect.objectContaining({
        locationInput: {
          in: ['body'],
          isLength: {
            options: { max: 4000 },
            errorMessage: expect.anything(),
          },
        },
      }));
    });

    test('post validation schema - particular location not set', () => {
      req.body.preferredLocationOption = PreferredLocation.DecideLater;

      const schema = preferredLocationController.postSchemaValidation(req);

      expect(schema).toStrictEqual(expect.objectContaining({
        preferredLocationOption: {
          in: ['body'],
          errorMessage: expect.anything(),
          custom: {
            options: expect.anything(),
          },
        },
      }));
    });

    test('renders the preferred location page if there are errors - but still prepopulates text field', () => {
      const longString = new Array(4001 + 1).join('a');
      req.body.locationInput = longString;
      req.hasErrors = true;

      preferredLocationController.post(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_PREFERRED_LOCATION, {
        errors: [],
        savedPreferredLocation: longString,
        preferredLocationOption: PreferredLocation.ParticularLocation,
        backLink: 'preferred-day',
      });
    });

    test('selecting decide later will still save the users text', () => {
      req.body.locationInput = 'new text';
      req.body.preferredLocationOption = PreferredLocation.DecideLater;

      preferredLocationController.post(req, res);

      expect(req.session.currentBooking.preferredLocation).toStrictEqual('new text');
      expect(res.redirect).toHaveBeenCalledWith('email-contact');
    });

    test('navigate to next page', () => {
      req.body.locationInput = 'changed location preference';

      preferredLocationController.post(req, res);

      expect(req.session.currentBooking.preferredLocation).toStrictEqual('changed location preference');
      expect(res.redirect).toHaveBeenCalledWith('email-contact');
    });

    test('edit mode - navigate to check your details page', () => {
      req.body.locationInput = 'changed location preference';
      req.session.journey.inEditMode = true;

      preferredLocationController.post(req, res);

      expect(res.redirect).toHaveBeenCalledWith('check-your-details');
    });
  });
});
