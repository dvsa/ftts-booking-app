import MockDate from 'mockdate';
import { ELIG } from '@dvsa/ftts-eligibility-api-model';
import { CRMContact } from '@dvsa/ftts-crm-test-client/dist/crm-types';
import { CandidateDetails } from '@dvsa/ftts-eligibility-api-model/dist/generated/candidateDetails';
import dayjs from 'dayjs';
import { FetchXmlResponse } from 'dynamics-web-api';
import { mockedDynamicsWebApi } from '../../../mocks/dynamicsWebApi.mock';
import { CRMGateway } from '../../../../src/services/crm-gateway/crm-gateway';
import {
  BookingDetails,
  BookingResponse,
  CreateBookingProductResponse,
  CreateCandidateResponse,
  CreateLicenceResponse,
  CRMBookingDetails,
  CRMBookingRescheduleCountResponse,
  CRMBookingResponse,
  CRMLicenceCandidateResponse,
  CRMNsaBookingSlots,
  CRMProductPriceLevel,
  CRMXmlBookingDetails,
  GetWorkingDaysResponse,
  NsaBookingDetail,
} from '../../../../src/services/crm-gateway/interfaces';
import { Booking, Candidate } from '../../../../src/services/session';
import {
  CRMAdditionalSupport,
  CRMBookingStatus,
  CRMCalendarName,
  CRMFinanceTransactionStatus,
  CRMOrigin,
  CRMPaymentStatus,
  CRMRemit,
  CRMTransactionType,
  CRMVoiceOver,
  CRMTestLanguage,
  CRMProductNumber,
  CRMGovernmentAgency,
  CRMPeopleTitle,
  CRMGenderCode,
  CRMNsaStatus,
  CRMCancelReason,
  CRMNsaBookingSlotStatus,
} from '../../../../src/services/crm-gateway/enums';
import {
  Language, Target, TestType, Voiceover,
} from '../../../../src/domain/enums';
import { Centre, PriceListItem } from '../../../../src/domain/types';
import { mockCentres } from '../../../mocks/data/mock-data';
import { BusinessTelemetryEvents, logger } from '../../../../src/helpers';
import config from '../../../../src/config';
import { mapCRMGenderCodeToGenderEnum, mapCRMPeopleTitleToString } from '../../../../src/services/crm-gateway/crm-helper';
import { CrmCreateBookingDataError } from '../../../../src/domain/errors/crm/CrmCreateBookingDataError';

jest.mock('../../../../src/helpers/logger');

const candidateId = 'candidate-id';
const licenceId = 'licence-id';
const licenceNumber = 'licence-number';
const bookingId = 'booking-id';
const bookingReference = 'booking-ref';
const bookingProductId = 'booking-product-id';
const priceListId = 'mockPriceListId';
const receiptReference = 'receipt-ref';

const mockCandidate: Candidate = {
  title: 'Mr',
  gender: CandidateDetails.GenderEnum.M,
  address: {
    line1: '42 Somewhere Street',
    line2: 'This Village',
    line3: 'This County',
    line4: 'Nowhere',
    line5: 'Birmingham',
    postcode: 'B5 1AA',
  },
  behaviouralMarker: false,
  eligibleToBookOnline: true,
  firstnames: 'Test',
  surname: 'User',
  dateOfBirth: '2000-01-01',
  email: 'test@user.com',
  licenceId,
  candidateId,
  licenceNumber,
  eligibilities: [],
  personReference: '123456789',
};

const mockBooking: Booking = {
  bsl: true,
  testType: TestType.CAR,
  centre: {
    accountId: 'site:1234',
  } as Centre,
  dateTime: '2020-01-01',
  language: Language.ENGLISH,
  reservationId: '123456',
  voiceover: Voiceover.ENGLISH,
  bookingId: 'booking-id',
  bookingProductId: 'booking-product-id',
  bookingRef: 'booking-ref',
  bookingProductRef: 'booking-product-ref',
  receiptReference: 'receipt-reference',
  salesReference: 'sales-reference',
  lastRefundDate: '',
  firstSelectedDate: '2020-01-02',
  firstSelectedCentre: {
    accountId: 'first-selected-test-centre-account-id',
  } as Centre,
  translator: undefined,
  customSupport: '',
  selectSupportType: [],
  voicemail: false,
  preferredDay: '',
  preferredLocation: '',
  governmentAgency: Target.GB,
};

const mockNsaBookingDetails: NsaBookingDetail[] = [
  {
    bookingId: '123',
    crmNsaStatus: CRMNsaStatus.AwaitingCscResponse,
    origin: CRMOrigin.CitizenPortal,
  },
  {
    bookingId: '321',
    crmNsaStatus: CRMNsaStatus.AwaitingCscResponse,
    origin: CRMOrigin.CitizenPortal,
  },
];

const mockCRMBookingResponse: CRMBookingResponse = {
  ftts_bookingid: bookingId,
  ftts_reference: bookingReference,
  _ftts_candidateid_value: candidateId,
  _ftts_licenceid_value: licenceId,
};

const mockBookingResponse: BookingResponse = {
  id: bookingId,
  reference: bookingReference,
};

const mockDate = new Date('2020-11-11T14:30:45.979Z');

