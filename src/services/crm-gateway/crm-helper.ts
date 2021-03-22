/* eslint-disable no-underscore-dangle */
import dayjs from 'dayjs';
import config from '../../config';
import logger from '../../helpers/logger';
import { LANGUAGE, TCNRegion, Voiceover } from '../../domain/enums';
import { Candidate, Booking } from '../session';
import {
  CRMAdditionalSupport,
  CRMBookingStatus,
  CRMCalendarName,
  CRMLicenceValidStatus,
  CRMOrigin, CRMPeopleTitle,
  CRMRemit,
  CRMTestLanguage,
  CRMVoiceOver,
} from './enums';
import {
  CRMBooking,
  CRMBookingProduct,
  CRMBookingResponse,
  CRMContact,
  CRMLicence,
  CRMProduct,
  LicenceResponse,
  ProductResponse,
  BookingResponse,
  CRMLicenceResponse,
  BookingDetails,
  CRMBookingDetails,
  CRMLicenceCandidateResponse,
  GetPaymentInformationResponse,
  CRMTestCentre,
} from './interfaces';
import { fromCRMTestType, toCRMTestType } from './maps';

export function mapToCRMContact(candidate: Candidate): CRMContact {
  return {
    ftts_firstandmiddlenames: candidate.firstnames,
    lastname: candidate.surname,
    birthdate: candidate.dateOfBirth,
    emailaddress1: candidate.email,
    ftts_title: CRMPeopleTitle.MR, // TODO populate title from DVLA - Eligibility API epic FTT-5729
    ftts_personreference: candidate.personReference,
  };
}

export function mapToCRMLicence(candidateId: string, licenceNumber: string): CRMLicence {
  return {
    ftts_licence: licenceNumber,
    'ftts_Person@odata.bind': `$${candidateId}`,
  };
}

export function mapToCRMBooking(candidate: Candidate, booking: Booking, candidateId: string, licenceId: string, additionalSupport: CRMAdditionalSupport, isMultiRequest: boolean): CRMBooking {
  return {
    'ftts_candidateid@odata.bind': isMultiRequest ? `$${candidateId}` : `contacts(${candidateId})`,
    ftts_name: `${candidate.firstnames} ${candidate.surname}`,
    ftts_firstname: candidate.firstnames,
    ftts_lastname: candidate.surname,
    ftts_drivinglicence: candidate.licenceNumber,
    ftts_dob: candidate.dateOfBirth,
    ftts_origin: CRMOrigin.CitizenPortal,
    ftts_pricelist: null,
    'ftts_LicenceId@odata.bind': isMultiRequest ? `$${licenceId}` : `ftts_licences(${licenceId})`,
    'ftts_testcentre@odata.bind': `accounts(${booking.centre.accountId})`,
    ftts_testdate: booking.dateTime,
    ftts_bookingstatus: CRMBookingStatus.Reserved,
    ftts_language: booking.language?.toLowerCase() === LANGUAGE.WELSH.toLowerCase() ? CRMTestLanguage.Welsh : CRMTestLanguage.English,
    ftts_licencevalidstatus: CRMLicenceValidStatus.Valid, // TODO: needs to be updated when eligibility checks are implemented (FTT-286)
    ftts_testtype: toCRMTestType(booking.testType),
    ftts_additionalsupportoptions: additionalSupport,
    ftts_nivoiceoveroptions: mapVoiceoverToCRMVoiceover(booking.voiceover),
  };
}

export function mapToCRMBookingProduct(candidate: Candidate, booking: Booking, product: ProductResponse, bookingResponse: BookingResponse): CRMBookingProduct {
  return {
    'ftts_bookingid@odata.bind': `ftts_bookings(${bookingResponse.id})`,
    'ftts_CandidateId@odata.bind': `contacts(${candidate.candidateId})`,
    'ftts_productid@odata.bind': `products(${product.id})`,
    'ftts_ihttcid@odata.bind': `accounts(${booking.centre.accountId})`,
    'ftts_drivinglicencenumber@odata.bind': `ftts_licences(${candidate.licenceId})`,
    'ftts_testcategoryId@odata.bind': `products(${product.parentId})`,
    ftts_reference: `${bookingResponse.reference}-01`,
    ftts_drivinglicenceentered: candidate.licenceNumber,
    ftts_price: parseFloat(config.view.theoryTestPriceInGbp), // hardcoded for now
    ftts_bookingstatus: CRMBookingStatus.Reserved,
    ftts_testdate: booking.dateTime,
    ftts_testlanguage: booking.language?.toLowerCase() === LANGUAGE.WELSH.toLowerCase() ? CRMTestLanguage.Welsh : CRMTestLanguage.English,
    ftts_selected: true, // true will associate the booking product with the booking
    ftts_tcn_update_date: dayjs().toISOString(),
    ftts_salesreference: booking.salesReference,
  };
}

export function mapCRMLicenceToLicenceResponse(crmLicence: CRMLicenceResponse[]): LicenceResponse | undefined {
  if (crmLicence.length === 0) {
    logger.log('Candidate was not found in CRM');
    return undefined;
  }
  return {
    // eslint-disable-next-line no-underscore-dangle
    candidateId: crmLicence[0]._ftts_person_value,
    licenceId: crmLicence[0].ftts_licenceid,
  };
}

export function mapCRMProductToProductResponse(crmProduct: CRMProduct[]): ProductResponse {
  if (crmProduct.length === 0) {
    throw new Error('No Product Found in CRM');
  }
  return {
    id: crmProduct[0].productid,
    // eslint-disable-next-line no-underscore-dangle
    parentId: crmProduct[0]._parentproductid_value,
  };
}

