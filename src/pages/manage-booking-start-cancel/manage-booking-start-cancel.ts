/* istanbul ignore file */
import { Request, Response } from 'express';
import { PageNames } from '@constants';

class ManageBookingStartCancelController {
  public get = (req: Request, res: Response): void => res.render(PageNames.MANAGE_BOOKING_START_CANCEL);
}

export default new ManageBookingStartCancelController();
