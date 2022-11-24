import { CRMAdditionalSupport } from '@dvsa/ftts-crm-test-client/dist/enums';
import dayjs from 'dayjs';
import { CardPaymentResponse } from '@dvsa/ftts-payment-api-model/dist/candidate/generated/cardPaymentResponse';
import { t } from 'testcafe';
import { SessionData, Candidate, Booking } from '../../data/session-data';
import { buildPaymentReference, initiateCardPayment } from '../payment-helper';
import { dynamicsWebApiClient } from './dynamics-web-api';
import { CRMGateway } from './crm-gateway-test';
import { CRMBookingStatus } from '../../../../src/services/crm-gateway/enums';
import { Origin, Target } from '../../../../src/domain/enums';
import { PriceListItem } from '../../../../src/domain/types';
import { isZeroCostTest } from '../../../../src/domain/eligibility';
import { PaymentsPage } from '../../pages/payments-page';
import { CpmsPaymentModel } from '../../data/cpms-payment-model';

export async function createCandidateAndLicence(sessionData: SessionData): Promise<void> {
  const crmGateway = new CRMGateway(dynamicsWebApiClient());

  const crmCandidateId = await crmGateway.createCandidate(sessionData.candidate);
  const crmLicenceId = await crmGateway.createLicence(sessionData.candidate.licenceId, sessionData.candidate.address, crmCandidateId);
  const personReference = await crmGateway.getPersonReference(crmCandidateId);

  sessionData.candidate.candidateId = crmCandidateId;
  sessionData.candidate.licenceId = crmLicenceId;
  sessionData.candidate.personReference = personReference;
}

export async function createNewBookingInCrm(sessionData: SessionData, newCandidateAndLicence = false): Promise<void> {
  const crmGateway = new CRMGateway(dynamicsWebApiClient());

  if (newCandidateAndLicence) {
    await createCandidateAndLicence(sessionData);
  } else {
    const licenceAndProduct = await crmGateway.getLicence(sessionData.candidate.licenceNumber);
    sessionData.candidate.candidateId = licenceAndProduct.licence.candidateId;
    sessionData.candidate.licenceId = licenceAndProduct.licence.licenceId;
  }

  const candidateData: Candidate = {
    ...sessionData.candidate,
    licenceId: sessionData.candidate.licenceId,
    candidateId: sessionData.candidate.candidateId,
    licenceNumber: sessionData.candidate.licenceNumber,
  };

  const dvaPriceList = '61e42335-f771-ec11-8943-00224801fa66';
  const dvsaPriceList = ' a4b1b341-79b9-ec11-9840-6045bd0ffa34';
  const priceListId = sessionData.target === Target.NI ? dvaPriceList : dvsaPriceList;

  const priceList: PriceListItem[] = await crmGateway.getPriceList(priceListId, [sessionData.currentBooking.testType]);
  [sessionData.currentBooking.priceList] = priceList;

  // create booking and bookingproduct records
  const bookingResponse = await crmGateway.createBooking(candidateData, sessionData.currentBooking, getAdditionalSupport(sessionData.currentBooking), sessionData.journey.standardAccommodation, priceListId, sessionData.overrideCreatedOnDate);
  sessionData.currentBooking.bookingId = bookingResponse.id;
  sessionData.currentBooking.bookingRef = bookingResponse.reference;
  sessionData.currentBooking.bookingProductRef = `${sessionData.currentBooking.bookingRef}-01`;
  const salesReference = buildPaymentReference(27);
  sessionData.currentBooking.salesReference = salesReference;
  sessionData.currentBooking.bookingProductId = await crmGateway.createBookingProduct(candidateData, sessionData.currentBooking, bookingResponse, sessionData.journey.standardAccommodation, getAdditionalSupport(sessionData.currentBooking), sessionData.overrideCreatedOnDate);

  const isTestTypeZeroCost = isZeroCostTest(sessionData.currentBooking.testType);
  if (isTestTypeZeroCost) {
    await crmGateway.updateZeroCostBooking(sessionData.currentBooking.bookingId);
  } else {
    // create payment records
    const paymentId = await crmGateway.createPayment(sessionData);
    await crmGateway.createFinanceTransaction(sessionData, paymentId);

    // required for CSC bookings to work
    await crmGateway.updatePaymentStatus(sessionData.currentBooking.bookingProductId);

    // link booking and payment
    await crmGateway.createBindBetweenBookingAndPayment(
      sessionData.currentBooking.bookingId,
      paymentId,
      sessionData.currentBooking.receiptReference,
    );
  }

  // set eligibility bypass if required
  if (sessionData.currentBooking.eligibilityBypass) {
    await crmGateway.enableEligibilityBypass(sessionData.currentBooking.bookingId);
  }

  // set test support needs if required for an NSA booking
  if (!sessionData.journey.standardAccommodation && sessionData.currentBooking.testSupportNeeds) {
    await crmGateway.assignTestSupportNeedsToBooking(
      sessionData.currentBooking.bookingId,
      sessionData.currentBooking.testSupportNeeds,
      sessionData.currentBooking.translator,
    );
  }

  // update booking status to confirmed
  await crmGateway.updateBookingStatus(sessionData.currentBooking.bookingId, CRMBookingStatus.Confirmed);

  // set compensation booking assigned and booking status to cancelled if flag is set
  if (sessionData.isCompensationBooking) {
    const isCSCBooking = sessionData.currentBooking.origin === Origin.CustomerServiceCentre;
    await crmGateway.setCompensationBookingAssigned(sessionData.currentBooking.bookingId, dayjs().toISOString());
    await crmGateway.updateBookingStatus(sessionData.currentBooking.bookingId, CRMBookingStatus.Cancelled, isCSCBooking);
  }
}

