/* eslint-disable no-underscore-dangle */
import dayjs from 'dayjs';
import MockDate from 'mockdate';
import { v4 as uuidv4 } from 'uuid';
import { CRMTestClient, constants } from '@dvsa/ftts-crm-test-client';
import { Candidate as MockTestCandidate } from '@dvsa/ftts-crm-test-client/dist/types';
import { ELIG } from '@dvsa/ftts-eligibility-api-model';
import { CRMGenderCode, CRMPeopleTitle, CRMBookingStatus } from '@dvsa/ftts-crm-test-client/dist/enums';
import { TestLanguage } from '../../src/domain/test-language';
import { CRMGateway } from '../../src/services/crm-gateway/crm-gateway';
import {
  CRMAdditionalSupport,
  CRMGovernmentAgency,
  CRMNsaBookingSlotStatus,
  CRMNsaStatus,
  CRMOrigin,
  CRMPersonType,
  CRMPreferredCommunicationMethod,
  CRMProductNumber,
  CRMRemit,
  CRMVoiceOver,
  CRMZeroCostBookingReason,
} from '../../src/services/crm-gateway/enums';
import { mockSessionBooking, mockSessionNsaBooking, mockSessionCandidate } from '../mocks/data/session-types';
import { Booking, Candidate } from '../../src/services/session';
import { mapGenderEnumToCRMGenderCode, mapPeopleTitleStringToCRMPeopleTitle } from '../../src/services/crm-gateway/crm-helper';
import {
  Target, SupportType, TestType,
} from '../../src/domain/enums';
import config from '../../src/config';
import { CRMNsaBookingSlots, NsaBookingDetail } from '../../src/services/crm-gateway/interfaces';

jest.mock('@dvsa/azure-logger');
jest.setTimeout(45000);

