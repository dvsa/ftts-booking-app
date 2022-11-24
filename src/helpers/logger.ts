import { Logger as AzureLogger } from '@dvsa/azure-logger';
import { Props } from '@dvsa/azure-logger/dist/ILogger';
import { CustomAxiosError } from '@dvsa/azure-logger/dist/interfaces';
import { getNamespace } from 'cls-hooked';

export class Logger extends AzureLogger {
  critical(message: string, properties?: Props): void {
    super.critical(message, this.buildLogProps(properties));
  }

  error(error: Error, message?: string, properties?: Props): void {
    super.error(error, message, this.buildLogProps(properties));
  }

  warn(message: string, properties?: Props): void {
    super.warn(message, this.buildLogProps(properties));
  }

  event(name: string, message?: string, properties?: Props): void {
    super.event(name, message, this.buildLogProps(properties));
  }

  request(name: string, properties?: Props): void {
    super.request(name, this.buildLogProps(properties));
  }

  dependency(name: string, data?: string, properties?: Props): void {
    super.dependency(name, data, this.buildLogProps(properties));
  }

  security(message: string, properties?: Props): void {
    super.security(message, this.buildLogProps(properties));
  }

  audit(message: string, properties?: Props): void {
    super.audit(message, this.buildLogProps(properties));
  }

  log(message: string, properties?: Props): void {
    super.log(message, this.buildLogProps(properties));
  }

  info(message: string, properties?: Props): void {
    super.info(message, this.buildLogProps(properties));
  }

  debug(message: string, properties?: Props): void {
    super.debug(message, this.buildLogProps(properties));
  }

  private buildLogProps(customProps?: Props): Props {
    return {
      sessionId: getNamespace('app')?.get('sessionId'),
      'X-Azure-Ref': getNamespace('app')?.get('X-Azure-Ref'),
      'INCAP-REQ-ID': getNamespace('app')?.get('INCAP-REQ-ID'),
      ...customProps,
    };
  }
}

const logger = new Logger('FTTS', process.env.WEBSITE_SITE_NAME || 'ftts-booking-app');

enum BusinessTelemetryEvents {
  CDS_AUTH_ISSUE = 'CP_CDS_AUTH_ISSUE', // Candidate Portal get 401 or 403 response from CDS
  CDS_ERROR = 'CP_CDS_ERROR', // Candidate Portal get 5** response from CDS
  CDS_FAIL_BOOKING_CANCEL = 'CP_CDS_FAIL_BOOKING_CANCEL', // Candidate Portal was unable to update booking for already canceled slot during cancelation. This event is subset of request/error issue with CDS but need to be emitted separately.
  CDS_FAIL_BOOKING_CHANGE_UPDATE = 'CP_CDS_FAIL_BOOKING_CHANGE_UPDATE', // Candidate Portal was unable to update booking for confirmed slot during rescheduling. This event is subset of request/error issue with CDS but need to be emitted separately.
  CDS_FAIL_BOOKING_NEW_UPDATE = 'CP_CDS_FAIL_BOOKING_NEW_UPDATE', // Candidate Portal was unable to update booking for paid and confirmed slot during make a booking. This event is subset of request/error issue with CDS but need to be emitted separately.
  CDS_REQUEST_ISSUE = 'CP_CDS_REQUEST_ISSUE', // Candidate Portal get other 4** response from CDS
  CDS_REQUEST_RESPONSE_MISMATCH = 'CP_REQUEST_RESPONSE_MISMATCH',

  ELIGIBILITY_AUTH_ISSUE = 'CP_ELIGIBILITY_AUTH_ISSUE', // Candidate Portal get 401 or 403 response from Eligibility API
  ELIGIBILITY_ERROR = 'CP_ELIGIBILITY_ERROR', // Candidate Portal get 5** response from Eligibility API
  ELIGIBILITY_REQUEST_ISSUE = 'CP_ELIGIBILITY_REQUEST_ISSUE', // Candidate Portal get other 4** response from Eligibility API

  LOC_AUTH_ISSUE = 'CP_LOC_AUTH_ISSUE', // Candidate Portal get 401 or 403 response from Location API
  LOC_ERROR = 'CP_LOC_ERROR', // Candidate Portal get 5** response from Location API
  LOC_REQUEST_ISSUE = 'CP_LOC_REQUEST_ISSUE', // Candidate Portal get other 4** response from Location API

  NOT_WHITELISTED_URL_CALL = 'NOT_WHITELISTED_URL_CALL',

  NOTIF_AUTH_ISSUE = 'CP_NOTIF_AUTH_ISSUE', // Candidate Portal get 401 or 403 response from Notification API
  NOTIF_ERROR = 'CP_NOTIF_ERROR', // Candidate Portal get 5** response from Notification API
  NOTIF_REQUEST_ISSUE = 'CP_NOTIF_REQUEST_ISSUE', // Candidate Portal get other 4** response from Notification API

