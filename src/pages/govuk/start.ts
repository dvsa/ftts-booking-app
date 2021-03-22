import { Request, Response } from 'express';

export class StartController {
  public get = (req: Request, res: Response): void => res.render('govuk/start', {
    shouldShowCookieMessage: true,
  });
}

export default new StartController();
