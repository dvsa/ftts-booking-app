/* istanbul ignore file */
import { Request, Response } from 'express';
import { PageNames } from '@constants';

export class StartController {
  public get = (req: Request, res: Response): void => res.render(PageNames.START);
}

export default new StartController();
