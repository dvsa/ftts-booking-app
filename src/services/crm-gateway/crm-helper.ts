/* eslint-disable no-underscore-dangle */
import { ELIG } from '@dvsa/ftts-eligibility-api-model';
import dayjs from 'dayjs';

import { PageNames } from '@constants';
import { isNsaDraftBooking, logger } from '../../helpers';
import config from '../../config';
import {
  Language, SupportType, Target, TCNRegion, TestSupportNeed, Voiceover,
} from '../../domain/enums';
import {
  CRMAdditionalSupport,
  CRMBookingStatus,
  CRMCalendarName,
  CRMGenderCode,
  CRMGovernmentAgency,
  CRMLicenceValidStatus,
  CRMNsaStatus,
  CRMOrigin, CRMPeopleTitle,
  CRMPersonType,
  CRMPreferredCommunicationMethod,
  CRMRemit,
  CRMTestLanguage,
  CRMTestSupportNeed,
  CRMVoiceOver,
} from './enums';
import {
  CRMBooking,
  CRMBookingProduct,
  CRMBookingResponse,
  CRMContact,
  CRMLicence,
  CRMProduct,
  ProductResponse,
  BookingResponse,
  BookingDetails,
  CRMBookingDetails,
  CRMLicenceCandidateResponse,
  GetPaymentInformationResponse,
  CRMTestCentre,
  BookingDetailsCentre,
  CandidateResponse,
  NsaBookingFields,
  CRMXmlBookingDetails,
} from './interfaces';
import { CRMSupportHelper } from './crm-support-helper';
import { Booking, Candidate } from '../session';
import { mapToCrmContactAddress } from './crm-address-mapper';
import { determineEvidenceRoute } from '../../helpers/evidence-helper';

export function mapToCRMContact(candidate: Partial<Candidate>): Partial<Omit<CRMContact, 'contactid'>> {
  return {
    ftts_persontype: CRMPersonType.Candidate,
    ftts_firstandmiddlenames: candidate.firstnames,
    lastname: candidate.surname,
    birthdate: candidate.dateOfBirth,
    emailaddress1: candidate.email,
    telephone2: candidate.telephone || undefined,
    ftts_title: mapPeopleTitleStringToCRMPeopleTitle(candidate.title),
    ftts_othertitle: mapPeopleTitleStringToCRMPeopleTitle(candidate.title) ? undefined : transformOtherTitle(candidate.title),
    ftts_personreference: candidate.personReference,
    gendercode: mapGenderEnumToCRMGenderCode(candidate.gender),
    'ownerid@odata.bind': candidate.ownerId ? `teams(${candidate.ownerId})` : undefined,
    ...mapToCrmContactAddress(candidate.address),
  };
}

export function transformOtherTitle(title: string | undefined): string | undefined {
  return title === 'OTHER' ? 'Other' : title;
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
    ftts_origin: CRMOrigin.CitizenPortal,
    ftts_pricepaid: (booking.compensationBooking) ? booking.compensationBooking.pricePaid : booking.priceList?.price as number,
    'ftts_pricelist@odata.bind': (booking.compensationBooking) ? `pricelevels(${booking.compensationBooking.priceListId})` : `pricelevels(${priceListId})`,
    'ftts_LicenceId@odata.bind': `ftts_licences(${licenceId})`,
    'ftts_testcentre@odata.bind': isStandardAccommodation ? `accounts(${booking.centre?.accountId})` : undefined,
    ftts_testdate: booking.dateTime,
    ftts_bookingstatus: isStandardAccommodation ? CRMBookingStatus.Reserved : CRMBookingStatus.Draft,
    ftts_language: booking.language?.toLowerCase() === Language.WELSH.toLowerCase() ? CRMTestLanguage.Welsh : CRMTestLanguage.English,
    ftts_licencevalidstatus: CRMLicenceValidStatus.Valid, // TODO: needs to be updated when eligibility checks are implemented (FTT-286)
    ftts_additionalsupportoptions: additionalSupport,
    ftts_nivoiceoveroptions: mapVoiceoverToCRMVoiceover(booking.voiceover),
    ftts_selecteddate: booking.firstSelectedDate || booking.dateTime,
    'ftts_selectedtestcentrelocation@odata.bind': isStandardAccommodation ? `accounts(${booking.firstSelectedCentre?.accountId || booking.centre?.accountId})` : undefined,
    ftts_governmentagency: booking.governmentAgency === Target.GB ? CRMGovernmentAgency.Dvsa : CRMGovernmentAgency.Dva,
    ...mapNsaAttributesToBooking(candidate, booking, isStandardAccommodation),
    ftts_tcnpreferreddate: booking.firstSelectedDate,
    ftts_dateavailableonoraftertoday: booking.dateAvailableOnOrAfterToday,
    ftts_dateavailableonorbeforepreferreddate: booking.dateAvailableOnOrBeforePreferredDate,
    ftts_dateavailableonorafterpreferreddate: booking.dateAvailableOnOrAfterPreferredDate,
    ftts_testsselected: true,
    'ownerid@odata.bind': `teams(${config.crm.ownerId.dvsa})`,
  };
}

