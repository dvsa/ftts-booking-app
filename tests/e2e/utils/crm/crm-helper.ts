/* eslint-disable no-underscore-dangle */
import dayjs from 'dayjs';
import { ELIG } from '@dvsa/ftts-eligibility-api-model';
import { logger } from '../../../../src/helpers/logger';
import {
  Language, Origin, SupportType, Target, TCNRegion, Voiceover,
} from '../../../../src/domain/enums';
import {
  CRMAdditionalSupport,
  CRMBookingStatus,
  CRMCalendarName,
  CRMGenderCode,
  CRMGovernmentAgency,
  CRMLicenceValidStatus,
  CRMNsaStatus,
  CRMOrigin,
  CRMPeopleTitle,
  CRMPersonType,
  CRMPreferredCommunicationMethod,
  CRMRemit,
  CRMTestLanguage,
  CRMVoiceOver,
} from '../../../../src/services/crm-gateway/enums';
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
  BookingDetailsCentre,
  CandidateResponse,
  NsaBookingFields,
} from '../../../../src/services/crm-gateway/interfaces';
import { CRMSupportHelper } from '../../../../src/services/crm-gateway/crm-support-helper';
import { Booking, Candidate } from '../../data/session-data';
import { mapToCrmContactAddress } from '../../../../src/services/crm-gateway/crm-address-mapper';

export const toCRMOrigin = (origin: Origin): CRMOrigin => ORIGIN_TO_CRMORIGIN.get(origin) as CRMOrigin;

const ORIGIN_TO_CRMORIGIN: Map<Origin, CRMOrigin> = new Map([
  [Origin.CitizenPortal, CRMOrigin.CitizenPortal],
  [Origin.CustomerServiceCentre, CRMOrigin.CustomerServiceCentre],
  [Origin.IHTTCPortal, CRMOrigin.IHTTCPortal],
  [Origin.TrainerBookerPortal, CRMOrigin.TrainerBookerPortal],
]);

export function mapToCRMContact(candidate: Partial<Candidate>): Partial<Omit<CRMContact, 'contactid'>> {
  return {
    ftts_persontype: CRMPersonType.Candidate,
    ftts_firstandmiddlenames: candidate.firstnames,
    lastname: candidate.surname,
    birthdate: candidate.dateOfBirth,
    emailaddress1: candidate.email,
    telephone2: candidate.telephone || undefined,
    ftts_title: mapPeopleTitleStringToCRMPeopleTitle(candidate.title),
    ftts_othertitle: !mapPeopleTitleStringToCRMPeopleTitle(candidate.title) ? candidate.title : undefined,
    ftts_personreference: candidate.personReference,
    gendercode: mapGenderEnumToCRMGenderCode(candidate.gender),
    'ownerid@odata.bind': candidate.ownerId ? `teams(${candidate.ownerId})` : undefined,
    ...mapToCrmContactAddress(candidate.address),
  };
}

export function mapToCRMLicence(candidateId: string, licenceNumber?: string, candidateDetails?: Partial<Candidate>): Partial<CRMLicence> {
  // Use the mapped CRM contact address which already handles edge cases such as empty lines and no city
  const mappedAddress = mapToCrmContactAddress(candidateDetails?.address);
  const contactToLicenceAddress: Partial<CRMLicence> = {
    ftts_address1_street1: mappedAddress?.address1_line1,
    ftts_address1_street2: mappedAddress?.address1_line2,
    ftts_address1street3: mappedAddress?.address1_line3,
    ftts_address1street4: mappedAddress?.ftts_address1_line4,
    ftts_address1_city: mappedAddress?.address1_city,
    ftts_address1_postalcode: mappedAddress?.address1_postalcode,
    'ftts_Person@odata.bind': `contacts(${candidateId})`,
    'ownerid@odata.bind': candidateDetails?.ownerId ? `teams(${candidateDetails?.ownerId})` : undefined,
  };

  if (licenceNumber) {
    return {
      ...contactToLicenceAddress,
      ftts_licence: licenceNumber,
    };
  }
  return {
    ...contactToLicenceAddress,
  };
}

