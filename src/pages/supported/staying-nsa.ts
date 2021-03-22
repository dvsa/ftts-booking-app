import { Request, Response } from 'express';

export class StayingNSAController {
  public get = (req: Request, res: Response): void => res.render('supported/staying-nsa');
}

export default new StayingNSAController();
