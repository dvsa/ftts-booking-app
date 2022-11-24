import { PageNames } from '@constants';
import { StartController } from '@pages/start/start';

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

      expect(res.render).toHaveBeenCalledWith(PageNames.START);
    });
  });
});