export function mapToCRMBooking(candidate: Candidate, booking: Booking, candidateId: string, licenceId: string, additionalSupport: CRMAdditionalSupport, isStandardAccommodation: boolean, priceListId?: string): CRMBooking {
  if (!candidate.firstnames || !candidate.surname || !candidate.licenceNumber || !candidate.dateOfBirth || (!isStandardAccommodation && !candidate.ownerId)) {
    throw new Error('CRMHelper::mapToCRMBooking: Missing required candidate data');
  }
  if (!booking.dateTime || !booking.centre?.accountId || !booking.testType) {
    if (isStandardAccommodation) {
      throw new Error('CRMHelper::mapToCRMBooking: Missing required booking data');
    }
  }
  return {
    'ftts_candidateid@odata.bind': `contacts(${candidateId})`,
    ftts_name: `${candidate.firstnames} ${candidate.surname}`,
    ftts_firstname: candidate.firstnames,
    ftts_lastname: candidate.surname,
    ftts_drivinglicence: candidate.licenceNumber,
    ftts_dob: candidate.dateOfBirth,
    ftts_origin: toCRMOrigin(booking.origin),
    ftts_pricepaid: (booking.compensationBooking) ? booking.compensationBooking.pricePaid : booking.priceList?.price as number,
    'ftts_pricelist@odata.bind': (booking.compensationBooking) ? `pricelevels(${booking.compensationBooking.priceListId})` : `pricelevels(${priceListId})`,
    'ftts_LicenceId@odata.bind': `ftts_licences(${licenceId})`,
    'ftts_testcentre@odata.bind': `accounts(${booking.centre?.accountId})`,
    ftts_testdate: booking.dateTime,
    ftts_bookingstatus: isStandardAccommodation ? CRMBookingStatus.Reserved : CRMBookingStatus.Draft,
    ftts_language: booking.language?.toLowerCase() === Language.WELSH.toLowerCase() ? CRMTestLanguage.Welsh : CRMTestLanguage.English,
    ftts_licencevalidstatus: CRMLicenceValidStatus.Valid, // TODO: needs to be updated when eligibility checks are implemented (FTT-286)
    ftts_additionalsupportoptions: additionalSupport,
    ftts_nivoiceoveroptions: mapVoiceoverToCRMVoiceover(booking.voiceover),
    ftts_selecteddate: booking.firstSelectedDate || booking.dateTime,
    'ftts_selectedtestcentrelocation@odata.bind': `accounts(${booking.firstSelectedCentre?.accountId || booking.centre?.accountId})`,
    ftts_governmentagency: booking.governmentAgency === Target.GB ? CRMGovernmentAgency.Dvsa : CRMGovernmentAgency.Dva,
    ...mapNsaAttributesToBooking(candidate, booking, isStandardAccommodation),
    ftts_tcnpreferreddate: booking.firstSelectedDate,
    ftts_dateavailableonoraftertoday: booking.dateAvailableOnOrAfterToday,
    ftts_dateavailableonorbeforepreferreddate: booking.dateAvailableOnOrBeforePreferredDate,
    ftts_dateavailableonorafterpreferreddate: booking.dateAvailableOnOrAfterPreferredDate,
    ftts_testsselected: true,
    'ownerid@odata.bind': `teams(${candidate.ownerId})`,
  };
}

function mapNsaAttributesToBooking(candidate: Candidate, booking: Booking, isStandardAccommodation: boolean): NsaBookingFields {
  return {
    ftts_nonstandardaccommodation: !isStandardAccommodation,
    ftts_nsastatus: isStandardAccommodation ? undefined : CRMNsaStatus.AwaitingCscResponse,
    ftts_supportrequirements: isStandardAccommodation ? undefined : new CRMSupportHelper(booking.selectSupportType as SupportType[], booking.customSupport as SupportType).toString(),
    ftts_preferreddateandtime: isStandardAccommodation ? undefined : CRMSupportHelper.getPreferredDayOrLocation(booking.preferredDayOption, booking.preferredDay as string),
    ftts_preferreddateselected: true,
    ftts_preferredtestcentrelocation: isStandardAccommodation ? undefined : CRMSupportHelper.getPreferredDayOrLocation(booking.preferredLocationOption, booking.preferredLocation as string),
    ftts_preferredcommunicationmethod: isStandardAccommodation ? CRMPreferredCommunicationMethod.Email : CRMSupportHelper.preferredCommunicationMethod(candidate.telephone), // If email is provided then put 'Email' here. If telephone contact is yes, then put 'Phone' here.
    ftts_proxypermitted: false,
    ftts_voicemailmessagespermitted: isStandardAccommodation ? undefined : CRMSupportHelper.isVoicemail(candidate.telephone, booking.voicemail as boolean),
    'ownerid@odata.bind': `teams(${candidate.ownerId})`,
  };
}

