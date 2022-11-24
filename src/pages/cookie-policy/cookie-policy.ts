import { Request, Response } from 'express';
import { PageNames } from '@constants';

export class CookiePolicyController {
  public get = (req: Request, res: Response): void => {
    if (!req.headers.referer?.match(/view-cookies/)) {
      req.session.lastPage = req.headers.referer?.split('?')[0] || '/';
    }
    return res.render(PageNames.COOKIE_POLICY, {
      cookiePageBackLink: req.session.lastPage,
      onPolicyPage: true,
    });
  };
}

export default new CookiePolicyController();
