import { mocked } from 'ts-jest/utils';
import { TechnicalErrorController } from '@pages/error-technical/error-technical';
import { PageNames } from '@constants';
import { Locale, Target } from '../../../../src/domain/enums';
import { setCorrectLanguage } from '../../../../src/helpers/language';
import { getStartAgainLink } from '../../../../src/helpers/links';

jest.mock('../../../../src/helpers/language', () => ({
  setCorrectLanguage: jest.fn(),
}));

jest.mock('../../../../src/helpers/links');
const getStartAgainLinkMock = mocked(getStartAgainLink, true);

const START_AGAIN_LINK = 'some/link';

describe('Error technical controller', () => {
  let req;
  let res;
  let technicalErrorController: TechnicalErrorController;

  beforeEach(() => {
    req = {
      hasErrors: false,
      query: {
        source: '/choose-support',
      },
      body: {},
      errors: [],
      session: {
        testCentreSearch: {},
        target: Target.GB,
        journey: {
          support: false,
          standardAccommodation: true,
        },
        currentBooking: {},
      },
    };

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      locals: {
        target: undefined,
      },
    };
    technicalErrorController = new TechnicalErrorController();

    setCorrectLanguage.mockImplementation(async () => Promise.resolve(Locale.GB));
    getStartAgainLinkMock.mockReturnValue(START_AGAIN_LINK);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET', () => {
    test.each([
      [Target.GB, Target.GB],
      [Target.NI, Target.NI],
      [undefined, Target.GB],
    ])('should render technical error page', async (givenTarget: Target | undefined, expectedTarget: Target) => {
      req.query.target = givenTarget;
      await technicalErrorController.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.ERROR_TECHNICAL, {
        startAgainLink: START_AGAIN_LINK,
      });
      expect(setCorrectLanguage).toHaveBeenCalledWith(req, res, expectedTarget);
    });
  });
});