export function mapToCRMBookingProduct(candidate: Candidate, booking: Booking, bookingResponse: BookingResponse, isStandardAccommodation: boolean, additionalSupport: CRMAdditionalSupport): CRMBookingProduct {
  return {
    'ftts_bookingid@odata.bind': `ftts_bookings(${bookingResponse.id})`,
    'ftts_CandidateId@odata.bind': `contacts(${candidate.candidateId})`,
    'ftts_productid@odata.bind': `products(${booking.priceList?.product.productId})`,
    'ftts_ihttcid@odata.bind': `accounts(${booking.centre?.accountId})`,
    'ftts_drivinglicencenumber@odata.bind': `ftts_licences(${candidate.licenceId})`,
    'ftts_testcategoryId@odata.bind': `products(${booking.priceList?.product?.parentId})`,
    ftts_reference: `${bookingResponse.reference}-01`, // TODO find out if -01 is always the selected booking product
    ftts_drivinglicenceentered: candidate.licenceNumber,
    ftts_price: (booking.compensationBooking) ? booking.compensationBooking.price : booking.priceList?.price as number,
    ftts_bookingstatus: CRMBookingStatus.Reserved,
    ftts_additionalsupportoptions: additionalSupport,
    ftts_testdate: booking.dateTime,
    ftts_testlanguage: booking.language?.toLowerCase() === Language.WELSH.toLowerCase() ? CRMTestLanguage.Welsh : CRMTestLanguage.English,
    ftts_selected: true, // true will associate the booking product with the booking
    ftts_tcn_update_date: dayjs().toISOString(),
    ftts_salesreference: booking.salesReference,
    ftts_personalreferencenumber: candidate.personalReferenceNumber,
    ftts_paymentreferencenumber: candidate.paymentReceiptNumber,
    ftts_eligible: true, // we only create booking products which are eligible,
    ftts_eligiblefrom: booking.eligibility?.eligibleFrom,
    ftts_eligibleto: booking.eligibility?.eligibleTo,
    'ownerid@odata.bind': `teams(${candidate.ownerId})`,
  };
}