function mapNsaAttributesToBooking(candidate: Candidate, booking: Booking, isStandardAccommodation: boolean): NsaBookingFields {
  return {
    ftts_nonstandardaccommodation: !isStandardAccommodation,
    ftts_nsastatus: isStandardAccommodation ? undefined : setNsaStatus(booking),
    ftts_supportrequirements: isStandardAccommodation ? undefined : new CRMSupportHelper(booking.selectSupportType as SupportType[], booking.customSupport as SupportType).toString(booking.translator),
    ftts_preferreddateandtime: isStandardAccommodation ? undefined : CRMSupportHelper.getPreferredDayOrLocation(booking.preferredDayOption, booking.preferredDay as string),
    ftts_preferreddateselected: true,
    ftts_preferredtestcentrelocation: isStandardAccommodation ? undefined : CRMSupportHelper.getPreferredDayOrLocation(booking.preferredLocationOption, booking.preferredLocation as string),
    ftts_preferredcommunicationmethod: isStandardAccommodation ? CRMPreferredCommunicationMethod.Email : CRMSupportHelper.preferredCommunicationMethod(candidate.telephone), // If email is provided then put 'Email' here. If telephone contact is yes, then put 'Phone' here.
    ftts_proxypermitted: false,
    ftts_voicemailmessagespermitted: isStandardAccommodation ? undefined : CRMSupportHelper.isVoicemail(candidate.telephone, booking.voicemail as boolean),
    'ownerid@odata.bind': `teams(${config.crm.ownerId.dvsa})`,
  };
}

