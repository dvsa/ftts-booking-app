import { Request, Response } from 'express';
import { PageNames } from '@constants';

export class SupportAlertController {
  public get = (req: Request, res: Response): void => {
    res.render(PageNames.SUPPORT_ALERT, {
      backLink: 'choose-support',
    });
  };

  public post = (req: Request, res: Response): void => {
    req.session.journey = {
      ...req.session.journey,
      support: true,
      standardAccommodation: false,
      inEditMode: false,
    };
    res.redirect('nsa/candidate-details');
  };
}

export default new SupportAlertController();
