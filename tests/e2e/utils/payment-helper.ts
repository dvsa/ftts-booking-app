import { ObjectSerializer } from '@dvsa/ftts-eligibility-api-model/dist/generated/models';
import { Address } from '@dvsa/ftts-payment-api-model/dist/candidate/generated/address';
import { CardPaymentPayload } from '@dvsa/ftts-payment-api-model/dist/candidate/generated/cardPaymentPayload';
import { CardPaymentResponse } from '@dvsa/ftts-payment-api-model/dist/candidate/generated/cardPaymentResponse';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import { ClientSecretCredential } from '@dvsa/ftts-auth-client';
import axios from 'axios';
import config from '../../../src/config';
import { Target } from '../../../src/domain/enums';
import { logger } from '../../../src/helpers/logger';
import { mapToCrmContactAddress } from '../../../src/services/crm-gateway/crm-address-mapper';
import { SessionData } from '../data/session-data';

export const buildPaymentReference = (limit: number): string => {
  const uuid: string = uuidv4();
  const uuidNoDashes = uuid.replace(/-/g, '');
  return `FTT-${uuidNoDashes.substring(limit, 32)}-${dayjs().format('YYMMDDHHMMss')}`.toUpperCase();
};

export async function initiateCardPayment(sessionData: SessionData): Promise<CardPaymentResponse> {
  const candidateAddressCrmFormat = mapToCrmContactAddress(sessionData.candidate.address);
  const customerAddress: Address = {
    line1: candidateAddressCrmFormat.address1_line1 as string,
    line2: candidateAddressCrmFormat?.address1_line2,
    line3: candidateAddressCrmFormat?.address1_line3,
    line4: candidateAddressCrmFormat?.ftts_address1_line4,
    city: candidateAddressCrmFormat.address1_city as string,
    postcode: candidateAddressCrmFormat.address1_postalcode as string,
  };

  const paymentAmount = sessionData.currentBooking.priceList.price.toFixed(2);

  const cardPaymentPayload: CardPaymentPayload = {
    countryCode: sessionData.target === Target.NI
      ? CardPaymentPayload.CountryCodeEnum.NI
      : CardPaymentPayload.CountryCodeEnum.GB,
    customerAddress,
    customerManagerName: `${sessionData.candidate.firstnames} ${sessionData.candidate.surname}`,
    customerName: `${sessionData.candidate.firstnames} ${sessionData.candidate.surname}`,
    customerReference: sessionData.candidate.candidateId,
    paymentData: [{
      lineIdentifier: 1,
      amount: paymentAmount,
      allocatedAmount: paymentAmount,
      netAmount: paymentAmount,
      taxAmount: '0.00',
      taxCode: 'AX',
      taxRate: 0,
      productReference: sessionData.currentBooking.bookingProductId,
      productDescription: sessionData.currentBooking.priceList.product.productId,
      receiverReference: sessionData.candidate.candidateId,
      receiverName: `${sessionData.candidate.firstnames} ${sessionData.candidate.surname}`,
      receiverAddress: customerAddress,
      salesReference: sessionData.currentBooking.salesReference,
      salesPersonReference: null,
    }],
    hasInvoice: true,
    refundOverpayment: false,
    redirectUri: process.env.BOOKING_APP_URL,
    scope: CardPaymentPayload.ScopeEnum.CARD,
    totalAmount: paymentAmount,
  };

  const paymentApiBaseUrl = `${config.payment.baseUrl}/api/v1/candidate/payment/card`;
  const clientId = config.payment.identity.azureClientId;
  const clientSecret = config.payment.identity.azureClientSecret;
  const { scope } = config.payment.identity;

  try {
    const { token } = await new ClientSecretCredential(
      config.payment.identity.azureTenantId,
      clientId,
      clientSecret,
    ).getToken(scope);

    const paymentHeaders = {
      headers:
      {
        Authorization: `Bearer ${token}`,
        'X-FTTS-PAYMENT-USER-ID': `person:${sessionData.candidate.candidateId}`,
        'X-FTTS-PAYMENT-PERSON-REFERENCE': sessionData.candidate.personReference,
      },
    };

    const paymentResponse = await axios.post<CardPaymentResponse>(
      paymentApiBaseUrl,
      ObjectSerializer.serialize(cardPaymentPayload, 'CardPaymentPayload'),
      paymentHeaders,
    );
    const responseData: CardPaymentResponse = ObjectSerializer.deserialize(paymentResponse.data, 'CardPaymentResponse');
    return responseData;
  } catch (error) {
    logger.error(error, 'Payment service error', {
      response: error.response?.data,
    });
    throw error;
  }
}