describe('Booking app -> CRM integration tests', () => {
  const crmTestClient = new CRMTestClient();
  const crmGateway = CRMGateway.getInstance();
  const mockToday = '2021-02-04T12:00:00.000Z';
  MockDate.set(mockToday);
  let mockCandidates: { candidateId: any; }[];

  beforeAll(async () => {
    // Doing this to wake up CRM to prevent timeout on the first test case
    const mockLicenceNumber = `int-test-${uuidv4()}`;
    const contact = await crmTestClient.createContact();
    const candidateData = mockSessionCandidate();

    await crmGateway.createLicence(mockLicenceNumber, candidateData.address as ELIG.Address, contact.contactid);
  });

  describe('getLicenceNumberRecordsByCandidateId', () => {
    const mockLicenceNumber = uuidv4();

    beforeEach(async () => {
      mockCandidates = [
        await crmTestClient.createNewCandidate(mockLicenceNumber, { telephone2: '123', ftts_title: CRMPeopleTitle.MR, gendercode: CRMGenderCode.Male }),
        await crmTestClient.createNewCandidate(mockLicenceNumber, { telephone2: '456', ftts_title: CRMPeopleTitle.MS, gendercode: CRMGenderCode.Female }),
        await crmTestClient.createNewCandidate(mockLicenceNumber, { telephone2: '789', ftts_title: CRMPeopleTitle.DR, gendercode: CRMGenderCode.Unknown }),
      ];

      await crmTestClient.createSupportNeed(mockCandidates[0].candidateId);
    });

    test('retrieves the correct existing candidate and licence record given a candidate ID and licence number', async () => {
      const result = await crmGateway.getLicenceNumberRecordsByCandidateId(mockCandidates[0].candidateId, mockLicenceNumber);

      const returnedCandidate = await crmTestClient.retrieveCandidate(mockCandidates[0].candidateId);

      expect(result?.candidateId).toEqual(mockCandidates[0].candidateId);
      expect(result?.licenceNumber).toEqual(mockLicenceNumber);
      expect(result?.personReference).toEqual(returnedCandidate.ftts_personreference);
      expect(result?.telephone).toEqual(returnedCandidate.telephone2);
      expect(mapPeopleTitleStringToCRMPeopleTitle(result?.title)).toEqual(returnedCandidate.ftts_title);
      expect(mapGenderEnumToCRMGenderCode(result?.gender)).toEqual(returnedCandidate.gendercode);
      expect(result?.supportNeedName).toBeTruthy();
      expect(result?.supportEvidenceStatus).toBeTruthy();
    });

    test('returns undefined if licence doesn\'t already exist', async () => {
      const mockIncorrectLicenceNumber = '404-licence-does-not-exist';
      const mockCorrectLicenceNumber = uuidv4();

      const mockCandidate = await crmTestClient.createNewCandidate(mockCorrectLicenceNumber);

      const result = await crmGateway.getLicenceNumberRecordsByCandidateId(mockCandidate.candidateId, mockIncorrectLicenceNumber);

      expect(result).toBeUndefined();
    });
  });

  describe('createLicence', () => {
    test('creates a licence record for a given candidate', async () => {
      const mockLicenceNumber = `int-test-${uuidv4()}`;
      const contact = await crmTestClient.createContact();
      const candidateData = mockSessionCandidate();

      const result = await crmGateway.createLicence(mockLicenceNumber, candidateData.address as ELIG.Address, contact.contactid);

      const newLicence = await crmTestClient.retrieveLicence(result);

      expect(result).toBeTruthy();
      expect(newLicence.ftts_licence).toBe(mockLicenceNumber);
      expect(newLicence.ftts_address1_street1).toBe(candidateData.address?.line1);
      expect(newLicence.ftts_address1_street2).toBe(candidateData.address?.line2);
      expect(newLicence.ftts_address1street3).toBe(candidateData.address?.line3);
      expect(newLicence.ftts_address1street4).toBe(candidateData.address?.line4);
      expect(newLicence.ftts_address1_city).toBe(candidateData.address?.line5);
      expect(newLicence.ftts_address1_postalcode).toBe(candidateData.address?.postcode);
      expect(newLicence._ownerid_value).toBe(config.crm.ownerId.dvsa);
    });
  });

  describe('createCandidate', () => {
    test('creates a candidate record', async () => {
      const candidateData = mockSessionCandidate();

      const result = await crmGateway.createCandidate(candidateData);

      const candidate = await crmTestClient.retrieveCandidate(result);

      expect(result).toBeTruthy();
      expect(candidate.contactid).toBeTruthy();
      expect(candidate.ftts_persontype).toStrictEqual(CRMPersonType.Candidate);
      expect(candidate.ftts_title).toStrictEqual(mapPeopleTitleStringToCRMPeopleTitle(candidateData.title));
      expect(candidate.ftts_firstandmiddlenames).toStrictEqual(candidateData.firstnames);
      expect(candidate.lastname).toStrictEqual(candidateData.surname);
      expect(candidate.address1_line1).toStrictEqual(candidateData.address?.line1);
      expect(candidate.address1_line2).toStrictEqual(candidateData.address?.line2);
      expect(candidate.address1_line3).toStrictEqual(candidateData.address?.line3);
      expect(candidate.ftts_address1_line4).toStrictEqual(candidateData.address?.line4);
      expect(candidate.address1_city).toStrictEqual(candidateData.address?.line5);
      expect(candidate.address1_postalcode).toStrictEqual(candidateData.address?.postcode);
      expect(candidate.birthdate).toStrictEqual(candidateData.dateOfBirth);
      expect(candidate.gendercode).toStrictEqual(mapGenderEnumToCRMGenderCode(candidateData.gender));
      expect(candidate.ftts_personreference).toStrictEqual(candidateData.personReference);
      expect(candidate._ownerid_value).toStrictEqual(config.crm.ownerId.dvsa);
    });
  });

  describe('updateCandidate', () => {
    test('successfully updates the candidate details to CRM given a new telephone number and email from the candidate', async () => {
      const mockLicenceNumber = `int-test-${uuidv4()}`;
      const mockCandidate = await crmTestClient.createNewCandidate(mockLicenceNumber);
      const candidateData: Candidate = {
        ...mockSessionCandidate(),
        licenceId: mockCandidate.licenceId,
        candidateId: mockCandidate.candidateId,
        licenceNumber: mockLicenceNumber,
      };

      const updatedCandidateDetails: Partial<Candidate> = {
        telephone: '123 456 7890',
        email: 'newemail@test.com',
      };

      await crmGateway.updateCandidate(candidateData.candidateId as string, updatedCandidateDetails);
      const updatedCandidate = await crmTestClient.retrieveCandidate(mockCandidate.candidateId);

      expect(updatedCandidate.telephone2).toBe(updatedCandidateDetails.telephone);
      expect(updatedCandidate.emailaddress1).toBe(updatedCandidateDetails.email);
    });

    test('successfully updates candidate details including name, address, title and gender', async () => {
      const mockLicenceNumber = `int-test-${uuidv4()}`;
      const mockCandidate = await crmTestClient.createNewCandidate(mockLicenceNumber);
      const candidateData: Candidate = {
        ...mockSessionCandidate(),
        title: 'Mr',
        licenceId: mockCandidate.licenceId,
        candidateId: mockCandidate.candidateId,
        licenceNumber: mockLicenceNumber,
      };

      const updatedCandidateDetails: Partial<Candidate> = {
        firstnames: 'UpdatedFirstName',
        surname: 'UpdatedLastName',
        title: 'Ms',
        gender: ELIG.CandidateDetails.GenderEnum.F,
        address: {
          line1: 'Updated line 1',
          line2: 'Updated line 2',
          line3: 'Updated line 3',
          line4: 'Updated line 4',
          line5: 'Updated line 5',
          postcode: 'B5 1AA',
        },
      };

      await crmGateway.updateCandidate(candidateData.candidateId as string, updatedCandidateDetails);
      const updatedCandidate = await crmTestClient.retrieveCandidate(mockCandidate.candidateId);

      expect(updatedCandidate.ftts_title).toBe(mapPeopleTitleStringToCRMPeopleTitle(updatedCandidateDetails.title));
      expect(updatedCandidate.ftts_firstandmiddlenames).toBe(updatedCandidateDetails.firstnames);
      expect(updatedCandidate.lastname).toBe(updatedCandidateDetails.surname);
      expect(updatedCandidate.gendercode).toBe(mapGenderEnumToCRMGenderCode(updatedCandidateDetails.gender));
      expect(updatedCandidate.address1_line1).toBe(updatedCandidateDetails.address?.line1);
      expect(updatedCandidate.address1_line2).toBe(updatedCandidateDetails.address?.line2);
      expect(updatedCandidate.address1_line3).toBe(updatedCandidateDetails.address?.line3);
      expect(updatedCandidate.ftts_address1_line4).toBe(updatedCandidateDetails.address?.line4);
      expect(updatedCandidate.address1_city).toBe(updatedCandidateDetails.address?.line5);
      expect(updatedCandidate.address1_postalcode).toBe(updatedCandidateDetails.address?.postcode);
    });

    test('title gets moved to the other title field if it\'s out of scope', async () => {
      const mockLicenceNumber = `int-test-${uuidv4()}`;
      const mockCandidate = await crmTestClient.createNewCandidate(mockLicenceNumber);

      const updatedCandidateDetails: Partial<Candidate> = {
        title: 'Other',
      };

      await crmGateway.updateCandidate(mockCandidate.candidateId, updatedCandidateDetails);
      const updatedCandidate = await crmTestClient.retrieveCandidate(mockCandidate.candidateId);

      expect(updatedCandidate.ftts_othertitle).toBe(updatedCandidateDetails.title);
    });
  });

  describe('updateCandidateAndCreateBooking', () => {
    test('successfully updates candidate with new telephone number and email address and creates a standard booking', async () => {
      const isStandardAccommodation = true;
      const mockLicenceNumber = `tst${Date.now()}`; // Booking product only allows max 16 chars
      const mockCandidate = await crmTestClient.createNewCandidate(mockLicenceNumber);
      const candidateData: Candidate = {
        ...mockSessionCandidate(),
        licenceId: mockCandidate.licenceId,
        candidateId: mockCandidate.candidateId,
        licenceNumber: mockLicenceNumber,
        telephone: '123 456 7890',
        email: 'newemail@test.com',
        ownerId: config.crm.ownerId.dvsa,
      };
      const bookingData: Booking = {
        ...mockSessionBooking(constants.account.dvsa.derby),
      };
      // Get the Price list and product id for the test type
      const priceLists = await crmGateway.getPriceList(Target.GB, [bookingData.testType as TestType]);
      // eslint-disable-next-line prefer-destructuring
      bookingData.priceList = priceLists[0];

      const oldCandidate = await crmTestClient.retrieveCandidate(mockCandidate.candidateId);

      const updatedCandidateAndBookingResponse = await crmGateway.updateCandidateAndCreateBooking(candidateData, bookingData, CRMAdditionalSupport.None, isStandardAccommodation, config.crm.priceListId.dvsa);
      const bookingProductId = await crmGateway.createBookingProduct(candidateData, bookingData, updatedCandidateAndBookingResponse.booking, true, CRMAdditionalSupport.None);

      const newCandidate = await crmTestClient.retrieveCandidate(updatedCandidateAndBookingResponse.candidate.candidateId as string);
      const booking = await crmTestClient.retrieveBooking(updatedCandidateAndBookingResponse.booking.id);
      const bookingProduct = await crmTestClient.retrieveBookingProduct(bookingProductId);

      expect(newCandidate.telephone2).toBe(candidateData.telephone);
      expect(newCandidate.emailaddress1).toBe(candidateData.email);
      expect(newCandidate.gendercode).toBe(oldCandidate.gendercode);
      expect(newCandidate.ftts_title).toBe(oldCandidate.ftts_title);
      expect(newCandidate._ownerid_value).toBe(oldCandidate._ownerid_value);

      expect(booking.ftts_firstname).toStrictEqual(candidateData.firstnames);
      expect(booking.ftts_lastname).toStrictEqual(candidateData.surname);
      expect(dayjs(booking.ftts_dob).isSame(candidateData.dateOfBirth)).toStrictEqual(true);
      expect(booking.ftts_drivinglicence).toStrictEqual(candidateData.licenceNumber);
      expect(dayjs(booking.ftts_testdate).isSame(bookingData.dateTime)).toStrictEqual(true);
      expect(booking.ftts_reference).toBeTruthy();
      expect(TestLanguage.fromCRMTestLanguage(booking.ftts_language)).toBeTruthy();
      expect(booking.ftts_additionalsupportoptions).toStrictEqual(CRMAdditionalSupport.None);
      expect(booking.ftts_nivoiceoveroptions).toStrictEqual(CRMVoiceOver.English);
      expect(booking.ftts_origin).toStrictEqual(CRMOrigin.CitizenPortal);
      expect(booking.ftts_pricepaid).toEqual(bookingData.priceList?.price);
      expect(booking.ftts_testsselected).toStrictEqual(true);
      expect(booking.ftts_selecteddate).toStrictEqual(new Date('2020-12-30T10:00:00.000Z'));
      expect(booking.ftts_tcnpreferreddate).toStrictEqual(new Date('2020-12-30T10:00:00.000Z'));
      expect(booking.ftts_dateavailableonoraftertoday).toStrictEqual(new Date('2020-12-29T10:00:00.000Z'));
      expect(booking.ftts_dateavailableonorbeforepreferreddate).toStrictEqual(new Date('2020-12-28T10:00:00.000Z'));
      expect(booking.ftts_dateavailableonorafterpreferreddate).toStrictEqual(new Date('2020-12-27T10:00:00.000Z'));
      expect(booking.ftts_proxypermitted).toStrictEqual(false);

      expect(bookingProduct.ftts_price).toStrictEqual(priceLists[0].price);
      expect(bookingProduct._ftts_productid_value).toStrictEqual(priceLists[0].product.productId);
      expect(bookingProduct._ftts_testcategoryid_value).toStrictEqual(priceLists[0].product.parentId);
      expect(bookingProduct.ftts_personalreferencenumber).toStrictEqual('325825');
      expect(bookingProduct.ftts_paymentreferencenumber).toStrictEqual('5134567890123456');
      expect(bookingProduct.ftts_additionalsupportoptions).toStrictEqual(CRMAdditionalSupport.None);
      expect(bookingProduct.ftts_eligible).toBe(true);
      expect(bookingProduct.ftts_eligiblefrom).toStrictEqual('2020-01-01');
      expect(bookingProduct.ftts_eligibleto).toStrictEqual('2030-01-01');
      expect(booking.ftts_nonstandardaccommodation).toBeFalsy();
      expect(booking.ftts_governmentagency).toStrictEqual(CRMGovernmentAgency.Dvsa);

      // Check that any non standard information hasn't leaked through.
      expect(booking.ftts_nsastatus).toBeNull();
      expect(booking.ftts_supportrequirements).toBeNull();
      expect(booking.ftts_preferreddateandtime).toBeNull();
      expect(booking.ftts_preferreddateselected).toBeTruthy();
      expect(booking.ftts_preferredtestcentrelocation).toBeNull();
      expect(booking.ftts_preferredcommunicationmethod).toBe(CRMPreferredCommunicationMethod.Email);
      expect(booking.ftts_voicemailmessagespermitted).toBeFalsy();
    });

    test('successfully updates candidate with new telephone number and email address and creates a standard booking with a different test type', async () => {
      const isStandardAccommodation = true;
      const mockLicenceNumber = `tst${Date.now()}`; // Booking product only allows max 16 chars
      const mockCandidate = await crmTestClient.createNewCandidate(mockLicenceNumber);
      const candidateData: Candidate = {
        ...mockSessionCandidate(),
        licenceId: mockCandidate.licenceId,
        candidateId: mockCandidate.candidateId,
        licenceNumber: mockLicenceNumber,
        telephone: '123 456 7890',
        email: 'newemail@test.com',
      };
      const bookingData: Booking = {
        ...mockSessionBooking(constants.account.dvsa.derby),
        testType: TestType.LGVMC,
      };

      // Get the Price list and product id for the test type
      const priceLists = await crmGateway.getPriceList(Target.GB, [bookingData.testType as TestType]);
      // eslint-disable-next-line prefer-destructuring
      bookingData.priceList = priceLists[0];

      const oldCandidate = await crmTestClient.retrieveCandidate(mockCandidate.candidateId);

      const updatedCandidateAndBookingResponse = await crmGateway.updateCandidateAndCreateBooking(candidateData, bookingData, CRMAdditionalSupport.None, isStandardAccommodation, config.crm.priceListId.dvsa);
      const bookingProductId = await crmGateway.createBookingProduct(candidateData, bookingData, updatedCandidateAndBookingResponse.booking, true, CRMAdditionalSupport.None);

      const newCandidate = await crmTestClient.retrieveCandidate(updatedCandidateAndBookingResponse.candidate.candidateId as string);
      const booking = await crmTestClient.retrieveBooking(updatedCandidateAndBookingResponse.booking.id);
      const bookingProduct = await crmTestClient.retrieveBookingProduct(bookingProductId);

      expect(newCandidate.telephone2).toBe(candidateData.telephone);
      expect(newCandidate.emailaddress1).toBe(candidateData.email);
      expect(newCandidate.gendercode).toBe(oldCandidate.gendercode);
      expect(newCandidate.ftts_title).toBe(oldCandidate.ftts_title);
      expect(newCandidate._ownerid_value).toBe(oldCandidate._ownerid_value);

      expect(booking.ftts_firstname).toStrictEqual(candidateData.firstnames);
      expect(booking.ftts_lastname).toStrictEqual(candidateData.surname);
      expect(dayjs(booking.ftts_dob).isSame(candidateData.dateOfBirth)).toStrictEqual(true);
      expect(booking.ftts_drivinglicence).toStrictEqual(candidateData.licenceNumber);
      expect(dayjs(booking.ftts_testdate).isSame(bookingData.dateTime)).toStrictEqual(true);
      expect(booking.ftts_reference).toBeTruthy();
      expect(TestLanguage.fromCRMTestLanguage(booking.ftts_language)).toBeTruthy();
      expect(booking.ftts_additionalsupportoptions).toStrictEqual(CRMAdditionalSupport.None);
      expect(booking.ftts_nivoiceoveroptions).toStrictEqual(CRMVoiceOver.English);
      expect(booking.ftts_origin).toStrictEqual(CRMOrigin.CitizenPortal);
      expect(booking.ftts_selecteddate).toStrictEqual(new Date('2020-12-30T10:00:00.000Z'));

      expect(bookingProduct.ftts_price).toStrictEqual(priceLists[0].price);
      expect(bookingProduct._ftts_productid_value).toStrictEqual(priceLists[0].product.productId);
      expect(bookingProduct._ftts_testcategoryid_value).toStrictEqual(priceLists[0].product.parentId);
      expect(bookingProduct.ftts_additionalsupportoptions).toStrictEqual(CRMAdditionalSupport.None);
      expect(booking.ftts_nonstandardaccommodation).toBeFalsy();
      expect(booking.ftts_governmentagency).toStrictEqual(CRMGovernmentAgency.Dvsa);

      // Check that any non standard information hasn't leaked through.
      expect(booking.ftts_nsastatus).toBeNull();
      expect(booking.ftts_supportrequirements).toBeNull();
      expect(booking.ftts_preferreddateandtime).toBeNull();
      expect(booking.ftts_preferreddateselected).toBeTruthy();
      expect(booking.ftts_preferredtestcentrelocation).toBeNull();
      expect(booking.ftts_preferredcommunicationmethod).toBe(CRMPreferredCommunicationMethod.Email);
      expect(booking.ftts_voicemailmessagespermitted).toBeFalsy();
    });

    test('successfully updates candidate with new telephone number and email address and creates a non-standard booking', async () => {
      const isStandardAccommodation = false;
      const mockLicenceNumber = `tst${Date.now()}`; // Booking product only allows max 16 chars
      const mockCandidate = await crmTestClient.createNewCandidate(mockLicenceNumber);
      const candidateData: Candidate = {
        ...mockSessionCandidate(),
        licenceId: mockCandidate.licenceId,
        candidateId: mockCandidate.candidateId,
        licenceNumber: mockLicenceNumber,
        telephone: '123 456 7890',
        email: 'newemail@test.com',
        ownerId: config.crm.ownerId.dvsa,
      };
      const bookingData: Booking = {
        ...mockSessionNsaBooking(),
        governmentAgency: Target.NI,
        selectSupportType: [
          SupportType.BSL_INTERPRETER,
          SupportType.EXTRA_TIME,
          SupportType.ON_SCREEN_BSL,
          SupportType.OTHER,
          SupportType.READING_SUPPORT,
          SupportType.TRANSLATOR,
          SupportType.VOICEOVER,
        ],
        translator: 'French',
      };

      const updatedCandidateAndBookingResponse = await crmGateway.updateCandidateAndCreateBooking(candidateData, bookingData, CRMAdditionalSupport.VoiceoverEnglish, isStandardAccommodation, config.crm.priceListId.dvsa);

      const booking = await crmTestClient.retrieveBooking(updatedCandidateAndBookingResponse.booking.id);

      expect(updatedCandidateAndBookingResponse.candidate.telephone).toBe(candidateData.telephone);
      expect(updatedCandidateAndBookingResponse.candidate.email).toBe(candidateData.email);

      expect(booking.ftts_governmentagency).toStrictEqual(CRMGovernmentAgency.Dva);
      expect(booking.ftts_nonstandardaccommodation).toBeTruthy();
      expect(booking.ftts_nsastatus).toStrictEqual(CRMNsaStatus.AwaitingCandidateMedicalEvidence);
      expect(booking.ftts_supportrequirements).toBe('- Sign language (interpreter)\n- Extra time\n- Sign language (on-screen)\n- Other\n- Reading support with answer entry\n- Translator (French)\n- Voiceover\n\nThe support I would like is...');
      expect(booking.ftts_additionalsupportoptions).toStrictEqual(CRMAdditionalSupport.VoiceoverEnglish);
      expect(booking.ftts_nivoiceoveroptions).toStrictEqual(CRMVoiceOver.English);
      expect(booking.ftts_preferreddateandtime).toStrictEqual(bookingData.preferredDay);
      expect(booking.ftts_preferreddateselected).toBeTruthy();
      expect(booking.ftts_preferredtestcentrelocation).toStrictEqual(bookingData.preferredLocation);
      expect(booking.ftts_preferredcommunicationmethod).toStrictEqual(CRMPreferredCommunicationMethod.Phone);
      expect(booking.ftts_proxypermitted).toStrictEqual(false);
      expect(booking.ftts_voicemailmessagespermitted).toBe(bookingData.voicemail);
      expect(booking._ownerid_value).toBe(candidateData.ownerId);
    });

    test('successfully updates candidate with new telephone number and email address and creates a non-standard booking with different test type with nsa status AwaitingCandidateMedicalEvidence', async () => {
      const isStandardAccommodation = false;
      const mockLicenceNumber = `tst${Date.now()}`; // Booking product only allows max 16 chars
      const mockCandidate = await crmTestClient.createNewCandidate(mockLicenceNumber);
      const candidateData: Candidate = {
        ...mockSessionCandidate(),
        licenceId: mockCandidate.licenceId,
        candidateId: mockCandidate.candidateId,
        licenceNumber: mockLicenceNumber,
        telephone: '123 456 7890',
        email: 'newemail@test.com',
        ownerId: config.crm.ownerId.dvsa,
      };
      const bookingData: Booking = {
        ...mockSessionNsaBooking(),
        governmentAgency: Target.NI,
        selectSupportType: Object.values(SupportType),
        translator: 'French',
        testType: TestType.LGVMC,
      };

      // Get the Price list and product id for the test type
      const priceLists = await crmGateway.getPriceList(Target.GB, [bookingData.testType as TestType]);
      // eslint-disable-next-line prefer-destructuring
      bookingData.priceList = priceLists[0];

      const updatedCandidateAndBookingResponse = await crmGateway.updateCandidateAndCreateBooking(candidateData, bookingData, CRMAdditionalSupport.VoiceoverEnglish, isStandardAccommodation, config.crm.priceListId.dvsa);

      const booking = await crmTestClient.retrieveBooking(updatedCandidateAndBookingResponse.booking.id);

      const bookingProductId = await crmGateway.createBookingProduct(candidateData, bookingData, updatedCandidateAndBookingResponse.booking, false, CRMAdditionalSupport.None);
      const bookingProduct = await crmTestClient.retrieveBookingProduct(bookingProductId);

      expect(updatedCandidateAndBookingResponse.candidate.telephone).toBe(candidateData.telephone);
      expect(updatedCandidateAndBookingResponse.candidate.email).toBe(candidateData.email);

      expect(booking.ftts_governmentagency).toStrictEqual(CRMGovernmentAgency.Dva);
      expect(booking.ftts_nonstandardaccommodation).toBeTruthy();
      expect(booking.ftts_nsastatus).toStrictEqual(CRMNsaStatus.AwaitingCandidateMedicalEvidence);
      expect(booking.ftts_supportrequirements).toBeTruthy();
      expect(booking.ftts_additionalsupportoptions).toStrictEqual(CRMAdditionalSupport.VoiceoverEnglish);
      expect(booking.ftts_nivoiceoveroptions).toStrictEqual(CRMVoiceOver.English);
      expect(booking.ftts_preferreddateandtime).toStrictEqual(bookingData.preferredDay);
      expect(booking.ftts_preferreddateselected).toBeTruthy();
      expect(booking.ftts_preferredtestcentrelocation).toStrictEqual(bookingData.preferredLocation);
      expect(booking.ftts_preferredcommunicationmethod).toStrictEqual(CRMPreferredCommunicationMethod.Phone);
      expect(booking.ftts_proxypermitted).toStrictEqual(false);
      expect(booking.ftts_voicemailmessagespermitted).toBe(bookingData.voicemail);
      expect(booking._ownerid_value).toBe(candidateData.ownerId);

      expect(bookingProduct.ftts_price).toStrictEqual(priceLists[0].price);
      expect(bookingProduct._ftts_productid_value).toStrictEqual(priceLists[0].product.productId);
      expect(bookingProduct._ftts_testcategoryid_value).toStrictEqual(priceLists[0].product.parentId);
      expect(bookingProduct.ftts_additionalsupportoptions).toStrictEqual(CRMAdditionalSupport.None);
      expect(bookingProduct.ftts_bookingstatus).toStrictEqual(CRMBookingStatus.Draft);
      expect(booking.ftts_nonstandardaccommodation).toBeTruthy();
    });

    test('successfully updates candidate with new telephone number and email address and creates a non-standard booking with different test type with nsa status AwaitingCSCResponse', async () => {
      const isStandardAccommodation = false;
      const mockLicenceNumber = `tst${Date.now()}`; // Booking product only allows max 16 chars
      const mockCandidate = await crmTestClient.createNewCandidate(mockLicenceNumber);
      const candidateData: Candidate = {
        ...mockSessionCandidate(),
        licenceId: mockCandidate.licenceId,
        candidateId: mockCandidate.candidateId,
        licenceNumber: mockLicenceNumber,
        telephone: '123 456 7890',
        email: 'newemail@test.com',
        ownerId: config.crm.ownerId.dvsa,
      };
      const bookingData: Booking = {
        ...mockSessionNsaBooking(),
        governmentAgency: Target.NI,
        selectSupportType: [SupportType.BSL_INTERPRETER],
        testType: TestType.LGVMC,
      };

      // Get the Price list and product id for the test type
      const priceLists = await crmGateway.getPriceList(Target.GB, [bookingData.testType as TestType]);
      // eslint-disable-next-line prefer-destructuring
      bookingData.priceList = priceLists[0];

      const updatedCandidateAndBookingResponse = await crmGateway.updateCandidateAndCreateBooking(candidateData, bookingData, CRMAdditionalSupport.VoiceoverEnglish, isStandardAccommodation, config.crm.priceListId.dvsa);

      const booking = await crmTestClient.retrieveBooking(updatedCandidateAndBookingResponse.booking.id);

      const bookingProductId = await crmGateway.createBookingProduct(candidateData, bookingData, updatedCandidateAndBookingResponse.booking, false, CRMAdditionalSupport.None);
      const bookingProduct = await crmTestClient.retrieveBookingProduct(bookingProductId);

      expect(updatedCandidateAndBookingResponse.candidate.telephone).toBe(candidateData.telephone);
      expect(updatedCandidateAndBookingResponse.candidate.email).toBe(candidateData.email);

      expect(booking.ftts_governmentagency).toStrictEqual(CRMGovernmentAgency.Dva);
      expect(booking.ftts_nonstandardaccommodation).toBeTruthy();
      expect(booking.ftts_nsastatus).toStrictEqual(CRMNsaStatus.AwaitingCscResponse);
      expect(booking.ftts_supportrequirements).toBeTruthy();
      expect(booking.ftts_additionalsupportoptions).toStrictEqual(CRMAdditionalSupport.VoiceoverEnglish);
      expect(booking.ftts_nivoiceoveroptions).toStrictEqual(CRMVoiceOver.English);
      expect(booking.ftts_preferreddateandtime).toStrictEqual(bookingData.preferredDay);
      expect(booking.ftts_preferreddateselected).toBeTruthy();
      expect(booking.ftts_preferredtestcentrelocation).toStrictEqual(bookingData.preferredLocation);
      expect(booking.ftts_preferredcommunicationmethod).toStrictEqual(CRMPreferredCommunicationMethod.Phone);
      expect(booking.ftts_proxypermitted).toStrictEqual(false);
      expect(booking.ftts_voicemailmessagespermitted).toBe(bookingData.voicemail);
      expect(booking._ownerid_value).toBe(candidateData.ownerId);

      expect(bookingProduct.ftts_price).toStrictEqual(priceLists[0].price);
      expect(bookingProduct._ftts_productid_value).toStrictEqual(priceLists[0].product.productId);
      expect(bookingProduct._ftts_testcategoryid_value).toStrictEqual(priceLists[0].product.parentId);
      expect(bookingProduct.ftts_additionalsupportoptions).toStrictEqual(CRMAdditionalSupport.None);
      expect(bookingProduct.ftts_bookingstatus).toStrictEqual(CRMBookingStatus.Draft);
      expect(booking.ftts_nonstandardaccommodation).toBeTruthy();
    });
  });

  describe('updateLicence', () => {
    test('successfully updates licence record with an address and keeping licence number', async () => {
      const mockLicence = `int-test-${uuidv4()}`;
      const mockCandidate = await crmTestClient.createNewCandidate(mockLicence);
      const candidateData = mockSessionCandidate();

      await crmGateway.updateLicence(mockCandidate.licenceId, mockCandidate.candidateId, candidateData.address);

      const updatedLicenceRecord = await crmTestClient.retrieveLicence(mockCandidate.licenceId);

      expect(updatedLicenceRecord.ftts_licence).toBe(mockLicence);
      expect(updatedLicenceRecord.ftts_address1_street1).toBe(candidateData.address?.line1);
      expect(updatedLicenceRecord.ftts_address1_street2).toBe(candidateData.address?.line2);
      expect(updatedLicenceRecord.ftts_address1street3).toBe(candidateData.address?.line3);
      expect(updatedLicenceRecord.ftts_address1street4).toBe(candidateData.address?.line4);
      expect(updatedLicenceRecord.ftts_address1_city).toBe(candidateData.address?.line5);
      expect(updatedLicenceRecord.ftts_address1_postalcode).toBe(candidateData.address?.postcode);
    });
  });

  describe('updateAdditionalSupport', () => {
    test('successfully updates booking and booking product with the bsl option', async () => {
      const mockLicence = `int-test-${uuidv4()}`;
      const mockCandidate = await crmTestClient.createNewCandidate(mockLicence);
      const mockBooking = await crmTestClient.createNewBooking(mockCandidate, CRMBookingStatus.Confirmed, CRMOrigin.CitizenPortal);
      await crmGateway.updateAdditionalSupport(mockBooking.bookingId, mockBooking.bookingProductId, CRMAdditionalSupport.BritishSignLanguage);

      const updatedBookingProduct = await crmTestClient.retrieveBookingProduct(mockBooking.bookingProductId);
      const updatedBooking = await crmTestClient.retrieveBooking(mockBooking.bookingId);

      expect(updatedBookingProduct.ftts_additionalsupportoptions).toBe(CRMAdditionalSupport.BritishSignLanguage);
      expect(updatedBooking.ftts_additionalsupportoptions).toBe(CRMAdditionalSupport.BritishSignLanguage);
    });
  });

  describe('updateVoiceover', () => {
    test('successfully updates booking and booking product with the voiceover option', async () => {
      const mockLicence = `int-test-${uuidv4()}`;
      const mockCandidate = await crmTestClient.createNewCandidate(mockLicence);
      const mockBooking = await crmTestClient.createNewBooking(mockCandidate, CRMBookingStatus.Confirmed, CRMOrigin.CitizenPortal);
      await crmGateway.updateVoiceover(mockBooking.bookingId, mockBooking.bookingProductId, CRMVoiceOver.English);

      const updatedBookingProduct = await crmTestClient.retrieveBookingProduct(mockBooking.bookingProductId);
      const updatedBooking = await crmTestClient.retrieveBooking(mockBooking.bookingId);

      expect(updatedBookingProduct.ftts_voiceoverlanguage).toBe(CRMVoiceOver.English);
      expect(updatedBooking.ftts_nivoiceoveroptions).toBe(CRMVoiceOver.English);
    });
  });

  describe('updateBookingStatus', () => {
    test('successfully updates booking status to confirmed', async () => {
      const mockLicence = `int-test-${uuidv4()}`;
      const ownerId = config.crm.ownerId.dvsa;
      const mockCandidate = await crmTestClient.createNewCandidate(mockLicence);
      const bookingFields: Record<string, unknown> = { 'ownerid@odata.bind': `teams(${config.crm.ownerId.dvsa})` };
      const mockBooking = await crmTestClient.createNewBooking(mockCandidate, CRMBookingStatus.Draft, CRMOrigin.CitizenPortal, undefined, bookingFields, bookingFields);
      await crmGateway.updateBookingStatus(mockBooking.bookingId, CRMBookingStatus.Confirmed, false);

      const updatedBookingProduct = await crmTestClient.retrieveBookingProduct(mockBooking.bookingProductId);
      const updatedBooking = await crmTestClient.retrieveBooking(mockBooking.bookingId);

      expect(updatedBookingProduct.ftts_bookingstatus).toBe(CRMBookingStatus.Confirmed);
      expect(updatedBooking.ftts_bookingstatus).toBe(CRMBookingStatus.Confirmed);
      expect(updatedBooking._ownerid_value).toBe(ownerId);
      expect(updatedBookingProduct._ownerid_value).toBe(ownerId);
    });

    test('successfully updates booking status to cancellation in progress', async () => {
      const mockLicence = `int-test-${uuidv4()}`;
      const mockCandidate = await crmTestClient.createNewCandidate(mockLicence);
      const mockBooking = await crmTestClient.createNewBooking(mockCandidate, CRMBookingStatus.Confirmed, CRMOrigin.CitizenPortal);
      await crmGateway.updateBookingStatus(mockBooking.bookingId, CRMBookingStatus.CancellationInProgress);

      const updatedBookingProduct = await crmTestClient.retrieveBookingProduct(mockBooking.bookingProductId);
      const updatedBooking = await crmTestClient.retrieveBooking(mockBooking.bookingId);

      expect(updatedBookingProduct.ftts_bookingstatus).toBe(CRMBookingStatus.CancellationInProgress);
      expect(updatedBooking.ftts_bookingstatus).toBe(CRMBookingStatus.CancellationInProgress);
    });

    test('successfully updates booking status to cancelled', async () => {
      const mockLicence = `int-test-${uuidv4()}`;
      const mockCandidate = await crmTestClient.createNewCandidate(mockLicence);
      const mockBooking = await crmTestClient.createNewBooking(mockCandidate, CRMBookingStatus.CancellationInProgress, CRMOrigin.CitizenPortal);
      await crmGateway.updateBookingStatus(mockBooking.bookingId, CRMBookingStatus.Cancelled);

      const updatedBookingProduct = await crmTestClient.retrieveBookingProduct(mockBooking.bookingProductId);
      const updatedBooking = await crmTestClient.retrieveBooking(mockBooking.bookingId);

      expect(updatedBookingProduct.ftts_bookingstatus).toBe(CRMBookingStatus.Cancelled);
      expect(updatedBooking.ftts_bookingstatus).toBe(CRMBookingStatus.Cancelled);
    });
  });

  describe('markBookingCancelled', () => {
    test('successfully updates booking status to cancelled and cancel date to todays date', async () => {
      const mockLicence = `int-test-${uuidv4()}`;
      const mockCandidate = await crmTestClient.createNewCandidate(mockLicence);
      const mockBooking = await crmTestClient.createNewBooking(mockCandidate, CRMBookingStatus.CancellationInProgress, CRMOrigin.CitizenPortal);
      await crmGateway.markBookingCancelled(mockBooking.bookingId, mockBooking.bookingProductId);

      const updatedBookingProduct = await crmTestClient.retrieveBookingProduct(mockBooking.bookingProductId);
      const updatedBooking = await crmTestClient.retrieveBooking(mockBooking.bookingId);

      expect(updatedBookingProduct.ftts_bookingstatus).toBe(CRMBookingStatus.Cancelled);
      expect(new Date(updatedBookingProduct.ftts_canceldate).toISOString()).toBe(mockToday);
      expect(updatedBooking.ftts_bookingstatus).toBe(CRMBookingStatus.Cancelled);
    });
  });

  describe('updateTCNUpdateDate', () => {
    test('successfully updates TCN Update Date', async () => {
      const mockLicence = `int-test-${uuidv4()}`;
      const mockCandidate = await crmTestClient.createNewCandidate(mockLicence);
      const mockBooking = await crmTestClient.createNewBooking(mockCandidate, CRMBookingStatus.Confirmed, CRMOrigin.CitizenPortal);
      await crmGateway.updateTCNUpdateDate(mockBooking.bookingProductId);

      const updatedBookingProduct = await crmTestClient.retrieveBookingProduct(mockBooking.bookingProductId);

      expect(new Date(updatedBookingProduct.ftts_tcn_update_date).toISOString()).toBe(mockToday);
    });
  });

  describe('createBindBetweenBookingAndPayment', () => {
    test('GIVEN a booking AND a payment WHEN called THEN the booking is binded to the payment', async () => {
      const mockLicence = `int-test-${uuidv4()}`;
      const mockCandidate = await crmTestClient.createNewCandidate(mockLicence);
      const mockBooking = await crmTestClient.createNewBookingWithPayment(mockCandidate, CRMBookingStatus.Reserved);

      await crmGateway.createBindBetweenBookingAndPayment(
        mockBooking.bookingId,
        mockBooking.paymentId,
        mockBooking.receiptReference,
      );

      const updatedBooking = await crmTestClient.retrieveBooking(mockBooking.bookingId);
      expect(updatedBooking._ftts_payment_value).toEqual(mockBooking.paymentId);
    });
  });

  describe('updateBookingStatusPaymentStatusAndTCNUpdateDate', () => {
    test('successfully updates booking status and TCN Update Date in a batch request', async () => {
      const mockLicence = `int-test-${uuidv4()}`;
      const mockCandidate = await crmTestClient.createNewCandidate(mockLicence);
      const mockBooking = await crmTestClient.createNewBooking(mockCandidate, CRMBookingStatus.Reserved, CRMOrigin.CitizenPortal);

      await crmGateway.updateBookingStatusPaymentStatusAndTCNUpdateDate(mockBooking.bookingId, mockBooking.bookingProductId, CRMBookingStatus.Draft);

      const updatedBookingProduct = await crmTestClient.retrieveBookingProduct(mockBooking.bookingProductId);
      expect(new Date(updatedBookingProduct.ftts_tcn_update_date).toISOString()).toBe(mockToday);
      expect(updatedBookingProduct.ftts_bookingstatus).toBe(CRMBookingStatus.Draft);
    });

    test('GIVEN a booking AND a payment WHEN called THEN the booking is binded to the payment', async () => {
      const mockLicence = `int-test-${uuidv4()}`;
      const mockCandidate = await crmTestClient.createNewCandidate(mockLicence);
      const mockBooking = await crmTestClient.createNewBookingWithPayment(mockCandidate, CRMBookingStatus.Reserved);

      await crmGateway.updateBookingStatusPaymentStatusAndTCNUpdateDate(
        mockBooking.bookingId,
        mockBooking.bookingProductId,
        CRMBookingStatus.Draft,
        mockBooking.paymentId,
        false,
      );

      const updatedBooking = await crmTestClient.retrieveBooking(mockBooking.bookingId);
      expect(updatedBooking._ftts_payment_value).toEqual(mockBooking.paymentId);
    });

    test('successfully updates booking status, booking product, payment status in a batch request when user cancelled', async () => {
      const mockLicence = `int-test-${uuidv4()}`;
      const mockCandidate = await crmTestClient.createNewCandidate(mockLicence);
      const mockBooking = await crmTestClient.createNewBookingWithPayment(mockCandidate, CRMBookingStatus.Reserved);

      await crmGateway.updateBookingStatusPaymentStatusAndTCNUpdateDate(mockBooking.bookingId, mockBooking.bookingProductId, CRMBookingStatus.AbandonedNonRecoverable, mockBooking.paymentId);

      const updatedBookingProduct = await crmTestClient.retrieveBookingProduct(mockBooking.bookingProductId);
      const updatedBooking = await crmTestClient.retrieveBooking(mockBooking.bookingId);
      expect(updatedBookingProduct.ftts_bookingstatus).toBe(CRMBookingStatus.AbandonedNonRecoverable);
      expect(updatedBooking.ftts_bookingstatus).toBe(CRMBookingStatus.AbandonedNonRecoverable);
    });

    test('upon a gateway error or a system error from the payments API (cpms code 810 or 828 with status 500), update the booking status and booking product to \'SystemErrorNonRecoverable\' and set payment status all in a batch request', async () => {
      const mockLicence = `int-test-${uuidv4()}`;
      const mockCandidate = await crmTestClient.createNewCandidate(mockLicence);
      const mockBooking = await crmTestClient.createNewBooking(mockCandidate, CRMBookingStatus.Reserved);

      await crmGateway.updateBookingStatusPaymentStatusAndTCNUpdateDate(mockBooking.bookingId, mockBooking.bookingProductId, CRMBookingStatus.SystemErrorNonRecoverable);

      const updatedBookingProduct = await crmTestClient.retrieveBookingProduct(mockBooking.bookingProductId);
      const updatedBooking = await crmTestClient.retrieveBooking(mockBooking.bookingId);

      expect(updatedBookingProduct.ftts_bookingstatus).toBe(CRMBookingStatus.SystemErrorNonRecoverable);
      expect(updatedBooking.ftts_bookingstatus).toBe(CRMBookingStatus.SystemErrorNonRecoverable);
    });
  });

  describe('calculateThreeWorkingDays', () => {
    test('should successfully calculate 3 working days for Northern Ireland', async () => {
      const result = await crmGateway.calculateThreeWorkingDays(mockToday, CRMRemit.NorthernIreland);
      expect(result).toEqual('2021-01-29');
    });

    test('should successfully calculate 3 working days for England', async () => {
      const result = await crmGateway.calculateThreeWorkingDays(mockToday, CRMRemit.England);
      expect(result).toEqual('2021-01-30');
    });

    test('should successfully calculate 3 working days for Scotland', async () => {
      const result = await crmGateway.calculateThreeWorkingDays(mockToday, CRMRemit.Scotland);
      expect(result).toEqual('2021-01-30');
    });

    test('should successfully calculate 3 working days for Wales', async () => {
      const result = await crmGateway.calculateThreeWorkingDays(mockToday, CRMRemit.Wales);
      expect(result).toEqual('2021-01-30');
    });
  });

  describe('updateCompensationBooking', () => {
    test('successfully creates and updates a compensation booking to recognise the owed compensation', async () => {
      const mockLicence = `int-test-${uuidv4()}`;
      const mockCandidate = await crmTestClient.createNewCandidate(mockLicence);
      const newCompensatedBooking = await crmTestClient.createNewCompensatedBooking(mockCandidate, CRMOrigin.CitizenPortal, CRMProductNumber.CAR);

      const { bookingId } = newCompensatedBooking;
      const mockOwedCompensationBookingRecognised = dayjs().toISOString();

      await crmGateway.updateCompensationBooking(bookingId, mockOwedCompensationBookingRecognised);

      const expectedBooking = await crmTestClient.retrieveBooking(bookingId);

      expect(expectedBooking.ftts_owedcompbookingrecognised).toStrictEqual(new Date(mockOwedCompensationBookingRecognised));
    });
  });

  describe('getCandidateBookings', () => {
    let mockCandidate: MockTestCandidate;
    beforeEach(async () => {
      const mockLicenceNumber = uuidv4();
      mockCandidate = await crmTestClient.createNewCandidate(mockLicenceNumber);
    });

    test('retrieves a candidate\'s bookings with expected statuses', async () => {
      const statuses = [
        CRMBookingStatus.Confirmed, CRMBookingStatus.CompletePassed, CRMBookingStatus.CompleteFailed,
        CRMBookingStatus.ChangeInProgress, CRMBookingStatus.CancellationInProgress,
      ];
      const mockBookings = await Promise.all(statuses.map((status) => crmTestClient.createNewBooking(mockCandidate, status)));

      const result = await crmGateway.getCandidateBookings(mockCandidate.candidateId);

      expect(result).toHaveLength(5);
      const expectedBookingIds = mockBookings.map((booking) => booking.bookingId).sort();
      const actualBookingIds = result.map((booking) => booking.bookingId).sort();
      expect(actualBookingIds).toStrictEqual(expectedBookingIds);
    });

    test('filters out cancelled bookings', async () => {
      await crmTestClient.createNewBooking(mockCandidate, CRMBookingStatus.Cancelled);
      const mockBooking2 = await crmTestClient.createNewBooking(mockCandidate);

      const result = await crmGateway.getCandidateBookings(mockCandidate.candidateId);

      expect(result).toHaveLength(1);
      expect(result[0].bookingId).toBe(mockBooking2.bookingId);
    });

    test('filters out bookings not from the booking app or CSC', async () => {
      await crmTestClient.createNewBooking(mockCandidate, CRMBookingStatus.Confirmed, CRMOrigin.TrainerBookerPortal);
      await crmTestClient.createNewBooking(mockCandidate, CRMBookingStatus.Confirmed, CRMOrigin.IHTTCPortal);
      const mockBooking3 = await crmTestClient.createNewBooking(mockCandidate);

      const result = await crmGateway.getCandidateBookings(mockCandidate.candidateId);

      expect(result).toHaveLength(1);
      expect(result[0].bookingId).toBe(mockBooking3.bookingId);
    });

    test('gets all the expected booking attributes', async () => {
      const mockBooking = await crmTestClient.createNewBooking(mockCandidate);

      const result = await crmGateway.getCandidateBookings(mockCandidate.candidateId);

      expect(result).toHaveLength(1);
      expect(result[0].bookingId).toBe(mockBooking.bookingId);
      // Check all the attributes we expect are present and defined
      const expectedProps = [
        'reference', 'bookingStatus', 'testDate', 'testLanguage', 'voiceoverLanguage',
        'additionalSupport', 'paymentStatus', 'price', 'salesReference',
        'nonStandardAccommodation', 'enableEligibilityBypass', 'origin',
        'testCentre.testCentreId', 'testCentre.name', 'testCentre.addressLine1',
        'testCentre.addressLine2', 'testCentre.addressCity', 'testCentre.addressPostalCode',
        'testCentre.remit', 'testCentre.accountId', 'testCentre.region', 'testCentre.siteId',
        'bookingProductRef', 'testSupportNeed',
        'createdOn',
      ];
      expectedProps.forEach((prop) => expect(result[0]).toHaveProperty(prop));
    });

    test('retrieves payment information for bookings with \'Cancel in progress\' status', async () => {
      const status = CRMBookingStatus.CancellationInProgress;

      const mockBooking = await crmTestClient.createNewBookingWithPayment(mockCandidate, status);

      const result = await crmGateway.getCandidateBookings(mockCandidate.candidateId);

      expect(result).toHaveLength(1);
      expect(result[0]).toStrictEqual(expect.objectContaining({
        bookingId: mockBooking.bookingId,
        paymentId: mockBooking.paymentId,
        paymentStatus: expect.any(Number),
        financeTransaction: expect.objectContaining({
          financeTransactionId: mockBooking.financeTransactionId,
          transactionStatus: expect.any(Number),
          transactionType: expect.any(Number),
        }),
      }));
    });

    test('retrieves cancelled bookings that are eligible to be rebooked', async () => {
      const status = CRMBookingStatus.Cancelled;

      const mockBooking = await crmTestClient.createNewBookingWithPayment(mockCandidate, status);
      const updateBooking = await crmTestClient.updateBooking(mockBooking.bookingId, {
        ftts_bookingstatus: status,
        ftts_owedcompbookingassigned: '2021-02-03',
      });

      expect(updateBooking).toBeTruthy();

      const result = await crmGateway.getCandidateBookings(mockCandidate.candidateId);

      expect(result).toHaveLength(1);
      expect(result[0].owedCompensationBooking).toBeTruthy();
    });

    test('filters out cancelled bookings that have been rebooked', async () => {
      const status = CRMBookingStatus.Cancelled;

      const mockBooking = await crmTestClient.createNewBookingWithPayment(mockCandidate, status);
      const updateBooking = await crmTestClient.updateBooking(mockBooking.bookingId, {
        ftts_bookingstatus: status,
        ftts_owedcompbookingassigned: '2021-02-03',
        ftts_owedcompbookingrecognised: '2021-02-03',
      });

      expect(updateBooking).toBeTruthy();

      const result = await crmGateway.getCandidateBookings(mockCandidate.candidateId);

      expect(result).toHaveLength(0);
    });

    describe('enableViewNsaBookingSlots feature toggle is on', () => {
      beforeEach(() => {
        config.featureToggles.enableViewNsaBookingSlots = true;
      });

      test('filters back all nsa draft bookings that have no NSA bookings slots', async () => {
        const mockDraftBooking = await crmTestClient.createNewBooking(mockCandidate, CRMBookingStatus.Draft, CRMOrigin.CitizenPortal, CRMProductNumber.CAR, { ftts_nsastatus: CRMNsaStatus.AwaitingCscResponse });

        await crmTestClient.updateBooking(mockDraftBooking.bookingId, {
          ftts_nonstandardaccommodation: true,
          ftts_nivoiceoveroptions: CRMVoiceOver.Arabic,
          ftts_voicemailmessagespermitted: true,
          ftts_foreignlanguageselected: 'French',
        });

        const result = await crmGateway.getCandidateBookings(mockCandidate.candidateId);
        const returnedBooking = result[0];

        expect(result).toHaveLength(1);
        expect(returnedBooking.bookingId).toEqual(mockDraftBooking.bookingId);
        expect(returnedBooking.nsaStatus).toEqual(CRMNsaStatus.AwaitingCscResponse);
        expect(returnedBooking.voiceoverLanguage).toEqual(CRMVoiceOver.Arabic);
        expect(returnedBooking.voicemailmessagespermitted).toBe(true);
        expect(returnedBooking.testDate).toBeNull();
        expect(returnedBooking.nsaBookingSlots).toBeNull();
        expect(returnedBooking.salesReference).toBeNull();
        expect(returnedBooking.testCentre).toEqual({});
        expect(returnedBooking.paymentStatus).toBeNull();
        expect(returnedBooking.accountId).toBeUndefined();
        expect(returnedBooking.financeTransaction).toBeUndefined();
        expect(returnedBooking.paymentId).toBeUndefined();
        expect(returnedBooking.nonStandardAccommodation).toBe(true);
        expect(returnedBooking.foreignlanguageselected).toBe('French');
      });

      test('filters back all nsa draft bookings with some NSA bookings slots', async () => {
        const mockDraftBooking = await crmTestClient.createNewBooking(mockCandidate, CRMBookingStatus.Draft, CRMOrigin.CitizenPortal, CRMProductNumber.CAR, { ftts_nsastatus: CRMNsaStatus.AwaitingCscResponse });

        for (let i = 0; i < 3; i++) {
          // eslint-disable-next-line no-await-in-loop
          await crmTestClient.createNSABookingSlot(mockDraftBooking.bookingId, CRMNsaBookingSlotStatus.Offered, 'test-reservation-id', '2023-04-08T08:45:00Z');
        }

        await crmTestClient.updateBooking(mockDraftBooking.bookingId, {
          ftts_nonstandardaccommodation: true,
          ftts_nivoiceoveroptions: CRMVoiceOver.English,
        });

        const result = await crmGateway.getCandidateBookings(mockCandidate.candidateId);
        const returnedBooking = result[0];
        const returnedNsaBookingSlots = returnedBooking.nsaBookingSlots as CRMNsaBookingSlots[];

        expect(result).toHaveLength(1);
        expect(returnedNsaBookingSlots[0]._ftts_bookingid_value).toEqual(mockDraftBooking.bookingId);
        expect(returnedNsaBookingSlots[1]._ftts_bookingid_value).toEqual(mockDraftBooking.bookingId);
        expect(returnedNsaBookingSlots[2]._ftts_bookingid_value).toEqual(mockDraftBooking.bookingId);
      });

      test('retrieves expected NSA attributes', async () => {
        const mockDraftBooking = await crmTestClient.createNewBooking(mockCandidate, CRMBookingStatus.Draft, CRMOrigin.CitizenPortal, CRMProductNumber.CAR, { ftts_nsastatus: CRMNsaStatus.AwaitingCscResponse });
        await crmTestClient.createNSABookingSlot(mockDraftBooking.bookingId, CRMNsaBookingSlotStatus.Offered, 'test-reservation-id', '2023-04-08T08:45:00Z');

        await crmTestClient.updateBooking(mockDraftBooking.bookingId, {
          ftts_nonstandardaccommodation: true,
          ftts_nivoiceoveroptions: CRMVoiceOver.Farsi,
          ftts_foreignlanguageselected: 'French',
        });

        const result = await crmGateway.getCandidateBookings(mockCandidate.candidateId);
        const returnedBooking = result[0];
        const returnedNsaBookingSlots = returnedBooking.nsaBookingSlots as CRMNsaBookingSlots[];

        expect(returnedBooking).toHaveProperty('nsaStatus');
        expect(returnedBooking).toHaveProperty('voicemailmessagespermitted');
        expect(returnedBooking).toHaveProperty('foreignlanguageselected');
        expect(returnedNsaBookingSlots[0]).toHaveProperty('ftts_status');
        expect(returnedNsaBookingSlots[0]).toHaveProperty('ftts_reservationid');
        expect(returnedNsaBookingSlots[0]).toHaveProperty('ftts_expirydate');
        expect(returnedNsaBookingSlots[0]).toHaveProperty('_ftts_organisationid_value');
        expect(returnedNsaBookingSlots[0]).toHaveProperty('ftts_testdate');
        expect(returnedNsaBookingSlots[0]).toHaveProperty('_ftts_bookingid_value');
      });
    });
  });

  describe('getCompensatedBookings', () => {
    let mockCandidate: MockTestCandidate;

    beforeEach(async () => {
      const mockLicenceNumber = uuidv4();
      mockCandidate = await crmTestClient.createNewCandidate(mockLicenceNumber);
    });

    test('retrieves candidates compensated bookings', async () => {
      const compensatedBooking = await crmTestClient.createNewCompensatedBooking(mockCandidate);
      const bookingProduct = await crmTestClient.retrieveBookingProduct(compensatedBooking.bookingProductId);
      const booking = await crmTestClient.retrieveBooking(compensatedBooking.bookingId);

      const result = await crmGateway.getCandidateCompensatedBookings(mockCandidate.candidateId, Target.GB);

      expect(result).toStrictEqual([expect.objectContaining({
        bookingProductId: compensatedBooking.bookingProductId,
        bookingProductReference: bookingProduct.ftts_reference,
        bookingId: compensatedBooking.bookingId,
        bookingStatus: CRMBookingStatus.Cancelled,
        candidateId: mockCandidate.candidateId,
        compensationAssigned: booking.ftts_owedcompbookingassigned,
        bookingReference: booking.ftts_reference,
        productNumber: CRMProductNumber.CAR,
      })]);
    });
  });

  describe('updateZeroCostBooking', () => {
    test('successfully updates booking with zero cost fields', async () => {
      const mockLicence = `int-test-${uuidv4()}`;
      const mockCandidate = await crmTestClient.createNewCandidate(mockLicence);
      const mockBooking = await crmTestClient.createNewBookingForInstructor(mockCandidate, CRMBookingStatus.Confirmed, CRMOrigin.CitizenPortal);

      await crmGateway.updateZeroCostBooking(mockBooking.bookingId);
      const updatedBooking = await crmTestClient.retrieveBooking(mockBooking.bookingId);

      expect(updatedBooking.ftts_zerocostbooking).toBe(true);
      expect(updatedBooking.ftts_zerocostbookingreason).toBe(CRMZeroCostBookingReason.EXAMINER);
    });
  });

  describe('getUserDraftNSABookingIfExist', () => {
    let mockCandidate: MockTestCandidate;
    beforeEach(async () => {
      const mockLicenceNumber = uuidv4();
      mockCandidate = await crmTestClient.createNewCandidate(mockLicenceNumber);
    });

    // eslint-disable-next-line jest/no-focused-tests
    test('returns true if draft NSA booking found', async () => {
      const mockDraftBooking = await crmTestClient.createNewBooking(mockCandidate, CRMBookingStatus.Draft);

      await crmTestClient.updateBooking(mockDraftBooking.bookingId, {
        ftts_nonstandardaccommodation: true,
      });

      const result = await crmGateway.getUserDraftNSABookingsIfExist(mockCandidate.candidateId, TestType.CAR);

      expect(result).toStrictEqual(expect.arrayContaining([expect.objectContaining({ bookingId: mockDraftBooking.bookingId, origin: CRMOrigin.CitizenPortal })]));
    });

    test('returns false if no draft NSA booking found', async () => {
      await crmTestClient.createNewBooking(mockCandidate, CRMBookingStatus.Confirmed);

      const result = await crmGateway.getUserDraftNSABookingsIfExist(mockCandidate.candidateId, TestType.CAR);

      expect(result).toBeUndefined();
    });

    test('returns false if draft booking found but nonstandardaccommodation eq false', async () => {
      await crmTestClient.createNewBooking(mockCandidate, CRMBookingStatus.Draft);

      const result = await crmGateway.getUserDraftNSABookingsIfExist(mockCandidate.candidateId, TestType.CAR);

      expect(result).toBeUndefined();
    });

    test('returns false if booking found but nonstandardaccommodation eq true', async () => {
      const mockDraftBooking = await crmTestClient.createNewBooking(mockCandidate, CRMBookingStatus.Confirmed);

      await crmTestClient.updateBooking(mockDraftBooking.bookingId, {
        ftts_nonstandardaccommodation: true,
      });

      const result = await crmGateway.getUserDraftNSABookingsIfExist(mockCandidate.candidateId, TestType.CAR);

      expect(result).toBeUndefined();
    });
  });

  describe('updateNSABookings', () => {
    let mockCandidate: MockTestCandidate;
    let mockNsaBookingDetails: NsaBookingDetail[];
    beforeEach(async () => {
      const mockLicenceNumber = uuidv4();
      mockCandidate = await crmTestClient.createNewCandidate(mockLicenceNumber);
    });
    test('successfully updates booking status and nsa status to no longer required and standard test booked', async () => {
      const mockBooking = await crmTestClient.createNewBooking(mockCandidate, CRMBookingStatus.Draft, CRMOrigin.CitizenPortal);

      await crmTestClient.updateBooking(mockBooking.bookingId, { ftts_nsastatus: CRMNsaStatus.AwaitingCscResponse });

      const mockUpdatedBooking = await crmTestClient.retrieveBooking(mockBooking.bookingId);
      const crmNsaStatus = mockUpdatedBooking.ftts_nsastatus as unknown as CRMNsaStatus;

      mockNsaBookingDetails = [{
        bookingId: mockUpdatedBooking.ftts_bookingid,
        crmNsaStatus,
        origin: mockUpdatedBooking.ftts_origin,
      }];

      await crmGateway.updateNSABookings(mockNsaBookingDetails);

      const retrievedBooking = await crmTestClient.retrieveBooking(mockBooking.bookingId);

      expect(retrievedBooking.ftts_bookingstatus).toBe(CRMBookingStatus.NoLongerRequired);
      expect(retrievedBooking.ftts_nsastatus).toBe(CRMNsaStatus.StandardTestBooked);
      expect(retrievedBooking.ftts_origin).toBe(CRMOrigin.CitizenPortal);
    });
  });

  describe('doesCandidateHaveExistingBookingsByTestType', () => {
    let mockCandidate: MockTestCandidate;
    beforeEach(async () => {
      const mockLicenceNumber = uuidv4();
      mockCandidate = await crmTestClient.createNewCandidate(mockLicenceNumber);
    });

    test('returns true if confirmed bookings of existing test type found', async () => {
      await crmTestClient.createNewBookingWithPayment(mockCandidate, CRMBookingStatus.Confirmed, undefined, CRMProductNumber.CAR);

      const result = await crmGateway.doesCandidateHaveExistingBookingsByTestType(mockCandidate.candidateId, TestType.CAR);

      expect(result).toBe(true);
    });

    test('returns false if no confirmed bookings of existing test type found', async () => {
      await crmTestClient.createNewBooking(mockCandidate, CRMBookingStatus.Draft);

      const result = await crmGateway.doesCandidateHaveExistingBookingsByTestType(mockCandidate.candidateId, TestType.CAR);

      expect(result).toBe(false);
    });
  });

  describe('rescheduleBookingAndConfirm', () => {
    test('successfully updates booking with new booking details', async () => {
      const mockLicenceNumber = uuidv4();
      const mockCandidate = await crmTestClient.createNewCandidate(mockLicenceNumber, { telephone2: '123', ftts_title: CRMPeopleTitle.MR, gendercode: CRMGenderCode.Male });
      const mockBooking = await crmTestClient.createNewBooking(mockCandidate, CRMBookingStatus.Confirmed, CRMOrigin.CitizenPortal, CRMProductNumber.CAR, {
        ftts_reschedulecount: 2,
        ftts_testdate: '2022-04-08T08:45:00Z',
      }, {
        ftts_testdate: '2022-04-08T08:45:00Z',
      });

      await crmGateway.rescheduleBookingAndConfirm(mockBooking.bookingId, '2022-05-09T09:52:00Z', 2, false);

      const changedBooking = await crmTestClient.retrieveBooking(mockBooking.bookingId);

      expect(changedBooking.ftts_testdate).toStrictEqual(new Date('2022-05-09T09:52:00.000Z'));
      expect(changedBooking.ftts_reschedulecount).toBe(3);
    });
  });

  describe('getRescheduleCount', () => {
    test('successfully retrieves reschdule count', async () => {
      const mockLicenceNumber = uuidv4();
      const mockCandidate = await crmTestClient.createNewCandidate(mockLicenceNumber, { telephone2: '123', ftts_title: CRMPeopleTitle.MR, gendercode: CRMGenderCode.Male });
      const mockBooking = await crmTestClient.createNewBooking(mockCandidate, CRMBookingStatus.Confirmed, CRMOrigin.CitizenPortal, CRMProductNumber.CAR, {
        ftts_reschedulecount: 2,
      });

      const result = await crmGateway.getRescheduleCount(mockBooking.bookingId);

      expect(result).toBe(2);
    });
  });
});
