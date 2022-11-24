import MockDate from 'mockdate';
import { ELIG } from '@dvsa/ftts-eligibility-api-model';
import { mocked } from 'ts-jest/utils';
import { Centre } from '../../../../src/domain/types';
import {
  Language, SupportType, TCNRegion, TestSupportNeed, TestType, Voiceover,
} from '../../../../src/domain/enums';
import {
  getMissingFields,
  hasCRMSupportNeeds,
  mapCRMBookingResponseToBookingResponse,
  mapCRMGenderCodeToGenderEnum,
  mapCRMPeopleTitleToString,
  mapCRMProductToProductResponse,
  mapCRMRegionToTCNRegion,
  mapCRMRemitToCRMCalendarName,
  mapFromCrmXmlBookingDetailsToCRMBookingDetails,
  mapGenderEnumToCRMGenderCode,
  mapPaymentInformationToBookingDetails,
  mapPeopleTitleStringToCRMPeopleTitle,
  mapToBookingDetails,
  mapToCandidate,
  mapToCandidateResponse,
  mapToCRMBooking,
  mapToCRMBookingProduct,
  mapToCRMContact,
  mapToCRMLicence,
  mapToSupportType,
  mapVoiceoverToCRMVoiceover,
  transformOtherTitle,
} from '../../../../src/services/crm-gateway/crm-helper';
import {
  CRMAdditionalSupport,
  CRMBookingStatus,
  CRMCalendarName,
  CRMFinanceTransactionStatus,
  CRMGenderCode,
  CRMGovernmentAgency,
  CRMLicenceValidStatus,
  CRMNsaBookingSlotStatus,
  CRMNsaStatus,
  CRMOrigin,
  CRMPaymentStatus,
  CRMPeopleTitle,
  CRMPersonType,
  CRMProductNumber,
  CRMRemit,
  CRMTestLanguage,
  CRMTestSupportNeed,
  CRMTransactionType,
  CRMVoiceOver,
} from '../../../../src/services/crm-gateway/enums';
import {
  BookingDetails,
  BookingResponse,
  CRMBookingDetails,
  CRMBookingResponse,
  CRMContact,
  CRMLicenceCandidateResponse,
  CRMProduct,
  CRMTestCentre,
  CRMXmlBookingDetails,
  GetPaymentInformationResponse,
} from '../../../../src/services/crm-gateway/interfaces';
import { Booking, Candidate } from '../../../../src/services/session';
import config from '../../../../src/config';
import { crmBookingDetailsBuilder } from '../../../mocks/data/builders';

