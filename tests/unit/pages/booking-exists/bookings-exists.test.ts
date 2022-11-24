import { PageNames } from '@constants';
import { BookingExistsController } from '@pages/booking-exists/booking-exists';

describe('BookingsExistsController', () => {
  let bookingExists: BookingExistsController;
  let req;
  let res;

  beforeEach(() => {
    bookingExists = new BookingExistsController();
    req = {
      session: {
        lastPage: 'previous-page',
      },
      path: '/booking-exists',
    };
    res = {
      render: jest.fn(),
    };
  });

  describe('get', () => {
    test('it should render the correct page', () => {
      bookingExists.get(req, res);
      expect(res.render).toHaveBeenCalledWith(PageNames.BOOKING_EXISTS, {
        backLink: 'previous-page',
      });
    });
  });
});
