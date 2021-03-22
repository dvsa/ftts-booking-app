import testCentresGb from './test-centres-gb';
import testCentresNi from './test-centres-ni';
import notification from './notification';
import token from './token';
import payment from './payment';
import {
  bookingsSingleFutureGB, bookingsSingleFutureNI, bookingsMultipleFutureGB, bookingsMultipleFutureNI, bookingsCSCPaymentFailure, bookingsCSCPaymentSuccess, bookingsPrevPassed, bookingsPrevFailed, bookingsErrorHandling,
} from './bookings';

const mockData = {
  testCentresGb,
  testCentresNi,
  notification,
  token,
  payment,
  bookingsSingleFutureGB,
  bookingsSingleFutureNI,
  bookingsMultipleFutureGB,
  bookingsMultipleFutureNI,
  bookingsCSCPaymentFailure,
  bookingsCSCPaymentSuccess,
  bookingsPrevFailed,
  bookingsPrevPassed,
  bookingsErrorHandling,
};

export default mockData;
