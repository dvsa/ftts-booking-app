import { Request, Response } from 'express';
import { PageNames } from '@constants';
import nsaNavigator from '../../helpers/nsa-navigator';

export class DuplicateSupportRequest {
  public get = (req: Request, res: Response): void => this.render(req, res);

  private render = (req: Request, res: Response): void => {
    res.render(PageNames.DUPLICATE_SUPPORT_REQUEST, {
      backLink: this.getBackLink(req),
    });
  };

  private getBackLink = (req: Request): string => {
    if (req.session.lastPage === 'nsa/leaving-nsa') {
      return 'leaving-nsa';
    }

    return nsaNavigator.getPreviousPage(req);
  };
}

export default new DuplicateSupportRequest();