export function mapCRMLicenceToLicenceResponse(crmLicence: CRMLicenceResponse[]): LicenceResponse | undefined {
  if (crmLicence.length === 0) {
    logger.info('CRM-HELPER::mapCRMLicenceToLicenceResponse: Candidate was not found in CRM');
    return undefined;
  }
  return {
    // eslint-disable-next-line no-underscore-dangle
    candidateId: crmLicence[0]._ftts_person_value,
    licenceId: crmLicence[0].ftts_licenceid,
    address: {
      line1: crmLicence[0].ftts_address1_street1,
      line2: crmLicence[0].ftts_address1_street2,
      line3: crmLicence[0].ftts_address1street3,
      line4: crmLicence[0].ftts_address1street4,
      line5: crmLicence[0].ftts_address1_city,
      postcode: crmLicence[0].ftts_address1_postalcode,
    },
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
  if (!crmBookingResponse.ftts_reference) {
    throw new Error('CRM-HELPER::mapCRMBookingResponseToBookingResponse: Missing ftts_reference in crm response');
  }
  return {
    id: crmBookingResponse.ftts_bookingid,
    reference: crmBookingResponse.ftts_reference,
  };
}

export function mapToBookingDetails(crmBookingDetails: CRMBookingDetails): BookingDetails {
  if (!crmBookingDetails.ftts_bookingid.ftts_reference || !crmBookingDetails.ftts_bookingstatus || !crmBookingDetails.ftts_testdate || !crmBookingDetails.ftts_productid
    || !crmBookingDetails.ftts_testlanguage || !crmBookingDetails.ftts_voiceoverlanguage || !crmBookingDetails.ftts_salesreference
    || !crmBookingDetails.ftts_bookingid.ftts_origin || crmBookingDetails.ftts_additionalsupportoptions === undefined || crmBookingDetails.ftts_bookingid.ftts_governmentagency === null) {
    throw new Error('CRMHelper::mapToBookingDetails: Missing expected fields in crm response');
  }

  const owedCompensationBooking = crmBookingDetails.ftts_bookingid.ftts_owedcompbookingassigned !== null && crmBookingDetails.ftts_bookingid.ftts_owedcompbookingrecognised === null;

  const booking: BookingDetails = {
    bookingId: crmBookingDetails._ftts_bookingid_value,
    reference: crmBookingDetails.ftts_bookingid.ftts_reference,
    bookingProductId: crmBookingDetails.ftts_bookingproductid,
    bookingProductRef: crmBookingDetails.ftts_reference,
    bookingStatus: crmBookingDetails.ftts_bookingstatus,
    testDate: crmBookingDetails.ftts_testdate,
    testLanguage: crmBookingDetails.ftts_testlanguage,
    voiceoverLanguage: crmBookingDetails.ftts_voiceoverlanguage,
    additionalSupport: crmBookingDetails.ftts_additionalsupportoptions,
    nonStandardAccommodation: crmBookingDetails.ftts_bookingid.ftts_nonstandardaccommodation,
    paymentStatus: crmBookingDetails.ftts_paymentstatus,
    price: crmBookingDetails.ftts_price,
    salesReference: crmBookingDetails.ftts_salesreference,
    origin: crmBookingDetails.ftts_bookingid.ftts_origin,
    governmentAgency: crmBookingDetails.ftts_bookingid.ftts_governmentagency,
    testCentre: {} as BookingDetailsCentre,
    product: crmBookingDetails.ftts_productid,
    createdOn: crmBookingDetails.createdon,
    enableEligibilityBypass: crmBookingDetails.ftts_bookingid.ftts_enableeligibilitybypass,
    compensationAssigned: crmBookingDetails.ftts_bookingid.ftts_owedcompbookingassigned,
    compensationRecognised: crmBookingDetails.ftts_bookingid.ftts_owedcompbookingrecognised,
    isZeroCostBooking: crmBookingDetails.ftts_bookingid.ftts_zerocostbooking,
    owedCompensationBooking,
    testSupportNeed: JSON.parse(`[ ${crmBookingDetails.ftts_bookingid.ftts_testsupportneed} ]`),
    foreignlanguageselected: crmBookingDetails.ftts_bookingid.ftts_foreignlanguageselected,
    nsaStatus: null,
    nsaBookingSlots: null,
    voicemailmessagespermitted: null,
  };

  // Safety check to allow for NSA Bookings that don't have a test centre assigned.
  if (crmBookingDetails.ftts_bookingid.ftts_testcentre) {
    if (!crmBookingDetails.ftts_bookingid.ftts_testcentre.ftts_remit || !crmBookingDetails.ftts_bookingid.ftts_testcentre.ftts_siteid) {
      throw new Error('CRMHelper::mapToBookingDetails: Missing expected fields in crm test centre response');
    }
    booking.testCentre = {
      testCentreId: crmBookingDetails.ftts_bookingid.ftts_testcentre.ftts_tcntestcentreid,
      name: crmBookingDetails.ftts_bookingid.ftts_testcentre.name,
      addressLine1: crmBookingDetails.ftts_bookingid.ftts_testcentre.address1_line1,
      addressLine2: crmBookingDetails.ftts_bookingid.ftts_testcentre.address1_line2,
      addressCity: crmBookingDetails.ftts_bookingid.ftts_testcentre.address1_city,
      addressCounty: crmBookingDetails.ftts_bookingid.ftts_testcentre.address1_county,
      addressPostalCode: crmBookingDetails.ftts_bookingid.ftts_testcentre.address1_postalcode,
      remit: crmBookingDetails.ftts_bookingid.ftts_testcentre.ftts_remit,
      accountId: crmBookingDetails.ftts_bookingid.ftts_testcentre.accountid,
      region: mapCRMRegionToTCNRegion(crmBookingDetails.ftts_bookingid.ftts_testcentre),
      siteId: crmBookingDetails.ftts_bookingid.ftts_testcentre.ftts_siteid,
      ftts_tcntestcentreid: crmBookingDetails.ftts_bookingid.ftts_testcentre.ftts_tcntestcentreid as string,
    };
  }
  return booking;
}

export function mapCRMRegionToTCNRegion(centre: CRMTestCentre): TCNRegion {
  // Every test centre should have one of the 3 region fields set to true
  if (centre.parentaccountid?.ftts_regiona) {
    return TCNRegion.A;
  }
  if (centre.parentaccountid?.ftts_regionb) {
    return TCNRegion.B;
  }
  if (centre.parentaccountid?.ftts_regionc) {
    return TCNRegion.C;
  }
  throw new Error('Unable to map the test centre to a region, all region values are false/missing');
}

export function mapPaymentInformationToBookingDetails(paymentInformation: GetPaymentInformationResponse, bookingDetails: BookingDetails): BookingDetails {
  return {
    ...bookingDetails,
    paymentId: paymentInformation.ftts_payment.ftts_paymentid,
    paymentStatus: paymentInformation.ftts_payment.ftts_status,
    financeTransaction: {
      financeTransactionId: paymentInformation.ftts_financetransactionid,
      transactionStatus: paymentInformation.ftts_status,
      transactionType: paymentInformation.ftts_type,
    },
  };
}

export function mapToCandidate(response: CRMLicenceCandidateResponse): Candidate {
  return {
    candidateId: response.candidateId,
    firstnames: response.firstnames,
    surname: response.surname,
    email: response.email,
    dateOfBirth: response.dateOfBirth,
    licenceId: response.ftts_licenceid,
    licenceNumber: response.ftts_licence,
    personReference: response.personReference,
    address: {
      line1: response.ftts_address1_street1,
      line2: response.ftts_address1_street2,
      line3: response.ftts_address1street3,
      line4: response.ftts_address1street4,
      line5: response.ftts_address1_city,
      postcode: response.ftts_address1_postalcode,
    },
  };
}

export function mapToCandidateResponse(response: CRMContact): Partial<CandidateResponse> {
  return {
    candidateId: response.contactid,
    firstnames: response.ftts_firstandmiddlenames,
    surname: response.lastname,
    email: response.emailaddress1,
    telephone: response.telephone2,
    dateOfBirth: response.birthdate,
    personReference: response.ftts_personreference,
    address: {
      line1: response.address1_line1,
      line2: response.address1_line2,
      line3: response.address1_line3,
      line4: response.ftts_address1_line4,
      line5: response.address1_city,
      postcode: response.address1_postalcode,
    },
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

export function mapPeopleTitleStringToCRMPeopleTitle(title?: string): CRMPeopleTitle | undefined {
  switch (title?.toLowerCase()) {
    case 'mr': return CRMPeopleTitle.MR;
    case 'ms': return CRMPeopleTitle.MS;
    case 'mrs': return CRMPeopleTitle.MRS;
    case 'miss': return CRMPeopleTitle.MISS;
    case 'mx': return CRMPeopleTitle.MX;
    case 'dr': return CRMPeopleTitle.DR;
    case 'doctor': return CRMPeopleTitle.DR;
    default: return undefined;
  }
}

export function mapGenderEnumToCRMGenderCode(gender?: ELIG.CandidateDetails.GenderEnum): CRMGenderCode | undefined {
  switch (gender) {
    case undefined: return undefined;
    case ELIG.CandidateDetails.GenderEnum.M: return CRMGenderCode.Male;
    case ELIG.CandidateDetails.GenderEnum.F: return CRMGenderCode.Female;
    default: return CRMGenderCode.Unknown;
  }
}
