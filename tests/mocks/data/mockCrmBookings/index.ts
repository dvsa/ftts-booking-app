import { CRMBookingDetails } from '../../../../src/services/crm-gateway/interfaces';
import {
  mockBookingStandardCarGb, mockBookingChangeInProgressGb, mockBookingCancelledGb, mockBookingStandardMotorcycleGb, mockBookingStandardCarGb2, mockBookingStandardPcvHptGb, mockBookingStandardAdiP1Gb, mockBookingStandardAdiHptGb, mockBookingStandardErsGb, mockBookingStandardCscSuccessGb, mockBookingStandardCscFailureGb, mockBookingStandardPrevPassedGb, mockBookingStandardPrevFailedGb,
} from './gb';

import {
  mockBookingStandardCarNi, mockBookingStandardMotorcycleNi, mockBookingStandardCarNi2, mockBookingStandardPcvHptNi, mockBookingStandardAdiP1Ni, mockBookingStandardAmiP1Ni,
} from './ni';

const bookingsSingleFutureGB: DynamicsWebApi.RetrieveMultipleResponse<CRMBookingDetails> = {
  value: [
    mockBookingStandardCarGb,
  ],
};

const bookingsErrorHandling: DynamicsWebApi.RetrieveMultipleResponse<CRMBookingDetails> = {
  value: [
    mockBookingChangeInProgressGb,
    mockBookingCancelledGb,
  ],
};

const bookingsSingleFutureNI: DynamicsWebApi.RetrieveMultipleResponse<CRMBookingDetails> = {
  value: [
    mockBookingStandardCarNi,
  ],
};

const bookingsMultipleFutureGB: DynamicsWebApi.RetrieveMultipleResponse<CRMBookingDetails> = {
  value: [
    mockBookingStandardCarGb,
    mockBookingStandardMotorcycleGb,
    mockBookingStandardCarGb2,
    mockBookingStandardPcvHptGb,
  ],
};

const bookingsMultipleFutureInstructorGB: DynamicsWebApi.RetrieveMultipleResponse<CRMBookingDetails> = {
  value: [
    mockBookingStandardAdiP1Gb,
    mockBookingStandardAdiHptGb,
    mockBookingStandardErsGb,
  ],
};

const bookingsMultipleFutureNI: DynamicsWebApi.RetrieveMultipleResponse<CRMBookingDetails> = {
  value: [
    mockBookingStandardCarNi,
    mockBookingStandardCarNi2,
    mockBookingStandardMotorcycleNi,
    mockBookingStandardPcvHptNi,
    mockBookingStandardMotorcycleGb,
  ],
};

const bookingsMultipleFutureInstructorNI: DynamicsWebApi.RetrieveMultipleResponse<CRMBookingDetails> = {
  value: [
    mockBookingStandardAdiP1Ni,
    mockBookingStandardAmiP1Ni,
  ],
};

const bookingsCSCPaymentSuccess: DynamicsWebApi.RetrieveMultipleResponse<CRMBookingDetails> = {
  value: [
    mockBookingStandardCscSuccessGb,
  ],
};

const bookingsCSCPaymentFailure: DynamicsWebApi.RetrieveMultipleResponse<CRMBookingDetails> = {
  value: [
    mockBookingStandardCscFailureGb,
  ],
};

const bookingsPrevPassed: DynamicsWebApi.RetrieveMultipleResponse<CRMBookingDetails> = {
  value: [
    mockBookingStandardPrevPassedGb,
  ],
};

const bookingsPrevFailed: DynamicsWebApi.RetrieveMultipleResponse<CRMBookingDetails> = {
  value: [
    mockBookingStandardPrevFailedGb,
  ],
};

export {
  bookingsSingleFutureGB,
  bookingsSingleFutureNI,
  bookingsMultipleFutureGB,
  bookingsMultipleFutureNI,
  bookingsCSCPaymentSuccess,
  bookingsCSCPaymentFailure,
  bookingsPrevFailed,
  bookingsPrevPassed,
  bookingsErrorHandling,
  bookingsMultipleFutureInstructorGB,
  bookingsMultipleFutureInstructorNI,
};
