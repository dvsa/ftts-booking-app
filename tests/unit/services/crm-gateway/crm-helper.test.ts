import MockDate from 'mockdate';
import { Centre } from '../../../../src/domain/types';
import {
  LANGUAGE,
  TCNRegion,
  TestType,
  Voiceover,
} from '../../../../src/domain/enums';
import {
  mapCRMBookingResponseToBookingResponse,
  mapCRMLicenceToLicenceResponse,
  mapCRMProductToProductResponse,
  mapToBookingDetails,
  mapCRMRemitToCRMCalendarName,
  mapToCRMBooking,
  mapToCRMBookingProduct,
  mapToCRMContact,
  mapToCRMLicence,
  mapToCandidate,
  mapPaymentInformationToBookingDetails,
  mapCRMRegionToTCNRegion,
  mapVoiceoverToCRMVoiceover,
} from '../../../../src/services/crm-gateway/crm-helper';
import {
  CRMAdditionalSupport,
  CRMBookingStatus,
  CRMCalendarName,
  CRMFinanceTransactionStatus,
  CRMLicenceValidStatus,
  CRMOrigin,
  CRMPaymentStatus,
  CRMPeopleTitle,
  CRMRemit,
  CRMTestLanguage,
  CRMTestType,
  CRMTransactionType,
  CRMVoiceOver,
} from '../../../../src/services/crm-gateway/enums';
import {
  ProductResponse,
  BookingResponse,
  CRMLicenceResponse,
  CRMProduct,
  CRMBookingResponse,
  CRMBookingDetails,
  CRMLicenceCandidateResponse,
  BookingDetails,
  GetPaymentInformationResponse,
  CRMTestCentre,
} from '../../../../src/services/crm-gateway/interfaces';
import { Booking, Candidate } from '../../../../src/services/session';

