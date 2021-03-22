import { Request } from 'express';
import { Candidate } from '@dvsa/ftts-payment-api-model';
import { store } from '../session';
import { TARGET } from '../../domain/enums';
import config from '../../config';
import { buildPaymentReference, buildPersonReference } from './payment-helper';
import paymentApiClient from './payment-api-client';
import logger from '../../helpers/logger';

export class PaymentHandler {
  private static instance: PaymentHandler = new PaymentHandler();

  public static getInstance(): PaymentHandler {
    return PaymentHandler.instance;
  }

  public async handlePayment(req: Request): Promise<string> {
    const customerAddress = store.candidate.get(req).address as Candidate.Address;

    const candidate = store.candidate.get(req);
    const booking = store.currentBooking.get(req);

    const cardPaymentPayload: Candidate.CardPaymentPayload = {
      countryCode: store.target.get(req) === TARGET.NI
        ? Candidate.CardPaymentPayload.CountryCodeEnum.NI
        : Candidate.CardPaymentPayload.CountryCodeEnum.GB,
      customerAddress,
      customerManagerName: `${candidate.firstnames} ${candidate.surname}`,
      customerName: `${candidate.firstnames} ${candidate.surname}`,
      customerReference: candidate.candidateId,
      paymentData: [{
        allocatedAmount: config.view.theoryTestPriceInGbp,
        amount: config.view.theoryTestPriceInGbp,
        lineIdentifier: 1,
        netAmount: config.view.theoryTestPriceInGbp,
        productReference: booking.bookingProductId,
        productDescription: booking.bookingProductId,
        receiverReference: candidate.candidateId,
        receiverName: `${candidate.firstnames} ${candidate.surname}`,
        receiverAddress: customerAddress,
        salesReference: booking.salesReference,
        salesPersonReference: buildPaymentReference(19),
        taxAmount: '0.00',
        taxCode: 'AX',
        taxRate: 0,
      }],
      refundOverpayment: false,
      redirectUri: `${config.payment.redirectUri}/payment-confirmation`,
      scope: Candidate.CardPaymentPayload.ScopeEnum.CARD,
      totalAmount: config.view.theoryTestPriceInGbp,
    };

    try {
      const cardPaymentResponse = await paymentApiClient.initiateCardPayment(cardPaymentPayload, candidate.candidateId, candidate.personReference || buildPersonReference());

      store.currentBooking.update(req, {
        receiptReference: cardPaymentResponse.receiptReference,
      });
      logger.info('cardPaymentResponse: Receipt reference added to session');

      return cardPaymentResponse.gatewayUrl;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
}
