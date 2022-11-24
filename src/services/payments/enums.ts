export enum PaymentStatus {
  SUCCESS = 801,
  FAILED = 802,
  USER_CANCELLED = 807,

  // Refund
  REFUND_SUCCESS = 809,

  // Gateway error
  GATEWAY_ERROR = 810,

  // System Error
  SYSTEM_ERROR = 828,
}
