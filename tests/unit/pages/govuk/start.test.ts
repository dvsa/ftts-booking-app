import { StartController } from '../../../../src/pages/govuk/start';

describe('StartController', () => {
  let startController: StartController;

  let req = {};
  let res = {};

  beforeEach(() => {
    startController = new StartController();
    req = {
      errors: [],
      hasErrors: false,
    };
    res = {
      render: jest.fn(),
    };
  });

  describe('get', () => {
    test('should render page correctly', () => {
      startController.get(req, res);

      expect(res.render).toHaveBeenCalledWith(
        'govuk/start',
        {
          shouldShowCookieMessage: true,
        },
      );
    });
  });
});