export function mapFromCrmXmlBookingDetailsToCRMBookingDetails(crmXmlBookingDetails: CRMXmlBookingDetails): CRMBookingDetails {
  const mappedCRMBookingDetail: CRMBookingDetails = {
    ftts_bookingproductid: crmXmlBookingDetails.ftts_bookingproductid,
    ftts_reference: crmXmlBookingDetails.ftts_reference,
    _ftts_bookingid_value: crmXmlBookingDetails._ftts_bookingid_value,
    ftts_price: crmXmlBookingDetails.ftts_price,
    ftts_bookingstatus: crmXmlBookingDetails.ftts_bookingstatus ?? null,
    ftts_testdate: crmXmlBookingDetails.ftts_testdate ?? null,
    ftts_testlanguage: crmXmlBookingDetails.ftts_testlanguage ?? null,
    ftts_voiceoverlanguage: crmXmlBookingDetails.ftts_voiceoverlanguage ?? null,
    ftts_paymentstatus: crmXmlBookingDetails.ftts_paymentstatus ?? null,
    ftts_salesreference: crmXmlBookingDetails.ftts_salesreference ?? null,
    ftts_additionalsupportoptions: crmXmlBookingDetails.ftts_additionalsupportoptions ?? null,
    ftts_bookingid: {
      ftts_governmentagency: crmXmlBookingDetails['booking.ftts_governmentagency'] ?? null,
      ftts_reference: crmXmlBookingDetails.bookingReference ?? null,
      ftts_origin: crmXmlBookingDetails['booking.ftts_origin'] ?? null,
      ftts_testcentre: {} as CRMTestCentre,
      ftts_enableeligibilitybypass: crmXmlBookingDetails['booking.ftts_enableeligibilitybypass'] ?? null,
      ftts_nonstandardaccommodation: crmXmlBookingDetails['booking.ftts_nonstandardaccommodation'] ?? null,
      ftts_nsastatus: crmXmlBookingDetails['booking.ftts_nsastatus'] ?? null,
      ftts_owedcompbookingassigned: crmXmlBookingDetails['booking.ftts_owedcompbookingassigned'] ?? null,
      ftts_owedcompbookingrecognised: crmXmlBookingDetails['booking.ftts_owedcompbookingrecognised'] ?? null,
      ftts_zerocostbooking: crmXmlBookingDetails['booking.ftts_zerocostbooking'] ?? null,
      ftts_testsupportneed: crmXmlBookingDetails['booking.ftts_testsupportneed'] ?? null,
      ftts_foreignlanguageselected: crmXmlBookingDetails['booking.ftts_foreignlanguageselected'] ?? null,
      ftts_voicemailmessagespermitted: crmXmlBookingDetails['booking.ftts_voicemailmessagespermitted'] ?? null,
      ftts_nivoiceoveroptions: crmXmlBookingDetails['booking.ftts_nivoiceoveroptions'] ?? null,
    },
    ftts_nsabookingslots: crmXmlBookingDetails.ftts_nsabookingslots ?? null,
    ftts_productid: {
      name: crmXmlBookingDetails['product.name'],
      productid: crmXmlBookingDetails['product.productid'],
      productnumber: crmXmlBookingDetails['product.productnumber'],
      _parentproductid_value: crmXmlBookingDetails['product.parentproductid'],
    },
    createdon: crmXmlBookingDetails.createdon,
  };

  if (!crmXmlBookingDetails['account.ftts_tcntestcentreid']) {
    mappedCRMBookingDetail.ftts_bookingid.ftts_testcentre = null;
  } else {
    mappedCRMBookingDetail.ftts_bookingid.ftts_testcentre = {
      name: crmXmlBookingDetails['account.name'] as string,
      address1_line1: crmXmlBookingDetails['account.address1_line1'] as string,
      address1_line2: crmXmlBookingDetails['account.address1_line2'],
      address1_city: crmXmlBookingDetails['account.address1_city'] as string,
      address1_county: crmXmlBookingDetails['account.address1_county'] as string,
      address1_postalcode: crmXmlBookingDetails['account.address1_postalcode'] as string,
      ftts_remit: crmXmlBookingDetails['account.ftts_remit'],
      ftts_siteid: crmXmlBookingDetails['account.ftts_siteid'],
      accountid: crmXmlBookingDetails['account.accountid'],
      ftts_tcntestcentreid: crmXmlBookingDetails['account.ftts_tcntestcentreid'],
      parentaccountid: {
        ftts_regiona: crmXmlBookingDetails['parentaccountid.ftts_regiona'] as boolean,
        ftts_regionb: crmXmlBookingDetails['parentaccountid.ftts_regionb'] as boolean,
        ftts_regionc: crmXmlBookingDetails['parentaccountid.ftts_regionc'] as boolean,
      },
    };
  }

  return mappedCRMBookingDetail;
}

