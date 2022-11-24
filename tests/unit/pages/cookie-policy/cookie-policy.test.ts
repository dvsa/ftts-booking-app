import { PageNames } from '@constants';
import { CookiePolicyController } from '@pages/cookie-policy/cookie-policy';

describe('CookiePolicyController', () => {
  let cookiePolicyController: CookiePolicyController;
  let req;
  let res;

  beforeEach(() => {
    cookiePolicyController = new CookiePolicyController();
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
      req.headers.referer = '/';

      cookiePolicyController.get(req, res);

      expect(req.session.lastPage).toBe(req.headers.referer);
      expect(res.render).toHaveBeenCalledWith(PageNames.COOKIE_POLICY, {
        cookiePageBackLink: req.headers.referer,
        onPolicyPage: true,
      });
    });

    test('back link doesn\'t change if the referer is on the cookie page', () => {
      req.headers.referer = '/view-cookies';
      req.session.lastPage = '/candidate-details';

      cookiePolicyController.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.COOKIE_POLICY, {
        cookiePageBackLink: req.session.lastPage,
        onPolicyPage: true,
      });
    });

    test('back link defaults to the root if referer is undefined', () => {
      req.headers.referer = undefined;

      cookiePolicyController.get(req, res);

      expect(req.session.lastPage).toBe('/');
      expect(res.render).toHaveBeenCalledWith(PageNames.COOKIE_POLICY, {
        cookiePageBackLink: '/',
        onPolicyPage: true,
      });
    });

    test('back link doesn\'t have any query string params if referer originally contained them', () => {
      req.headers.referer = '/candidate-details?lang=cy';

      cookiePolicyController.get(req, res);

      expect(req.session.lastPage).toBe('/candidate-details');
      expect(res.render).toHaveBeenCalledWith(PageNames.COOKIE_POLICY, {
        cookiePageBackLink: '/candidate-details',
        onPolicyPage: true,
      });
    });
  });
});
