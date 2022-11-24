import { PageNames } from '@constants';
import { AccessibilityStatementController } from '@pages/accessibility-statement/accessibility-statement';

describe('AccessibilityStatementController', () => {
  let accessibilityStatementController: AccessibilityStatementController;
  let req;
  let res;

  beforeEach(() => {
    accessibilityStatementController = new AccessibilityStatementController();
    req = {
      headers: {
        referer: '',
      },
      session: {
        lastPage: '',
      },
    };

    res = {
      render: jest.fn(),
    };
  });

  describe('GET', () => {
    test('renders the page', () => {
      req.headers.referer = '/manage-booking/login';

      accessibilityStatementController.get(req, res);

      expect(req.session.lastPage).toBe(req.headers.referer);
      expect(res.render).toHaveBeenCalledWith(PageNames.ACCESSIBILITY_STATEMENT, {
        backLink: req.headers.referer,
      });
    });

    test('back link does not change if the referer is on the accessibility statement page', () => {
      req.headers.referer = '/accessibility-statement';
      req.session.lastPage = '/candidate-details';

      accessibilityStatementController.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.ACCESSIBILITY_STATEMENT, {
        backLink: req.session.lastPage,
      });
    });

    test('back link defaults to the root if referer is undefined', () => {
      req.headers.referer = undefined;

      accessibilityStatementController.get(req, res);

      expect(req.session.lastPage).toBe('/');
      expect(res.render).toHaveBeenCalledWith(PageNames.ACCESSIBILITY_STATEMENT, {
        backLink: '/',
      });
    });

    test('back link doesn\'t have any query string params if referer originally contained them', () => {
      req.headers.referer = '/candidate-details?lang=cy';

      accessibilityStatementController.get(req, res);

      expect(req.session.lastPage).toBe('/candidate-details');
      expect(res.render).toHaveBeenCalledWith(PageNames.ACCESSIBILITY_STATEMENT, {
        backLink: '/candidate-details',
      });
    });
  });
});