export function mapToCRMBookingProduct(candidate: Candidate, booking: Booking, bookingResponse: BookingResponse, isStandardAccommodation: boolean, additionalSupport: CRMAdditionalSupport): CRMBookingProduct {
  return {
    'ftts_bookingid@odata.bind': `ftts_bookings(${bookingResponse.id})`,
    'ftts_CandidateId@odata.bind': `contacts(${candidate.candidateId})`,
    'ftts_productid@odata.bind': `products(${booking.priceList?.product.productId})`,
    'ftts_ihttcid@odata.bind': isStandardAccommodation ? `accounts(${booking.centre?.accountId})` : undefined,
    'ftts_drivinglicencenumber@odata.bind': `ftts_licences(${candidate.licenceId})`,
    'ftts_testcategoryId@odata.bind': `products(${booking.priceList?.product?.parentId})`,
    ftts_reference: `${bookingResponse.reference}-01`,
    ftts_drivinglicenceentered: candidate.licenceNumber,
    ftts_price: (booking.compensationBooking) ? booking.compensationBooking.price : booking.priceList?.price as number,
    ftts_bookingstatus: isStandardAccommodation ? CRMBookingStatus.Reserved : CRMBookingStatus.Draft,
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
    'ownerid@odata.bind': `teams(${config.crm.ownerId.dvsa})`,
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
    throw new Error('CRMHelper::mapCRMBookingResponseToBookingResponse: Missing ftts_reference in crm response');
  }
  return {
    id: crmBookingResponse.ftts_bookingid,
    reference: crmBookingResponse.ftts_reference,
    firstName: crmBookingResponse.ftts_firstname,
    lastName: crmBookingResponse.ftts_lastname,
    candidateId: crmBookingResponse._ftts_candidateid_value,
    licenceId: crmBookingResponse._ftts_licenceid_value,
  };
}

export function mapToBookingDetails(crmBookingDetails: CRMBookingDetails): BookingDetails {
  const isAnNsaDraftBooking = isNsaDraftBooking(crmBookingDetails);
  const missingFields = getMissingFields(crmBookingDetails, isAnNsaDraftBooking);

  if (missingFields.length > 0) {
    logger.warn('CRMHelper::mapToBookingDetails: Missing fields to map', {
      missingFields,
      bookingid: crmBookingDetails._ftts_bookingid_value,
    });
    throw new Error('CRMHelper::mapToBookingDetails: Missing expected fields in crm response');
  }

  const owedCompensationBooking = crmBookingDetails.ftts_bookingid.ftts_owedcompbookingassigned !== null && crmBookingDetails.ftts_bookingid.ftts_owedcompbookingrecognised === null;

  const booking: BookingDetails = {
    bookingId: crmBookingDetails._ftts_bookingid_value,
    reference: crmBookingDetails.ftts_bookingid.ftts_reference as string,
    bookingProductId: crmBookingDetails.ftts_bookingproductid,
    bookingProductRef: crmBookingDetails.ftts_reference,
    bookingStatus: crmBookingDetails.ftts_bookingstatus as CRMBookingStatus,
    testDate: crmBookingDetails.ftts_testdate,
    testLanguage: crmBookingDetails.ftts_testlanguage as CRMTestLanguage,
    voiceoverLanguage: (isAnNsaDraftBooking ? crmBookingDetails.ftts_bookingid.ftts_nivoiceoveroptions : crmBookingDetails.ftts_voiceoverlanguage) as CRMVoiceOver,
    additionalSupport: crmBookingDetails.ftts_additionalsupportoptions,
    nonStandardAccommodation: crmBookingDetails.ftts_bookingid.ftts_nonstandardaccommodation,
    nsaStatus: crmBookingDetails.ftts_bookingid.ftts_nsastatus,
    paymentStatus: crmBookingDetails.ftts_paymentstatus,
    price: crmBookingDetails.ftts_price,
    salesReference: crmBookingDetails.ftts_salesreference,
    origin: crmBookingDetails.ftts_bookingid.ftts_origin as CRMOrigin,
    governmentAgency: crmBookingDetails.ftts_bookingid.ftts_governmentagency as CRMGovernmentAgency,
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
    nsaBookingSlots: crmBookingDetails.ftts_nsabookingslots,
    voicemailmessagespermitted: crmBookingDetails.ftts_bookingid.ftts_voicemailmessagespermitted,
  };

  // Safety check to allow for NSA Bookings that don't have a test centre assigned.
  if (crmBookingDetails.ftts_bookingid.ftts_testcentre) {
    booking.testCentre = {
      testCentreId: crmBookingDetails.ftts_bookingid.ftts_testcentre.ftts_tcntestcentreid,
      name: crmBookingDetails.ftts_bookingid.ftts_testcentre.name,
      addressLine1: crmBookingDetails.ftts_bookingid.ftts_testcentre.address1_line1,
      addressLine2: crmBookingDetails.ftts_bookingid.ftts_testcentre.address1_line2,
      addressCity: crmBookingDetails.ftts_bookingid.ftts_testcentre.address1_city,
      addressCounty: crmBookingDetails.ftts_bookingid.ftts_testcentre.address1_county,
      addressPostalCode: crmBookingDetails.ftts_bookingid.ftts_testcentre.address1_postalcode,
      remit: crmBookingDetails.ftts_bookingid.ftts_testcentre.ftts_remit as CRMRemit,
      accountId: crmBookingDetails.ftts_bookingid.ftts_testcentre.accountid,
      region: mapCRMRegionToTCNRegion(crmBookingDetails.ftts_bookingid.ftts_testcentre),
      siteId: crmBookingDetails.ftts_bookingid.ftts_testcentre.ftts_siteid as string,
      ftts_tcntestcentreid: crmBookingDetails.ftts_bookingid.ftts_testcentre.ftts_tcntestcentreid as string,
    };
  }
  return booking;
}