describe('CRM Gateway', () => {
  beforeEach(() => {
    MockDate.set(mockDate);
  });

  afterEach(() => {
    MockDate.reset();
  });

  let crmGateway: CRMGateway;
  let standardAccommodation: boolean;

  beforeEach(() => {
    standardAccommodation = true;
    crmGateway = new CRMGateway(mockedDynamicsWebApi);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getLicenceNumberRecordsByCandidateId', () => {
    const mockCRMLicenceCandidate: CRMLicenceCandidateResponse = {
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
      personReference: '123456789',
      title: CRMPeopleTitle.MR,
      gender: CRMGenderCode.Male,
      telephone: '1234',
    };

    test('returns a record given a candidate id and a licence number associated to that candidate', async () => {
      mockedDynamicsWebApi.fetch.mockResolvedValue({
        value: [
          mockCRMLicenceCandidate,
        ],
      });

      const result = await crmGateway.getLicenceNumberRecordsByCandidateId(candidateId, licenceNumber);

      expect(result).toStrictEqual({
        candidateId: mockCRMLicenceCandidate.candidateId,
        firstnames: mockCRMLicenceCandidate.firstnames,
        surname: mockCRMLicenceCandidate.surname,
        email: mockCRMLicenceCandidate.email,
        dateOfBirth: mockCRMLicenceCandidate.dateOfBirth,
        licenceId: mockCRMLicenceCandidate.ftts_licenceid,
        licenceNumber: mockCRMLicenceCandidate.ftts_licence,
        personReference: mockCRMLicenceCandidate.personReference,
        title: mapCRMPeopleTitleToString(mockCRMLicenceCandidate.title),
        gender: mapCRMGenderCodeToGenderEnum(mockCRMLicenceCandidate.gender),
        telephone: mockCRMLicenceCandidate.telephone,
        address: {
          line1: mockCRMLicenceCandidate.ftts_address1_street1,
          line2: mockCRMLicenceCandidate.ftts_address1_street2,
          line3: mockCRMLicenceCandidate.ftts_address1street3,
          line4: mockCRMLicenceCandidate.ftts_address1street4,
          line5: mockCRMLicenceCandidate.ftts_address1_city,
          postcode: mockCRMLicenceCandidate.ftts_address1_postalcode,
        },
        supportEvidenceStatus: undefined,
        supportNeedName: undefined,
      });
      expect(logger.info).toHaveBeenCalledTimes(2);
      expect(logger.info).toHaveBeenNthCalledWith(1, 'CRMGateway::getLicenceNumberRecordsByCandidateId: Attempting to retrieve Candidate and Licence from CRM', { candidateId });
      expect(logger.info).toHaveBeenNthCalledWith(2, 'CRMGateway::getLicenceNumberRecordsByCandidateId: Candidate was mapped from CRM', { candidateId });
      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.event).not.toHaveBeenCalled();
    });

    test('returns undefined if no licence/candidate found', async () => {
      mockedDynamicsWebApi.fetch.mockResolvedValue({});

      const result = await crmGateway.getLicenceNumberRecordsByCandidateId(candidateId, '');

      expect(result).toBeUndefined();
      expect(logger.info).toHaveBeenCalledTimes(2);
      expect(logger.info).toHaveBeenNthCalledWith(1, 'CRMGateway::getLicenceNumberRecordsByCandidateId: Attempting to retrieve Candidate and Licence from CRM', { candidateId });
      expect(logger.info).toHaveBeenNthCalledWith(2, 'CRMGateway::getLicenceNumberRecordsByCandidateId: No licence/candidate found for the given candidate id', { candidateId });
      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.event).not.toHaveBeenCalled();
    });

    test('throws an error when the call to CRM fails', async () => {
      const error = {
        message: 'Unknown error',
        status: 500,
      };
      mockedDynamicsWebApi.fetch.mockRejectedValue(error);

      await expect(crmGateway.getLicenceNumberRecordsByCandidateId('candidateIDInvalid', 'licenceInvalid')).rejects.toEqual(error);

      expect(logger.info).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenNthCalledWith(1, 'CRMGateway::getLicenceNumberRecordsByCandidateId: Attempting to retrieve Candidate and Licence from CRM', { candidateId: 'candidateIDInvalid' });
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenLastCalledWith(
        error,
        'CRMGateway::getLicenceNumberRecordsByCandidateId: Error retrieving licence/candidate from CRM',
        { candidateId: 'candidateIDInvalid' },
      );
      expect(logger.event).toHaveBeenCalledTimes(1);
      expect(logger.event).toHaveBeenLastCalledWith(BusinessTelemetryEvents.CDS_ERROR,
        'CRMGateway::getLicenceNumberRecordsByCandidateId: Error retrieving licence/candidate from CRM',
        {
          error,
          candidateId: 'candidateIDInvalid',
        });
    });
  });

  describe('createLicence', () => {
    test('calls CRM and successfully creates a licence for a candidate and returns new licence id', async () => {
      const mockCrmResponse: CreateLicenceResponse = {
        ftts_licenceid: licenceId,
      };
      mockedDynamicsWebApi.createRequest.mockResolvedValue(mockCrmResponse);

      const response = await crmGateway.createLicence(mockCandidate.licenceNumber as string, mockCandidate.address as ELIG.Address, mockCandidate.candidateId as string);

      expect(response).toEqual(licenceId);
      expect(logger.info).toHaveBeenCalledTimes(2);
      expect(logger.info).toHaveBeenNthCalledWith(1, 'CRMGateway::createLicence: Creating licence record in CRM', { candidateId: mockCandidate.candidateId });
      expect(logger.info).toHaveBeenNthCalledWith(2, 'CRMGateway::createLicence: Successfully created licence in CRM', { candidateId: mockCandidate.candidateId, licenceId });
      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.event).not.toHaveBeenCalled();
    });

    test('handles error if call to CRM fails', async () => {
      const mockError = {
        message: 'Unknown error',
        status: 500,
      };
      mockedDynamicsWebApi.createRequest.mockRejectedValue(mockError);

      await expect(crmGateway.createLicence(mockCandidate.licenceNumber as string, mockCandidate.address as ELIG.Address, mockCandidate.candidateId as string)).rejects.toEqual(mockError);

      expect(logger.info).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenNthCalledWith(1, 'CRMGateway::createLicence: Creating licence record in CRM', { candidateId: mockCandidate.candidateId });
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(mockError, 'CRMGateway::createLicence: Could not create licence record for candidate in CRM', { candidateId: mockCandidate.candidateId });
      expect(logger.event).toHaveBeenCalledTimes(1);
      expect(logger.event).toHaveBeenLastCalledWith(BusinessTelemetryEvents.CDS_ERROR,
        'CRMGateway::createLicence: Could not create licence record for candidate in CRM',
        {
          candidateId: mockCandidate.candidateId,
          error: mockError,
        });
    });
  });

  describe('createCandidate', () => {
    test('calls CRM and successfully creates a new candidate and returns new candidate id', async () => {
      const mockCrmResponse: CreateCandidateResponse = {
        contactid: candidateId,
      };
      mockedDynamicsWebApi.createRequest.mockResolvedValue(mockCrmResponse);

      const response = await crmGateway.createCandidate(mockCandidate);

      expect(response).toEqual(candidateId);
      expect(logger.info).toHaveBeenCalledTimes(2);
      expect(logger.info).toHaveBeenNthCalledWith(1, 'CRMGateway::createCandidate: Creating candidate in CRM');
      expect(logger.info).toHaveBeenNthCalledWith(2, 'CRMGateway::createCandidate: Successfully created candidate in CRM', { candidateId });
      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.event).not.toHaveBeenCalled();
    });

    test('handles error if call to CRM fails', async () => {
      const mockError = {
        message: 'Unknown error',
        status: 500,
      };
      mockedDynamicsWebApi.createRequest.mockRejectedValue(mockError);

      await expect(crmGateway.createCandidate(mockCandidate)).rejects.toEqual(mockError);

      expect(logger.info).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenNthCalledWith(1, 'CRMGateway::createCandidate: Creating candidate in CRM');
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(mockError, 'CRMGateway::createCandidate: Could not create candidate record for candidate in CRM', { candidate: mockCandidate });
      expect(logger.event).toHaveBeenCalledTimes(1);
      expect(logger.event).toHaveBeenLastCalledWith(BusinessTelemetryEvents.CDS_ERROR,
        'CRMGateway::createCandidate: Could not create candidate record for candidate in CRM',
        {
          candidate: mockCandidate,
          error: mockError,
        });
    });
  });

  describe('updateCandidate', () => {
    test('successfully calls CRM to update the candidate and doesn\'t throw an error', async () => {
      const updatedCandidate: Partial<CRMContact> = {
        telephone2: '+44 123 567 7789',
        address1_line1: 'updated address line 1',
        address1_line2: 'updated address line 2',
        address1_line3: 'updated address line 3',
        ftts_address1_line4: 'updated address line 4',
        address1_city: 'updated city',
        address1_postalcode: 'B5 1AA',
      };

      mockedDynamicsWebApi.updateRequest.mockResolvedValue({
        contactid: mockCandidate.candidateId,
        telephone2: updatedCandidate.telephone2,
        address1_line1: updatedCandidate.address1_line1,
        address1_line2: updatedCandidate.address1_line2,
        address1_line3: updatedCandidate.address1_line3,
        ftts_address1_line4: updatedCandidate.ftts_address1_line4,
        address1_city: updatedCandidate.address1_city,
        address1_postalcode: updatedCandidate.address1_postalcode,
      });

      const response = await crmGateway.updateCandidate(mockCandidate.candidateId as string, {
        telephone: updatedCandidate.telephone2,
        address: {
          line1: updatedCandidate.address1_line1 as string,
          line2: updatedCandidate.address1_line2,
          line3: updatedCandidate.address1_line3,
          line4: updatedCandidate.ftts_address1_line4,
          line5: updatedCandidate.address1_city,
          postcode: updatedCandidate.address1_postalcode as string,
        },
      });

      const {
        line1, line2, line3, line4, line5, postcode,
      } = response.address as ELIG.Address;

      expect(mockedDynamicsWebApi.updateRequest).toHaveBeenCalled();
      expect(response.candidateId).toBe(mockCandidate.candidateId);
      expect(response.telephone).toBe(updatedCandidate.telephone2);
      expect(line1).toBe(updatedCandidate.address1_line1);
      expect(line2).toBe(updatedCandidate.address1_line2);
      expect(line3).toBe(updatedCandidate.address1_line3);
      expect(line4).toBe(updatedCandidate.ftts_address1_line4);
      expect(line5).toBe(updatedCandidate.address1_city);
      expect(postcode).toBe(updatedCandidate.address1_postalcode);
      expect(logger.info).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenCalledWith('CRMGateway::updateCandidate: Attempting to update candidate details', { candidateId: mockCandidate.candidateId });
      expect(logger.error).not.toHaveBeenCalled();
    });

    test('throws error if CRM call is unsuccessful', async () => {
      const error = {
        message: 'Unknown error',
        status: 500,
      };

      mockedDynamicsWebApi.updateRequest.mockRejectedValue(error);

      const updatedTelephone: Partial<CRMContact> = {
        telephone2: '+44 123 567 7789',
      };

      const mockCandidateId = mockCandidate.candidateId as string;

      await expect(crmGateway.updateCandidate(mockCandidateId, {
        telephone: updatedTelephone.telephone2,
      })).rejects.toEqual(error);

      expect(logger.info).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenCalledWith('CRMGateway::updateCandidate: Attempting to update candidate details', { candidateId: mockCandidate.candidateId });
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(error, 'CRMGateway::updateCandidate: Could not update candidate details in CRM', { candidateId: mockCandidate.candidateId });
      expect(logger.event).toHaveBeenCalledTimes(1);
      expect(logger.event).toHaveBeenLastCalledWith(BusinessTelemetryEvents.CDS_ERROR,
        'CRMGateway::updateCandidate: Could not update candidate details in CRM',
        {
          candidateId: mockCandidate.candidateId,
          error,
        });
    });
  });

  describe('updateLicence', () => {
    test('successfully calls CRM to update a licence record', async () => {
      mockedDynamicsWebApi.updateRequest.mockResolvedValue({
        ftts_licenceid: licenceId,
        ftts_address1_street1: mockCandidate?.address?.line1,
        ftts_address1_street2: mockCandidate.address?.line2,
        ftts_address1street3: mockCandidate?.address?.line3,
        ftts_address1street4: mockCandidate?.address?.line4,
        ftts_address1_city: mockCandidate?.address?.line5,
        ftts_address1_postalcode: mockCandidate?.address?.postcode,
      });

      const response = await crmGateway.updateLicence(licenceId, candidateId, mockCandidate.address);

      const {
        line1, line2, line3, line4, line5, postcode,
      } = mockCandidate.address as ELIG.Address;

      expect(mockedDynamicsWebApi.updateRequest).toHaveBeenCalled();
      expect(response.ftts_licenceid).toBe(licenceId);
      expect(response.ftts_address1_street1).toBe(line1);
      expect(response.ftts_address1_street2).toBe(line2);
      expect(response.ftts_address1street3).toBe(line3);
      expect(response.ftts_address1street4).toBe(line4);
      expect(response.ftts_address1_city).toBe(line5);
      expect(response.ftts_address1_postalcode).toBe(postcode);
      expect(logger.info).toHaveBeenCalledTimes(2);
      expect(logger.info).toHaveBeenNthCalledWith(1, 'CRMGateway::updateLicence: Attempting to update Licence details', { licenceId, candidateId });
      expect(logger.info).toHaveBeenNthCalledWith(2, 'CRMGateway::updateLicence: Successfully updated Licence in CRM', { licenceId, candidateId });
      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.event).not.toHaveBeenCalled();
    });

    test('error gets handled when call to CRM fails', async () => {
      const error = {
        message: 'Unknown error',
        status: 500,
      };

      mockedDynamicsWebApi.updateRequest.mockRejectedValue(error);

      await expect(crmGateway.updateLicence(licenceId, candidateId, mockCandidate.address)).rejects.toEqual(error);

      expect(logger.info).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenNthCalledWith(1, 'CRMGateway::updateLicence: Attempting to update Licence details', { licenceId, candidateId });
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(error, 'CRMGateway::updateLicence: Could not update Licence details in CRM', { licenceId, candidateId });
      expect(logger.event).toHaveBeenCalledTimes(1);
      expect(logger.event).toHaveBeenLastCalledWith(BusinessTelemetryEvents.CDS_ERROR,
        'CRMGateway::updateLicence: Could not update Licence details in CRM',
        {
          licenceId,
          candidateId,
          error,
        });
    });
  });

  describe('updateCandidateAndCreateBooking', () => {
    test('successfully calls CRM to update candidate record when telephone, email and address are different and creates a booking', async () => {
      const updatedCandidate: Partial<CRMContact> = {
        ...mockCandidate,
        emailaddress1: 'newemail@email.com',
        telephone2: '+44 123 567 7789',
      };

      mockedDynamicsWebApi.executeBatch.mockResolvedValue([
        {
          emailaddress1: updatedCandidate.emailaddress1,
          telephone2: updatedCandidate.telephone2,
        },
        {
          ...mockCRMBookingResponse,
          ftts_firstname: mockCandidate.firstnames,
          ftts_lastname: mockCandidate.surname,
          ftts_testdate: mockBooking.dateTime,
        },
      ]);

      const response = await crmGateway.updateCandidateAndCreateBooking(mockCandidate, mockBooking, CRMAdditionalSupport.None, true, priceListId);

      expect(mockedDynamicsWebApi.updateRequest).toHaveBeenCalled();
      expect(mockedDynamicsWebApi.createRequest).toHaveBeenCalled();
      expect(mockedDynamicsWebApi.executeBatch).toHaveBeenCalled();
      expect(response.booking.id).toBe(bookingId);
      expect(response.booking.reference).toBe(bookingReference);
      expect(response.candidate.email).toBe(updatedCandidate.emailaddress1);
      expect(response.candidate.telephone).toBe(updatedCandidate.telephone2);
      expect(logger.info).toHaveBeenCalledTimes(2);
      expect(logger.info).toHaveBeenNthCalledWith(
        1,
        'CRMGateway:updateCandidateAndCreateBooking: Attempting to update candidate details and create booking',
        {
          candidateId: mockCandidate.candidateId,
          licenceId: mockCandidate.licenceId,
          bookingProduct: mockBooking.bookingProductId,
        },
      );
      expect(logger.info).toHaveBeenNthCalledWith(
        2,
        'CRMGateway::updateCandidateAndCreateBooking: Successful',
        {
          candidateId: mockCandidate.candidateId,
          licenceId: mockCandidate.licenceId,
          bookingId: mockCRMBookingResponse.ftts_bookingid,
          bookingReference: mockCRMBookingResponse.ftts_reference,
          bookingProduct: mockBooking.bookingProductId,
        },
      );
      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.event).not.toHaveBeenCalled();
    });

    test('make a 3 retries when crm returns wrong data', async () => {
      const updatedCandidate: Partial<CRMContact> = {
        ...mockCandidate,
        emailaddress1: 'newemail@email.com',
        telephone2: '+44 123 567 7789',
      };

      mockedDynamicsWebApi.executeBatch.mockResolvedValue([
        {
          emailaddress1: updatedCandidate.emailaddress1,
          telephone2: updatedCandidate.telephone2,
        },
        {
          ...mockCRMBookingResponse,
          ftts_firstname: 'different',
          ftts_lastname: mockCandidate.surname,
          ftts_testdate: mockBooking.dateTime,
          _ftts_licenceid_value: licenceId,
          _ftts_cendidateid_value: candidateId,
        },
      ]);
      mockedDynamicsWebApi.createRequest.mockResolvedValueOnce({
        ...mockCRMBookingResponse,
        ftts_firstname: 'different',
        ftts_lastname: mockCandidate.surname,
        ftts_testdate: mockBooking.dateTime,
        _ftts_licenceid_value: licenceId,
        _ftts_cendidateid_value: candidateId,
      });
      mockedDynamicsWebApi.createRequest.mockResolvedValueOnce({
        ...mockCRMBookingResponse,
        ftts_firstname: 'different',
        ftts_lastname: mockCandidate.surname,
        ftts_testdate: mockBooking.dateTime,
        _ftts_licenceid_value: licenceId,
        _ftts_cendidateid_value: candidateId,
      });
      mockedDynamicsWebApi.createRequest.mockResolvedValueOnce({
        ...mockCRMBookingResponse,
        ftts_firstname: 'different',
        ftts_lastname: mockCandidate.surname,
        ftts_testdate: mockBooking.dateTime,
        _ftts_licenceid_value: licenceId,
        _ftts_cendidateid_value: candidateId,
      });
      mockedDynamicsWebApi.createRequest.mockResolvedValueOnce({
        ...mockCRMBookingResponse,
        ftts_firstname: mockCandidate.firstnames,
        ftts_lastname: mockCandidate.surname,
        ftts_testdate: mockBooking.dateTime,
        _ftts_licenceid_value: licenceId,
        _ftts_cendidateid_value: candidateId,
      });

      const response = await crmGateway.updateCandidateAndCreateBooking(mockCandidate, mockBooking, CRMAdditionalSupport.None, true, priceListId);

      expect(response.booking.id).toBe(bookingId);
      expect(response.booking.reference).toBe(bookingReference);
      expect(response.candidate.email).toBe(updatedCandidate.emailaddress1);
      expect(response.candidate.telephone).toBe(updatedCandidate.telephone2);
      expect(mockedDynamicsWebApi.createRequest).toHaveBeenCalledTimes(4);
      expect(logger.event).toHaveBeenCalledTimes(3);
      expect(logger.event).toHaveBeenCalledWith(
        BusinessTelemetryEvents.CDS_REQUEST_RESPONSE_MISMATCH,
        'CRMGateway::updateCandidateAndCreateBooking: request-response data mismatch',
        {
          candidateId: mockCandidate.candidateId,
          licenceId: mockCandidate.licenceId,
          responseBookingId: bookingId,
        },
      );
    });

    test('throws a CrmCreateBookingDataError when crm returns wrong data and retries are not successful', async () => {
      const updatedCandidate: Partial<CRMContact> = {
        ...mockCandidate,
        emailaddress1: 'newemail@email.com',
        telephone2: '+44 123 567 7789',
      };

      mockedDynamicsWebApi.executeBatch.mockResolvedValue([
        {
          emailaddress1: updatedCandidate.emailaddress1,
          telephone2: updatedCandidate.telephone2,
        },
        {
          ...mockCRMBookingResponse,
          ftts_firstname: 'different',
          ftts_lastname: mockCandidate.surname,
          ftts_testdate: mockBooking.dateTime,
        },
      ]);
      mockedDynamicsWebApi.createRequest.mockResolvedValueOnce({
        ...mockCRMBookingResponse,
        ftts_firstname: 'different',
        ftts_lastname: mockCandidate.surname,
        ftts_testdate: mockBooking.dateTime,
      });
      mockedDynamicsWebApi.createRequest.mockResolvedValueOnce({
        ...mockCRMBookingResponse,
        ftts_firstname: 'different',
        ftts_lastname: mockCandidate.surname,
        ftts_testdate: mockBooking.dateTime,
      });
      mockedDynamicsWebApi.createRequest.mockResolvedValueOnce({
        ...mockCRMBookingResponse,
        ftts_firstname: 'different',
        ftts_lastname: mockCandidate.surname,
        ftts_testdate: mockBooking.dateTime,
      });
      mockedDynamicsWebApi.createRequest.mockResolvedValueOnce({
        ...mockCRMBookingResponse,
        ftts_firstname: 'different',
        ftts_lastname: mockCandidate.surname,
        ftts_testdate: mockBooking.dateTime,
      });
      const error = new CrmCreateBookingDataError('CRMGateway::validateBookingAndRetryIfNeeded: crm returned data from different booking');

      await expect(crmGateway.updateCandidateAndCreateBooking(mockCandidate, mockBooking, CRMAdditionalSupport.None, standardAccommodation, priceListId))
        .rejects
        .toThrow(error);
    });

    test('throws an error when licence is missing', async () => {
      const candidate = {
        ...mockCandidate,
      };
      delete candidate.licenceId;
      const error = new Error('CRMGateway::updateCandidateAndCreateBooking: Missing required candidate data');

      await expect(crmGateway.updateCandidateAndCreateBooking(candidate, mockBooking, CRMAdditionalSupport.None, standardAccommodation, priceListId))
        .rejects
        .toThrow(error);

      expect(mockedDynamicsWebApi.executeBatch).not.toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenNthCalledWith(
        1,
        'CRMGateway:updateCandidateAndCreateBooking: Attempting to update candidate details and create booking',
        {
          candidateId: mockCandidate.candidateId,
          licenceId: undefined,
          bookingProduct: mockBooking.bookingProductId,
        },
      );
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(
        error,
        'CRMGateway::updateCandidateAndCreateBooking: Could not update candidate or create the booking in CRM',
        {
          candidateId: mockCandidate.candidateId,
          licenceId: undefined,
          bookingProduct: mockBooking.bookingProductId,
        },
      );
      expect(logger.event).toHaveBeenCalledTimes(1);
      expect(logger.event).toHaveBeenCalledWith(
        BusinessTelemetryEvents.CDS_FAIL_BOOKING_NEW_UPDATE,
        'CRMGateway::updateCandidateAndCreateBooking: Failed',
        {
          error,
          candidateId: mockCandidate.candidateId,
          bookingProduct: mockBooking.bookingProductId,
        },
      );
    });

    test('throws an error when the call to CRM fails', async () => {
      const error = {
        message: 'Unknown error',
        status: 500,
      };

      mockedDynamicsWebApi.executeBatch.mockRejectedValue(error);

      await expect(crmGateway.updateCandidateAndCreateBooking(mockCandidate, mockBooking, CRMAdditionalSupport.None, standardAccommodation, priceListId)).rejects.toEqual(error);

      expect(logger.info).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenNthCalledWith(
        1,
        'CRMGateway:updateCandidateAndCreateBooking: Attempting to update candidate details and create booking',
        {
          candidateId: mockCandidate.candidateId,
          licenceId: mockCandidate.licenceId,
          bookingProduct: mockBooking.bookingProductId,
        },
      );
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(
        error,
        'CRMGateway::updateCandidateAndCreateBooking: Could not update candidate or create the booking in CRM',
        {
          candidateId: mockCandidate.candidateId,
          licenceId: mockCandidate.licenceId,
          bookingProduct: mockBooking.bookingProductId,
        },
      );
      expect(logger.event).toHaveBeenCalledTimes(1);
      expect(logger.event).toHaveBeenCalledWith(
        BusinessTelemetryEvents.CDS_FAIL_BOOKING_NEW_UPDATE,
        'CRMGateway::updateCandidateAndCreateBooking: Failed',
        {
          error,
          candidateId: mockCandidate.candidateId,
          bookingProduct: mockBooking.bookingProductId,
        },
      );
    });
  });

  describe('createBookingProduct', () => {
    test('successfully calls CRM to create a Booking Product and returns its id', async () => {
      const expectedId = '1115e591-75ca-ea11-a812-00224801cecd';
      const mockResponse: CreateBookingProductResponse = {
        ftts_bookingproductid: expectedId,
        ftts_reference: 'mock-ref',
      };
      mockedDynamicsWebApi.createRequest.mockResolvedValue(mockResponse);

      const result = await crmGateway.createBookingProduct(mockCandidate, mockBooking, mockBookingResponse, standardAccommodation, CRMAdditionalSupport.None);

      expect(result).toEqual(expectedId);
      expect(logger.info).toHaveBeenCalledTimes(2);
      expect(logger.info).toHaveBeenNthCalledWith(
        1, 'CRMGateway::createBookingProduct: Creating Booking Product in CRM',
        {
          candidateId: mockCandidate.candidateId,
          licenceId: mockCandidate.licenceId,
          bookingId: mockBooking.bookingId,
          bookingRef: mockBooking.bookingRef,
        },
      );
      expect(logger.info).toHaveBeenNthCalledWith(
        2, 'CRMGateway::createBookingProduct: Successfully created Booking Product in CRM',
        {
          candidateId: mockCandidate.candidateId,
          licenceId: mockCandidate.licenceId,
          bookingId: mockBooking.bookingId,
          bookingProductId: expectedId,
          bookingProductRef: 'mock-ref',
          bookingRef: mockBooking.bookingRef,
        },
      );
      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.event).not.toHaveBeenCalled();
    });

    test('throws an error when the call to CRM fails', async () => {
      const error = {
        message: 'Unknown error',
        status: 500,
      };
      mockedDynamicsWebApi.createRequest.mockRejectedValue(error);

      await expect(crmGateway.createBookingProduct(mockCandidate, mockBooking, mockBookingResponse, standardAccommodation, CRMAdditionalSupport.None)).rejects.toEqual(error);

      expect(logger.info).toHaveBeenNthCalledWith(
        1, 'CRMGateway::createBookingProduct: Creating Booking Product in CRM',
        {
          candidateId: mockCandidate.candidateId,
          licenceId: mockCandidate.licenceId,
          bookingId: mockBooking.bookingId,
          bookingRef: mockBooking.bookingRef,
        },
      );
      expect(logger.error).toHaveBeenCalledWith(error, 'CRMGateway::createBookingProduct: Could not create booking product entity in CRM', {
        candidateId: mockCandidate.candidateId,
        licenceId: mockCandidate.licenceId,
        bookingId: mockBooking.bookingId,
        bookingProduct: mockBooking.bookingProductId,
        bookingRef: mockBooking.bookingRef,
      });
      expect(logger.event).toHaveBeenLastCalledWith(BusinessTelemetryEvents.CDS_FAIL_BOOKING_NEW_UPDATE,
        'CRMGateway::createBookingProduct: Failed',
        {
          candidateId: mockCandidate.candidateId,
          licenceId: mockCandidate.licenceId,
          bookingId: mockBooking.bookingId,
          bookingProduct: mockBooking.bookingProductId,
          bookingRef: mockBooking.bookingRef,
          error,
        });
    });
  });

  describe('rescheduleBookingAndConfirm', () => {
    test('successfully calls CRM to update the booking time and date of a given booking & changes status to confirmed', async () => {
      mockedDynamicsWebApi.updateRequest.mockResolvedValue({});
      const dateTime = '2021-02-16T09:30:00Z';

      await crmGateway.rescheduleBookingAndConfirm(bookingId, dateTime, 0, false);

      expect(mockedDynamicsWebApi.updateRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          key: bookingId,
          collection: 'ftts_bookings',
          entity: {
            ftts_testdate: dateTime,
            ftts_callamend: undefined,
            ftts_bookingstatus: CRMBookingStatus.Confirmed,
            ftts_reschedulecount: 1,
          },
        }),
      );
      expect(logger.info).toHaveBeenCalledTimes(2);
      expect(logger.info).toHaveBeenNthCalledWith(
        1, 'CRMGateway::rescheduleBookingAndConfirm: Attempting to reschedule and confirm booking', { bookingId, dateTime, rescheduleCount: 1 },
      );
      expect(logger.info).toHaveBeenNthCalledWith(
        2, 'CRMGateway::rescheduleBookingAndConfirm: Booking rescheduled and confirmed', { bookingId, dateTime },
      );
      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.event).not.toHaveBeenCalled();
    });

    test('successfully calls CRM to update the booking time, date and location of a given booking & changes status to confirmed', async () => {
      mockedDynamicsWebApi.updateRequest.mockResolvedValue({});
      const dateTime = '2021-02-16T09:30:00Z';
      const centre = { ...mockCentres[0] };

      await crmGateway.rescheduleBookingAndConfirm(bookingId, dateTime, 0, false, centre.accountId);

      expect(mockedDynamicsWebApi.updateRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          key: bookingId,
          collection: 'ftts_bookings',
          entity: {
            ftts_testdate: dateTime,
            ftts_callamend: undefined,
            'ftts_testcentre@odata.bind': `accounts(${centre.accountId})`,
            ftts_bookingstatus: CRMBookingStatus.Confirmed,
            ftts_reschedulecount: 1,
          },
        }),
      );
      expect(logger.info).toHaveBeenCalledTimes(2);
      expect(logger.info).toHaveBeenNthCalledWith(
        1, 'CRMGateway::rescheduleBookingAndConfirm: Attempting to reschedule and confirm booking', { bookingId, dateTime, rescheduleCount: 1 },
      );
      expect(logger.info).toHaveBeenNthCalledWith(
        2, 'CRMGateway::rescheduleBookingAndConfirm: Booking rescheduled and confirmed', { bookingId, dateTime },
      );
      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.event).not.toHaveBeenCalled();
    });

    test('CSC bookings - successfully calls CRM to update the booking time, date and location of a given booking & changes status to confirmed', async () => {
      mockedDynamicsWebApi.updateRequest.mockResolvedValue({});
      const dateTime = '2021-02-16T09:30:00Z';
      const centre = { ...mockCentres[0] };

      await crmGateway.rescheduleBookingAndConfirm(bookingId, dateTime, 0, true, centre.accountId);

      expect(mockedDynamicsWebApi.updateRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          key: bookingId,
          collection: 'ftts_bookings',
          entity: {
            ftts_testdate: dateTime,
            ftts_callamend: 'true',
            'ftts_testcentre@odata.bind': `accounts(${centre.accountId})`,
            ftts_bookingstatus: CRMBookingStatus.Confirmed,
            ftts_reschedulecount: 1,
          },
        }),
      );
      expect(logger.info).toHaveBeenCalledTimes(2);
      expect(logger.info).toHaveBeenNthCalledWith(
        1, 'CRMGateway::rescheduleBookingAndConfirm: Attempting to reschedule and confirm booking', { bookingId, dateTime, rescheduleCount: 1 },
      );
      expect(logger.info).toHaveBeenNthCalledWith(
        2, 'CRMGateway::rescheduleBookingAndConfirm: Booking rescheduled and confirmed', { bookingId, dateTime },
      );
      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.event).not.toHaveBeenCalled();
    });

    test('throws an error when the call to CRM fails', async () => {
      const error = {
        message: 'Unknown error',
        status: 500,
      };
      mockedDynamicsWebApi.updateRequest.mockRejectedValue(error);
      const dateTime = '2021-02-16T09:30:00Z';

      await expect(crmGateway.rescheduleBookingAndConfirm(bookingId, dateTime, 0))
        .rejects.toEqual(error);

      expect(logger.info).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenNthCalledWith(
        1, 'CRMGateway::rescheduleBookingAndConfirm: Attempting to reschedule and confirm booking', { bookingId, dateTime, rescheduleCount: 1 },
      );
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(error, 'CRMGateway::rescheduleBookingAndConfirm: Could not update booking date time and location in CRM', { bookingId, dateTime });
      expect(logger.event).toHaveBeenCalledTimes(1);
      expect(logger.event).toHaveBeenLastCalledWith(BusinessTelemetryEvents.CDS_FAIL_BOOKING_CHANGE_UPDATE,
        'CRMGateway::rescheduleBookingAndConfirm: Failed',
        {
          bookingId,
          error,
        });
    });
  });

  describe('updateBookingStatus', () => {
    test('successfully calls CRM to update the booking status of a given booking', async () => {
      mockedDynamicsWebApi.updateRequest.mockResolvedValue({});
      const crmBookingStatus = CRMBookingStatus.Cancelled;

      await crmGateway.updateBookingStatus(bookingId, crmBookingStatus);

      expect(mockedDynamicsWebApi.updateRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          key: bookingId,
          collection: 'ftts_bookings',
          entity: expect.objectContaining({
            ftts_bookingstatus: crmBookingStatus,
          }),
        }),
      );
      expect(logger.info).toHaveBeenCalledTimes(2);
      expect(logger.info).toHaveBeenNthCalledWith(
        1, 'CRMGateway::updateBookingStatus: Attempting to update booking status', { bookingId, crmBookingStatus },
      );
      expect(logger.info).toHaveBeenNthCalledWith(
        2, 'CRMGateway::updateBookingStatus: Booking status updated', { bookingId, crmBookingStatus },
      );
      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.event).not.toHaveBeenCalled();
    });

    test('CSC bookings - successfully calls CRM to update the booking status of a given booking', async () => {
      mockedDynamicsWebApi.updateRequest.mockResolvedValue({});
      const crmBookingStatus = CRMBookingStatus.Cancelled;

      await crmGateway.updateBookingStatus(bookingId, crmBookingStatus, true);

      expect(mockedDynamicsWebApi.updateRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          key: bookingId,
          collection: 'ftts_bookings',
          entity: expect.objectContaining({
            ftts_bookingstatus: crmBookingStatus,
            ftts_callamend: 'true',
          }),
        }),
      );
      expect(logger.info).toHaveBeenCalledTimes(2);
      expect(logger.info).toHaveBeenNthCalledWith(
        1, 'CRMGateway::updateBookingStatus: Attempting to update booking status', { bookingId, crmBookingStatus },
      );
      expect(logger.info).toHaveBeenNthCalledWith(
        2, 'CRMGateway::updateBookingStatus: Booking status updated', { bookingId, crmBookingStatus },
      );
      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.event).not.toHaveBeenCalled();
    });

    test('throws an error when the call to CRM fails', async () => {
      const error = {
        message: 'Unknown error',
        status: 500,
      };
      mockedDynamicsWebApi.updateRequest.mockRejectedValue(error);
      const crmBookingStatus = CRMBookingStatus.Cancelled;

      await expect(crmGateway.updateBookingStatus(bookingId, crmBookingStatus))
        .rejects.toEqual(error);

      expect(logger.info).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenNthCalledWith(
        1, 'CRMGateway::updateBookingStatus: Attempting to update booking status', { bookingId, crmBookingStatus },
      );
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(error, 'CRMGateway::updateBookingStatus: Could not update booking status in CRM', { bookingId, crmBookingStatus });
      expect(logger.event).toHaveBeenCalledTimes(1);
      expect(logger.event).toHaveBeenLastCalledWith(BusinessTelemetryEvents.CDS_FAIL_BOOKING_CHANGE_UPDATE,
        'CRMGateway::updateBookingStatus: Could not update booking status in CRM',
        {
          bookingId,
          error,
        });
    });
  });

  describe('markBookingCancelled', () => {
    test('successfully calls CRM to update the booking status of a given booking', async () => {
      mockedDynamicsWebApi.updateRequest.mockResolvedValue({});
      const crmBookingStatus = CRMBookingStatus.Cancelled;

      await crmGateway.markBookingCancelled(bookingId, bookingProductId);

      expect(mockedDynamicsWebApi.updateRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          key: bookingId,
          collection: 'ftts_bookings',
          entity: expect.objectContaining({
            ftts_bookingstatus: crmBookingStatus,
          }),
        }),
      );
      expect(mockedDynamicsWebApi.updateRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          key: bookingProductId,
          collection: 'ftts_bookingproducts',
          entity: expect.objectContaining({
            ftts_canceldate: dayjs().toISOString(),
            ftts_cancelreason: CRMCancelReason.Other,
            ftts_cancelreasondetails: 'Booking cancelled by candidate online',
          }),
        }),
      );
      expect(logger.info).toHaveBeenCalledTimes(3);
      expect(logger.info).toHaveBeenNthCalledWith(
        1, 'CRMGateway::markBookingCancelled: Attempting to update booking status and cancel date', { bookingId, bookingProductId },
      );
      expect(logger.info).toHaveBeenNthCalledWith(
        2, 'CRMGateway::updateBookingStatus: Attempting to update booking status', { bookingId, crmBookingStatus },
      );
      expect(logger.info).toHaveBeenNthCalledWith(
        3, 'CRMGateway::markBookingCancelled: Booking status and Booking product cancel date updated', { bookingId, bookingProductId },
      );
      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.event).not.toHaveBeenCalled();
    });

    test('CSC bookings - successfully calls CRM to update the booking status of a given booking', async () => {
      mockedDynamicsWebApi.updateRequest.mockResolvedValue({});
      const crmBookingStatus = CRMBookingStatus.Cancelled;

      await crmGateway.markBookingCancelled(bookingId, bookingProductId, true);

      expect(mockedDynamicsWebApi.updateRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          key: bookingId,
          collection: 'ftts_bookings',
          entity: expect.objectContaining({
            ftts_bookingstatus: crmBookingStatus,
          }),
        }),
      );
      expect(mockedDynamicsWebApi.updateRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          key: bookingProductId,
          collection: 'ftts_bookingproducts',
          entity: expect.objectContaining({
            ftts_canceldate: dayjs().toISOString(),
            ftts_cancelreason: CRMCancelReason.Other,
            ftts_cancelreasondetails: 'Booking cancelled by candidate online',
          }),
        }),
      );
      expect(logger.info).toHaveBeenCalledTimes(3);
      expect(logger.info).toHaveBeenNthCalledWith(
        1, 'CRMGateway::markBookingCancelled: Attempting to update booking status and cancel date', { bookingId, bookingProductId },
      );
      expect(logger.info).toHaveBeenNthCalledWith(
        2, 'CRMGateway::updateBookingStatus: Attempting to update booking status', { bookingId, crmBookingStatus },
      );
      expect(logger.info).toHaveBeenNthCalledWith(
        3, 'CRMGateway::markBookingCancelled: Booking status and Booking product cancel date updated', { bookingId, bookingProductId },
      );
      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.event).not.toHaveBeenCalled();
    });

    test('throws an error when the call to CRM fails', async () => {
      const error = {
        message: 'Unknown error',
        status: 500,
      };
      mockedDynamicsWebApi.executeBatch.mockRejectedValue(error);
      const crmBookingStatus = CRMBookingStatus.Cancelled;

      await expect(crmGateway.markBookingCancelled(bookingId, bookingProductId))
        .rejects.toEqual(error);

      expect(logger.info).toHaveBeenCalledTimes(3);
      expect(logger.info).toHaveBeenNthCalledWith(
        1, 'CRMGateway::markBookingCancelled: Attempting to update booking status and cancel date', { bookingId, bookingProductId },
      );
      expect(logger.info).toHaveBeenNthCalledWith(
        2, 'CRMGateway::updateBookingStatus: Attempting to update booking status', { bookingId, crmBookingStatus },
      );
      expect(logger.info).toHaveBeenNthCalledWith(
        3, 'CRMGateway::updateBookingStatus: Booking status updated', { bookingId, crmBookingStatus },
      );
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(error, 'CRMGateway::markBookingCancelled: Could not update booking status in CRM', { bookingId, bookingProductId });
      expect(logger.event).toHaveBeenCalledTimes(1);
      expect(logger.event).toHaveBeenLastCalledWith(BusinessTelemetryEvents.CDS_FAIL_BOOKING_CHANGE_UPDATE,
        'CRMGateway::markBookingCancelled: Could not update booking status in CRM',
        {
          bookingId,
          error,
        });
    });
  });

  describe('updateVoiceover', () => {
    test('successfully calls CRM to update the voiceover of a given booking', async () => {
      const voiceover = CRMVoiceOver.English;
      await crmGateway.updateVoiceover(bookingId, bookingProductId, voiceover);

      expect(mockedDynamicsWebApi.updateRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          key: bookingId,
          collection: 'ftts_bookings',
          entity: expect.objectContaining({
            ftts_nivoiceoveroptions: voiceover,
          }),
        }),
      );
      expect(mockedDynamicsWebApi.updateRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          key: bookingProductId,
          collection: 'ftts_bookingproducts',
          entity: expect.objectContaining({
            ftts_voiceoverlanguage: voiceover,
          }),
        }),
      );
      expect(mockedDynamicsWebApi.executeBatch).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenCalledTimes(2);
      expect(logger.info).toHaveBeenNthCalledWith(
        1, 'CRMGateway::updateVoiceover: Attempting to update voicover', { bookingId, bookingProductId, voiceover },
      );
      expect(logger.info).toHaveBeenNthCalledWith(
        2, 'CRMGateway::updateVoiceover: Voiceover updated successfully', { bookingId, bookingProductId, voiceover },
      );
      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.event).not.toHaveBeenCalled();
    });

    test('CSC bookings - successfully calls CRM to update the voiceover of a given booking', async () => {
      const voiceover = CRMVoiceOver.English;
      await crmGateway.updateVoiceover(bookingId, bookingProductId, voiceover, true);

      expect(mockedDynamicsWebApi.updateRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          key: bookingId,
          collection: 'ftts_bookings',
          entity: expect.objectContaining({
            ftts_nivoiceoveroptions: voiceover,
            ftts_callamend: 'true',
          }),
        }),
      );
      expect(mockedDynamicsWebApi.updateRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          key: bookingProductId,
          collection: 'ftts_bookingproducts',
          entity: expect.objectContaining({
            ftts_voiceoverlanguage: voiceover,
          }),
        }),
      );
      expect(mockedDynamicsWebApi.executeBatch).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenCalledTimes(2);
      expect(logger.info).toHaveBeenNthCalledWith(
        1, 'CRMGateway::updateVoiceover: Attempting to update voicover', { bookingId, bookingProductId, voiceover },
      );
      expect(logger.info).toHaveBeenNthCalledWith(
        2, 'CRMGateway::updateVoiceover: Voiceover updated successfully', { bookingId, bookingProductId, voiceover },
      );
      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.event).not.toHaveBeenCalled();
    });

    test('throws an error when the call to CRM fails', async () => {
      const voiceover = CRMVoiceOver.English;
      const error = {
        message: 'Unknown error',
        status: 500,
      };

      mockedDynamicsWebApi.executeBatch.mockRejectedValue(error);

      await expect(crmGateway.updateVoiceover(bookingId, bookingProductId, voiceover))
        .rejects.toEqual(error);

      expect(logger.info).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenNthCalledWith(
        1, 'CRMGateway::updateVoiceover: Attempting to update voicover', { bookingId, bookingProductId, voiceover },
      );
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(error, 'CRMGateway::updateVoiceover: Could not update voiceover in CRM', { bookingId, bookingProductId, voiceover });
      expect(logger.event).toHaveBeenCalledTimes(1);
      expect(logger.event).toHaveBeenLastCalledWith(BusinessTelemetryEvents.CDS_FAIL_BOOKING_CHANGE_UPDATE,
        'CRMGateway::updateVoiceover: Could not update voiceover in CRM',
        {
          bookingId,
          error,
        });
    });
  });

  describe('updateAdditionalSupport', () => {
    const additionalSupport = CRMAdditionalSupport.BritishSignLanguage;

    test('successfully calls CRM to update the bsl option of a given booking', async () => {
      await crmGateway.updateAdditionalSupport(bookingId, bookingProductId, additionalSupport);

      expect(mockedDynamicsWebApi.updateRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          key: bookingId,
          collection: 'ftts_bookings',
          entity: expect.objectContaining({
            ftts_additionalsupportoptions: additionalSupport,
          }),
        }),
      );
      expect(mockedDynamicsWebApi.updateRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          key: bookingProductId,
          collection: 'ftts_bookingproducts',
          entity: expect.objectContaining({
            ftts_additionalsupportoptions: additionalSupport,
          }),
        }),
      );
      expect(mockedDynamicsWebApi.executeBatch).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenCalledTimes(2);
      expect(logger.info).toHaveBeenNthCalledWith(
        1, 'CRMGateway::updateAdditionalSupport: Attempting to update additional support', { bookingId, bookingProductId, additionalSupport },
      );
      expect(logger.info).toHaveBeenNthCalledWith(
        2, 'CRMGateway::updateAdditionalSupport: Additional support updated', { bookingId, bookingProductId, additionalSupport },
      );
      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.event).not.toHaveBeenCalled();
    });

    test('CSC bookings - successfully calls CRM to update the bsl option of a given booking', async () => {
      await crmGateway.updateAdditionalSupport(bookingId, bookingProductId, additionalSupport, true);

      expect(mockedDynamicsWebApi.updateRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          key: bookingId,
          collection: 'ftts_bookings',
          entity: expect.objectContaining({
            ftts_additionalsupportoptions: additionalSupport,
            ftts_callamend: 'true',
          }),
        }),
      );
      expect(mockedDynamicsWebApi.updateRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          key: bookingProductId,
          collection: 'ftts_bookingproducts',
          entity: expect.objectContaining({
            ftts_additionalsupportoptions: additionalSupport,
          }),
        }),
      );
      expect(mockedDynamicsWebApi.executeBatch).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenCalledTimes(2);
      expect(logger.info).toHaveBeenNthCalledWith(
        1, 'CRMGateway::updateAdditionalSupport: Attempting to update additional support', { bookingId, bookingProductId, additionalSupport },
      );
      expect(logger.info).toHaveBeenNthCalledWith(
        2, 'CRMGateway::updateAdditionalSupport: Additional support updated', { bookingId, bookingProductId, additionalSupport },
      );
      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.event).not.toHaveBeenCalled();
    });

    test('throws an error when the call to CRM fails', async () => {
      const error = {
        message: 'Unknown error',
        status: 500,
      };

      mockedDynamicsWebApi.executeBatch.mockRejectedValue(error);

      await expect(crmGateway.updateAdditionalSupport(bookingId, bookingProductId, additionalSupport))
        .rejects.toEqual(error);

      expect(mockedDynamicsWebApi.executeBatch).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenNthCalledWith(
        1, 'CRMGateway::updateAdditionalSupport: Attempting to update additional support', { bookingId, bookingProductId, additionalSupport },
      );
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(error, 'CRMGateway::updateAdditionalSupport: Could not update additional support options in CRM', { bookingId, bookingProductId, additionalSupport });
      expect(logger.event).toHaveBeenCalledTimes(1);
      expect(logger.event).toHaveBeenLastCalledWith(BusinessTelemetryEvents.CDS_FAIL_BOOKING_CHANGE_UPDATE,
        'CRMGateway::updateAdditionalSupport: Could not update additional support options in CRM',
        {
          bookingId,
          error,
        });
    });
  });

  describe('updateLanguage', () => {
    const language = CRMTestLanguage.Welsh;
    test('successfully calls CRM to update the booking language of a given booking', async () => {
      await crmGateway.updateLanguage(bookingId, bookingProductId, language);

      expect(mockedDynamicsWebApi.updateRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          key: bookingId,
          collection: 'ftts_bookings',
          entity: expect.objectContaining({
            ftts_language: language,
          }),
        }),
      );
      expect(mockedDynamicsWebApi.updateRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          key: bookingProductId,
          collection: 'ftts_bookingproducts',
          entity: expect.objectContaining({
            ftts_testlanguage: language,
          }),
        }),
      );
      expect(mockedDynamicsWebApi.executeBatch).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenCalledTimes(2);
      expect(logger.info).toHaveBeenNthCalledWith(
        1, 'CRMGateway::updateLanguage: Attempting to update language', { bookingId, bookingProductId, language },
      );
      expect(logger.info).toHaveBeenNthCalledWith(
        2, 'CRMGateway::updateLanguage: Language updated successfully', { bookingId, bookingProductId, language },
      );
      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.event).not.toHaveBeenCalled();
    });

    test('CSC bookings - successfully calls CRM to update the booking language of a given booking', async () => {
      await crmGateway.updateLanguage(bookingId, bookingProductId, language, true);

      expect(mockedDynamicsWebApi.updateRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          key: bookingId,
          collection: 'ftts_bookings',
          entity: expect.objectContaining({
            ftts_language: language,
            ftts_callamend: 'true',
          }),
        }),
      );
      expect(mockedDynamicsWebApi.updateRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          key: bookingProductId,
          collection: 'ftts_bookingproducts',
          entity: expect.objectContaining({
            ftts_testlanguage: language,
          }),
        }),
      );
      expect(mockedDynamicsWebApi.executeBatch).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenCalledTimes(2);
      expect(logger.info).toHaveBeenNthCalledWith(
        1, 'CRMGateway::updateLanguage: Attempting to update language', { bookingId, bookingProductId, language },
      );
      expect(logger.info).toHaveBeenNthCalledWith(
        2, 'CRMGateway::updateLanguage: Language updated successfully', { bookingId, bookingProductId, language },
      );
      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.event).not.toHaveBeenCalled();
    });

    test('throws an error when the call to CRM fails', async () => {
      const error = {
        message: 'Unknown error',
        status: 500,
      };

      mockedDynamicsWebApi.executeBatch.mockRejectedValue(error);

      await expect(crmGateway.updateLanguage(bookingId, bookingProductId, language))
        .rejects.toEqual(error);

      expect(logger.info).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenNthCalledWith(
        1, 'CRMGateway::updateLanguage: Attempting to update language', { bookingId, bookingProductId, language },
      );
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(error, 'CRMGateway::updateLanguage: Could not update language in CRM', { bookingId, bookingProductId, language });
      expect(logger.event).toHaveBeenCalledTimes(1);
      expect(logger.event).toHaveBeenLastCalledWith(BusinessTelemetryEvents.CDS_FAIL_BOOKING_CHANGE_UPDATE,
        'CRMGateway::updateLanguage: Could not update language in CRM',
        {
          bookingId,
          error,
        });
    });
  });

  describe('updateCompensationBooking', () => {
    test('successfully calls CRM to update the compensation booking to mark the booking owed compensation as recognised', async () => {
      const mockBookingId = 'mock-booking-id';
      const owedCompensationBookingRecognised = dayjs().toISOString();

      const mockRequest: DynamicsWebApi.UpdateRequest = {
        key: mockBookingId,
        collection: 'ftts_bookings',
        entity: {
          ftts_owedcompbookingrecognised: owedCompensationBookingRecognised,
        },
      };

      await crmGateway.updateCompensationBooking(mockBookingId, owedCompensationBookingRecognised);

      expect(mockedDynamicsWebApi.updateRequest).toHaveBeenCalledWith(mockRequest);
    });

    test('throws an error if the call to CRM fails', async () => {
      const mockBookingId = 'mock-booking-id';
      const owedCompensationBookingRecognised = dayjs().toISOString();

      const error = new Error('failed to call CRM');

      mockedDynamicsWebApi.updateRequest.mockRejectedValue(error);

      await expect(crmGateway.updateCompensationBooking(mockBookingId, owedCompensationBookingRecognised)).rejects.toThrow(error);
    });
  });

  describe('getCandidateBookings', () => {
    describe('ability to view nsa booking slots - false', () => {
      beforeEach(() => {
        config.featureToggles.enableViewNsaBookingSlots = false;
      });

      test('successfully calls CRM to get the given candidate\'s bookings from booking app/CSC', async () => {
        const mockReturnValue: CRMBookingDetails[] = [{
          ftts_bookingproductid: '000',
          ftts_reference: 'B-001-01',
          ftts_bookingstatus: CRMBookingStatus.Confirmed,
          ftts_testdate: '2020-10-10',
          ftts_price: 25,
          createdon: dayjs().toISOString(),
          ftts_testlanguage: CRMTestLanguage.Welsh,
          ftts_voiceoverlanguage: CRMVoiceOver.Welsh,
          ftts_salesreference: 'receipt123',
          ftts_additionalsupportoptions: CRMAdditionalSupport.None,
          _ftts_bookingid_value: 'value',
          ftts_paymentstatus: CRMPaymentStatus.Success,
          ftts_bookingid: {
            ftts_reference: 'abcd1234',
            ftts_origin: CRMOrigin.CitizenPortal,
            ftts_governmentagency: CRMGovernmentAgency.Dvsa,
            ftts_enableeligibilitybypass: false,
            ftts_nonstandardaccommodation: false,
            ftts_owedcompbookingassigned: 'not assigned',
            ftts_owedcompbookingrecognised: 'not recognised',
            ftts_zerocostbooking: false,
            ftts_nivoiceoveroptions: null,
            ftts_voicemailmessagespermitted: null,
            ftts_nsastatus: null,
            ftts_testcentre: {
              name: 'mock-site-name',
              ftts_remit: CRMRemit.England,
              ftts_siteid: 'site:123',
              address1_line1: 'address-line-1',
              address1_line2: 'address-line-2',
              address1_city: 'address-city',
              address1_county: 'address-county',
              address1_postalcode: 'address-post-code',
              accountid: 'accountid',
              ftts_tcntestcentreid: 'tnc-test-centre-id',
              parentaccountid: {
                ftts_regiona: true,
                ftts_regionb: false,
                ftts_regionc: false,
              },
            },
            ftts_foreignlanguageselected: null,
            ftts_testsupportneed: null,
          },
          ftts_productid: {
            productid: 'mock-product-id',
            _parentproductid_value: 'mock-parent-product-id',
            name: 'Car test',
            productnumber: CRMProductNumber.CAR,
          },
          ftts_nsabookingslots: null,
        }, {
          ftts_bookingproductid: '001',
          ftts_reference: 'B-002-01',
          ftts_bookingstatus: CRMBookingStatus.Reserved,
          ftts_testdate: '2020-10-10',
          ftts_price: 25,
          createdon: dayjs().toISOString(),
          ftts_testlanguage: CRMTestLanguage.Welsh,
          ftts_voiceoverlanguage: CRMVoiceOver.Welsh,
          ftts_salesreference: 'receipt123',
          ftts_additionalsupportoptions: CRMAdditionalSupport.None,
          _ftts_bookingid_value: 'value',
          ftts_paymentstatus: CRMPaymentStatus.InProgress,
          ftts_bookingid: {
            ftts_reference: 'abcd1234',
            ftts_origin: CRMOrigin.IHTTCPortal,
            ftts_governmentagency: CRMGovernmentAgency.Dvsa,
            ftts_enableeligibilitybypass: false,
            ftts_nonstandardaccommodation: false,
            ftts_owedcompbookingassigned: 'not assigned',
            ftts_owedcompbookingrecognised: 'not recognised',
            ftts_zerocostbooking: false,
            ftts_nivoiceoveroptions: null,
            ftts_voicemailmessagespermitted: null,
            ftts_nsastatus: null,
            ftts_testcentre: {
              name: 'mock-site-name',
              ftts_remit: CRMRemit.England,
              address1_line1: 'address-line-1',
              address1_line2: 'address-line-2',
              address1_city: 'address-city',
              address1_county: 'address-county',
              address1_postalcode: 'address-post-code',
              accountid: 'accountid',
              ftts_tcntestcentreid: 'tnc-test-centre-id',
              ftts_siteid: 'site:123',
              parentaccountid: {
                ftts_regiona: true,
                ftts_regionb: false,
                ftts_regionc: false,
              },
            },
            ftts_foreignlanguageselected: null,
            ftts_testsupportneed: null,
          },
          ftts_productid: {
            productid: 'mock-product-id',
            _parentproductid_value: 'mock-parent-product-id',
            name: 'Car test',
            productnumber: CRMProductNumber.CAR,
          },
          ftts_nsabookingslots: null,
        }, {
          ftts_bookingproductid: '002',
          ftts_reference: 'B-003-01',
          ftts_bookingstatus: CRMBookingStatus.Confirmed,
          ftts_price: 25,
          createdon: dayjs().toISOString(),
          ftts_testdate: '2020-10-10',
          ftts_testlanguage: CRMTestLanguage.Welsh,
          ftts_voiceoverlanguage: CRMVoiceOver.Welsh,
          ftts_salesreference: 'receipt123',
          ftts_paymentstatus: null,
          ftts_additionalsupportoptions: CRMAdditionalSupport.None,
          _ftts_bookingid_value: 'value',
          ftts_bookingid: {
            ftts_reference: 'abcd1234',
            ftts_governmentagency: CRMGovernmentAgency.Dvsa,
            ftts_enableeligibilitybypass: false,
            ftts_nonstandardaccommodation: false,
            ftts_owedcompbookingassigned: 'not assigned',
            ftts_owedcompbookingrecognised: 'not recognised',
            ftts_nivoiceoveroptions: null,
            ftts_zerocostbooking: false,
            ftts_voicemailmessagespermitted: null,
            ftts_nsastatus: null,
            ftts_origin: CRMOrigin.CustomerServiceCentre,
            ftts_testcentre: {
              name: 'mock-site-name',
              address1_line1: 'address-line-1',
              address1_line2: 'address-line-2',
              address1_city: 'address-city',
              address1_county: 'address-county',
              address1_postalcode: 'address-post-code',
              accountid: 'accountid',
              ftts_tcntestcentreid: 'tnc-test-centre-id',
              ftts_remit: CRMRemit.England,
              ftts_siteid: 'site:123',
              parentaccountid: {
                ftts_regionc: true,
                ftts_regiona: false,
                ftts_regionb: false,
              },
            },
            ftts_foreignlanguageselected: null,
            ftts_testsupportneed: null,
          },
          ftts_productid: {
            productid: 'mock-product-id',
            _parentproductid_value: 'mock-parent-product-id',
            name: 'Car test',
            productnumber: CRMProductNumber.CAR,
          },
          ftts_nsabookingslots: null,
        }, {
          ftts_bookingproductid: '003',
          ftts_reference: 'B-004-01',
          ftts_bookingstatus: CRMBookingStatus.Confirmed,
          ftts_testdate: '2020-10-10',
          ftts_testlanguage: CRMTestLanguage.Welsh,
          ftts_voiceoverlanguage: CRMVoiceOver.Welsh,
          ftts_salesreference: 'receipt123',
          ftts_price: 25,
          createdon: dayjs().toISOString(),
          ftts_paymentstatus: CRMPaymentStatus.Failure,
          ftts_additionalsupportoptions: CRMAdditionalSupport.None,
          _ftts_bookingid_value: 'value',
          ftts_bookingid: {
            ftts_reference: 'abcd1234',
            ftts_governmentagency: CRMGovernmentAgency.Dvsa,
            ftts_enableeligibilitybypass: false,
            ftts_nonstandardaccommodation: false,
            ftts_nsastatus: null,
            ftts_owedcompbookingassigned: 'not assigned',
            ftts_owedcompbookingrecognised: 'not recognised',
            ftts_nivoiceoveroptions: null,
            ftts_voicemailmessagespermitted: null,
            ftts_zerocostbooking: false,
            ftts_origin: CRMOrigin.CustomerServiceCentre,
            ftts_testcentre: {
              name: 'mock-site-name',
              address1_line1: 'address-line-1',
              address1_line2: 'address-line-2',
              address1_city: 'address-city',
              address1_county: 'address-county',
              address1_postalcode: 'address-post-code',
              ftts_remit: CRMRemit.England,
              ftts_siteid: 'site:123',
              parentaccountid: {
                ftts_regionb: true,
                ftts_regiona: false,
                ftts_regionc: false,
              },
            },
            ftts_foreignlanguageselected: null,
            ftts_testsupportneed: null,
          },
          ftts_productid: {
            productid: 'mock-product-id',
            _parentproductid_value: 'mock-parent-product-id',
            name: 'Car test',
            productnumber: CRMProductNumber.CAR,
          },
          ftts_nsabookingslots: null,
        }];

        mockedDynamicsWebApi.retrieveMultipleRequest.mockResolvedValue({
          value: mockReturnValue,
        });

        const result = await crmGateway.getCandidateBookings(candidateId);

        const expectedIds = ['000']; // Should filter out non-booking app/CSC bookings and CSC bookings with unconfirmed payment
        const actualIds = result.map((booking) => booking.bookingProductId);
        expect(actualIds).toStrictEqual(expectedIds);
        expect(logger.error).not.toHaveBeenCalled();
        expect(logger.event).not.toHaveBeenCalled();
      });

      test('is able to load bookings with a status of Change in Progress', async () => {
        mockedDynamicsWebApi.retrieveMultipleRequest.mockResolvedValue({
          value: [{
            ftts_bookingproductid: '001',
            ftts_reference: 'B-001-01',
            ftts_bookingstatus: CRMBookingStatus.ChangeInProgress,
            ftts_testdate: '2020-10-10',
            ftts_testlanguage: CRMTestLanguage.Welsh,
            ftts_voiceoverlanguage: CRMVoiceOver.Welsh,
            ftts_salesreference: 'receipt123',
            ftts_paymentstatus: CRMPaymentStatus.Success,
            ftts_additionalsupportoptions: CRMAdditionalSupport.None,
            ftts_bookingid: {
              ftts_reference: 'abcd1234',
              ftts_origin: CRMOrigin.CitizenPortal,
              ftts_testcentre: {
                ftts_remit: CRMRemit.England,
                ftts_siteid: 'site:123',
                parentaccountid: {
                  ftts_regiona: true,
                },
              },
              ftts_foreignlanguageselected: null,
              ftts_testsupportneed: null,
            },
            ftts_productid: {
              productid: 'mock-product-id',
              _parentproductid_value: 'mock-parent-product-id',
              name: 'Car test',
              productnumber: CRMProductNumber.CAR,
            },
          }],
        });

        const result = await crmGateway.getCandidateBookings(candidateId);

        const expectedIds = ['001'];
        const actualIds = result.map((booking) => booking.bookingProductId);
        expect(actualIds).toStrictEqual(expectedIds);
        expect(logger.error).not.toHaveBeenCalled();
        expect(logger.event).not.toHaveBeenCalled();
      });

      test('is able to retrieve payment information for bookings with a status of Cancellation in Progress', async () => {
        mockedDynamicsWebApi.retrieveMultipleRequest.mockResolvedValue({
          value: [{
            ftts_bookingproductid: '001',
            ftts_reference: 'B-001-01',
            ftts_bookingstatus: CRMBookingStatus.CancellationInProgress,
            ftts_testdate: '2020-10-10',
            ftts_testlanguage: CRMTestLanguage.Welsh,
            ftts_voiceoverlanguage: CRMVoiceOver.Welsh,
            ftts_salesreference: 'receipt123',
            ftts_paymentstatus: CRMPaymentStatus.Success,
            ftts_additionalsupportoptions: CRMAdditionalSupport.None,
            ftts_bookingid: {
              ftts_reference: 'abcd1234',
              ftts_origin: CRMOrigin.CitizenPortal,
              ftts_testcentre: {
                ftts_remit: CRMRemit.England,
                ftts_siteid: 'site:123',
                parentaccountid: {
                  ftts_regiona: true,
                },
              },
              ftts_foreignlanguageselected: null,
              ftts_testsupportneed: null,
            },
            ftts_productid: {
              productid: 'mock-product-id',
              _parentproductid_value: 'mock-parent-product-id',
              name: 'Car test',
              productnumber: CRMProductNumber.CAR,
            },
          }],
        });
        mockedDynamicsWebApi.executeBatch.mockResolvedValue([{
          value: [{
            ftts_type: CRMTransactionType.Booking,
            ftts_status: CRMFinanceTransactionStatus.Deferred,
            _ftts_bookingproduct_value: '001',
            ftts_financetransactionid: '011',
            ftts_payment: {
              ftts_status: CRMPaymentStatus.Success,
              ftts_paymentid: '111',
            },
          }],
        }]);

        const result = await crmGateway.getCandidateBookings(candidateId);

        expect(result[0]).toMatchObject(expect.objectContaining({
          paymentId: '111',
          paymentStatus: CRMPaymentStatus.Success,
        }));
        expect(result[0].financeTransaction).toStrictEqual({
          financeTransactionId: '011',
          transactionStatus: CRMFinanceTransactionStatus.Deferred,
          transactionType: CRMTransactionType.Booking,
        });
        expect(logger.error).not.toHaveBeenCalled();
        expect(logger.event).not.toHaveBeenCalled();
      });

      test('is able to load bookings with a status of Cancelled that have not yet rebooked their cancelled test', async () => {
        mockedDynamicsWebApi.retrieveMultipleRequest.mockResolvedValue({
          value: [{
            ftts_bookingproductid: '001',
            ftts_reference: 'B-001-01',
            ftts_bookingstatus: CRMBookingStatus.Cancelled,
            ftts_testdate: '2020-10-10',
            ftts_testlanguage: CRMTestLanguage.Welsh,
            ftts_voiceoverlanguage: CRMVoiceOver.Welsh,
            ftts_salesreference: 'receipt123',
            ftts_paymentstatus: CRMPaymentStatus.Success,
            ftts_additionalsupportoptions: CRMAdditionalSupport.None,
            ftts_bookingid: {
              ftts_reference: 'abcd1234',
              ftts_origin: CRMOrigin.CitizenPortal,
              ftts_testcentre: {
                ftts_remit: CRMRemit.England,
                ftts_siteid: 'site:123',
                parentaccountid: {
                  ftts_regiona: true,
                },
              },
              ftts_owedcompbookingassigned: '2020-10-10',
              ftts_owedcompbookingrecognised: null,
              ftts_foreignlanguageselected: null,
              ftts_testsupportneed: null,
            },
            ftts_productid: {
              productid: 'mock-product-id',
              _parentproductid_value: 'mock-parent-product-id',
              name: 'Car test',
              productnumber: CRMProductNumber.CAR,
            },
          }],
        });

        const result = await crmGateway.getCandidateBookings(candidateId);

        const expectedIds = ['001'];
        const actualIds = result.map((booking) => booking.bookingProductId);
        expect(actualIds).toStrictEqual(expectedIds);
        expect(logger.error).not.toHaveBeenCalled();
        expect(logger.event).not.toHaveBeenCalled();
      });

      test('does not attempt to load the cancelled booking that has already been rebooked', async () => {
        mockedDynamicsWebApi.retrieveMultipleRequest.mockResolvedValue({
          value: [{
            ftts_bookingproductid: '001',
            ftts_reference: 'B-001-01',
            ftts_bookingstatus: CRMBookingStatus.Cancelled,
            ftts_testdate: '2020-10-10',
            ftts_testlanguage: CRMTestLanguage.Welsh,
            ftts_voiceoverlanguage: CRMVoiceOver.Welsh,
            ftts_salesreference: 'receipt123',
            ftts_paymentstatus: CRMPaymentStatus.Success,
            ftts_additionalsupportoptions: CRMAdditionalSupport.None,
            ftts_bookingid: {
              ftts_reference: 'abcd1234',
              ftts_origin: CRMOrigin.CitizenPortal,
              ftts_testcentre: {
                ftts_remit: CRMRemit.England,
                ftts_siteid: 'site:123',
                parentaccountid: {
                  ftts_regiona: true,
                },
              },
              ftts_owedcompbookingassigned: '2020-10-10',
              ftts_owedcompbookingrecognised: '2021-02-02',
              ftts_foreignlanguageselected: null,
              ftts_testsupportneed: null,
            },
            ftts_productid: {
              productid: 'mock-product-id',
              _parentproductid_value: 'mock-parent-product-id',
              name: 'Car test',
              productnumber: CRMProductNumber.CAR,
            },
          }],
        });

        const result = await crmGateway.getCandidateBookings(candidateId);

        expect(logger.error).not.toHaveBeenCalled();
        expect(result).toEqual([]);
      });

      test('does not attempt to load booking that have been cancelled in the standard way', async () => {
        mockedDynamicsWebApi.retrieveMultipleRequest.mockResolvedValue({
          value: [{
            ftts_bookingproductid: '001',
            ftts_reference: 'B-001-01',
            ftts_bookingstatus: CRMBookingStatus.Cancelled,
            ftts_testdate: '2020-10-10',
            ftts_testlanguage: CRMTestLanguage.Welsh,
            ftts_voiceoverlanguage: CRMVoiceOver.Welsh,
            ftts_salesreference: 'receipt123',
            ftts_paymentstatus: CRMPaymentStatus.Success,
            ftts_additionalsupportoptions: CRMAdditionalSupport.None,
            ftts_bookingid: {
              ftts_reference: 'abcd1234',
              ftts_origin: CRMOrigin.CitizenPortal,
              ftts_testcentre: {
                ftts_remit: CRMRemit.England,
                ftts_siteid: 'site:123',
                parentaccountid: {
                  ftts_regiona: true,
                },
              },
              ftts_owedcompbookingassigned: null,
              ftts_owedcompbookingrecognised: null,
              ftts_foreignlanguageselected: null,
              ftts_testsupportneed: null,
            },
            ftts_productid: {
              productid: 'mock-product-id',
              _parentproductid_value: 'mock-parent-product-id',
              name: 'Car test',
              productnumber: CRMProductNumber.CAR,
            },
          }],
        });

        const result = await crmGateway.getCandidateBookings(candidateId);

        expect(logger.error).not.toHaveBeenCalled();
        expect(result).toEqual([]);
      });

      test('does not attempt to get any payment information if no bookings are returned from the get bookings api call', async () => {
        mockedDynamicsWebApi.retrieveMultipleRequest.mockResolvedValue({ value: [] });

        await crmGateway.getCandidateBookings(candidateId);

        expect(mockedDynamicsWebApi.startBatch).not.toHaveBeenCalled();
        expect(mockedDynamicsWebApi.executeBatch).not.toHaveBeenCalled();
      });

      test('does not attempt to get any payment info if there are no bookings with the Cancellation in Progress Status', async () => {
        mockedDynamicsWebApi.retrieveMultipleRequest.mockResolvedValue({
          value: [{
            ftts_bookingproductid: '001',
            ftts_reference: 'B-001-01',
            ftts_bookingstatus: CRMBookingStatus.Confirmed,
            ftts_testdate: '2020-10-10',
            ftts_testlanguage: CRMTestLanguage.Welsh,
            ftts_voiceoverlanguage: CRMVoiceOver.Welsh,
            ftts_salesreference: 'receipt123',
            ftts_paymentstatus: CRMPaymentStatus.Success,
            ftts_additionalsupportoptions: CRMAdditionalSupport.None,
            ftts_bookingid: {
              ftts_reference: 'abcd1234',
              ftts_origin: CRMOrigin.CitizenPortal,
              ftts_testcentre: {
                ftts_remit: CRMRemit.England,
                ftts_siteid: 'site:123',
                parentaccountid: {
                  ftts_regionc: true,
                },
              },
              ftts_foreignlanguageselected: null,
              ftts_testsupportneed: null,
            },
            ftts_productid: {
              productid: 'mock-product-id',
              _parentproductid_value: 'mock-parent-product-id',
              name: 'Car test',
              productnumber: CRMProductNumber.CAR,
            },
          }],
        });

        await crmGateway.getCandidateBookings(candidateId);

        expect(mockedDynamicsWebApi.startBatch).not.toHaveBeenCalled();
        expect(mockedDynamicsWebApi.executeBatch).not.toHaveBeenCalled();
      });

      test('throws an error when the call to CRM fails', async () => {
        const error = {
          message: 'Unknown error',
          status: 500,
        };

        mockedDynamicsWebApi.retrieveMultipleRequest.mockRejectedValue(error);

        await expect(crmGateway.getCandidateBookings(candidateId)).rejects.toEqual(error);

        expect(logger.error).toHaveBeenCalledTimes(1);
        expect(logger.error).toHaveBeenCalledWith(
          error,
          'CRMGateway::getCandidateBookings: Could not retrieve booking products from CRM',
          {
            candidateId,
          },
        );
        expect(logger.event).toHaveBeenCalledTimes(1);
        expect(logger.event).toHaveBeenCalledWith(
          BusinessTelemetryEvents.CDS_ERROR,
          'CRMGateway::getCandidateBookings: Could not retrieve booking products from CRM',
          {
            error,
            candidateId,
          },
        );
      });
    });

    describe('ability to view nsa booking slots - true', () => {
      let standardBookings: CRMXmlBookingDetails[];
      let nsaBookings: CRMXmlBookingDetails[];
      let nsaBookingSlots: CRMNsaBookingSlots[];
      let nsaBookingSlotResponse: FetchXmlResponse<CRMNsaBookingSlots>;
      let standardBookingResponse: FetchXmlResponse<CRMXmlBookingDetails>;
      let nsaBookingResponse: FetchXmlResponse<CRMXmlBookingDetails>;

      beforeEach(() => {
        config.featureToggles.enableViewNsaBookingSlots = true;

        standardBookings = [{
          createdon: '03-02-2022',
          ftts_bookingproductid: '001',
          ftts_reference: 'B-001-000-001',
          ftts_bookingstatus: CRMBookingStatus.CancellationInProgress,
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
          'booking.ftts_nivoiceoveroptions': null,
          'booking.ftts_origin': CRMOrigin.CitizenPortal,
          'booking.ftts_testsupportneed': null,
          'booking.ftts_zerocostbooking': false,
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
          'account.name': 'mock-name',
          'parentaccountid.ftts_regiona': true,
          'parentaccountid.ftts_regionb': false,
          'parentaccountid.ftts_regionc': false,
        }];

        nsaBookings = [
          {
            createdon: '03-02-2022',
            ftts_bookingproductid: '002',
            ftts_reference: 'B-001-000-001',
            ftts_bookingstatus: CRMBookingStatus.Draft,
            ftts_testdate: null,
            ftts_price: 23,
            ftts_testlanguage: CRMTestLanguage.Welsh,
            ftts_voiceoverlanguage: CRMVoiceOver.Welsh,
            ftts_salesreference: null,
            ftts_paymentstatus: null,
            ftts_additionalsupportoptions: CRMAdditionalSupport.None,
            _ftts_bookingid_value: 'mock-id',
            bookingReference: 'mock-ref',
            'booking.ftts_enableeligibilitybypass': false,
            'booking.ftts_foreignlanguageselected': '',
            'booking.ftts_governmentagency': CRMGovernmentAgency.Dvsa,
            'booking.ftts_nonstandardaccommodation': true,
            'booking.ftts_nsastatus': CRMNsaStatus.AwaitingCscResponse,
            'booking.ftts_origin': CRMOrigin.CitizenPortal,
            'booking.ftts_owedcompbookingassigned': '',
            'booking.ftts_owedcompbookingrecognised': '',
            'booking.ftts_testsupportneed': '',
            'booking.ftts_zerocostbooking': false,
            'booking.ftts_nivoiceoveroptions': CRMVoiceOver.None,
            'product.parentproductid': 'mock-parentproduct-id',
            'product.productid': 'mock-product-id',
            'product.name': 'mock-name',
            'product.productnumber': CRMProductNumber.CAR,
          },
          {
            createdon: '03-02-2022',
            ftts_bookingproductid: '003',
            ftts_reference: 'B-001-000-001',
            ftts_bookingstatus: CRMBookingStatus.Draft,
            ftts_testdate: null,
            ftts_price: 23,
            ftts_testlanguage: CRMTestLanguage.Welsh,
            ftts_voiceoverlanguage: CRMVoiceOver.Welsh,
            ftts_salesreference: null,
            ftts_paymentstatus: null,
            ftts_additionalsupportoptions: CRMAdditionalSupport.None,
            _ftts_bookingid_value: 'mock-id2',
            bookingReference: 'mock-ref',
            'booking.ftts_enableeligibilitybypass': false,
            'booking.ftts_foreignlanguageselected': '',
            'booking.ftts_governmentagency': CRMGovernmentAgency.Dvsa,
            'booking.ftts_nonstandardaccommodation': true,
            'booking.ftts_nsastatus': CRMNsaStatus.AwaitingCscResponse,
            'booking.ftts_origin': CRMOrigin.CitizenPortal,
            'booking.ftts_owedcompbookingassigned': '',
            'booking.ftts_owedcompbookingrecognised': '',
            'booking.ftts_testsupportneed': '',
            'booking.ftts_zerocostbooking': false,
            'booking.ftts_nivoiceoveroptions': CRMVoiceOver.Albanian,
            'product.parentproductid': 'mock-parentproduct-id',
            'product.productid': 'mock-product-id',
            'product.name': 'mock-name',
            'product.productnumber': CRMProductNumber.CAR,
          },
          {
            createdon: '03-02-2022',
            ftts_bookingproductid: '004',
            ftts_reference: 'B-001-000-001',
            ftts_bookingstatus: CRMBookingStatus.Draft,
            ftts_testdate: null,
            ftts_price: 23,
            ftts_testlanguage: CRMTestLanguage.Welsh,
            ftts_voiceoverlanguage: CRMVoiceOver.Welsh,
            ftts_salesreference: null,
            ftts_paymentstatus: null,
            ftts_additionalsupportoptions: CRMAdditionalSupport.None,
            _ftts_bookingid_value: 'mock-id3',
            bookingReference: 'mock-ref',
            'booking.ftts_enableeligibilitybypass': false,
            'booking.ftts_foreignlanguageselected': '',
            'booking.ftts_governmentagency': CRMGovernmentAgency.Dvsa,
            'booking.ftts_nonstandardaccommodation': true,
            'booking.ftts_nsastatus': CRMNsaStatus.AwaitingCscResponse,
            'booking.ftts_origin': CRMOrigin.CitizenPortal,
            'booking.ftts_owedcompbookingassigned': '',
            'booking.ftts_owedcompbookingrecognised': '',
            'booking.ftts_testsupportneed': '',
            'booking.ftts_zerocostbooking': false,
            'booking.ftts_nivoiceoveroptions': CRMVoiceOver.Bengali,
            'product.parentproductid': 'mock-parentproduct-id',
            'product.productid': 'mock-product-id',
            'product.name': 'mock-name',
            'product.productnumber': CRMProductNumber.CAR,
          },
        ];

        nsaBookingSlots = [
          {
            ftts_status: CRMNsaBookingSlotStatus.Offered,
            ftts_reservationid: 'mock-reservation-id',
            ftts_expirydate: '10-11-2002',
            _ftts_organisationid_value: 'mock-organisation-value',
            ftts_testdate: '10-11-2002',
            _ftts_bookingid_value: 'mock-id',
          },
          {
            ftts_status: CRMNsaBookingSlotStatus.Offered,
            ftts_reservationid: 'mock-reservation-id2',
            ftts_expirydate: '10-11-2002',
            _ftts_organisationid_value: 'mock-organisation-value',
            ftts_testdate: '10-11-2002',
            _ftts_bookingid_value: 'mock-id',
          },
          {
            ftts_status: CRMNsaBookingSlotStatus.Offered,
            ftts_reservationid: 'mock-reservation-id3',
            ftts_expirydate: '10-11-2002',
            _ftts_organisationid_value: 'mock-organisation-value',
            ftts_testdate: '10-11-2002',
            _ftts_bookingid_value: 'mock-id2',
          },
          {
            ftts_status: CRMNsaBookingSlotStatus.Offered,
            ftts_reservationid: 'mock-reservation-id4',
            ftts_expirydate: '10-11-2002',
            _ftts_organisationid_value: 'mock-organisation-value',
            ftts_testdate: '10-11-2002',
            _ftts_bookingid_value: 'mock-id2',
          },
          {
            ftts_status: CRMNsaBookingSlotStatus.Offered,
            ftts_reservationid: 'mock-reservation-id5',
            ftts_expirydate: '10-11-2002',
            _ftts_organisationid_value: 'mock-organisation-value',
            ftts_testdate: '10-11-2002',
            _ftts_bookingid_value: 'mock-id3',
          },
          {
            ftts_status: CRMNsaBookingSlotStatus.Offered,
            ftts_reservationid: 'mock-reservation-id6',
            ftts_expirydate: '10-11-2003',
            _ftts_organisationid_value: 'mock-organisation-value',
            ftts_testdate: '15-05-2002',
            _ftts_bookingid_value: 'mock-id3',
          },
        ];

        nsaBookingSlotResponse = {
          value: nsaBookingSlots,
        };

        standardBookingResponse = {
          value: standardBookings,
        };

        nsaBookingResponse = {
          value: nsaBookings,
        };
      });

      test('is able to load bookings that are both standard bookings, and non-standard that contain a draft booking status', async () => {
        mockedDynamicsWebApi.executeBatch.mockResolvedValue([standardBookingResponse, nsaBookingResponse]);
        mockedDynamicsWebApi.fetch.mockResolvedValue(nsaBookingSlotResponse);

        const result = await crmGateway.getCandidateBookings(candidateId);

        const expectedIds = ['001', '002', '003', '004'];
        const actualIds = result.map((booking) => booking.bookingProductId);
        expect(actualIds).toStrictEqual(expectedIds);
        expect(logger.error).not.toHaveBeenCalled();
        expect(logger.event).not.toHaveBeenCalled();
      });

      test('correctly maps nsa booking slots to nsa bookings', async () => {
        standardBookingResponse = {
          value: [],
        };

        mockedDynamicsWebApi.executeBatch.mockResolvedValue([standardBookingResponse, nsaBookingResponse]);
        mockedDynamicsWebApi.fetch.mockResolvedValue(nsaBookingSlotResponse);

        const result = await crmGateway.getCandidateBookings(candidateId);

        result.forEach((mockResultBooking: BookingDetails) => {
          const nsaBookingSlotsResult = mockResultBooking.nsaBookingSlots as CRMNsaBookingSlots[];
          nsaBookingSlotsResult.forEach((nsaBookingSlot: CRMNsaBookingSlots) => {
            // eslint-disable-next-line no-underscore-dangle
            expect(nsaBookingSlot._ftts_bookingid_value).toEqual(mockResultBooking.bookingId);
          });
        });
      });

      test('only returns standard tests if there are no NSA bookings', async () => {
        nsaBookingResponse = {
          value: [],
        };

        mockedDynamicsWebApi.executeBatch.mockResolvedValue([standardBookingResponse, nsaBookingResponse]);
        mockedDynamicsWebApi.fetch.mockResolvedValue({});

        const result = await crmGateway.getCandidateBookings(candidateId);

        const expectedIds = ['001'];
        const actualIds = result.map((booking) => booking.bookingProductId);
        expect(actualIds).toStrictEqual(expectedIds);
        expect(logger.error).not.toHaveBeenCalled();
        expect(logger.event).not.toHaveBeenCalled();
      });

      test('returns nsa tests if there are no nsa booking slots', async () => {
        standardBookingResponse = {
          value: [],
        };

        mockedDynamicsWebApi.executeBatch.mockResolvedValue([standardBookingResponse, nsaBookingResponse]);
        mockedDynamicsWebApi.fetch.mockResolvedValue({});

        const result = await crmGateway.getCandidateBookings(candidateId);

        const expectedIds = ['002', '003', '004'];
        const actualIds = result.map((booking) => booking.bookingProductId);
        expect(actualIds).toStrictEqual(expectedIds);
        expect(logger.error).not.toHaveBeenCalled();
        expect(logger.event).not.toHaveBeenCalled();
      });

      test('does not attempt to load draft NSA bookings that have no NSA status attached to them', async () => {
        nsaBookings[0]['booking.ftts_nsastatus'] = null;
        nsaBookings[1]['booking.ftts_nsastatus'] = null;
        nsaBookings[2]['booking.ftts_nsastatus'] = null;

        mockedDynamicsWebApi.executeBatch.mockResolvedValue([standardBookingResponse, nsaBookingResponse]);
        mockedDynamicsWebApi.fetch.mockResolvedValue(nsaBookingSlotResponse);

        const result = await crmGateway.getCandidateBookings(candidateId);

        const expectedIdsNotReturned = ['002', '003', '004'];
        const actualIds = result.map((booking) => booking.bookingProductId);
        expect(actualIds).not.toContain(expectedIdsNotReturned);
        expect(logger.error).not.toHaveBeenCalled();
      });

      test('does not attempt to load draft NSA bookings that aren\'t non-standard', async () => {
        nsaBookings[0]['booking.ftts_nonstandardaccommodation'] = false;

        mockedDynamicsWebApi.executeBatch.mockResolvedValue([standardBookingResponse, nsaBookingResponse]);
        mockedDynamicsWebApi.fetch.mockResolvedValue(nsaBookingSlotResponse);

        const result = await crmGateway.getCandidateBookings(candidateId);

        const expectedIdsNotReturned = ['002'];
        const actualIds = result.map((booking) => booking.bookingProductId);
        expect(actualIds).not.toContain(expectedIdsNotReturned);
        expect(logger.error).not.toHaveBeenCalled();
      });

      test('does not attempt to get any payment information if any draft NSA bookings are returned from the get bookings api call', async () => {
        standardBookingResponse = {
          value: [],
        };

        mockedDynamicsWebApi.executeBatch.mockResolvedValue([standardBookingResponse, nsaBookingResponse]);
        mockedDynamicsWebApi.fetch.mockResolvedValue({});

        await crmGateway.getCandidateBookings(candidateId);

        expect(logger.debug).not.toHaveBeenCalledWith('CRMGateway::getPaymentInformationForBookingDetails: Raw Response', expect.any(Object));
      });

      test('fails when call to crm to fetch xml based queries throw an error', async () => {
        const error = new Error('fail to call crm');
        mockedDynamicsWebApi.fetch.mockRejectedValue(error);

        await expect(crmGateway.getCandidateBookings(candidateId)).rejects.toThrow(error);
      });
    });
  });

  describe('getCandidateCompensatedBookings', () => {
    test('successfully calls CRM to get candidates bookings which require compensation', async () => {
      mockedDynamicsWebApi.fetch.mockResolvedValue({
        value: [
          {
            '@odata.etag': 'W/"161765247"',
            _ftts_candidateid_value: '4ddab30e-f90e-eb11-a813-000d3a7f128d',
            ftts_bookingstatus: 675030008,
            _ftts_productid_value: 'da490f3e-2605-4c03-9d28-f935cf9ace5c',
            ftts_selected: true,
            ftts_bookingproductid: '9afee4ea-43fc-eb11-94ef-000d3ad67a18',
            bookingId: '42bcf7e8-43fc-eb11-94ef-000d3ad6739c',
            bookingProductReference: 'B-000-193-849-01',
            bookingReference: 'B-000-193-849',
            productNumber: '1001',
            compensationAssigned: '2021-08-30T18:30:00.000Z',
            candidateName: 'Wendy',
            bookingStatus: 675030008,
            candidateId: '4ddab30e-f90e-eb11-a813-000d3a7f128d',
            bookingProductId: '9afee4ea-43fc-eb11-94ef-000d3ad67a18',
          },
        ],
      });

      const result = await crmGateway.getCandidateCompensatedBookings(candidateId, Target.GB);

      expect(result).toStrictEqual([
        {
          '@odata.etag': 'W/"161765247"',
          _ftts_candidateid_value: '4ddab30e-f90e-eb11-a813-000d3a7f128d',
          ftts_bookingstatus: 675030008,
          _ftts_productid_value: 'da490f3e-2605-4c03-9d28-f935cf9ace5c',
          ftts_selected: true,
          ftts_bookingproductid: '9afee4ea-43fc-eb11-94ef-000d3ad67a18',
          bookingId: '42bcf7e8-43fc-eb11-94ef-000d3ad6739c',
          bookingProductReference: 'B-000-193-849-01',
          bookingReference: 'B-000-193-849',
          productNumber: '1001',
          compensationAssigned: '2021-08-30T18:30:00.000Z',
          candidateName: 'Wendy',
          bookingStatus: 675030008,
          candidateId: '4ddab30e-f90e-eb11-a813-000d3a7f128d',
          bookingProductId: '9afee4ea-43fc-eb11-94ef-000d3ad67a18',
        },
      ]);
      expect(logger.error).not.toHaveBeenCalled();
    });

    test('logs error when call to CRM to get candidates bookings which require compensation fail', async () => {
      const error = new Error('error');
      mockedDynamicsWebApi.fetch.mockRejectedValue(error);

      await expect(crmGateway.getCandidateCompensatedBookings(candidateId, Target.GB))
        .rejects
        .toStrictEqual(error);

      expect(logger.error)
        .toHaveBeenCalledWith(error, 'CRMGateway::getCandidateCompensatedBookings: Could not retrieve compensated booking from CRM', { candidateId: 'candidate-id' });
    });
  });

  describe('createBindBetweenBookingAndPayment', () => {
    const paymentId = 'ebd85a44-2ae4-459d-b2b9-40278c1ab7a9';

    test('udpates a booking', async () => {
      await crmGateway.createBindBetweenBookingAndPayment(bookingId, paymentId, receiptReference);

      expect(logger.info).toHaveBeenCalledWith(
        'CRMGateway::createBindBetweenBookingAndPayment: Attempting to create a bind between a booking and a payment',
        {
          bookingId,
          paymentId,
          receiptReference,
        },
      );
      expect(logger.debug).toHaveBeenCalledWith(
        'CRMGateway::createBindBetweenBookingAndPayment: Trying to update a booking',
        {
          updateRequest: {
            key: bookingId,
            collection: 'ftts_bookings',
            entity: {
              'ftts_payment@odata.bind': `/ftts_payments(${paymentId})`,
            },
          },
        },
      );
      expect(mockedDynamicsWebApi.updateRequest).toHaveBeenCalledTimes(1);
      expect(mockedDynamicsWebApi.updateRequest).toHaveBeenCalledWith({
        key: bookingId,
        collection: 'ftts_bookings',
        entity: {
          'ftts_payment@odata.bind': `/ftts_payments(${paymentId})`,
        },
      });
    });

    test('rethrows the error', async () => {
      mockedDynamicsWebApi.updateRequest.mockRejectedValue('Error');
      await expect(
        crmGateway.createBindBetweenBookingAndPayment(bookingId, paymentId, receiptReference),
      ).rejects.toEqual('Error');
    });

    test('bookingId not provided', async () => {
      await expect(
        crmGateway.createBindBetweenBookingAndPayment(undefined, paymentId, receiptReference),
      ).rejects.toEqual(new Error('bookingId is not defined'));
    });

    test('paymentId not provided', async () => {
      await expect(
        crmGateway.createBindBetweenBookingAndPayment(bookingId, undefined, undefined),
      ).rejects.toEqual(new Error('paymentId is not defined'));
    });
  });

  describe('calculateThreeWorkingDays', () => {
    test('successfully calls the working days action in CRM', async () => {
      const mockResponse: GetWorkingDaysResponse = {
        '@odata.context': 'mock',
        DueDate: new Date('2020-01-10'),
        oDataContext: 'mock',
      };
      mockedDynamicsWebApi.executeUnboundAction.mockResolvedValue(mockResponse);

      const result = await crmGateway.calculateThreeWorkingDays('2020-01-01', CRMRemit.England);

      expect(mockedDynamicsWebApi.executeUnboundAction).toHaveBeenCalledWith(
        'ftts_GetClearWorkingDay',
        {
          CalendarName: CRMCalendarName.England,
          NoOfDays: -4,
          TestDate: '2020-01-01',
        },
      );
      expect(result).toEqual('2020-01-10');
      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.event).not.toHaveBeenCalled();
    });

    test('returns an empty string if an error is thrown', async () => {
      const error = {
        message: 'Unknown error',
        status: 500,
      };
      mockedDynamicsWebApi.executeUnboundAction.mockRejectedValue(error);
      const testDate = '2020-01-01';
      const remit = CRMRemit.England;

      expect(await crmGateway.calculateThreeWorkingDays(testDate, remit)).toEqual('');
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(
        error,
        'CRMGateway::calculateThreeWorkingDays: Could not get 3 working days',
        {
          testDate,
          remit,
        },
      );
      expect(logger.event).toHaveBeenCalledTimes(1);
      expect(logger.event).toHaveBeenCalledWith(
        BusinessTelemetryEvents.CDS_ERROR,
        'CRMGateway::calculateThreeWorkingDays: Could not get 3 working days',
        {
          error,
          testDate,
          remit,
        },
      );
    });
  });

  describe('getUserDraftNSABookingsIfExist', () => {
    test('returns a nsa booking if the user does have a draft NSA booking', async () => {
      mockedDynamicsWebApi.fetch.mockResolvedValue({
        value: [
          {
            '@odata.etag': 'W/"161765247"',
            _ftts_candidateid_value: '4ddab30e-f90e-eb11-a813-000d3a7f128d',
            'ftts_booking.ftts_nsastatus': 675030000,
            'ftts_booking.ftts_origin': CRMOrigin.CustomerServiceCentre,
            ftts_selected: true,
            ftts_bookingproductid: '9afee4ea-43fc-eb11-94ef-000d3ad67a18',
            'ftts_booking.ftts_bookingid': '4cgee4ea-43fc-eb11-94ef-000d3ad67a18',
            ftts_nonstandardaccomdation: true,
            productNumber: '1001',
          },
        ],
      });

      const result = await crmGateway.getUserDraftNSABookingsIfExist(candidateId, TestType.CAR);

      expect(result).toStrictEqual([{ bookingId: '4cgee4ea-43fc-eb11-94ef-000d3ad67a18', nsaStatus: 675030000, origin: 2 }]);
      expect(logger.error).not.toHaveBeenCalled();
    });

    test('returns false if the user does not have a draft NSA booking', async () => {
      mockedDynamicsWebApi.fetch.mockResolvedValue({});
      const result = await crmGateway.getUserDraftNSABookingsIfExist(candidateId, TestType.CAR);
      expect(result).toBeUndefined();
    });
  });

  describe('doesCandidateHaveExistingBookingsByTestType', () => {
    test('returns true if the user has a test booked of the existing test type', async () => {
      mockedDynamicsWebApi.fetch.mockResolvedValue({
        value: [
          {
            '@odata.etag': 'W/"161765247"',
            _ftts_candidateid_value: '4ddab30e-f90e-eb11-a813-000d3a7f128d',
            ftts_bookingstatus: CRMBookingStatus.Confirmed,
            ftts_selected: true,
            ftts_bookingproductid: '9afee4ea-43fc-eb11-94ef-000d3ad67a18',
            ftts_nonstandardaccomdation: true,
            productNumber: CRMProductNumber.CAR,
            testType: TestType.CAR,
          },
        ],
      });

      const result = await crmGateway.doesCandidateHaveExistingBookingsByTestType(candidateId, TestType.CAR);

      expect(result).toStrictEqual(true);
      expect(logger.error).not.toHaveBeenCalled();

      expect(mockedDynamicsWebApi.fetch).toHaveBeenCalledWith('ftts_bookingproducts',
        expect.stringMatching(candidateId));
      expect(mockedDynamicsWebApi.fetch).toHaveBeenCalledWith('ftts_bookingproducts',
        expect.stringMatching(CRMBookingStatus.Confirmed.toString()));
      expect(mockedDynamicsWebApi.fetch).toHaveBeenCalledWith('ftts_bookingproducts',
        expect.stringMatching('1001'));
    });

    test('returns false if the user does not have a booking of the existing test type in the CRM', async () => {
      mockedDynamicsWebApi.fetch.mockResolvedValue({});
      const result = await crmGateway.doesCandidateHaveExistingBookingsByTestType(candidateId, TestType.CAR);
      expect(result).toStrictEqual(false);
    });

    test('rethrows error if an error occurs', async () => {
      const error = new Error('Unknown error');
      mockedDynamicsWebApi.fetch.mockRejectedValue(error);

      await expect(crmGateway.doesCandidateHaveExistingBookingsByTestType(candidateId, TestType.CAR)).rejects.toEqual(error);

      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(error, 'CRMGateway::doesCandidateHaveExistingBookingsByTestType: Could not retrieve candidate bookings from CRM', { candidateId, testType: TestType.CAR });
    });
  });

  describe('updateTCNUpdateDate', () => {
    test('successfully updates the date', async () => {
      mockedDynamicsWebApi.updateRequest.mockResolvedValue({});

      await crmGateway.updateTCNUpdateDate(bookingProductId);

      expect(mockedDynamicsWebApi.updateRequest).toHaveBeenCalledWith(
        {
          collection: 'ftts_bookingproducts',
          entity: {
            ftts_tcn_update_date: '2020-11-11T14:30:45.979Z',
          },
          key: bookingProductId,
        },
      );
      expect(logger.info).toHaveBeenCalledTimes(2);
      expect(logger.info).toHaveBeenNthCalledWith(
        1, 'CRMGateway::updateTCNUpdateDate: Attempting to update ftts_tcn_update_date', { bookingProductId },
      );
      expect(logger.info).toHaveBeenNthCalledWith(
        2, 'CRMGateway::updateTCNUpdateDate: ftts_tcn_update_date updated successfully', { bookingProductId },
      );
      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.event).not.toHaveBeenCalled();
    });

    test('CSC bookings - successfully updates the date', async () => {
      mockedDynamicsWebApi.updateRequest.mockResolvedValue({});

      await crmGateway.updateTCNUpdateDate(bookingProductId);

      expect(mockedDynamicsWebApi.updateRequest).toHaveBeenCalledWith(
        {
          collection: 'ftts_bookingproducts',
          entity: {
            ftts_tcn_update_date: '2020-11-11T14:30:45.979Z',
          },
          key: bookingProductId,
        },
      );
      expect(logger.info).toHaveBeenCalledTimes(2);
      expect(logger.info).toHaveBeenNthCalledWith(
        1, 'CRMGateway::updateTCNUpdateDate: Attempting to update ftts_tcn_update_date', { bookingProductId },
      );
      expect(logger.info).toHaveBeenNthCalledWith(
        2, 'CRMGateway::updateTCNUpdateDate: ftts_tcn_update_date updated successfully', { bookingProductId },
      );
      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.event).not.toHaveBeenCalled();
    });

    test('throws an error if one occurs', async () => {
      const error = {
        message: 'Unknown error',
        status: 500,
      };
      mockedDynamicsWebApi.updateRequest.mockRejectedValue(error);

      await expect(crmGateway.updateTCNUpdateDate(bookingProductId)).rejects.toEqual(error);

      expect(logger.info).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenNthCalledWith(
        1, 'CRMGateway::updateTCNUpdateDate: Attempting to update ftts_tcn_update_date', { bookingProductId },
      );
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(error, 'CRMGateway::updateTCNUpdateDate: Could not set the TCN Update Date on Booking Product ID', { bookingProductId });
      expect(logger.event).toHaveBeenCalledTimes(1);
      expect(logger.event).toHaveBeenLastCalledWith(BusinessTelemetryEvents.CDS_FAIL_BOOKING_CHANGE_UPDATE,
        'CRMGateway::updateTCNUpdateDate: Could not set the TCN Update Date',
        {
          bookingProductId,
          error,
        });
    });
  });

  describe('updateBookingStatusPaymentStatusAndTCNUpdateDate', () => {
    let bookingStatus = CRMBookingStatus.Draft;

    test('does a batch call to update the booking status and TCN update date together when bookingStatus is draft', async () => {
      mockedDynamicsWebApi.updateRequest.mockResolvedValue({});
      mockedDynamicsWebApi.executeBatch.mockResolvedValue([]);

      await crmGateway.updateBookingStatusPaymentStatusAndTCNUpdateDate(bookingId, bookingProductId, bookingStatus);

      expect(mockedDynamicsWebApi.updateRequest.mock.calls).toEqual([
        [
          {
            collection: 'ftts_bookings',
            entity: {
              ftts_bookingstatus: bookingStatus,
            },
            key: bookingId,
          },
        ],
        [
          {
            collection: 'ftts_bookingproducts',
            entity: {
              ftts_tcn_update_date: mockDate.toISOString(),
            },
            key: bookingProductId,
          },
        ],
      ]);
      expect(mockedDynamicsWebApi.executeBatch).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledTimes(2);
      expect(logger.info).toHaveBeenNthCalledWith(
        1, 'CRMGateway::updateBookingStatusPaymentStatusAndTCNUpdateDate: Attempting to update', { bookingId, bookingProductId, bookingStatus },
      );
      expect(logger.info).toHaveBeenNthCalledWith(
        2, 'CRMGateway::updateBookingStatusPaymentStatusAndTCNUpdateDate: Update finished successfully', { bookingId, bookingProductId, bookingStatus },
      );
      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.event).not.toHaveBeenCalled();
    });

    test('does a batch call to update the booking status, paymet status and TCN update date together when bookingStatus is AbandonedNonRecoverable', async () => {
      mockedDynamicsWebApi.updateRequest.mockResolvedValue({});
      mockedDynamicsWebApi.executeBatch.mockResolvedValue([]);
      bookingStatus = CRMBookingStatus.AbandonedNonRecoverable;
      const paymentId = 'payment-id';

      await crmGateway.updateBookingStatusPaymentStatusAndTCNUpdateDate(bookingId, bookingProductId, bookingStatus, paymentId);

      expect(mockedDynamicsWebApi.updateRequest.mock.calls).toEqual([
        [
          {
            collection: 'ftts_bookings',
            entity: {
              ftts_bookingstatus: bookingStatus,
              'ftts_payment@odata.bind': '/ftts_payments(payment-id)',
              ftts_callamend: undefined,
            },
            key: bookingId,
          },
        ],
        [
          {
            collection: 'ftts_payments',
            entity: {
              ftts_status: CRMPaymentStatus.UserCancelled,
            },
            key: paymentId,
          },
        ],
        [
          {
            collection: 'ftts_bookingproducts',
            entity: {
              ftts_tcn_update_date: mockDate.toISOString(),
            },
            key: bookingProductId,
          },
        ],
      ]);
      expect(mockedDynamicsWebApi.executeBatch).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledTimes(2);
      expect(logger.info).toHaveBeenNthCalledWith(
        1, 'CRMGateway::updateBookingStatusPaymentStatusAndTCNUpdateDate: Attempting to update', {
          bookingId, bookingProductId, bookingStatus, paymentId,
        },
      );
      expect(logger.info).toHaveBeenNthCalledWith(
        2, 'CRMGateway::updateBookingStatusPaymentStatusAndTCNUpdateDate: Update finished successfully', {
          bookingId, bookingProductId, bookingStatus, paymentId,
        },
      );
      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.event).not.toHaveBeenCalled();
    });

    test('GIVEN ownerId and paymentId WHEN called THEN those two are also updated', async () => {
      const mockBookingId = 'booking-id';
      const mockBookingProductId = 'booking-product-id';
      const paymentId = 'ebd85a44-2ae4-459d-b2b9-40278c1ab7a9';
      mockedDynamicsWebApi.updateRequest.mockResolvedValue({});
      mockedDynamicsWebApi.executeBatch.mockResolvedValue([]);

      await crmGateway.updateBookingStatusPaymentStatusAndTCNUpdateDate(
        mockBookingId,
        mockBookingProductId,
        CRMBookingStatus.Draft,
        paymentId,
        false,
      );
      expect(logger.info).toHaveBeenCalledWith(
        'CRMGateway::updateBookingStatusPaymentStatusAndTCNUpdateDate: Attempting to update',
        {
          bookingId: mockBookingId,
          bookingProductId: mockBookingProductId,
          bookingStatus: CRMBookingStatus.Draft,
          paymentId,
        },
      );
      expect(logger.debug).toHaveBeenCalledWith(
        'CRMGateway::updateBookingStatusPaymentStatusAndTCNUpdateDate: Raw Request',
        {
          updateBookingRequest: {
            collection: 'ftts_bookings',
            entity: {
              ftts_bookingstatus: CRMBookingStatus.Draft,
              ftts_callamend: undefined,
              'ftts_payment@odata.bind': `/ftts_payments(${paymentId})`,
            },
            key: mockBookingId,
          },
          updateBookingProductRequest: {
            collection: 'ftts_bookingproducts',
            entity: {
              ftts_tcn_update_date: mockDate.toISOString(),
            },
            key: mockBookingProductId,
          },
          updatePaymentRequest: {},
        },
      );
      expect(mockedDynamicsWebApi.updateRequest.mock.calls).toEqual([
        [
          {
            collection: 'ftts_bookings',
            entity: {
              ftts_bookingstatus: CRMBookingStatus.Draft,
              ftts_callamend: undefined,
              'ftts_payment@odata.bind': `/ftts_payments(${paymentId})`,
            },
            key: mockBookingId,
          },
        ],
        [
          {
            collection: 'ftts_bookingproducts',
            entity: {
              ftts_tcn_update_date: mockDate.toISOString(),
            },
            key: mockBookingProductId,
          },
        ],
      ]);
      expect(mockedDynamicsWebApi.executeBatch).toHaveBeenCalled();
    });

    test('throws an error if one occurs', async () => {
      const error = {
        message: 'Unknown error',
        status: 500,
      };
      mockedDynamicsWebApi.executeBatch.mockRejectedValue(error);

      await expect(crmGateway.updateBookingStatusPaymentStatusAndTCNUpdateDate(bookingId, bookingProductId, bookingStatus)).rejects.toEqual(error);

      expect(logger.info).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenNthCalledWith(
        1, 'CRMGateway::updateBookingStatusPaymentStatusAndTCNUpdateDate: Attempting to update', { bookingId, bookingProductId, bookingStatus },
      );
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(error, 'CRMGateway::updateBookingStatusPaymentStatusAndTCNUpdateDate: Batch request failed', {
        bookingId,
        bookingProductId,
        bookingStatus,
      });
      expect(logger.event).toHaveBeenCalledTimes(1);
      expect(logger.event).toHaveBeenLastCalledWith(BusinessTelemetryEvents.CDS_ERROR,
        'CRMGateway::updateBookingStatusPaymentStatusAndTCNUpdateDate: Batch request failed',
        {
          bookingId,
          bookingProductId,
          bookingStatus,
          error,
        });
    });
  });

  describe('updateNSABookings', () => {
    test('when called with draft NSA bookings then bookings are updated in a batch', async () => {
      mockedDynamicsWebApi.updateRequest.mockResolvedValue({});
      mockedDynamicsWebApi.executeBatch.mockResolvedValue([]);

      await crmGateway.updateNSABookings(mockNsaBookingDetails);

      expect(mockedDynamicsWebApi.executeBatch).toHaveBeenCalled();
      expect(mockedDynamicsWebApi.updateRequest).toHaveBeenCalledWith({
        collection: 'ftts_bookings',
        entity: {
          ftts_bookingstatus: CRMBookingStatus.NoLongerRequired,
          ftts_callamend: undefined,
          ftts_nsastatus: CRMNsaStatus.StandardTestBooked,
        },
        key: '123',
      });
      expect(mockedDynamicsWebApi.updateRequest).toHaveBeenCalledWith({
        collection: 'ftts_bookings',
        entity: {
          ftts_bookingstatus: CRMBookingStatus.NoLongerRequired,
          ftts_callamend: undefined,
          ftts_nsastatus: CRMNsaStatus.StandardTestBooked,
        },
        key: '321',
      });
      expect(logger.info).toHaveBeenCalledTimes(2);
      expect(logger.info).toHaveBeenNthCalledWith(
        1, 'CRMGateway::updateNSABookings: Attempting to update', { nsaBookings: mockNsaBookingDetails },
      );
      expect(logger.info).toHaveBeenNthCalledWith(
        2, 'CRMGateway::updateNSABookings: Update finished successfully', { nsaBookings: mockNsaBookingDetails },
      );
      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.event).not.toHaveBeenCalled();
    });

    test('throws an error if batch request fails', async () => {
      const error = {
        message: 'Unknown error',
        status: 500,
      };
      mockedDynamicsWebApi.executeBatch.mockRejectedValue(error);

      await expect(crmGateway.updateNSABookings(mockNsaBookingDetails)).rejects.toEqual(error);

      expect(logger.info).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenNthCalledWith(
        1, 'CRMGateway::updateNSABookings: Attempting to update', { nsaBookings: mockNsaBookingDetails },
      );
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(error, 'CRMGateway::updateNSABookings: Batch request failed', {
        nsaBookings: mockNsaBookingDetails,
      });
      expect(logger.event).toHaveBeenCalledTimes(1);
      expect(logger.event).toHaveBeenLastCalledWith(BusinessTelemetryEvents.CDS_ERROR,
        'CRMGateway::updateNSABookings: Batch request failed',
        {
          nsaBookings: mockNsaBookingDetails,
          error,
        });
    });

    test('throws an error if there are a thousand nsa bookings or exceed a thousand', async () => {
      const nsaBookings = [].concat(...new Array(1000).fill([mockNsaBookingDetails[0]]));

      const error = {
        name: 'mock-name',
        message: 'CRMGateway::updateNSABookings: The number of NSA bookings to update exceeds a thousand',
        status: 500,
      };

      await expect(crmGateway.updateNSABookings(nsaBookings))
        .rejects
        .toThrow(error);

      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(Error(error.message), undefined, { numberOfNsaBookings: 1000 });
    });
  });

  describe('getPriceList', () => {
    const mockTarget = Target.GB;
    const mockTestTypes = [TestType.CAR, TestType.MOTORCYCLE, TestType.LGVHPT];

    test('successfully retrieves price list from CRM', async () => {
      const mockResponse: { value: CRMProductPriceLevel[] } = {
        value: [
          {
            productnumber: CRMProductNumber.CAR,
            amount: 23,
            productid: {
              productid: 'product-id-1',
              _parentproductid_value: 'parent-product-id-1',
              name: 'car',
            },
          },
          {
            productnumber: CRMProductNumber.MOTORCYCLE,
            amount: 23,
            productid: {
              productid: 'product-id-2',
              _parentproductid_value: 'parent-product-id-2',
              name: 'motorcycle',
            },
          },
          {
            productnumber: CRMProductNumber.LGVHPT,
            amount: 30,
            productid: {
              productid: 'product-id-3',
              _parentproductid_value: 'parent-product-id-3',
              name: 'lgvhpt',
            },
          },
        ],
      };
      mockedDynamicsWebApi.retrieveMultipleRequest.mockResolvedValue(mockResponse);

      const result = await crmGateway.getPriceList(mockTarget, mockTestTypes);

      const expectedResult: PriceListItem[] = [
        {
          testType: TestType.CAR,
          price: 23,
          product: {
            productId: 'product-id-1',
            parentId: 'parent-product-id-1',
            name: 'car',
          },
        },
        {
          testType: TestType.MOTORCYCLE,
          price: 23,
          product: {
            productId: 'product-id-2',
            parentId: 'parent-product-id-2',
            name: 'motorcycle',
          },
        },
        {
          testType: TestType.LGVHPT,
          price: 30,
          product: {
            productId: 'product-id-3',
            parentId: 'parent-product-id-3',
            name: 'lgvhpt',
          },
        },
      ];
      expect(result).toStrictEqual(expectedResult);
      expect(logger.error).not.toHaveBeenCalled();
    });

    test('throws an error if one occurs', async () => {
      const error = {
        message: 'Unknown error',
        status: 500,
      };
      mockedDynamicsWebApi.retrieveMultipleRequest.mockRejectedValue(error);
      config.crm.priceListId.dvsa = priceListId;

      await expect(crmGateway.getPriceList(mockTarget)).rejects.toEqual(error);

      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(
        error,
        'CRMGateway::getPriceList: Failed to get price list from CRM',
        {
          priceListId,
          target: mockTarget,
          testTypes: undefined,
        },
      );
    });
  });

  describe('updateZeroCostBooking', () => {
    test('successfully calls CRM to update the booking and doesn\'t throw an error', async () => {
      await crmGateway.updateZeroCostBooking(bookingId);

      expect(mockedDynamicsWebApi.updateRequest).toHaveBeenCalledTimes(1);
      expect(mockedDynamicsWebApi.updateRequest).toHaveBeenCalledWith({
        key: bookingId,
        collection: 'ftts_bookings',
        entity: {
          ftts_zerocostbooking: true,
          ftts_zerocostbookingreason: 675030000,
        },
      });

      expect(logger.info).toHaveBeenCalledTimes(2);
      expect(logger.info).toHaveBeenNthCalledWith(
        1, 'CRMGateway::updateZeroCostBooking: Attempting to update', { bookingId },
      );
      expect(logger.info).toHaveBeenNthCalledWith(
        2, 'CRMGateway::updateZeroCostBooking: Update finished successfully', { bookingId },
      );
      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.event).not.toHaveBeenCalled();
    });

    test('throws an error when the call to CRM fails', async () => {
      const error = {
        message: 'Unknown error',
        status: 500,
      };
      mockedDynamicsWebApi.updateRequest.mockRejectedValue(error);

      await expect(crmGateway.updateZeroCostBooking(bookingId)).rejects.toEqual(error);

      expect(logger.info).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenNthCalledWith(
        1, 'CRMGateway::updateZeroCostBooking: Attempting to update', { bookingId },
      );
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(error, 'CRMGateway::updateZeroCostBooking: Could not update Booking', { bookingId });
      expect(logger.event).toHaveBeenCalledTimes(1);
      expect(logger.event).toHaveBeenLastCalledWith(BusinessTelemetryEvents.CDS_FAIL_BOOKING_NEW_UPDATE,
        'CRMGateway::updateZeroCostBooking: Could not update Booking',
        {
          bookingId,
          error,
        });
    });
  });

  describe('getRescheduleCount', () => {
    test('successfully retrieves reschedule count', async () => {
      const crmResponse: CRMBookingRescheduleCountResponse = {
        ftts_bookingid: 'mockBookingId',
        ftts_reschedulecount: 3,
      };
      mockedDynamicsWebApi.retrieveRequest.mockResolvedValue(crmResponse);

      const result = await crmGateway.getRescheduleCount('mockBookingId');

      expect(result).toBe(3);
    });

    test('successfully retrieves reschedule count - null reschedule response', async () => {
      const crmResponse: CRMBookingRescheduleCountResponse = {
        ftts_bookingid: 'mockBookingId',
        ftts_reschedulecount: null,
      };
      mockedDynamicsWebApi.retrieveRequest.mockResolvedValue(crmResponse);

      const result = await crmGateway.getRescheduleCount('mockBookingId');

      expect(result).toBe(0);
    });

    test('throws error if empty response is received', async () => {
      mockedDynamicsWebApi.retrieveRequest.mockResolvedValue(undefined);

      await expect(() => crmGateway.getRescheduleCount('mockBookingId')).rejects.toThrow();
    });

    test('logs and throws error if crm call fails', async () => {
      const crmError = new Error('crm error');
      mockedDynamicsWebApi.retrieveRequest.mockRejectedValue(crmError);

      await expect(() => crmGateway.getRescheduleCount('mockBookingId')).rejects.toThrow(crmError);
      expect(logger.error).toHaveBeenCalledWith(crmError, 'CRMGateway::getRescheduleCount: Failed to get reschdule count from CRM', { bookingId: 'mockBookingId' });
    });
  });

  describe('logGeneralError', () => {
    test('handles 4xx error', () => {
      const error = {
        status: 401,
      };

      crmGateway.logGeneralError(error, 'mockMessage', { example: 'mock value' });

      expect(logger.event).toHaveBeenCalledWith(
        BusinessTelemetryEvents.CDS_REQUEST_ISSUE,
        'mockMessage',
        {
          error: {
            status: 401,
          },
          example: 'mock value',
        },
      );
    });

    test('handles 5xx error', () => {
      const error = {
        status: 501,
      };

      crmGateway.logGeneralError(error, 'mockMessage2', { example: 'mock value2' });

      expect(logger.event).toHaveBeenCalledWith(
        BusinessTelemetryEvents.CDS_ERROR,
        'mockMessage2',
        {
          error: {
            status: 501,
          },
          example: 'mock value2',
        },
      );
    });
  });
});
