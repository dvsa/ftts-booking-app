import authClient, { IAuthClient } from '@dvsa/ftts-auth-client';
import { Candidate, Finance } from '@dvsa/ftts-payment-api-model';
import axiosRetryClient from '../../libraries/axios-retry-client';
import config from '../../config';

enum UserPrefix {
  Person = 'person',
  CrmUser = 'crmuser',
}

export class PaymentApiClient {
  constructor(
    private auth: IAuthClient,
    private apiUrl: string = config.payment.baseUrl,
  ) { }

  public async initiateCardPayment(
    cardPaymentPayload: Candidate.CardPaymentPayload,
    userId: string,
    personReference: string,
  ): Promise<Candidate.CardPaymentResponse> {
    const requestUrl = `${this.apiUrl}/api/v1/candidate/payment/card`;
    const response = await axiosRetryClient.post<Candidate.CardPaymentResponse>(
      requestUrl,
      Candidate.ObjectSerializer.serialize(cardPaymentPayload, 'CardPaymentPayload'),
      await this.headers(`${UserPrefix.Person}:${userId}`, personReference),
    );
    return Candidate.ObjectSerializer.deserialize(response.data, 'CardPaymentResponse');
  }

  public async confirmCardPaymentIsComplete(
    receiptReference: string,
    userId: string,
    personReference: string,
  ): Promise<Candidate.CardPaymentCompletionResponse> {
    const requestUrl = `${this.apiUrl}/api/v1/candidate/gateway/${receiptReference}/complete`;
    const response = await axiosRetryClient.put<Candidate.CardPaymentCompletionResponse>(
      requestUrl,
      null,
      await this.headers(`${UserPrefix.Person}:${userId}`, personReference),
    );
    return Candidate.ObjectSerializer.deserialize(response.data, 'CardPaymentCompletionResponse');
  }

  public async requestRefund(
    batchRefundPayload: Candidate.BatchRefundPayload,
    userId: string,
    personReference: string,
  ): Promise<Candidate.BatchPaymentRefundResponse> {
    const requestUrl = `${this.apiUrl}/api/v1/candidate/refund`;
    const response = await axiosRetryClient.post<Candidate.BatchPaymentRefundResponse>(
      requestUrl,
      Candidate.ObjectSerializer.serialize(batchRefundPayload, 'BatchRefundPayload'),
      await this.headers(`${UserPrefix.Person}:${userId}`, personReference),
    );
    return Candidate.ObjectSerializer.deserialize(response.data, 'BatchPaymentRefundResponse');
  }

  public async recogniseIncome(
    recogniseIncomePayload: Finance.RecogniseIncomePayload,
    userId: string,
    personReference: string,
  ): Promise<void> {
    const requestUrl = `${this.apiUrl}/api/v1/finance/recognitions`;
    await axiosRetryClient.post(
      requestUrl,
      Candidate.ObjectSerializer.serialize(recogniseIncomePayload, 'RecogniseIncomePayload'),
      await this.headers(`${UserPrefix.CrmUser}:${userId}`, personReference),
    );
  }

  private async headers(paymentUserId: string, personReference: string): Promise<object> {
    const token = await this.auth.getToken(config.apim.payment);
    return {
      headers: {
        Authorization: `Bearer ${token.value}`,
        'X-FTTS-PAYMENT-USER-ID': paymentUserId,
        'X-FTTS-PAYMENT-PERSON-REFERENCE': personReference,
      },
    };
  }
}

export * from '@dvsa/ftts-payment-api-model';
export default new PaymentApiClient(authClient);