export function getMissingFields(crmBookingDetails: CRMBookingDetails, isAnNsaDraftBooking: boolean): string[] {
  const possibleMissingSharedFields = ['ftts_bookingstatus', 'ftts_productid', 'ftts_testlanguage', 'ftts_additionalsupportoptions'];
  const possibleMissingBookingIdSharedFields = ['ftts_reference', 'ftts_origin', 'ftts_governmentagency'];
  const possibleMissingTestCentreFields = ['ftts_remit', 'ftts_siteid'];

  const possibleMissingStandardFields = [...possibleMissingSharedFields, 'ftts_salesreference', 'ftts_testdate', 'ftts_voiceoverlanguage'];
  const possibleMissingBookingIdFieldsNsa = [...possibleMissingBookingIdSharedFields, 'ftts_nivoiceoveroptions'];

  const actualMissingFields: string[] = [];
  if (isAnNsaDraftBooking) {
    possibleMissingSharedFields.forEach((missingField) => {
      const field = crmBookingDetails[missingField as keyof CRMBookingDetails];
      if (missingField === 'ftts_additionalsupportoptions') {
        if (field === undefined) {
          actualMissingFields.push(missingField);
        }
      } else if (!field) {
        actualMissingFields.push(missingField);
      }
    });
    possibleMissingBookingIdFieldsNsa.forEach((missingField) => {
      const field = crmBookingDetails.ftts_bookingid[missingField as keyof CRMBookingDetails['ftts_bookingid']];
      if (missingField === 'ftts_governmentagency') {
        if (field === null) {
          actualMissingFields.push(missingField);
        }
      } else if (!field) {
        actualMissingFields.push(missingField);
      }
    });
  } else {
    possibleMissingStandardFields.forEach((missingField) => {
      const field = crmBookingDetails[missingField as keyof CRMBookingDetails];
      if (missingField === 'ftts_additionalsupportoptions') {
        if (field === undefined) {
          actualMissingFields.push(missingField);
        }
      } else if (!field) {
        actualMissingFields.push(missingField);
      }
    });
    possibleMissingBookingIdSharedFields.forEach((missingField) => {
      const field = crmBookingDetails.ftts_bookingid[missingField as keyof CRMBookingDetails['ftts_bookingid']];
      if (missingField === 'ftts_governmentagency') {
        if (field === null) {
          actualMissingFields.push(missingField);
        }
      } else if (!field) {
        actualMissingFields.push(missingField);
      }
    });
  }

  if (crmBookingDetails.ftts_bookingid.ftts_testcentre) {
    possibleMissingTestCentreFields.forEach((missingField) => {
      const field = (crmBookingDetails.ftts_bookingid.ftts_testcentre as CRMTestCentre)[missingField as keyof CRMBookingDetails['ftts_bookingid']['ftts_testcentre']];
      if (!field) {
        actualMissingFields.push(missingField);
      }
    });
  }
  return actualMissingFields;
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
    telephone: response.telephone,
    title: mapCRMPeopleTitleToString(response.title),
    gender: mapCRMGenderCodeToGenderEnum(response.gender),
    address: {
      line1: response.ftts_address1_street1,
      line2: response.ftts_address1_street2,
      line3: response.ftts_address1street3,
      line4: response.ftts_address1street4,
      line5: response.ftts_address1_city,
      postcode: response.ftts_address1_postalcode,
    },
    supportNeedName: response.supportNeedName,
    supportEvidenceStatus: response.supportEvidenceStatus,
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

export function mapVoiceoverToCRMVoiceover(voiceover: Voiceover | undefined): CRMVoiceOver {
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
  switch (title?.toLowerCase().trim()) {
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

export function mapToSupportType(supports: CRMTestSupportNeed[] | null): TestSupportNeed[] {
  if (supports === null || supports === undefined || supports.length === 0) {
    return [TestSupportNeed.NoSupport];
  }
  return supports.map((support) => {
    switch (support) {
      case CRMTestSupportNeed.BSLInterpreter: return TestSupportNeed.BSLInterpreter;
      case CRMTestSupportNeed.ExtraTime: return TestSupportNeed.ExtraTime;
      case CRMTestSupportNeed.ExtraTimeWithBreak: return TestSupportNeed.ExtraTimeWithBreak;
      case CRMTestSupportNeed.ForeignLanguageInterpreter: return TestSupportNeed.ForeignLanguageInterpreter;
      case CRMTestSupportNeed.HomeTest: return TestSupportNeed.HomeTest;
      case CRMTestSupportNeed.LipSpeaker: return TestSupportNeed.LipSpeaker;
      case CRMTestSupportNeed.NonStandardAccommodationRequest: return TestSupportNeed.NonStandardAccommodationRequest;
      case CRMTestSupportNeed.OralLanguageModifier: return TestSupportNeed.OralLanguageModifier;
      case CRMTestSupportNeed.OtherSigner: return TestSupportNeed.OtherSigner;
      case CRMTestSupportNeed.Reader: return TestSupportNeed.Reader;
      case CRMTestSupportNeed.FamiliarReaderToCandidate: return TestSupportNeed.FamiliarReaderToCandidate;
      case CRMTestSupportNeed.Reader_Recorder: return TestSupportNeed.Reader_Recorder;
      case CRMTestSupportNeed.SeperateRoom: return TestSupportNeed.SeperateRoom;
      case CRMTestSupportNeed.TestInIsolation: return TestSupportNeed.TestInIsolation;
      case CRMTestSupportNeed.SpecialTestingEquipment: return TestSupportNeed.SpecialTestingEquipment;
      default: return TestSupportNeed.NoSupport;
    }
  });
}

export function mapCRMPeopleTitleToString(title?: CRMPeopleTitle): string | undefined {
  switch (title) {
    case CRMPeopleTitle.MR: return 'mr';
    case CRMPeopleTitle.MS: return 'ms';
    case CRMPeopleTitle.MRS: return 'mrs';
    case CRMPeopleTitle.MISS: return 'miss';
    case CRMPeopleTitle.MX: return 'mx';
    case CRMPeopleTitle.DR: return 'dr';
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

export function mapCRMGenderCodeToGenderEnum(gender?: CRMGenderCode): ELIG.CandidateDetails.GenderEnum | undefined {
  switch (gender) {
    case undefined: return undefined;
    case CRMGenderCode.Male: return ELIG.CandidateDetails.GenderEnum.M;
    case CRMGenderCode.Female: return ELIG.CandidateDetails.GenderEnum.F;
    default: return ELIG.CandidateDetails.GenderEnum.U;
  }
}

function setNsaStatus(booking: Booking): CRMNsaStatus {
  if (!booking.selectSupportType || booking.hasSupportNeedsInCRM === undefined) {
    throw new Error('CRMHelper::setNsaStatus: Missing candidate support data from booking');
  }
  const evidenceRoute = determineEvidenceRoute(booking.selectSupportType, booking.hasSupportNeedsInCRM);

  if (evidenceRoute === PageNames.EVIDENCE_REQUIRED) {
    return CRMNsaStatus.AwaitingCandidateMedicalEvidence;
  }

  return CRMNsaStatus.AwaitingCscResponse;
}

export function hasCRMSupportNeeds(candidate: Candidate): boolean {
  if (candidate.supportNeedName && candidate.supportEvidenceStatus) {
    return true;
  }
  return false;
}