describe('crm-helper.ts', () => {
  const candidateId = 'candidate-id';
  const licenceId = 'licence-id';
  const licenceNumber = 'licence-number';
  const dvsaTeam = 'dvsa-team';
  let mockCandidate: Candidate;
  let mockBooking: Booking;
  const mockConfig = mocked(config, true);
  mockConfig.crm.ownerId.dvsa = dvsaTeam;

  const mockEligibility = {
    testType: TestType.CAR,
    eligible: true,
    eligibleFrom: '2020-01-01',
    eligibleTo: '2030-01-01',
  };

  beforeEach(() => {
    const date = new Date('2020-11-11T14:30:45.979Z');
    MockDate.set(date);
    mockCandidate = {
      title: 'Mr',
      gender: ELIG.CandidateDetails.GenderEnum.M,
      firstnames: 'Test',
      surname: 'User',
      dateOfBirth: '2000-01-01',
      email: 'test@user.com',
      personReference: '342467342',
      address: {
        line1: '24 Somewhere Street',
        line2: 'Somewhere',
        line3: 'Nowhere town',
        line4: undefined,
        line5: 'Birmingham',
        postcode: 'B5 1AA',
      },
      eligibilities: [],
      eligibleToBookOnline: true,
      behaviouralMarker: false,
      candidateId,
      licenceId,
      licenceNumber,
      personalReferenceNumber: '123456',
      paymentReceiptNumber: '1234567890123456',
      ownerId: dvsaTeam,
    };
    mockBooking = {
      testType: TestType.CAR,
      dateTime: '2020-01-01',
      language: Language.WELSH,
      voiceover: Voiceover.NONE,
      selectSupportType: [],
      hasSupportNeedsInCRM: false,
      salesReference: 'sales-ref',
      centre: {
        accountId: 'test-centre-id',
      } as Centre,
      firstSelectedDate: '2020-01-02',
      firstSelectedCentre: {
        accountId: 'first-selected-test-centre-id',
      } as Centre,
      priceList: {
        testType: TestType.CAR,
        price: 23,
        product: {
          productId: 'mockProductId',
          parentId: 'mockParentId',
          name: 'mockName',
        },
      },
      compensationBooking: {
        bookingProductId: 'mock-booking-id',
        bookingProductReference: 'mock-product-reference',
        bookingId: 'mock-booking-id',
        bookingStatus: CRMBookingStatus.Assigned,
        candidateId: 'mock-candidate-id',
        compensationAssigned: 'mock-assigned',
        compensationRecognised: 'mock-recognised',
        productNumber: CRMProductNumber.CAR,
        pricePaid: 30,
        price: 20,
        priceListId: 'mock-price-list-id',
      },
      eligibility: mockEligibility,
    } as Booking;
  });

  afterEach(() => {
    MockDate.reset();
  });

  describe('mapToCRMContact', () => {
    test('correctly maps a Candidate to a CRM Candidate', () => {
      expect(mapToCRMContact(mockCandidate)).toStrictEqual({
        ftts_firstandmiddlenames: mockCandidate.firstnames,
        lastname: mockCandidate.surname,
        birthdate: mockCandidate.dateOfBirth,
        emailaddress1: mockCandidate.email,
        telephone2: undefined,
        ftts_title: CRMPeopleTitle.MR,
        ftts_othertitle: undefined,
        ftts_persontype: CRMPersonType.Candidate,
        ftts_personreference: mockCandidate.personReference,
        address1_line1: mockCandidate.address?.line1,
        address1_line2: mockCandidate.address?.line2,
        address1_line3: mockCandidate.address?.line3,
        ftts_address1_line4: mockCandidate.address?.line4,
        address1_city: mockCandidate.address?.line5,
        address1_postalcode: mockCandidate.address?.postcode,
        gendercode: CRMGenderCode.Male,
        'ownerid@odata.bind': `teams(${dvsaTeam})`,
      });
    });

    test('correctly maps a title out of scope to the other title field', () => {
      mockCandidate.title = 'Lord';
      expect(mapToCRMContact(mockCandidate)).toStrictEqual({
        ftts_firstandmiddlenames: mockCandidate.firstnames,
        lastname: mockCandidate.surname,
        birthdate: mockCandidate.dateOfBirth,
        emailaddress1: mockCandidate.email,
        telephone2: undefined,
        ftts_title: undefined,
        ftts_othertitle: 'Lord',
        ftts_persontype: CRMPersonType.Candidate,
        ftts_personreference: mockCandidate.personReference,
        address1_line1: mockCandidate.address?.line1,
        address1_line2: mockCandidate.address?.line2,
        address1_line3: mockCandidate.address?.line3,
        ftts_address1_line4: mockCandidate.address?.line4,
        address1_city: mockCandidate.address?.line5,
        address1_postalcode: mockCandidate.address?.postcode,
        gendercode: CRMGenderCode.Male,
        'ownerid@odata.bind': `teams(${dvsaTeam})`,
      });
    });
  });

  describe('mapToCRMLicence', () => {
    const convertedAddress = {
      address1_line1: '24 Somewhere Street',
      address1_line2: 'Somewhere',
      address1_line3: 'Nowhere town',
      ftts_address1_line4: undefined,
      address1_city: 'Birmingham',
      address1_postalcode: 'B5 1AA',
    };

    test('correctly maps data to a CRM Licence', () => {
      expect(mapToCRMLicence(candidateId, licenceNumber, mockCandidate)).toStrictEqual({
        ftts_licence: licenceNumber,
        'ftts_Person@odata.bind': `contacts(${candidateId})`,
        'ownerid@odata.bind': `teams(${dvsaTeam})`,
        ftts_address1_street1: convertedAddress.address1_line1,
        ftts_address1_street2: convertedAddress.address1_line2,
        ftts_address1street3: convertedAddress.address1_line3,
        ftts_address1street4: convertedAddress.ftts_address1_line4,
        ftts_address1_city: convertedAddress.address1_city,
        ftts_address1_postalcode: convertedAddress.address1_postalcode,
      });
    });

    test('correctly maps data if no licence is given', () => {
      expect(mapToCRMLicence(candidateId, undefined, mockCandidate)).toStrictEqual({
        'ftts_Person@odata.bind': `contacts(${candidateId})`,
        'ownerid@odata.bind': `teams(${dvsaTeam})`,
        ftts_address1_street1: convertedAddress.address1_line1,
        ftts_address1_street2: convertedAddress.address1_line2,
        ftts_address1street3: convertedAddress.address1_line3,
        ftts_address1street4: convertedAddress.ftts_address1_line4,
        ftts_address1_city: convertedAddress.address1_city,
        ftts_address1_postalcode: convertedAddress.address1_postalcode,
      });
    });

    test('correctly maps data if no candidate given', () => {
      expect(mapToCRMLicence(candidateId, licenceNumber, undefined)).toStrictEqual({
        'ftts_Person@odata.bind': `contacts(${candidateId})`,
        ftts_address1_street1: undefined,
        ftts_address1_street2: undefined,
        ftts_address1street3: undefined,
        ftts_address1street4: undefined,
        ftts_address1_city: undefined,
        ftts_address1_postalcode: undefined,
        ftts_licence: licenceNumber,
        'ownerid@odata.bind': undefined,
      });
    });
  });

  describe('mapToCRMBooking', () => {
    test('correctly maps data to a CRM Booking', () => {
      expect(mapToCRMBooking(
        mockCandidate,
        mockBooking,
        candidateId,
        licenceId,
        CRMAdditionalSupport.None,
        true,
        'dvsa-price-list-id',
      )).toMatchObject({
        'ftts_candidateid@odata.bind': `contacts(${candidateId})`,
        ftts_name: `${mockCandidate.firstnames} ${mockCandidate.surname}`,
        ftts_firstname: mockCandidate.firstnames,
        ftts_lastname: mockCandidate.surname,
        ftts_drivinglicence: mockCandidate.licenceNumber,
        ftts_dob: mockCandidate.dateOfBirth,
        ftts_origin: CRMOrigin.CitizenPortal,
        ftts_pricepaid: mockBooking.compensationBooking?.pricePaid,
        'ftts_pricelist@odata.bind': 'pricelevels(mock-price-list-id)',
        'ftts_LicenceId@odata.bind': `ftts_licences(${licenceId})`,
        'ftts_testcentre@odata.bind': `accounts(${mockBooking.centre?.accountId})`,
        ftts_testdate: mockBooking.dateTime,
        ftts_bookingstatus: CRMBookingStatus.Reserved,
        ftts_language: CRMTestLanguage.Welsh,
        ftts_licencevalidstatus: CRMLicenceValidStatus.Valid,
        ftts_additionalsupportoptions: CRMAdditionalSupport.None,
        ftts_nivoiceoveroptions: CRMVoiceOver.None,
        ftts_selecteddate: '2020-01-02',
        'ftts_selectedtestcentrelocation@odata.bind': 'accounts(first-selected-test-centre-id)',
        ftts_governmentagency: CRMGovernmentAgency.Dva,
        ftts_nonstandardaccommodation: false,
        'ownerid@odata.bind': `teams(${dvsaTeam})`,
      });
    });

    test('correctly maps no compensation booking to a CRM Booking', () => {
      mockBooking.compensationBooking = undefined;
      expect(mapToCRMBooking(
        mockCandidate,
        mockBooking,
        candidateId,
        licenceId,
        CRMAdditionalSupport.None,
        true,
        'dvsa-price-list-id',
      )).toStrictEqual(expect.objectContaining({
        ftts_pricepaid: mockBooking.priceList?.price,
      }));
    });

    test('throws an error if missing any required candidate data', () => {
      mockCandidate.licenceNumber = undefined;
      expect(() => mapToCRMBooking(
        mockCandidate,
        mockBooking,
        candidateId,
        licenceId,
        CRMAdditionalSupport.None,
        true,
      )).toThrow('CRMHelper::mapToCRMBooking: Missing required candidate data');
    });

    test('throws an error if missing any required booking data', () => {
      mockBooking.dateTime = undefined;
      expect(() => mapToCRMBooking(
        mockCandidate,
        mockBooking,
        candidateId,
        licenceId,
        CRMAdditionalSupport.None,
        true,
      )).toThrow('CRMHelper::mapToCRMBooking: Missing required booking data');
    });

    test('correctly maps data to a CRM Booking when isNonStandardAccommodation with no evidence required', () => {
      expect(mapToCRMBooking(
        mockCandidate,
        mockBooking,
        candidateId,
        licenceId,
        CRMAdditionalSupport.None,
        false,
        'dvsa-price-list-id',
      )).toMatchObject({
        'ftts_candidateid@odata.bind': `contacts(${candidateId})`,
        ftts_name: `${mockCandidate.firstnames} ${mockCandidate.surname}`,
        ftts_firstname: mockCandidate.firstnames,
        ftts_lastname: mockCandidate.surname,
        ftts_drivinglicence: mockCandidate.licenceNumber,
        ftts_dob: mockCandidate.dateOfBirth,
        ftts_origin: CRMOrigin.CitizenPortal,
        ftts_pricepaid: mockBooking.compensationBooking?.pricePaid,
        'ftts_pricelist@odata.bind': 'pricelevels(mock-price-list-id)',
        'ftts_LicenceId@odata.bind': `ftts_licences(${licenceId})`,
        'ftts_testcentre@odata.bind': undefined,
        ftts_testdate: mockBooking.dateTime,
        ftts_bookingstatus: CRMBookingStatus.Draft,
        ftts_language: CRMTestLanguage.Welsh,
        ftts_licencevalidstatus: CRMLicenceValidStatus.Valid,
        ftts_additionalsupportoptions: CRMAdditionalSupport.None,
        ftts_nivoiceoveroptions: CRMVoiceOver.None,
        ftts_selecteddate: '2020-01-02',
        'ftts_selectedtestcentrelocation@odata.bind': undefined,
        ftts_governmentagency: CRMGovernmentAgency.Dva,
        ftts_nonstandardaccommodation: true,
        ftts_proxypermitted: false,
        'ownerid@odata.bind': `teams(${dvsaTeam})`,
        ftts_nsastatus: CRMNsaStatus.AwaitingCscResponse,
      });
    });

    test('correctly maps data to a CRM Booking when isNonStandardAccommodation with evidence required', () => {
      mockBooking = { ...mockBooking, selectSupportType: [SupportType.EXTRA_TIME] };
      expect(mapToCRMBooking(
        mockCandidate,
        mockBooking,
        candidateId,
        licenceId,
        CRMAdditionalSupport.None,
        false,
        'dvsa-price-list-id',
      )).toMatchObject({
        'ftts_candidateid@odata.bind': `contacts(${candidateId})`,
        ftts_name: `${mockCandidate.firstnames} ${mockCandidate.surname}`,
        ftts_firstname: mockCandidate.firstnames,
        ftts_lastname: mockCandidate.surname,
        ftts_drivinglicence: mockCandidate.licenceNumber,
        ftts_dob: mockCandidate.dateOfBirth,
        ftts_origin: CRMOrigin.CitizenPortal,
        ftts_pricepaid: mockBooking.compensationBooking?.pricePaid,
        'ftts_pricelist@odata.bind': 'pricelevels(mock-price-list-id)',
        'ftts_LicenceId@odata.bind': `ftts_licences(${licenceId})`,
        'ftts_testcentre@odata.bind': undefined,
        ftts_testdate: mockBooking.dateTime,
        ftts_bookingstatus: CRMBookingStatus.Draft,
        ftts_language: CRMTestLanguage.Welsh,
        ftts_licencevalidstatus: CRMLicenceValidStatus.Valid,
        ftts_additionalsupportoptions: CRMAdditionalSupport.None,
        ftts_nivoiceoveroptions: CRMVoiceOver.None,
        ftts_selecteddate: '2020-01-02',
        'ftts_selectedtestcentrelocation@odata.bind': undefined,
        ftts_governmentagency: CRMGovernmentAgency.Dva,
        ftts_nonstandardaccommodation: true,
        ftts_proxypermitted: false,
        'ownerid@odata.bind': `teams(${dvsaTeam})`,
        ftts_nsastatus: CRMNsaStatus.AwaitingCandidateMedicalEvidence,
      });
    });

    test('correctly maps support requirements to a CRM Booking when isNonStandardAccommodation', () => {
      const testBooking = {
        ...mockBooking,
        selectSupportType: [SupportType.TRANSLATOR, SupportType.BSL_INTERPRETER],
        translator: 'French',
      };

      const payload = mapToCRMBooking(
        mockCandidate,
        testBooking,
        candidateId,
        licenceId,
        CRMAdditionalSupport.None,
        false,
        'dvsa-price-list-id',
      );

      expect(payload.ftts_supportrequirements).toBe('- Translator (French)\n- Sign language (interpreter)\n\n');
    });

    test('throws error if selectSupportType field is not set in the booking', () => {
      mockBooking = { ...mockBooking, hasSupportNeedsInCRM: true, selectSupportType: undefined };
      expect(() => mapToCRMBooking(
        mockCandidate,
        mockBooking,
        candidateId,
        licenceId,
        CRMAdditionalSupport.None,
        false,
        'dvsa-price-list-id',
      )).toThrow(new Error('CRMHelper::setNsaStatus: Missing candidate support data from booking'));
    });

    test('throws error if hasSupportNeedsInCRM is not set in the booking', () => {
      mockBooking = { ...mockBooking, hasSupportNeedsInCRM: undefined };
      expect(() => mapToCRMBooking(
        mockCandidate,
        mockBooking,
        candidateId,
        licenceId,
        CRMAdditionalSupport.None,
        false,
        'dvsa-price-list-id',
      )).toThrow(new Error('CRMHelper::setNsaStatus: Missing candidate support data from booking'));
    });
  });

  describe('mapToCRMBookingProduct', () => {
    test('correctly maps data to a CRM Booking Product', () => {
      const mockBookingResponse: BookingResponse = {
        id: 'booking-id',
        reference: 'booking-reference',
      };

      expect(mapToCRMBookingProduct(mockCandidate, mockBooking, mockBookingResponse, true, CRMAdditionalSupport.None)).toStrictEqual({
        'ftts_bookingid@odata.bind': `ftts_bookings(${mockBookingResponse.id})`,
        'ftts_CandidateId@odata.bind': `contacts(${mockCandidate.candidateId})`,
        'ftts_productid@odata.bind': `products(${mockBooking.priceList?.product.productId})`,
        'ftts_ihttcid@odata.bind': `accounts(${mockBooking.centre?.accountId})`,
        'ftts_drivinglicencenumber@odata.bind': `ftts_licences(${mockCandidate.licenceId})`,
        'ftts_testcategoryId@odata.bind': `products(${mockBooking.priceList?.product.parentId})`,
        ftts_reference: `${mockBookingResponse.reference}-01`,
        ftts_drivinglicenceentered: mockCandidate.licenceNumber,
        ftts_price: 20,
        ftts_bookingstatus: CRMBookingStatus.Reserved,
        ftts_testdate: mockBooking.dateTime,
        ftts_testlanguage: CRMTestLanguage.Welsh,
        ftts_selected: true,
        ftts_tcn_update_date: '2020-11-11T14:30:45.979Z',
        ftts_salesreference: mockBooking.salesReference,
        ftts_eligible: true,
        ftts_eligiblefrom: '2020-01-01',
        ftts_eligibleto: '2030-01-01',
        ftts_personalreferencenumber: '123456',
        ftts_paymentreferencenumber: '1234567890123456',
        ftts_additionalsupportoptions: CRMAdditionalSupport.None,
        'ownerid@odata.bind': `teams(${dvsaTeam})`,
      });
    });

    test('correctly maps data to CRM Booking Product with non compensated booking', () => {
      mockBooking.compensationBooking = undefined;
      const mockBookingResponse: BookingResponse = {
        id: 'booking-id',
        reference: 'booking-reference',
      };
      expect(mapToCRMBookingProduct(mockCandidate, mockBooking, mockBookingResponse, true, CRMAdditionalSupport.None))
        .toStrictEqual(expect.objectContaining({
          ftts_price: mockBooking.priceList?.price,
        }));
    });

    test('correctly maps data to a CRM Booking Product for non standard booking', () => {
      const mockBookingResponse: BookingResponse = {
        id: 'booking-id',
        reference: 'booking-reference',
      };

      expect(mapToCRMBookingProduct(mockCandidate, mockBooking, mockBookingResponse, false, CRMAdditionalSupport.None)).toStrictEqual({
        'ftts_bookingid@odata.bind': `ftts_bookings(${mockBookingResponse.id})`,
        'ftts_CandidateId@odata.bind': `contacts(${mockCandidate.candidateId})`,
        'ftts_productid@odata.bind': `products(${mockBooking.priceList?.product.productId})`,
        'ftts_ihttcid@odata.bind': undefined,
        'ftts_drivinglicencenumber@odata.bind': `ftts_licences(${mockCandidate.licenceId})`,
        'ftts_testcategoryId@odata.bind': `products(${mockBooking.priceList?.product.parentId})`,
        ftts_reference: `${mockBookingResponse.reference}-01`,
        ftts_drivinglicenceentered: mockCandidate.licenceNumber,
        ftts_price: 20,
        ftts_bookingstatus: CRMBookingStatus.Draft,
        ftts_testdate: mockBooking.dateTime,
        ftts_testlanguage: CRMTestLanguage.Welsh,
        ftts_selected: true,
        ftts_tcn_update_date: '2020-11-11T14:30:45.979Z',
        ftts_salesreference: mockBooking.salesReference,
        ftts_eligible: true,
        ftts_eligiblefrom: '2020-01-01',
        ftts_eligibleto: '2030-01-01',
        ftts_personalreferencenumber: '123456',
        ftts_paymentreferencenumber: '1234567890123456',
        ftts_additionalsupportoptions: CRMAdditionalSupport.None,
        'ownerid@odata.bind': `teams(${dvsaTeam})`,
      });
    });
  });

  describe('mapCRMProductToProductResponse', () => {
    test('should map a CRMProduct to a ProductResponse', () => {
      const mockCRMProduct: CRMProduct = {
        _parentproductid_value: 'parent-product-id',
        productid: 'product-id',
      };
      expect(mapCRMProductToProductResponse([mockCRMProduct])).toStrictEqual({
        id: mockCRMProduct.productid,
        // eslint-disable-next-line no-underscore-dangle
        parentId: mockCRMProduct._parentproductid_value,
      });
    });
    test('should throw an error if no product was found', () => {
      expect(() => { mapCRMProductToProductResponse([]); }).toThrow('No Product Found in CRM');
    });
  });

  describe('mapCRMBookingResponseToBookingResponse', () => {
    test('should map a CRMBookingResponse to a BookingResponse', () => {
      const mockCRMBookingResponse: CRMBookingResponse = {
        ftts_bookingid: 'booking-id',
        ftts_reference: 'booking-reference',
        ftts_firstname: 'first-name',
        ftts_lastname: 'last-name',
        _ftts_candidateid_value: 'candidate-id',
        _ftts_licenceid_value: 'licence-id',
      };
      expect(mapCRMBookingResponseToBookingResponse(mockCRMBookingResponse)).toStrictEqual({
        id: mockCRMBookingResponse.ftts_bookingid,
        reference: mockCRMBookingResponse.ftts_reference,
        firstName: 'first-name',
        lastName: 'last-name',
        candidateId: 'candidate-id',
        licenceId: 'licence-id',
      });
    });

    describe('missing data scenarios', () => {
      test('ftts_reference', () => {
        const mockCRMBookingResponse: any = {
          ftts_bookingid: 'booking-id',
        } as CRMBookingResponse;
        expect(() => mapCRMBookingResponseToBookingResponse(mockCRMBookingResponse)).toThrow(new Error('CRMHelper::mapCRMBookingResponseToBookingResponse: Missing ftts_reference in crm response'));
      });
    });
  });

  describe('mapFromCrmXmlBookingDetailsToCRMBookingDetails', () => {
    let mockCRMXmlBookingDetails: CRMXmlBookingDetails;
    beforeEach(() => {
      mockCRMXmlBookingDetails = {
        createdon: '03-02-2022',
        ftts_bookingproductid: '001',
        ftts_reference: 'B-001-000-001',
        ftts_bookingstatus: CRMBookingStatus.Confirmed,
        ftts_testdate: '03-04-2022',
        ftts_price: 23,
        ftts_testlanguage: CRMTestLanguage.Welsh,
        ftts_voiceoverlanguage: CRMVoiceOver.Welsh,
        ftts_salesreference: 'mock-sales-ref',
        ftts_paymentstatus: CRMPaymentStatus.Success,
        ftts_additionalsupportoptions: CRMAdditionalSupport.None,
        _ftts_bookingid_value: 'mock-id',
        bookingReference: 'mock-ref',
        'booking.ftts_enableeligibilitybypass': false,
        'booking.ftts_foreignlanguageselected': '',
        'booking.ftts_governmentagency': CRMGovernmentAgency.Dvsa,
        'booking.ftts_nonstandardaccommodation': false,
        'booking.ftts_origin': CRMOrigin.CitizenPortal,
        'booking.ftts_testsupportneed': null,
        'booking.ftts_zerocostbooking': false,
        'booking.ftts_voicemailmessagespermitted': 'yes',
        'booking.ftts_nivoiceoveroptions': null,
        'product.parentproductid': 'mock-parentproduct-id',
        'product.productid': 'mock-product-id',
        'product.name': 'mock-name',
        'product.productnumber': CRMProductNumber.CAR,
        'account.accountid': 'mock-account-id',
        'account.address1_city': 'Birmingham',
        'account.address1_county': 'West Midlands',
        'account.address1_line1': 'line1',
        'account.address1_line2': 'line2',
        'account.address1_postalcode': 'B32 5GF',
        'account.ftts_remit': CRMRemit.England,
        'account.ftts_siteid': 'mock-site-id',
        'account.ftts_tcntestcentreid': 'mock-tcn-test-centre-id',
        'account.name': 'Birmingham',
        'parentaccountid.ftts_regiona': true,
        'parentaccountid.ftts_regionb': false,
        'parentaccountid.ftts_regionc': false,
      };
    });

    test('should successfully map from CRM xml booking details to CRM booking details', () => {
      const mockCRMBookingDetails: CRMBookingDetails = {
        createdon: '03-02-2022',
        ftts_bookingproductid: '001',
        ftts_reference: 'B-001-000-001',
        ftts_bookingstatus: CRMBookingStatus.Confirmed,
        ftts_testdate: '03-04-2022',
        ftts_price: 23,
        ftts_testlanguage: CRMTestLanguage.Welsh,
        ftts_voiceoverlanguage: CRMVoiceOver.Welsh,
        ftts_salesreference: 'mock-sales-ref',
        ftts_paymentstatus: CRMPaymentStatus.Success,
        ftts_additionalsupportoptions: CRMAdditionalSupport.None,
        _ftts_bookingid_value: 'mock-id',
        ftts_bookingid: {
          ftts_enableeligibilitybypass: false,
          ftts_nonstandardaccommodation: false,
          ftts_nsastatus: null,
          ftts_governmentagency: CRMGovernmentAgency.Dvsa,
          ftts_reference: 'mock-ref',
          ftts_origin: CRMOrigin.CitizenPortal,
          ftts_owedcompbookingassigned: null,
          ftts_owedcompbookingrecognised: null,
          ftts_zerocostbooking: false,
          ftts_foreignlanguageselected: '',
          ftts_testsupportneed: null,
          ftts_voicemailmessagespermitted: 'yes',
          ftts_nivoiceoveroptions: null,
          ftts_testcentre: {
            accountid: 'mock-account-id',
            name: 'Birmingham',
            address1_line1: 'line1',
            address1_line2: 'line2',
            address1_city: 'Birmingham',
            address1_county: 'West Midlands',
            address1_postalcode: 'B32 5GF',
            ftts_remit: CRMRemit.England,
            parentaccountid: {
              ftts_regiona: true,
              ftts_regionb: false,
              ftts_regionc: false,
            },
            ftts_siteid: 'mock-site-id',
            ftts_tcntestcentreid: 'mock-tcn-test-centre-id',
          },
        },
        ftts_productid: {
          name: 'mock-name',
          productid: 'mock-product-id',
          _parentproductid_value: 'mock-parentproduct-id',
          productnumber: CRMProductNumber.CAR,
        },
        ftts_nsabookingslots: null,
      };

      const result = mapFromCrmXmlBookingDetailsToCRMBookingDetails(mockCRMXmlBookingDetails);

      expect(result).toStrictEqual(mockCRMBookingDetails);
    });

    test('should successfully map nsa bookings from CRM xml booking details to CRM booking details', () => {
      mockCRMXmlBookingDetails['account.accountid'] = undefined;
      mockCRMXmlBookingDetails['account.address1_city'] = undefined;
      mockCRMXmlBookingDetails['account.address1_county'] = undefined;
      mockCRMXmlBookingDetails['account.address1_line1'] = undefined;
      mockCRMXmlBookingDetails['account.address1_line2'] = undefined;
      mockCRMXmlBookingDetails['account.address1_postalcode'] = undefined;
      mockCRMXmlBookingDetails['account.ftts_remit'] = undefined;
      mockCRMXmlBookingDetails['account.ftts_siteid'] = undefined;
      mockCRMXmlBookingDetails['account.ftts_tcntestcentreid'] = undefined;
      mockCRMXmlBookingDetails['account.name'] = undefined;
      mockCRMXmlBookingDetails['booking.ftts_voicemailmessagespermitted'] = undefined;
      mockCRMXmlBookingDetails.ftts_salesreference = undefined;
      mockCRMXmlBookingDetails.ftts_testdate = undefined;
      mockCRMXmlBookingDetails.ftts_bookingstatus = CRMBookingStatus.Draft;
      mockCRMXmlBookingDetails.ftts_paymentstatus = CRMPaymentStatus.Draft;
      mockCRMXmlBookingDetails['booking.ftts_nsastatus'] = CRMNsaStatus.AwaitingCscResponse;
      mockCRMXmlBookingDetails['booking.ftts_nivoiceoveroptions'] = CRMVoiceOver.English;
      mockCRMXmlBookingDetails.ftts_voiceoverlanguage = null;
      mockCRMXmlBookingDetails.ftts_nsabookingslots = [
        {
          ftts_expirydate: 'mock-expiry-date',
          ftts_reservationid: 'mock-reservation-id',
          ftts_status: CRMNsaBookingSlotStatus.Offered,
          ftts_testdate: 'mock-date',
          _ftts_bookingid_value: 'mock-id',
          _ftts_organisationid_value: 'organisation-value',
        },
      ];

      const mockCRMBookingDetails: CRMBookingDetails = {
        createdon: '03-02-2022',
        ftts_bookingproductid: '001',
        ftts_reference: 'B-001-000-001',
        ftts_bookingstatus: CRMBookingStatus.Draft,
        ftts_testdate: null,
        ftts_price: 23,
        ftts_testlanguage: CRMTestLanguage.Welsh,
        ftts_voiceoverlanguage: null,
        ftts_salesreference: null,
        ftts_paymentstatus: CRMPaymentStatus.Draft,
        ftts_additionalsupportoptions: CRMAdditionalSupport.None,
        _ftts_bookingid_value: 'mock-id',
        ftts_bookingid: {
          ftts_enableeligibilitybypass: false,
          ftts_nonstandardaccommodation: false,
          ftts_nsastatus: CRMNsaStatus.AwaitingCscResponse,
          ftts_governmentagency: CRMGovernmentAgency.Dvsa,
          ftts_reference: 'mock-ref',
          ftts_origin: CRMOrigin.CitizenPortal,
          ftts_owedcompbookingassigned: null,
          ftts_owedcompbookingrecognised: null,
          ftts_zerocostbooking: false,
          ftts_foreignlanguageselected: '',
          ftts_testsupportneed: null,
          ftts_testcentre: null,
          ftts_voicemailmessagespermitted: null,
          ftts_nivoiceoveroptions: CRMVoiceOver.English,
        },
        ftts_productid: {
          name: 'mock-name',
          productid: 'mock-product-id',
          _parentproductid_value: 'mock-parentproduct-id',
          productnumber: CRMProductNumber.CAR,
        },
        ftts_nsabookingslots: [
          {
            ftts_expirydate: 'mock-expiry-date',
            ftts_reservationid: 'mock-reservation-id',
            ftts_status: CRMNsaBookingSlotStatus.Offered,
            ftts_testdate: 'mock-date',
            _ftts_bookingid_value: 'mock-id',
            _ftts_organisationid_value: 'organisation-value',
          },
        ],
      };

      const result = mapFromCrmXmlBookingDetailsToCRMBookingDetails(mockCRMXmlBookingDetails);

      expect(result).toStrictEqual(mockCRMBookingDetails);
    });

    test('should successfully map possible undefined values to null', () => {
      mockCRMXmlBookingDetails = {
        createdon: '02-03-2000',
        ftts_bookingproductid: 'mock-id',
        ftts_reference: 'mock-ref',
        _ftts_bookingid_value: 'mock-booking-id',
        ftts_price: 23,
        'product.productid': 'product-id',
        'product.parentproductid': 'parentproduct-id',
      };

      const mockCRMBookingDetails: CRMBookingDetails = {
        createdon: '02-03-2000',
        ftts_bookingproductid: 'mock-id',
        ftts_reference: 'mock-ref',
        ftts_bookingstatus: null,
        ftts_testdate: null,
        ftts_price: 23,
        ftts_testlanguage: null,
        ftts_voiceoverlanguage: null,
        ftts_salesreference: null,
        ftts_paymentstatus: null,
        ftts_additionalsupportoptions: null,
        _ftts_bookingid_value: 'mock-booking-id',
        ftts_bookingid: {
          ftts_enableeligibilitybypass: null,
          ftts_nonstandardaccommodation: null,
          ftts_nsastatus: null,
          ftts_governmentagency: null,
          ftts_reference: null,
          ftts_origin: null,
          ftts_owedcompbookingassigned: null,
          ftts_owedcompbookingrecognised: null,
          ftts_zerocostbooking: null,
          ftts_foreignlanguageselected: null,
          ftts_testsupportneed: null,
          ftts_testcentre: null,
          ftts_voicemailmessagespermitted: null,
          ftts_nivoiceoveroptions: null,
        },
        ftts_productid: {
          name: undefined,
          productid: 'product-id',
          _parentproductid_value: 'parentproduct-id',
          productnumber: undefined,
        },
        ftts_nsabookingslots: null,
      };

      const result = mapFromCrmXmlBookingDetailsToCRMBookingDetails(mockCRMXmlBookingDetails);

      expect(result).toStrictEqual(mockCRMBookingDetails);
    });
  });

  describe('mapToBookingDetails', () => {
    let mockCRMBookingDetails: CRMBookingDetails;
    beforeEach(() => {
      mockCRMBookingDetails = crmBookingDetailsBuilder();
    });

    test('should map CRMBookingDetails to BookingDetails', () => {
      expect(mapToBookingDetails(mockCRMBookingDetails)).toStrictEqual({
        bookingProductId: mockCRMBookingDetails.ftts_bookingproductid,
        reference: mockCRMBookingDetails.ftts_bookingid.ftts_reference,
        bookingProductRef: mockCRMBookingDetails.ftts_reference,
        // eslint-disable-next-line no-underscore-dangle
        bookingId: mockCRMBookingDetails._ftts_bookingid_value,
        bookingStatus: mockCRMBookingDetails.ftts_bookingstatus,
        compensationAssigned: mockCRMBookingDetails.ftts_bookingid.ftts_owedcompbookingassigned,
        compensationRecognised: mockCRMBookingDetails.ftts_bookingid.ftts_owedcompbookingrecognised,
        owedCompensationBooking: false,
        governmentAgency: mockCRMBookingDetails.ftts_bookingid.ftts_governmentagency,
        testDate: mockCRMBookingDetails.ftts_testdate,
        testLanguage: mockCRMBookingDetails.ftts_testlanguage,
        voiceoverLanguage: mockCRMBookingDetails.ftts_voiceoverlanguage,
        additionalSupport: mockCRMBookingDetails.ftts_additionalsupportoptions,
        enableEligibilityBypass: mockCRMBookingDetails.ftts_bookingid.ftts_enableeligibilitybypass,
        nonStandardAccommodation: mockCRMBookingDetails.ftts_bookingid.ftts_nonstandardaccommodation,
        voicemailmessagespermitted: true,
        nsaStatus: mockCRMBookingDetails.ftts_bookingid.ftts_nsastatus,
        isZeroCostBooking: mockCRMBookingDetails.ftts_bookingid.ftts_zerocostbooking,
        paymentStatus: mockCRMBookingDetails.ftts_paymentstatus,
        price: mockCRMBookingDetails.ftts_price,
        salesReference: mockCRMBookingDetails.ftts_salesreference,
        origin: mockCRMBookingDetails.ftts_bookingid.ftts_origin,
        createdOn: mockCRMBookingDetails.createdon,
        testCentre: {
          accountId: mockCRMBookingDetails.ftts_bookingid.ftts_testcentre?.accountid,
          siteId: mockCRMBookingDetails.ftts_bookingid.ftts_testcentre?.ftts_siteid,
          name: mockCRMBookingDetails.ftts_bookingid.ftts_testcentre?.name,
          addressLine1: mockCRMBookingDetails.ftts_bookingid.ftts_testcentre?.address1_line1,
          addressLine2: mockCRMBookingDetails.ftts_bookingid.ftts_testcentre?.address1_line2,
          addressCity: mockCRMBookingDetails.ftts_bookingid.ftts_testcentre?.address1_city,
          addressCounty: mockCRMBookingDetails.ftts_bookingid.ftts_testcentre?.address1_county,
          addressPostalCode: mockCRMBookingDetails.ftts_bookingid.ftts_testcentre?.address1_postalcode,
          remit: mockCRMBookingDetails.ftts_bookingid.ftts_testcentre?.ftts_remit,
          testCentreId: mockCRMBookingDetails.ftts_bookingid.ftts_testcentre?.ftts_tcntestcentreid,
          region: TCNRegion.A,
          ftts_tcntestcentreid: mockCRMBookingDetails.ftts_bookingid.ftts_testcentre?.ftts_tcntestcentreid,
        },
        testSupportNeed: [null],
        foreignlanguageselected: mockCRMBookingDetails.ftts_bookingid.ftts_foreignlanguageselected,
        product: {
          productid: mockCRMBookingDetails.ftts_productid?.productid,
          name: mockCRMBookingDetails.ftts_productid?.name,
          // eslint-disable-next-line no-underscore-dangle
          _parentproductid_value: mockCRMBookingDetails.ftts_productid?._parentproductid_value,
          productnumber: mockCRMBookingDetails.ftts_productid?.productnumber,
        },
        nsaBookingSlots: null,
      });
    });

    test('if there are any missing fields, throws an error and logs', () => {
      mockCRMBookingDetails.ftts_bookingstatus = undefined;

      expect(() => mapToBookingDetails(mockCRMBookingDetails)).toThrow(new Error('CRMHelper::mapToBookingDetails: Missing expected fields in crm response'));
    });

    describe('draft nsa bookings', () => {
      beforeEach(() => {
        mockCRMBookingDetails = crmBookingDetailsBuilder(true, false, CRMBookingStatus.Draft);
      });

      test('successfully maps voiceover language to nivoiceoverlanguage and maps nsa booking slots if it is an NSA draft booking', () => {
        expect(mapToBookingDetails(mockCRMBookingDetails)).toEqual(expect.objectContaining({
          voiceoverLanguage: mockCRMBookingDetails.ftts_bookingid.ftts_nivoiceoveroptions,
          nsaBookingSlots: mockCRMBookingDetails.ftts_nsabookingslots,
          testSupportNeed: JSON.parse(`[ ${mockCRMBookingDetails.ftts_bookingid.ftts_testsupportneed} ]`),
        }));
      });
    });
  });

  describe('getMissingFields', () => {
    let mockCRMBookingDetails: CRMBookingDetails;

    afterEach(() => {
      jest.clearAllMocks();
    });

    test.each`
        bookingStatus  | missingField
        ${CRMBookingStatus.Confirmed} | ${'ftts_bookingstatus'}
        ${CRMBookingStatus.Confirmed} | ${'ftts_testdate'}
        ${CRMBookingStatus.Confirmed} | ${'ftts_testlanguage'}
        ${CRMBookingStatus.Confirmed} | ${'ftts_voiceoverlanguage'}
        ${CRMBookingStatus.Confirmed} | ${'ftts_additionalsupportoptions'}
        ${CRMBookingStatus.Draft} | ${'ftts_testlanguage'}
        ${CRMBookingStatus.Draft} | ${'ftts_additionalsupportoptions'}
        `('given booking status is "$bookingStatus" it should throw an error when "$missingField" is undefined', ({ bookingStatus, missingField }) => {
      const isNsaBooking = bookingStatus === CRMBookingStatus.Draft;
      mockCRMBookingDetails = crmBookingDetailsBuilder(isNsaBooking, false, bookingStatus);

      mockCRMBookingDetails[missingField] = undefined;

      const result = getMissingFields(mockCRMBookingDetails, bookingStatus === CRMBookingStatus.Draft);
      expect(result).toStrictEqual([missingField]);
    });

    test.each`
        bookingStatus  | missingField
        ${CRMBookingStatus.Confirmed} | ${'ftts_reference'}
        ${CRMBookingStatus.Confirmed} | ${'ftts_origin'}
        ${CRMBookingStatus.Confirmed} | ${'ftts_governmentagency'}
        ${CRMBookingStatus.Draft} | ${'ftts_reference'}
        ${CRMBookingStatus.Draft} | ${'ftts_origin'}
        ${CRMBookingStatus.Draft} | ${'ftts_governmentagency'}
        ${CRMBookingStatus.Draft} | ${'ftts_nivoiceoveroptions'}
      `('given booking status is "$bookingStatus" it should throw an error when "$missingField" in bookingid entity is undefined', ({ bookingStatus, missingField }) => {
      const isNsaBooking = bookingStatus === CRMBookingStatus.Draft;
      mockCRMBookingDetails = crmBookingDetailsBuilder(isNsaBooking, false, bookingStatus);

      if (missingField === 'ftts_governmentagency') {
        mockCRMBookingDetails.ftts_bookingid[missingField] = null;
      } else {
        mockCRMBookingDetails.ftts_bookingid[missingField] = undefined;
      }

      const result = getMissingFields(mockCRMBookingDetails, bookingStatus === CRMBookingStatus.Draft);
      expect(result).toStrictEqual([missingField]);
    });

    test('given booking status is confirmed, it should throw an error when ftts_remit in test centre entity is undefined', () => {
      mockCRMBookingDetails = crmBookingDetailsBuilder(false, false, CRMBookingStatus.Confirmed);

      delete mockCRMBookingDetails.ftts_bookingid.ftts_testcentre?.ftts_remit;

      const result = getMissingFields(mockCRMBookingDetails, false);
      expect(result).toStrictEqual(['ftts_remit']);
    });
  });

  describe('mapCRMRegionToTCNRegion', () => {
    test('should return TCN Region A if ftts_regionA is true', () => {
      const data: CRMTestCentre = {
        parentaccountid: {
          ftts_regiona: true,
          ftts_regionb: false,
          ftts_regionc: false,
        },
      } as CRMTestCentre;

      expect(mapCRMRegionToTCNRegion(data)).toEqual(TCNRegion.A);
    });

    test('should return TCN Region B if ftts_regionB is true', () => {
      const data: CRMTestCentre = {
        parentaccountid: {
          ftts_regiona: false,
          ftts_regionb: true,
          ftts_regionc: false,
        },
      } as CRMTestCentre;

      expect(mapCRMRegionToTCNRegion(data)).toEqual(TCNRegion.B);
    });

    test('should return TCN Region C if ftts_regionC is true', () => {
      const data: CRMTestCentre = {
        parentaccountid: {
          ftts_regiona: false,
          ftts_regionb: false,
          ftts_regionc: true,
        },
      } as CRMTestCentre;

      expect(mapCRMRegionToTCNRegion(data)).toEqual(TCNRegion.C);
    });

    test('should throw an error if all the region booleans are false', () => {
      expect(() => mapCRMRegionToTCNRegion({} as CRMTestCentre)).toThrow(new Error('Unable to map the test centre to a region, all region values are false/missing'));
    });
  });

  describe('mapToCandidate', () => {
    test('maps CRMLicenceCandidateResponse to Candidate', () => {
      const crmResponse: CRMLicenceCandidateResponse = {
        ftts_licenceid: 'licence-id',
        ftts_licence: 'licence-number',
        ftts_address1_street1: 'address-line-1',
        ftts_address1_street2: 'address-line-2',
        ftts_address1street3: 'address-line-3',
        ftts_address1street4: 'address-line-4',
        ftts_address1_city: 'address-line-5',
        ftts_address1_postalcode: 'address-post-code',
        candidateId: 'candidate-id',
        firstnames: 'Firstname Middlename',
        surname: 'Lastname',
        email: 'test@email.com',
        dateOfBirth: '1998-10-09',
        personReference: '342467342',
        title: CRMPeopleTitle.MR,
        gender: CRMGenderCode.Male,
        telephone: '12345',
      };
      expect(mapToCandidate(crmResponse)).toStrictEqual({
        candidateId: crmResponse.candidateId,
        firstnames: crmResponse.firstnames,
        surname: crmResponse.surname,
        email: crmResponse.email,
        dateOfBirth: crmResponse.dateOfBirth,
        licenceId: crmResponse.ftts_licenceid,
        licenceNumber: crmResponse.ftts_licence,
        personReference: crmResponse.personReference,
        title: mapCRMPeopleTitleToString(crmResponse.title),
        gender: mapCRMGenderCodeToGenderEnum(crmResponse.gender),
        telephone: crmResponse.telephone,
        address: {
          line1: crmResponse.ftts_address1_street1,
          line2: crmResponse.ftts_address1_street2,
          line3: crmResponse.ftts_address1street3,
          line4: crmResponse.ftts_address1street4,
          line5: crmResponse.ftts_address1_city,
          postcode: crmResponse.ftts_address1_postalcode,
        },
        supportNeedName: undefined,
        supportEvidenceStatus: undefined,
      });
    });
  });

  describe('mapToCandidateResponse', () => {
    test('maps CRMContact to CandidateResponse', () => {
      const crmResponse: CRMContact = {
        'ownerid@odata.bind': 'mock-owner-id',
        contactid: 'candidate-id',
        ftts_persontype: CRMPersonType.Candidate,
        ftts_firstandmiddlenames: 'Wendy',
        lastname: 'Jones',
        ftts_title: CRMPeopleTitle.MR,
        ftts_personreference: 'personRef',
        birthdate: '1999-10-05',
        emailaddress1: 'test@email.com',
        telephone2: '123 456 7890',
        address1_line1: 'address line 1',
        address1_line2: 'address line 2',
        address1_line3: 'address line 3',
        ftts_address1_line4: 'address line 4',
        address1_city: 'city',
        address1_postalcode: 'B5 1AA',
        gendercode: CRMGenderCode.Male,
      };
      expect(mapToCandidateResponse(crmResponse)).toStrictEqual({
        candidateId: crmResponse.contactid,
        firstnames: crmResponse.ftts_firstandmiddlenames,
        surname: crmResponse.lastname,
        email: crmResponse.emailaddress1,
        dateOfBirth: crmResponse.birthdate,
        telephone: crmResponse.telephone2,
        personReference: crmResponse.ftts_personreference,
        address: {
          line1: crmResponse.address1_line1,
          line2: crmResponse.address1_line2,
          line3: crmResponse.address1_line3,
          line4: crmResponse.ftts_address1_line4,
          line5: crmResponse.address1_city,
          postcode: crmResponse.address1_postalcode,
        },
      });
    });
  });

  describe('mapCRMRemitToCRMCalendarName', () => {
    test('Maps English Test Centres to an English Calendar Name', () => {
      expect(mapCRMRemitToCRMCalendarName(CRMRemit.England)).toEqual(CRMCalendarName.England);
    });

    test('Maps Scotland Test Centres to an Scotland Calendar Name', () => {
      expect(mapCRMRemitToCRMCalendarName(CRMRemit.Scotland)).toEqual(CRMCalendarName.Scotland);
    });

    test('Maps English Test Centres to an Wales Calendar Name', () => {
      expect(mapCRMRemitToCRMCalendarName(CRMRemit.Wales)).toEqual(CRMCalendarName.Wales);
    });

    test('Maps NI Test Centres to an NI Calendar Name', () => {
      expect(mapCRMRemitToCRMCalendarName(CRMRemit.NorthernIreland)).toEqual(CRMCalendarName.NorthernIreland);
    });
  });

  describe('mapPaymentInformationToBookingDetails', () => {
    test('Successfully maps payment information into a booking detail object', () => {
      const bookingDetails: BookingDetails = {} as BookingDetails;
      const paymentInfo: GetPaymentInformationResponse = {
        _ftts_bookingproduct_value: 'mock-booking-oriduct-value',
        ftts_financetransactionid: 'mock-finance-transaction-id',
        ftts_status: CRMFinanceTransactionStatus.Deferred,
        ftts_type: CRMTransactionType.Booking,
        ftts_payment: {
          ftts_paymentid: 'mock-payment-id',
          ftts_status: CRMPaymentStatus.Draft,
        },
      };
      expect(mapPaymentInformationToBookingDetails(paymentInfo, bookingDetails)).toStrictEqual({
        financeTransaction: {
          financeTransactionId: 'mock-finance-transaction-id',
          transactionStatus: CRMFinanceTransactionStatus.Deferred,
          transactionType: CRMTransactionType.Booking,
        },
        paymentId: 'mock-payment-id',
        paymentStatus: CRMPaymentStatus.Draft,
      });
    });
  });

  describe('mapVoiceoverToCRMVoiceover', () => {
    test('Correctly maps Arabic Voiceover', () => {
      expect(mapVoiceoverToCRMVoiceover(Voiceover.ARABIC)).toEqual(CRMVoiceOver.Arabic);
    });

    test('Correctly maps Cantonese Voiceover', () => {
      expect(mapVoiceoverToCRMVoiceover(Voiceover.CANTONESE)).toEqual(CRMVoiceOver.Cantonese);
    });

    test('Correctly maps English Voiceover', () => {
      expect(mapVoiceoverToCRMVoiceover(Voiceover.ENGLISH)).toEqual(CRMVoiceOver.English);
    });

    test('Correctly maps Farsi Voiceover', () => {
      expect(mapVoiceoverToCRMVoiceover(Voiceover.FARSI)).toEqual(CRMVoiceOver.Farsi);
    });

    test('Correctly maps No Voiceover', () => {
      expect(mapVoiceoverToCRMVoiceover(Voiceover.NONE)).toEqual(CRMVoiceOver.None);
    });

    test('Correctly maps undefined to No Voiceover', () => {
      expect(mapVoiceoverToCRMVoiceover(undefined)).toEqual(CRMVoiceOver.None);
    });

    test('Correctly maps Polish Voiceover', () => {
      expect(mapVoiceoverToCRMVoiceover(Voiceover.POLISH)).toEqual(CRMVoiceOver.Polish);
    });

    test('Correctly maps Portuguese Voiceover', () => {
      expect(mapVoiceoverToCRMVoiceover(Voiceover.PORTUGUESE)).toEqual(CRMVoiceOver.Portuguese);
    });

    test('Correctly maps Turkish Voiceover', () => {
      expect(mapVoiceoverToCRMVoiceover(Voiceover.TURKISH)).toEqual(CRMVoiceOver.Turkish);
    });

    test('Correctly maps Welsh Voiceover', () => {
      expect(mapVoiceoverToCRMVoiceover(Voiceover.WELSH)).toEqual(CRMVoiceOver.Welsh);
    });
  });

  describe('mapPeopleTitleStringToCRMPeopleTitle', () => {
    test('correctly maps Mr title', () => {
      expect(mapPeopleTitleStringToCRMPeopleTitle('Mr')).toEqual(CRMPeopleTitle.MR);
    });

    test('correctly maps Ms title', () => {
      expect(mapPeopleTitleStringToCRMPeopleTitle('Ms')).toEqual(CRMPeopleTitle.MS);
    });

    test('correctly maps Mrs title', () => {
      expect(mapPeopleTitleStringToCRMPeopleTitle('Mrs')).toEqual(CRMPeopleTitle.MRS);
    });

    test('correctly maps Miss title', () => {
      expect(mapPeopleTitleStringToCRMPeopleTitle('Miss')).toEqual(CRMPeopleTitle.MISS);
    });

    test('correctly maps Mx title', () => {
      expect(mapPeopleTitleStringToCRMPeopleTitle('Mx')).toEqual(CRMPeopleTitle.MX);
    });

    test('correctly maps Dr title', () => {
      expect(mapPeopleTitleStringToCRMPeopleTitle('Dr')).toEqual(CRMPeopleTitle.DR);
    });

    test('correct maps \'doctor\'', () => {
      expect(mapPeopleTitleStringToCRMPeopleTitle('Doctor')).toEqual(CRMPeopleTitle.DR);
    });

    test('returns undefined if any other title supplied', () => {
      expect(mapPeopleTitleStringToCRMPeopleTitle('Lady')).toBeUndefined();
    });
  });

  describe('mapToSupportType', () => {
    test.each([
      [[CRMTestSupportNeed.BSLInterpreter], [TestSupportNeed.BSLInterpreter]],
      [[CRMTestSupportNeed.ExtraTime], [TestSupportNeed.ExtraTime]],
      [[CRMTestSupportNeed.ExtraTimeWithBreak], [TestSupportNeed.ExtraTimeWithBreak]],
      [[CRMTestSupportNeed.ForeignLanguageInterpreter], [TestSupportNeed.ForeignLanguageInterpreter]],
      [[CRMTestSupportNeed.HomeTest], [TestSupportNeed.HomeTest]],
      [[CRMTestSupportNeed.LipSpeaker], [TestSupportNeed.LipSpeaker]],
      [[CRMTestSupportNeed.NonStandardAccommodationRequest], [TestSupportNeed.NonStandardAccommodationRequest]],
      [[CRMTestSupportNeed.OralLanguageModifier], [TestSupportNeed.OralLanguageModifier]],
      [[CRMTestSupportNeed.OtherSigner], [TestSupportNeed.OtherSigner]],
      [[CRMTestSupportNeed.Reader], [TestSupportNeed.Reader]],
      [[CRMTestSupportNeed.FamiliarReaderToCandidate], [TestSupportNeed.FamiliarReaderToCandidate]],
      [[CRMTestSupportNeed.Reader_Recorder], [TestSupportNeed.Reader_Recorder]],
      [[CRMTestSupportNeed.SeperateRoom], [TestSupportNeed.SeperateRoom]],
      [[CRMTestSupportNeed.TestInIsolation], [TestSupportNeed.TestInIsolation]],
      [[CRMTestSupportNeed.SpecialTestingEquipment], [TestSupportNeed.SpecialTestingEquipment]],
      [[675030020], [TestSupportNeed.NoSupport]],
      [[], [TestSupportNeed.NoSupport]],
      [null, [TestSupportNeed.NoSupport]],
      [undefined, [TestSupportNeed.NoSupport]],
    ])('for given support types: %s returns "%s"', (supportTypeRequested: CRMTestSupportNeed[] | null | undefined, expectedResult: TestSupportNeed[]) => {
      expect(mapToSupportType(supportTypeRequested as unknown as CRMTestSupportNeed[])).toEqual(expectedResult);
    });
  });

  describe('mapGenderEnumToCRMGenderCode', () => {
    test('correctly maps Male gender', () => {
      expect(mapGenderEnumToCRMGenderCode(ELIG.CandidateDetails.GenderEnum.M)).toEqual(CRMGenderCode.Male);
    });

    test('correctly maps Female gender', () => {
      expect(mapGenderEnumToCRMGenderCode(ELIG.CandidateDetails.GenderEnum.F)).toEqual(CRMGenderCode.Female);
    });

    test('correctly maps Unknown gender', () => {
      expect(mapGenderEnumToCRMGenderCode(ELIG.CandidateDetails.GenderEnum.U)).toEqual(CRMGenderCode.Unknown);
    });

    test('ignores value if undefined', () => {
      expect(mapGenderEnumToCRMGenderCode(undefined)).toBeUndefined();
    });
  });

  describe('mapCRMPeopleTitleToString', () => {
    test.each([
      [CRMPeopleTitle.MR, 'mr'],
      [CRMPeopleTitle.MS, 'ms'],
      [CRMPeopleTitle.MRS, 'mrs'],
      [CRMPeopleTitle.MISS, 'miss'],
      [CRMPeopleTitle.MX, 'mx'],
      [CRMPeopleTitle.DR, 'dr'],
      [undefined, undefined],
    ])('for %s returns %s', (input: CRMPeopleTitle | undefined, expectedOutput: string | undefined) => {
      expect(mapCRMPeopleTitleToString(input)).toEqual(expectedOutput);
    });
  });

  describe('mapCRMGenderCodeToGenderEnum', () => {
    test.each([
      [CRMGenderCode.Male, ELIG.CandidateDetails.GenderEnum.M],
      [CRMGenderCode.Female, ELIG.CandidateDetails.GenderEnum.F],
      [CRMGenderCode.Unknown, ELIG.CandidateDetails.GenderEnum.U],
      [undefined, undefined],
    ])('for %s returns %s', (input: CRMGenderCode | undefined, expectedOutput: ELIG.CandidateDetails.GenderEnum | undefined) => {
      expect(mapCRMGenderCodeToGenderEnum(input)).toEqual(expectedOutput);
    });
  });

  describe('transformOtherTitle', () => {
    test('given a title OTHER the Other is returned', () => {
      expect(transformOtherTitle('OTHER')).toStrictEqual('Other');
    });

    test('given a different title that the word OTHER than the given title is returned', () => {
      expect(transformOtherTitle('Tiles')).toStrictEqual('Tiles');
    });

    test('given an undefined title than undefined is returned', () => {
      expect(transformOtherTitle(undefined)).toBeUndefined();
    });
  });

  describe('hasCRMSupportNeeds', () => {
    test('returns true if the user has a support need in the crm with approved status', () => {
      const mockedCandidate = { ...mockCandidate, supportNeedName: 'BSL- Interpreter', supportEvidenceStatus: '675030000' };

      const result = hasCRMSupportNeeds(mockedCandidate);

      expect(result).toBe(true);
    });

    test('returns false if the user does not have a support need in the crm', () => {
      const result = hasCRMSupportNeeds(mockCandidate);
      expect(result).toBe(false);
    });
  });
});
