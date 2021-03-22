import { Request, Response } from 'express';
import { store } from '../../services/session';

export class LeavingNSAController {
  public get = (req: Request, res: Response): void => res.render('supported/leaving-nsa');

  public post = (req: Request, res: Response): void => {
    store.journey.update(req, {
      standardAccommodation: req.body.accommodation === 'standard',
    });

    return res.redirect('#');
  };
}

export default new LeavingNSAController();
