import { Candidate as PaymentCandidate } from '@dvsa/ftts-payment-api-model';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import { Booking } from '../../domain/booking/booking';
import { Target } from '../../domain/enums';
import { mapToCrmContactAddress } from '../crm-gateway/crm-address-mapper';
import { Candidate } from '../session';

export const buildPaymentReference = (limit: number): string => {
  const uuid: string = uuidv4();
  const uuidNoDashes = uuid.replace(/-/g, '');
  return `FTT${uuidNoDashes.substring(limit, 32)}${dayjs().format('YYMMDDHHMMss')}`.toUpperCase();
};

export const buildPaymentRefundPayload = (candidate: Candidate, booking: Booking, target: Target): PaymentCandidate.BatchRefundPayload => {
  const refundAmount = booking.details.price.toFixed(2);
  const candidateAddressCrmFormat = mapToCrmContactAddress(candidate.address);

  const payload: PaymentCandidate.BatchRefundPayload = {
    scope: PaymentCandidate.BatchRefundPayload.ScopeEnum.REFUND,
    customerReference: candidate.candidateId as string,
    customerName: `${candidate.firstnames} ${candidate.surname}`,
    customerManagerName: `${candidate.firstnames} ${candidate.surname}`,
    customerAddress: {
      line1: candidateAddressCrmFormat.address1_line1 as string,
      line2: candidateAddressCrmFormat.address1_line2,
      line3: candidateAddressCrmFormat.address1_line3,
      line4: candidateAddressCrmFormat.ftts_address1_line4,
      city: candidateAddressCrmFormat.address1_city as string,
      postcode: candidateAddressCrmFormat.address1_postalcode as string,
    },
    countryCode: target === Target.NI
      ? PaymentCandidate.BatchRefundPayload.CountryCodeEnum.NI
      : PaymentCandidate.BatchRefundPayload.CountryCodeEnum.GB,
    payments: [{
      refundReason: 'Test cancelled by candidate',
      bookingProductId: booking.details.bookingProductId,
      totalAmount: refundAmount,
      paymentData: [{
        lineIdentifier: 1,
        amount: refundAmount,
        netAmount: refundAmount,
        taxAmount: '0.00',
        salesReference: booking.details.salesReference as string,
      }],
    }],
  };

  return payload;
};