export async function createNewBookingForPaymentsNotifications(sessionData: SessionData, cancelPayment = true): Promise<void> {
  const crmGateway = new CRMGateway(dynamicsWebApiClient());

  const licenceAndProduct = await crmGateway.getLicence(sessionData.candidate.licenceNumber);
  sessionData.candidate.candidateId = licenceAndProduct.licence.candidateId;
  sessionData.candidate.licenceId = licenceAndProduct.licence.licenceId;

  const candidateData: Candidate = {
    ...sessionData.candidate,
    licenceId: sessionData.candidate.licenceId,
    candidateId: sessionData.candidate.candidateId,
    licenceNumber: sessionData.candidate.licenceNumber,
  };

  const dvaPriceList = '61e42335-f771-ec11-8943-00224801fa66';
  const dvsaPriceList = ' a4b1b341-79b9-ec11-9840-6045bd0ffa34';
  const priceListId = sessionData.target === Target.NI ? dvaPriceList : dvsaPriceList;

  const priceList: PriceListItem[] = await crmGateway.getPriceList(priceListId, [sessionData.currentBooking.testType]);
  [sessionData.currentBooking.priceList] = priceList;

  // create booking and bookingproduct records
  const bookingResponse = await crmGateway.createBooking(candidateData, sessionData.currentBooking, getAdditionalSupport(sessionData.currentBooking), sessionData.journey.standardAccommodation, priceListId, sessionData.overrideCreatedOnDate);
  sessionData.currentBooking.bookingId = bookingResponse.id;
  sessionData.currentBooking.bookingRef = bookingResponse.reference;
  sessionData.currentBooking.bookingProductRef = `${sessionData.currentBooking.bookingRef}-01`;
  const salesReference = buildPaymentReference(27);
  sessionData.currentBooking.salesReference = salesReference;
  sessionData.currentBooking.bookingProductId = await crmGateway.createBookingProduct(candidateData, sessionData.currentBooking, bookingResponse, sessionData.journey.standardAccommodation, getAdditionalSupport(sessionData.currentBooking), sessionData.overrideCreatedOnDate);

  // initate card payment
  const cardPaymentResponse: CardPaymentResponse = await initiateCardPayment(sessionData);

  // link booking and payment
  await crmGateway.createBindBetweenBookingAndPayment(
    sessionData.currentBooking.bookingId,
    cardPaymentResponse.paymentId,
    sessionData.currentBooking.receiptReference,
  );
  console.log(`Booking ref: ${bookingResponse.reference} Booking Id: ${bookingResponse.id} Receipt Reference: ${cardPaymentResponse.receiptReference} Payment Id: ${cardPaymentResponse.paymentId} Created on: ${dayjs().toISOString()}`);

  if (cancelPayment) {
    await t.navigateTo(cardPaymentResponse.gatewayUrl);
    await new PaymentsPage().cancelPayment(sessionData.paymentDetails as CpmsPaymentModel);
  }
}

function getAdditionalSupport(currentBooking: Booking): CRMAdditionalSupport {
  if (currentBooking?.bsl) {
    return CRMAdditionalSupport.BritishSignLanguage;
  }
  if (currentBooking?.voiceover && currentBooking?.voiceover.toLowerCase() === 'welsh') {
    return CRMAdditionalSupport.VoiceoverWelsh;
  }
  if (currentBooking?.voiceover && currentBooking?.voiceover.toLowerCase() === 'english') {
    return CRMAdditionalSupport.VoiceoverEnglish;
  }

  return CRMAdditionalSupport.None;
}
