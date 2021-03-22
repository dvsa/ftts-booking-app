import { Request, Response } from 'express';

class ManageBookingStartController {
  public get = (req: Request, res: Response): void => res.render('manage-booking/start');
}

export default new ManageBookingStartController();