export function mapCRMBookingResponseToBookingResponse(crmBookingResponse: CRMBookingResponse): BookingResponse {
  return {
    id: crmBookingResponse.ftts_bookingid,
    reference: crmBookingResponse.ftts_reference,
  };
}

export function mapToBookingDetails(crmBookingDetails: CRMBookingDetails): BookingDetails {
  return {
    bookingProductId: crmBookingDetails.ftts_bookingproductid,
    reference: crmBookingDetails.ftts_bookingid.ftts_reference,
    bookingId: crmBookingDetails._ftts_bookingid_value,
    bookingStatus: crmBookingDetails.ftts_bookingstatus,
    testDate: crmBookingDetails.ftts_testdate,
    testLanguage: crmBookingDetails.ftts_testlanguage,
    voiceoverLanguage: crmBookingDetails.ftts_voiceoverlanguage,
    additionalSupport: crmBookingDetails.ftts_additionalsupportoptions,
    paymentStatus: crmBookingDetails.ftts_paymentstatus,
    price: crmBookingDetails.ftts_price,
    salesReference: crmBookingDetails.ftts_salesreference,
    testType: fromCRMTestType(crmBookingDetails.ftts_bookingid.ftts_testtype),
    origin: crmBookingDetails.ftts_bookingid.ftts_origin,
    testCentre: {
      testCentreId: crmBookingDetails.ftts_bookingid.ftts_testcentre.ftts_siteid,
      name: crmBookingDetails.ftts_bookingid.ftts_testcentre.name,
      addressLine1: crmBookingDetails.ftts_bookingid.ftts_testcentre.address1_line1,
      addressLine2: crmBookingDetails.ftts_bookingid.ftts_testcentre.address1_line2,
      addressCity: crmBookingDetails.ftts_bookingid.ftts_testcentre.address1_city,
      addressCounty: crmBookingDetails.ftts_bookingid.ftts_testcentre.address1_county,
      addressPostalCode: crmBookingDetails.ftts_bookingid.ftts_testcentre.address1_postalcode,
      remit: crmBookingDetails.ftts_bookingid.ftts_testcentre.ftts_remit,
      accountId: crmBookingDetails.ftts_bookingid.ftts_testcentre.account_id,
      region: mapCRMRegionToTCNRegion(crmBookingDetails.ftts_bookingid.ftts_testcentre),
      siteId: crmBookingDetails.ftts_bookingid.ftts_testcentre.ftts_siteid as string,
    },
  };
}

export function mapCRMRegionToTCNRegion(centre: CRMTestCentre): TCNRegion {
  // Every test centre should have one of the 3 region fields set to true
  if (centre.ftts_regiona) {
    return TCNRegion.A;
  }
  if (centre.ftts_regionb) {
    return TCNRegion.B;
  }
  if (centre.ftts_regionc) {
    return TCNRegion.C;
  }
  throw new Error('Unable to map the test centre to a region, all region values are false');
}

export function mapPaymentInformationToBookingDetails(paymentInformation: GetPaymentInformationResponse, bookingDetails: BookingDetails): BookingDetails {
  return {
    ...bookingDetails,
    payment: {
      paymentId: paymentInformation.ftts_payment.ftts_paymentid,
      paymentStatus: paymentInformation.ftts_payment.ftts_status,
    },
    financeTransaction: {
      financeTransactionId: paymentInformation.ftts_financetransactionid,
      transactionStatus: paymentInformation.ftts_status,
      transactionType: paymentInformation.ftts_type,
    },
  };
}

export function mapToCandidate(response: CRMLicenceCandidateResponse): Candidate {
  return {
    candidateId: response.ftts_Person.contactid,
    firstnames: response.ftts_Person.ftts_firstandmiddlenames,
    surname: response.ftts_Person.lastname,
    email: response.ftts_Person.emailaddress1,
    dateOfBirth: response.ftts_Person.birthdate,
    licenceId: response.ftts_licenceid,
    licenceNumber: response.ftts_licence,
    personReference: response.ftts_Person.ftts_personreference,
  };
}

export function mapCRMRemitToCRMCalendarName(remit: CRMRemit): CRMCalendarName {
  switch (remit) {
    case CRMRemit.England: return CRMCalendarName.England;
    case CRMRemit.NorthernIreland: return CRMCalendarName.NorthernIreland;
    case CRMRemit.Scotland: return CRMCalendarName.Scotland;
    case CRMRemit.Wales: return CRMCalendarName.Wales;
    default: throw Error(`Invalid value for remit. Value: ${remit}`);
  }
}

export function mapVoiceoverToCRMVoiceover(voiceover: Voiceover): CRMVoiceOver {
  switch (voiceover) {
    case Voiceover.ARABIC: return CRMVoiceOver.Arabic;
    case Voiceover.CANTONESE: return CRMVoiceOver.Cantonese;
    case Voiceover.ENGLISH: return CRMVoiceOver.English;
    case Voiceover.FARSI: return CRMVoiceOver.Farsi;
    case Voiceover.POLISH: return CRMVoiceOver.Polish;
    case Voiceover.PORTUGUESE: return CRMVoiceOver.Portuguese;
    case Voiceover.TURKISH: return CRMVoiceOver.Turkish;
    case Voiceover.WELSH: return CRMVoiceOver.Welsh;
    case Voiceover.NONE:
    default: return CRMVoiceOver.None;
  }
}