  PAYMENT_AUTH_ISSUE = 'CP_PAYMENT_AUTH_ISSUE', // Candidate Portal get 401 or 403 response from Payment API
  PAYMENT_BACK = 'CP_PAYMENT_BACK', // During booking process user returned from payment gateway
  PAYMENT_CANCEL = 'CP_PAYMENT_CANCEL', // During booking process user canceled payment in payment gateway
  PAYMENT_ERROR = 'CP_PAYMENT_ERROR', // Candidate Portal get 5** response from Payment API
  PAYMENT_FAILED = 'CP_PAYMENT_FAILED', // During booking process payment failed
  PAYMENT_GATEWAY_ERROR = 'CP_PAYMENT_GATEWAY_ERROR', // During booking process payment API fails by gateway error code 810
  PAYMENT_SYSTEM_ERROR = 'CP_PAYMENT_SYSTEM_ERROR', // During booking process payment API fails by system error code 828
  PAYMENT_INCOME_SUCCESS = 'CP_PAYMENT_INCOME_SUCCESS', // During cancelation of booking (in less than 3 days) income was recognized
  PAYMENT_INCOME_FAIL = 'CP_PAYMENT_INCOME_FAIL', // During cancelation of booking (in less than 3 days) income failed to be recognized
  PAYMENT_REDIRECT = 'CP_PAYMENT_REDIRECT', // During booking process user is about to redirect to payment gateway
  PAYMENT_REDIRECT_SESSION_FAIL = 'CP_PAYMENT_REDIRECT_SESSION_FAIL', // When the payment gateway redirects back to booking app and the session has expired
  PAYMENT_REFUND_FAIL = 'CP_PAYMENT_REFUND_FAIL', // During cancelation of booking refund failed
  PAYMENT_REFUND_INITIATED = 'CP_PAYMENT_REFUND_INITIATED', // During cancelation of booking refund was initiated
  PAYMENT_REFUND_SUCCESS = 'CP_PAYMENT_REFUND_SUCCESS', // During cancelation of booking refund was successful
  PAYMENT_REQUEST_ISSUE = 'CP_PAYMENT_REQUEST_ISSUE', // Candidate Portal get other 4** response from Payment API
  PAYMENT_STARTED = 'CP_PAYMENT_STARTED', // During booking process payment was initiated
  PAYMENT_SUCCESS = 'CP_PAYMENT_SUCCESS', // During booking process payment was finished successfully
  PAYMENT_COMPENSATION_SUCCESS = 'CP_PAYMENT_COMPENSATION_SUCCESS', // During transfering payments and linking a new booking to its compensation booking
  PAYMENT_COMPENSATION_FAIL = 'CP_PAYMENT_COMPENSATION_FAIL', // During transfering payments and linking a new booking to its compensation booking

  SCHEDULING_AUTH_ISSUE = 'CP_SCHEDULING_AUTH_ISSUE', // Candidate Portal get 401 or 403 response from Scheduling API
  SCHEDULING_ERROR = 'CP_SCHEDULING_ERROR', // Candidate Portal get 5** response from Scheduling API
  SCHEDULING_FAIL_CONFIRM_CHANGE = 'CP_SCHEDULING_FAIL_CONFIRM_CHANGE', // Candidate Portal was unable to confirm new slot during rescheduling. This event is subset of request/error issue with scheduling but need to be emitted separately.
  SCHEDULING_FAIL_CONFIRM_NEW = 'CP_SCHEDULING_FAIL_CONFIRM_NEW', // Candidate Portal was unable to confirm new slot during make a booking. This event is subset of request/error issue with scheduling but need to be emitted separately.
  SCHEDULING_FAIL_CONFIRM_CANCEL = 'CP_SCHEDULING_FAIL_CONFIRM_CANCEL', // Candidate Portal was unable to cancel existing slot during cancel a booking. This event is subset of request/error issue with scheduling but need to be emitted separately.
  SCHEDULING_FAIL_DELETE = 'CP_SCHEDULING_FAIL_DELETE', // Candidate Portal was unable to cancel previous slot during rescheduling. This event is subset of request/error issue with scheduling but need to be emitted separately.
  SCHEDULING_REQUEST_ISSUE = 'CP_SCHEDULING_REQUEST_ISSUE', // Candidate Portal get other 4** response from Scheduling API
  SCHEDULING_SLOT_EXP = 'CP_SCHEDULING_SLOT_EXP', // Candidate Portal get slots expired response from Scheduling API
  SCHEDULING_RESERVATION_SUCCESS = 'CP_SCHEDULING_RESERVATION_SUCCESS', // Success scenario when slot is reserved.
  SCHEDULING_BOOKING_CONFIRMATION_SUCCESS = 'CP_SCHEDULING_BOOKING_CONFRIMATION_SUCCESS', // This is not yet used but has been added.
  SCHEDULING_SLOT_INVALID_ERROR = 'CP_SCHEDULING_SLOT_INVALID_ERROR',

  SESSION_TIMEOUT = 'CP_SESSION_TIMEOUT',
}

export {
  logger,
  CustomAxiosError,
  BusinessTelemetryEvents,
};