describe('crm-helper.ts', () => {
  const candidateId = 'candidate-id';
  const licenceId = 'licence-id';
  const licenceNumber = 'licence-number';
  const mockCandidate: Candidate = {
    firstnames: 'Test',
    surname: 'User',
    dateOfBirth: '2000-01-01',
    email: 'test@user.com',
    personReference: '342467342',
    entitlements: '',
    candidateId,
    licenceId,
    licenceNumber,
  };
  const mockBooking: Booking = {
    testType: TestType.Car,
    dateTime: '2020-01-01',
    language: LANGUAGE.WELSH,
    voiceover: Voiceover.NONE,
    salesReference: 'sales-ref',
    centre: {
      accountId: 'test-centre-id',
    } as Centre,
  } as Booking;

  beforeEach(() => {
    const date = new Date('2020-11-11T14:30:45.979Z');
    MockDate.set(date);
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
        ftts_title: CRMPeopleTitle.MR,
        ftts_personreference: mockCandidate.personReference,
      });
    });
  });
  describe('mapToCRMLicence', () => {
    it('correctly maps data to a CRM Licence', () => {
      expect(mapToCRMLicence(candidateId, licenceNumber)).toStrictEqual({
        ftts_licence: licenceNumber,
        'ftts_Person@odata.bind': `$${candidateId}`,
      });
    });
  });
  describe('mapToCRMBooking', () => {
    it('correctly maps data to a CRM Booking when isMultiRequest is false', () => {
      expect(mapToCRMBooking(
        mockCandidate,
        mockBooking,
        candidateId,
        licenceId,
        CRMAdditionalSupport.None,
        false,
      )).toStrictEqual({
        'ftts_candidateid@odata.bind': `contacts(${candidateId})`,
        ftts_name: `${mockCandidate.firstnames} ${mockCandidate.surname}`,
        ftts_firstname: mockCandidate.firstnames,
        ftts_lastname: mockCandidate.surname,
        ftts_drivinglicence: mockCandidate.licenceNumber,
        ftts_dob: mockCandidate.dateOfBirth,
        ftts_origin: CRMOrigin.CitizenPortal,
        ftts_pricelist: null,
        'ftts_LicenceId@odata.bind': `ftts_licences(${licenceId})`,
        'ftts_testcentre@odata.bind': `accounts(${mockBooking.centre.accountId})`,
        ftts_testdate: mockBooking.dateTime,
        ftts_bookingstatus: CRMBookingStatus.Reserved,
        ftts_language: CRMTestLanguage.Welsh,
        ftts_licencevalidstatus: CRMLicenceValidStatus.Valid,
        ftts_testtype: CRMTestType.Car,
        ftts_additionalsupportoptions: CRMAdditionalSupport.None,
        ftts_nivoiceoveroptions: CRMVoiceOver.None,
      });
    });
    it('correctly maps data to a CRM Booking when isMultiRequest is true', () => {
      expect(mapToCRMBooking(
        mockCandidate,
        mockBooking,
        candidateId,
        licenceId,
        CRMAdditionalSupport.None,
        CRMVoiceOver.None,
        true,
      )).toStrictEqual({
        'ftts_candidateid@odata.bind': `$${candidateId}`,
        ftts_name: `${mockCandidate.firstnames} ${mockCandidate.surname}`,
        ftts_firstname: mockCandidate.firstnames,
        ftts_lastname: mockCandidate.surname,
        ftts_drivinglicence: mockCandidate.licenceNumber,
        ftts_dob: mockCandidate.dateOfBirth,
        ftts_origin: CRMOrigin.CitizenPortal,
        ftts_pricelist: null,
        'ftts_LicenceId@odata.bind': `$${licenceId}`,
        'ftts_testcentre@odata.bind': `accounts(${mockBooking.centre.accountId})`,
        ftts_testdate: mockBooking.dateTime,
        ftts_bookingstatus: CRMBookingStatus.Reserved,
        ftts_language: CRMTestLanguage.Welsh,
        ftts_licencevalidstatus: CRMLicenceValidStatus.Valid,
        ftts_testtype: CRMTestType.Car,
        ftts_additionalsupportoptions: CRMAdditionalSupport.None,
        ftts_nivoiceoveroptions: CRMVoiceOver.None,
      });
    });
  });
  describe('mapToCRMBookingProduct', () => {
    it('correctly maps data to a CRM Booking Product', () => {
      const mockProduct: ProductResponse = {
        id: 'product-id',
        parentId: 'product-parent-id',
      };
      const mockBookingResponse: BookingResponse = {
        id: 'booking-id',
        reference: 'booking-reference',
      };
      expect(mapToCRMBookingProduct(mockCandidate, mockBooking, mockProduct, mockBookingResponse)).toStrictEqual({
        'ftts_bookingid@odata.bind': `ftts_bookings(${mockBookingResponse.id})`,
        'ftts_CandidateId@odata.bind': `contacts(${mockCandidate.candidateId})`,
        'ftts_productid@odata.bind': `products(${mockProduct.id})`,
        'ftts_ihttcid@odata.bind': `accounts(${mockBooking.centre.accountId})`,
        'ftts_drivinglicencenumber@odata.bind': `ftts_licences(${mockCandidate.licenceId})`,
        'ftts_testcategoryId@odata.bind': `products(${mockProduct.parentId})`,
        ftts_reference: `${mockBookingResponse.reference}-01`,
        ftts_drivinglicenceentered: mockCandidate.licenceNumber,
        ftts_price: 23,
        ftts_bookingstatus: CRMBookingStatus.Reserved,
        ftts_testdate: mockBooking.dateTime,
        ftts_testlanguage: CRMTestLanguage.Welsh,
        ftts_selected: true,
        ftts_tcn_update_date: '2020-11-11T14:30:45.979Z',
        ftts_salesreference: mockBooking.salesReference,
      });
    });
  });
  describe('mapCRMLicenceToLicenceResponse', () => {
    it('should map the CRMLicenceResponse to a LicenceResponse object', () => {
      const mockCRMLicenceResponse: CRMLicenceResponse = {
        _ftts_person_value: 'person-id',
        ftts_licenceid: 'licence-id',
        ftts_licence: 'licence',
      };
      expect(mapCRMLicenceToLicenceResponse([mockCRMLicenceResponse])).toStrictEqual({
        // eslint-disable-next-line no-underscore-dangle
        candidateId: mockCRMLicenceResponse._ftts_person_value,
        licenceId: mockCRMLicenceResponse.ftts_licenceid,
      });
    });
    it('should return undefined if no licence is present', () => {
      expect(mapCRMLicenceToLicenceResponse([])).toBe(undefined);
    });
  });
  describe('mapCRMProductToProductResponse', () => {
    it('should map a CRMProduct to a ProductResponse', () => {
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
    it('should throw an error if no product was found', () => {
      try {
        mapCRMProductToProductResponse([]);
      } catch (error) {
        expect(error.message).toStrictEqual('No Product Found in CRM');
      }
    });
  });
  describe('mapCRMBookingResponseToBookingResponse', () => {
    it('should map a CRMBookingResponse to a BookingResponse', () => {
      const mockCRMBookingResponse: CRMBookingResponse = {
        ftts_bookingid: 'booking-id',
        ftts_reference: 'booking-reference',
      };
      expect(mapCRMBookingResponseToBookingResponse(mockCRMBookingResponse)).toStrictEqual({
        id: mockCRMBookingResponse.ftts_bookingid,
        reference: mockCRMBookingResponse.ftts_reference,
      });
    });
  });
  describe('mapToBookingDetails', () => {
    test('should map CRMBookingDetails to BookingDetails', () => {
      const mockCRMBookingDetails: CRMBookingDetails = {
        ftts_bookingproductid: '001',
        _ftts_bookingid_value: 'booking-id',
        ftts_bookingstatus: CRMBookingStatus.Confirmed,
        ftts_testdate: '2020-10-10',
        ftts_testlanguage: CRMTestLanguage.Welsh,
        ftts_voiceoverlanguage: CRMVoiceOver.Welsh,
        ftts_additionalsupportoptions: CRMAdditionalSupport.None,
        ftts_paymentstatus: CRMPaymentStatus.Success,
        ftts_price: 23,
        ftts_salesreference: 'sales-reference',
        ftts_bookingid: {
          ftts_reference: 'B-reference',
          ftts_testtype: CRMTestType.Car,
          ftts_origin: CRMOrigin.CustomerServiceCentre,
          ftts_testcentre: {
            name: 'Birmingham',
            address1_line1: 'Address line 1',
            address1_city: 'Birmingham',
            address1_county: 'West Midlands',
            address1_postalcode: 'B1 111',
            ftts_remit: CRMRemit.England,
            ftts_regiona: true,
            ftts_regionb: false,
            ftts_regionc: false,
            ftts_siteid: 'mockSiteId',
          },
        },
      };
      expect(mapToBookingDetails(mockCRMBookingDetails)).toStrictEqual({
        bookingProductId: '001',
        reference: 'B-reference',
        bookingId: 'booking-id',
        bookingStatus: CRMBookingStatus.Confirmed,
        testDate: '2020-10-10',
        testLanguage: CRMTestLanguage.Welsh,
        voiceoverLanguage: CRMVoiceOver.Welsh,
        additionalSupport: CRMAdditionalSupport.None,
        paymentStatus: CRMPaymentStatus.Success,
        price: 23,
        salesReference: 'sales-reference',
        testType: TestType.Car,
        origin: CRMOrigin.CustomerServiceCentre,
        testCentre: {
          accountId: undefined,
          siteId: 'mockSiteId',
          name: 'Birmingham',
          addressLine1: 'Address line 1',
          addressLine2: undefined,
          addressCity: 'Birmingham',
          addressCounty: 'West Midlands',
          addressPostalCode: 'B1 111',
          remit: CRMRemit.England,
          testCentreId: 'mockSiteId',
          region: TCNRegion.A,
        },
      });
    });
  });
  describe('mapCRMRegionToTCNRegion', () => {
    test('should return TCN Region A if ftts_regionA is true', () => {
      const data: CRMTestCentre = {
        ftts_regiona: true,
        ftts_regionb: false,
        ftts_regionc: false,
      } as CRMTestCentre;

      expect(mapCRMRegionToTCNRegion(data)).toEqual(TCNRegion.A);
    });
    test('should return TCN Region B if ftts_regionB is true', () => {
      const data: CRMTestCentre = {
        ftts_regiona: false,
        ftts_regionb: true,
        ftts_regionc: false,
      } as CRMTestCentre;

      expect(mapCRMRegionToTCNRegion(data)).toEqual(TCNRegion.B);
    });
    test('should return TCN Region C if ftts_regionC is true', () => {
      const data: CRMTestCentre = {
        ftts_regiona: false,
        ftts_regionb: false,
        ftts_regionc: true,
      } as CRMTestCentre;

      expect(mapCRMRegionToTCNRegion(data)).toEqual(TCNRegion.C);
    });
    test('should throw an error if all the region booleans are false', () => {
      expect(() => mapCRMRegionToTCNRegion({} as CRMTestCentre)).toThrow(new Error('Unable to map the test centre to a region, all region values are false'));
    });
  });
  describe('mapToCandidate', () => {
    test('maps CRMLicenceCandidateResponse to Candidate', () => {
      const crmResponse: CRMLicenceCandidateResponse = {
        ftts_licenceid: 'licence-id',
        ftts_licence: 'licence-number',
        ftts_Person: {
          contactid: 'candidate-id',
          ftts_firstandmiddlenames: 'Firstname Middlename',
          lastname: 'Lastname',
          emailaddress1: 'test@email.com',
          birthdate: '1998-10-09',
          ftts_personreference: '342467342',
        },
      };
      expect(mapToCandidate(crmResponse)).toStrictEqual({
        candidateId: 'candidate-id',
        firstnames: 'Firstname Middlename',
        surname: 'Lastname',
        email: 'test@email.com',
        dateOfBirth: '1998-10-09',
        licenceId: 'licence-id',
        licenceNumber: 'licence-number',
        personReference: '342467342',
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
        payment: {
          paymentId: 'mock-payment-id',
          paymentStatus: CRMPaymentStatus.Draft,
        },
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
});
