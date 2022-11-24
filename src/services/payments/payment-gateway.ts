import { Candidate, Finance } from '@dvsa/ftts-payment-api-model';
import config from '../../config';
import { logger, BusinessTelemetryEvents } from '../../helpers/logger';
import { AxiosRetryClient } from '../../libraries/axios-retry-client';
import { AxiosRetryClientForPaymentErrors } from '../../libraries/axios-retry-client-for-payment-errors';
import { ManagedIdentityAuth } from '../auth/managed-identity-auth';
import { PaymentStatus } from './enums';

enum UserPrefix {
  Person = 'person',
  CrmUser = 'crmuser',
}
class PaymentGateway {
  constructor(
    private auth: ManagedIdentityAuth = new ManagedIdentityAuth(config.payment.identity),
    private axiosRetryClient = new AxiosRetryClient(config.payment.retryPolicy).getClient(),
    private userCancelledAxiosRetryClient = new AxiosRetryClientForPaymentErrors(config.payment.retryPolicy).getClient(),
    private apiUrl: string = config.payment.baseUrl,
  ) { }

  public async initiateCardPayment(
    cardPaymentPayload: Candidate.CardPaymentPayload,
    userId: string,
    personReference: string,
  ): Promise<Candidate.CardPaymentResponse> {
    logger.debug('PaymentApiClient::initiateCardPayment: sending payload', { cardPaymentPayload });
    logger.event(BusinessTelemetryEvents.PAYMENT_STARTED, 'PaymentApiClient::initiateCardPayment: Start', {
      personReference,
      userId,
    });
    const requestUrl = `${this.apiUrl}/api/v1/candidate/payment/card`;
    const response = await this.axiosRetryClient.post<Candidate.CardPaymentResponse>(
      requestUrl,
      Candidate.ObjectSerializer.serialize(cardPaymentPayload, 'CardPaymentPayload'),
      await this.headers(`${UserPrefix.Person}:${userId}`, personReference),
    );
    const responseData: Candidate.CardPaymentResponse = Candidate.ObjectSerializer.deserialize(response.data, 'CardPaymentResponse');
    logger.debug('PaymentApiClient::initiateCardPayment: received response', { responseData });
    return responseData;
  }

  public async confirmCardPaymentIsComplete(
    receiptReference: string,
    userId: string,
    personReference: string,
  ): Promise<Candidate.CardPaymentCompletionResponse> {
    logger.debug('PaymentApiClient::confirmCardPaymentIsComplete: sending payload', { receiptReference });
    const requestUrl = `${this.apiUrl}/api/v1/candidate/gateway/${receiptReference}/complete`;
    const response = await this.userCancelledAxiosRetryClient.put<Candidate.CardPaymentCompletionResponse>(
      requestUrl,
      null,
      await this.headers(`${UserPrefix.Person}:${userId}`, personReference),
    );
    const responseData: Candidate.CardPaymentCompletionResponse = Candidate.ObjectSerializer.deserialize(response.data, 'CardPaymentCompletionResponse');
    logger.debug('PaymentApiClient::confirmCardPaymentIsComplete: received response', { responseData });
    if (response.data?.code === PaymentStatus.SUCCESS) {
      logger.event(BusinessTelemetryEvents.PAYMENT_SUCCESS, 'PaymentApiClient::confirmCardPaymentIsComplete: Finished', {
        userId,
        personReference,
      });
    }
    return responseData;
  }

  public async requestRefund(
    batchRefundPayload: Candidate.BatchRefundPayload,
    userId: string,
    personReference: string,
  ): Promise<Candidate.BatchPaymentRefundResponse> {
    logger.debug('PaymentApiClient::requestRefund: sending payload', { batchRefundPayload });
    logger.event(BusinessTelemetryEvents.PAYMENT_REFUND_INITIATED, 'PaymentApiClient::requestRefund: Started', {
      userId,
      personReference,
    });
    const requestUrl = `${this.apiUrl}/api/v1/candidate/refund`;
    const response = await this.axiosRetryClient.post<Candidate.BatchPaymentRefundResponse>(
      requestUrl,
      Candidate.ObjectSerializer.serialize(batchRefundPayload, 'BatchRefundPayload'),
      await this.headers(`${UserPrefix.Person}:${userId}`, personReference),
    );
    const responseData: Candidate.BatchPaymentRefundResponse = Candidate.ObjectSerializer.deserialize(response.data, 'BatchPaymentRefundResponse');
    logger.debug('PaymentApiClient::requestRefund: received response', { responseData });
    if (responseData?.code && Number(responseData?.code) === PaymentStatus.REFUND_SUCCESS) {
      logger.event(BusinessTelemetryEvents.PAYMENT_REFUND_SUCCESS, 'PaymentApiClient::requestRefund: Finished', {
        userId,
        personReference,
      });
    }
    return responseData;
  }

