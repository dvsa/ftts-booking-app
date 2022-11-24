import { Request, Response } from 'express';
import { PageNames } from '@constants';

export class AccessibilityStatementController {
  public get = (req: Request, res: Response): void => {
    if (!req.headers.referer?.match(/accessibility-statement/)) {
      req.session.lastPage = req.headers.referer?.split('?')[0] || '/';
    }
    return res.render(PageNames.ACCESSIBILITY_STATEMENT, {
      backLink: req.session.lastPage,
    });
  };
}

export default new AccessibilityStatementController();
