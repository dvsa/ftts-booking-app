import { testCentresGb, testCentresNi } from './mockTestCentres';
import notification from './notification';
import token from './token';
import payment from './payment';
import productpricelist from './mockPriceLists';
import {
  bookingsSingleFutureGB, bookingsSingleFutureNI, bookingsMultipleFutureGB, bookingsMultipleFutureNI, bookingsCSCPaymentFailure, bookingsCSCPaymentSuccess, bookingsPrevPassed, bookingsPrevFailed, bookingsErrorHandling, bookingsMultipleFutureInstructorGB, bookingsMultipleFutureInstructorNI,
} from './mockCrmBookings';
import {
  eligWendyJonesGb, eligTasneemAvilaGb, eligDavidWilliamsGb, eligAbdurRahmanBentonGb, eligTesterTesterGb, eligTesterTester2Gb, eligTesterTester3Gb, eligTesterTester4Gb, eligTesterTester5Gb, eligTesterTester6Gb, eligTesterTester7Gb, eligPaulDriveInstructorGb, eligGlenWilliamNi, eligCarolineFirthNi, eligTesterTesterNi, eligTesterTester9Ni, eligPaulDriveInstructorNi,
} from './mockEligibilities';

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
  bookingsMultipleFutureInstructorGB,
  bookingsMultipleFutureInstructorNI,
  bookingsCSCPaymentFailure,
  bookingsCSCPaymentSuccess,
  bookingsPrevFailed,
  bookingsPrevPassed,
  bookingsErrorHandling,
  eligGlenWilliamNi,
  eligWendyJonesGb,
  eligTasneemAvilaGb,
  eligDavidWilliamsGb,
  eligCarolineFirthNi,
  eligTesterTesterGb,
  eligTesterTesterNi,
  productpricelist,
  eligAbdurRahmanBentonGb,
  eligTesterTester2Gb,
  eligTesterTester3Gb,
  eligTesterTester4Gb,
  eligTesterTester5Gb,
  eligTesterTester6Gb,
  eligTesterTester7Gb,
  eligTesterTester9Ni,
  eligPaulDriveInstructorGb,
  eligPaulDriveInstructorNi,
};

export default mockData;