  public async recogniseIncome(
    recogniseIncomePayload: Finance.RecogniseIncomePayload,
    userId: string,
    personReference: string,
  ): Promise<void> {
    logger.debug('PaymentApiClient::recogniseIncome: sending payload', { recogniseIncomePayload });
    const requestUrl = `${this.apiUrl}/api/v1/finance/recognitions`;
    try {
      const response = await this.axiosRetryClient.post(
        requestUrl,
        Candidate.ObjectSerializer.serialize(recogniseIncomePayload, 'RecogniseIncomePayload'),
        await this.headers(`${UserPrefix.Person}:${userId}`, personReference),
      );
      logger.debug('PaymentApiClient::recogniseIncome: call finished', {
        httpCode: response.status,
      });
      if (response.status >= 400) {
        throw new Error(`HTTP request error - ${response.status}: ${response.statusText}`);
      }
      logger.event(BusinessTelemetryEvents.PAYMENT_INCOME_SUCCESS, 'PaymentApiClient::recogniseIncome: Finished', {
        userId,
        personReference,
      });
    } catch (error) {
      logger.error(error as Error, 'PaymentApiClient::recogniseIncome: Failed to recognise income', {
        ...recogniseIncomePayload,
      });
      logger.event(BusinessTelemetryEvents.PAYMENT_INCOME_FAIL, 'PaymentApiClient::recogniseIncome: Failed to recognise income', {
        ...recogniseIncomePayload,
      });

      throw error;
    }
  }

  public async compensateBooking(
    compensatedBookingPayload: Finance.CompensatedBookingPayload,
    userId: string,
    personReference: string,
  ): Promise<void> {
    logger.debug('PaymentApiClient::compensateBooking: sending payload', { compensatedBookingPayload });
    const requestUrl = `${this.apiUrl}/api/v1/finance/compensation-booking`;
    try {
      const response = await this.axiosRetryClient.post(
        requestUrl,
        compensatedBookingPayload,
        await this.headers(`${UserPrefix.Person}:${userId}`, personReference),
      );
      logger.debug('PaymentApiClient::compensateBooking: call response', {
        httpCode: response.status,
      });
      if (response.status >= 400) {
        throw new Error(`HTTP request error - ${response.status}: ${response.statusText}`);
      }
      logger.event(BusinessTelemetryEvents.PAYMENT_COMPENSATION_SUCCESS, 'PaymentApiClient::compensateBooking: Finished Successfully', {
        ...compensatedBookingPayload,
      });
    } catch (error) {
      logger.error(error as Error, 'PaymentApiClient::compensateBooking: Failed to compensate booking', {
        ...compensatedBookingPayload,
      });
      logger.event(BusinessTelemetryEvents.PAYMENT_COMPENSATION_FAIL, 'PaymentApiClient::compensateBooking: Failed to compensate booking', {
        ...compensatedBookingPayload,
      });

      throw error;
    }
  }

  private async headers(paymentUserId: string, personReference: string): Promise<Record<string, unknown>> {
    try {
      const authHeaders = await this.auth.getAuthHeader();
      return {
        headers: {
          ...authHeaders.headers,
          'X-FTTS-PAYMENT-USER-ID': paymentUserId,
          'X-FTTS-PAYMENT-PERSON-REFERENCE': personReference,
        },
      };
    } catch (error) {
      logger.event(BusinessTelemetryEvents.PAYMENT_AUTH_ISSUE, 'PaymentApiClient::headers: Failed to get token', {
        error,
        paymentUserId,
        personReference,
      });
      throw error;
    }
  }
}

const paymentGateway = new PaymentGateway();

export * from '@dvsa/ftts-payment-api-model';
export {
  PaymentGateway,
  paymentGateway,
};
