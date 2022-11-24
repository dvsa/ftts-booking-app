import { Candidate } from '@dvsa/ftts-payment-api-model';
import { Request, Response } from 'express';

import { PageNames } from '@constants';
import config from '../../config';
import { logger, BusinessTelemetryEvents } from '../../helpers/logger';
import { Target } from '../../domain/enums';
import { CRMGateway } from '../../services/crm-gateway/crm-gateway';
import { mapToCrmContactAddress } from '../../services/crm-gateway/crm-address-mapper';
import { paymentGateway, PaymentGateway } from '../../services/payments/payment-gateway';
import { getCreatedBookingIdentifiers } from '../../helpers/log-helper';

export class PaymentInitiationController {
  constructor(
    private crmGateway: CRMGateway,
    private payments: PaymentGateway,
  ) { }

  public get = async (req: Request, res: Response): Promise<void> => {
    const { candidate } = req.session;
    const { currentBooking: booking } = req.session;
    if (!candidate?.address || !candidate?.firstnames || !candidate?.surname || !candidate?.candidateId || !candidate?.personReference
      || !booking?.bookingProductId || !booking?.salesReference || !booking?.priceList) {
      logger.warn('PaymentInitiationController::get: Missing required session data', {
        candidateAddress: !candidate?.address,
        candidateFirstname: !candidate?.firstnames,
        candidateSurname: !candidate?.surname,
        candidateID: !candidate?.candidateId,
        candidateReference: !candidate?.personReference,
        bookingProduct: !booking?.bookingProductId,
        bookingSalesRef: !booking?.salesReference,
        bookingPriceList: !booking?.priceList,
      });
      throw new Error('PaymentInitiationController::get: Missing required session data');
    }

    const candidateAddressCrmFormat = mapToCrmContactAddress(candidate.address);
    const customerAddress: Candidate.Address = {
      line1: candidateAddressCrmFormat.address1_line1 as string,
      line2: candidateAddressCrmFormat?.address1_line2,
      line3: candidateAddressCrmFormat?.address1_line3,
      line4: candidateAddressCrmFormat?.ftts_address1_line4,
      city: candidateAddressCrmFormat.address1_city as string,
      postcode: candidateAddressCrmFormat.address1_postalcode as string,
    };

    const paymentAmount = booking.priceList.price.toFixed(2);
    const redirectUriBase = req.session.journey?.isInstructor ? `${config.payment.redirectUri}/instructor` : config.payment.redirectUri;
    const redirectUri = `${redirectUriBase}/payment-confirmation-loading/${booking.bookingRef}`;

    const cardPaymentPayload: Candidate.CardPaymentPayload = {
      countryCode: req.session.target === Target.NI
        ? Candidate.CardPaymentPayload.CountryCodeEnum.NI
        : Candidate.CardPaymentPayload.CountryCodeEnum.GB,
      customerAddress,
      customerManagerName: `${candidate.firstnames} ${candidate.surname}`,
      customerName: `${candidate.firstnames} ${candidate.surname}`,
      customerReference: candidate.candidateId,
      paymentData: [{
        lineIdentifier: 1,
        amount: paymentAmount,
        allocatedAmount: paymentAmount,
        netAmount: paymentAmount,
        taxAmount: '0.00',
        taxCode: 'AX',
        taxRate: 0,
        productReference: booking.bookingProductId,
        productDescription: booking.priceList.product.productId,
        receiverReference: candidate.candidateId,
        receiverName: `${candidate.firstnames} ${candidate.surname}`,
        receiverAddress: customerAddress,
        salesReference: booking.salesReference,
        salesPersonReference: null,
      }],
      hasInvoice: true,
      refundOverpayment: false,
      redirectUri,
      scope: Candidate.CardPaymentPayload.ScopeEnum.CARD,
      totalAmount: paymentAmount,
    };

    logger.debug('PaymentInitiationController::get: cardPaymentPayload', {
      cardPaymentPayload,
      ...getCreatedBookingIdentifiers(req),
    });

    let cardPaymentResponse: Candidate.CardPaymentResponse;
    try {
      logger.event(BusinessTelemetryEvents.PAYMENT_REDIRECT, 'PaymentInitiationController::get: Sending user to payment processor', {
        personReference: candidate?.personReference,
        instructorPersonalReferenceNumber: candidate?.personalReferenceNumber,
        ...getCreatedBookingIdentifiers(req),
      });
      cardPaymentResponse = await this.payments.initiateCardPayment(cardPaymentPayload, candidate.candidateId, candidate.personReference);
    } catch (error) {
      logger.error(error, 'PaymentInitiationController::get: Payment service error', {
        response: error.response?.data,
        personReference: candidate?.personReference,
        instructorPersonalReferenceNumber: candidate?.personalReferenceNumber,
        ...getCreatedBookingIdentifiers(req),
      });
      logger.event(BusinessTelemetryEvents.PAYMENT_FAILED, 'PaymentInitiationController::get: Payment service error', {
        error,
        personReference: candidate?.personReference,
        instructorPersonalReferenceNumber: candidate?.personalReferenceNumber,
        ...getCreatedBookingIdentifiers(req),
      });
      if (error.status === 500) {
        logger.event(BusinessTelemetryEvents.PAYMENT_ERROR, 'PaymentInitiationController::get: Payment service internal server error', {
          error,
          personReference: candidate?.personReference,
          instructorPersonalReferenceNumber: candidate?.personalReferenceNumber,
          ...getCreatedBookingIdentifiers(req),
        });
      }
      if (error.status === 401 || error.status === 403) {
        logger.event(BusinessTelemetryEvents.PAYMENT_AUTH_ISSUE, 'PaymentInitiationController::get: Payment authorisation error', {
          error,
          personReference: candidate?.personReference,
          instructorPersonalReferenceNumber: candidate?.personalReferenceNumber,
          ...getCreatedBookingIdentifiers(req),
        });
      }
      return res.render(PageNames.PAYMENT_INITIATION_ERROR);
    }

    try {
      await this.crmGateway.createBindBetweenBookingAndPayment(
        booking.bookingId,
        cardPaymentResponse.paymentId,
        cardPaymentResponse.receiptReference,
      );
    } catch (error) {
      logger.warn('PaymentInitiationController::get: No bind was created between the booking entity and the payment entity', {
        receiptReference: cardPaymentResponse.receiptReference,
        reason: error.message,
        ...getCreatedBookingIdentifiers(req),
      });
    }

    req.session.currentBooking = {
      ...req.session.currentBooking,
      receiptReference: cardPaymentResponse.receiptReference,
      paymentId: cardPaymentResponse.paymentId,
    };
    logger.info('PaymentInitiationController::get: Receipt reference and Payment ID added to session', {
      receiptReference: cardPaymentResponse.receiptReference,
      paymentId: cardPaymentResponse.paymentId,
      ...getCreatedBookingIdentifiers(req),
    });

    return res.redirect(cardPaymentResponse.gatewayUrl);
  };
}

export default new PaymentInitiationController(
  CRMGateway.getInstance(),
  paymentGateway,
);
