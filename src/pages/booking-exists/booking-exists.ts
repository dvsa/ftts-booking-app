import { Request, Response } from 'express';
import { PageNames } from '@constants';

export class BookingExistsController {
  public get = (req: Request, res: Response): void => {
    res.render(PageNames.BOOKING_EXISTS, {
      backLink: req.session.lastPage,
    });
  };
}

export default new BookingExistsController();
