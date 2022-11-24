import { mocked } from 'ts-jest/utils';
import { InstructorCustomSupportController } from '@pages/instructor-custom-support/instructor-custom-support';
import { PageNames } from '@constants';
import { SupportType } from '../../../../src/domain/enums';
import * as customSupportHelper from '../../../../src/helpers/custom-support-helper';
import config from '../../../../src/config';

jest.mock('../../../../src/helpers/custom-support-helper');
const mockedCustomSupportHelper = customSupportHelper as jest.Mocked<typeof customSupportHelper>;

jest.mock('../../../../src/config');
const mockedConfig = mocked(config, true);
mockedConfig.featureToggles.enableCustomSupportInputValidation = true;

describe('Instructor Custom support controller', () => {
  let customSupportController: InstructorCustomSupportController;
  let res;
  let req;

  beforeEach(() => {
    customSupportController = new InstructorCustomSupportController();

    req = {
      session: {
        currentBooking: {
          customSupport: 'mockSavedSupport',
          selectSupportType: [SupportType.OTHER],
        },
        journey: {
          inEditMode: false,
        },
      },
      hasErrors: false,
      errors: [],
      body: {
        support: 'mockSupportData',
      },
      path: '/nsa/custom-support',
    };

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
    };

    mockedCustomSupportHelper.isCustomSupportInputEmptyOrUnmeaningful.mockReturnValue(false);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET request', () => {
    test('renders the custom support page with saved text', () => {
      customSupportController.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_CUSTOM_SUPPORT, {
        errors: [],
        savedCustomSupport: 'mockSavedSupport',
        backLink: 'select-support-type',
        skipLink: 'confirm-support',
      });
    });

    test('edit mode - renders the custom support page with saved text', () => {
      req.session.journey.inEditMode = true;

      customSupportController.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_CUSTOM_SUPPORT, {
        errors: [],
        savedCustomSupport: 'mockSavedSupport',
        backLink: 'check-your-details',
        skipLink: 'confirm-support',
      });
    });

    describe('skip link', () => {
      test('is set to confirm support if the user has selected other support only', () => {
        req.session.currentBooking.selectSupportType = [SupportType.OTHER];

        customSupportController.get(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_CUSTOM_SUPPORT, expect.objectContaining({
          skipLink: 'confirm-support',
        }));
      });

      test('is set to leaving NSA if the user has selected other support + standard support only', () => {
        req.session.currentBooking.selectSupportType = [SupportType.OTHER, SupportType.ON_SCREEN_BSL];

        customSupportController.get(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_CUSTOM_SUPPORT, expect.objectContaining({
          skipLink: 'leaving-nsa',
        }));
      });

      test('is set to staying NSA if the user has selected other support + non-standard support', () => {
        req.session.currentBooking.selectSupportType = [SupportType.OTHER, SupportType.EXTRA_TIME];

        customSupportController.get(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_CUSTOM_SUPPORT, expect.objectContaining({
          skipLink: 'staying-nsa',
        }));
      });
    });
  });

  describe('POST request', () => {
    test('post validation schema', () => {
      expect(customSupportController.postSchemaValidation()).toStrictEqual(expect.objectContaining({
        support: {
          in: ['body'],
          isLength: {
            options: { max: 4000 },
            errorMessage: expect.anything(),
          },
        },
      }));
    });

    test('renders the custom support page if there are errors - but still saves the data', () => {
      const longString = new Array(4001 + 1).join('a');
      req.body.support = longString;
      req.hasErrors = true;

      customSupportController.post(req, res);

      expect(req.session.currentBooking.customSupport).toStrictEqual(longString);
      expect(res.render).toHaveBeenCalledWith(PageNames.INSTRUCTOR_CUSTOM_SUPPORT, {
        errors: [],
        savedCustomSupport: longString,
        backLink: 'select-support-type',
        skipLink: 'confirm-support',
      });
    });

    test('navigate to we will contact you page', () => {
      req.body.support = 'changed support';

      customSupportController.post(req, res);

      expect(req.session.currentBooking.customSupport).toStrictEqual('changed support');
      expect(res.redirect).toHaveBeenCalledWith('staying-nsa');
    });

    test('edit mode - navigate to check your details page', () => {
      req.body.support = 'changed support';
      req.session.journey.inEditMode = true;

      customSupportController.post(req, res);

      expect(req.session.currentBooking.customSupport).toStrictEqual('changed support');
      expect(res.redirect).toHaveBeenCalledWith('check-your-details');
    });
  });

  describe('unmeaningful input detection', () => {
    test('redirects to the confirm support page if the user has selected other support only and enters empty/unmeaningful input', () => {
      req.session.currentBooking.selectSupportType = [SupportType.OTHER];
      mockedCustomSupportHelper.isCustomSupportInputEmptyOrUnmeaningful.mockReturnValue(true);

      customSupportController.post(req, res);

      expect(res.redirect).toHaveBeenCalledWith('confirm-support');
    });

    test('redirects to the leaving NSA page if the user has selected other support + standard support only, and enters empty/unmeaningful input', () => {
      req.session.currentBooking.selectSupportType = [SupportType.OTHER, SupportType.VOICEOVER];
      mockedCustomSupportHelper.isCustomSupportInputEmptyOrUnmeaningful.mockReturnValue(true);

      customSupportController.post(req, res);

      expect(res.redirect).toHaveBeenCalledWith('leaving-nsa');
    });

    test('redirects to the staying NSA page as normal if the user has selected other support + non-standard support, and enters empty/unmeaningful input', () => {
      req.session.currentBooking.selectSupportType = [SupportType.OTHER, SupportType.READING_SUPPORT];
      mockedCustomSupportHelper.isCustomSupportInputEmptyOrUnmeaningful.mockReturnValue(true);

      customSupportController.post(req, res);

      expect(res.redirect).toHaveBeenCalledWith('staying-nsa');
    });
  });
});
