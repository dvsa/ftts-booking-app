/* eslint-disable no-underscore-dangle */
import dayjs from 'dayjs';
import MockDate from 'mockdate';
import { v4 as uuidv4 } from 'uuid';
import { CRMTestClient } from '@dvsa/ftts-crm-test-client';

import { TestLanguage } from '../../src/domain/test-language';
import { CRMGateway } from '../../src/services/crm-gateway/crm-gateway';
import {
  CRMAdditionalSupport,
  CRMBookingStatus,
  CRMOrigin,
  CRMRemit,
  CRMVoiceOver,
  TestEngineTestType,
} from '../../src/services/crm-gateway/enums';
import { mockSessionBooking, mockSessionCandidate } from '../mocks/data/session-types';
import { Booking, Candidate } from '../../src/services/session';
import { toCRMTestType } from '../../src/services/crm-gateway/maps';

jest.mock('@dvsa/azure-logger');
jest.setTimeout(30000);

describe('Booking app -> CRM integration tests', () => {
  const crmTestClient = new CRMTestClient();
  const crmGateway = CRMGateway.getInstance();
  const mockToday = '2021-02-04T12:00:00.000Z';
  MockDate.set(mockToday);

  describe('getLicenceAndProduct', () => {
    test('retrieves an existing licence given a licence number', async () => {
      // Create a new candidate (contact + licence) in CRM
      const mockLicenceNumber = uuidv4();
      const mockCandidate = await crmTestClient.createNewCandidate(mockLicenceNumber);

      // Try and retrieve it via licence number
      const result = await crmGateway.getLicenceAndProduct(mockLicenceNumber, TestEngineTestType.Car);

      // Check we get back what we created
      expect(result.licence.licenceId).toBe(mockCandidate.licenceId);
      expect(result.licence.candidateId).toBe(mockCandidate.candidateId);
    });

    test('returns undefined if licence doesn\'t already exist', async () => {
      const mockLicenceNumber = '404-licence-does-not-exist';

      const result = await crmGateway.getLicenceAndProduct(mockLicenceNumber, TestEngineTestType.Car);

      expect(result.licence).toBe(undefined);
    });

    test.each([
      TestEngineTestType.Car,
      TestEngineTestType.Motorcycle,
    ])('retrieves a product for the test type %d', async (testType: number) => {
      const mockLicenceNumber = uuidv4();

      const result = await crmGateway.getLicenceAndProduct(mockLicenceNumber, testType);

      expect(result.product.id.length).toBeGreaterThan(0);
      expect(result.product.parentId.length).toBeGreaterThan(0);
    });
  });

  describe('getCandidateByLicenceNumber', () => {
    test('retrieves an existing candidate given a licence number', async () => {
      const mockLicenceNumber = uuidv4();
      const mockCandidate = await crmTestClient.createNewCandidate(mockLicenceNumber);

      const result = await crmGateway.getCandidateByLicenceNumber(mockLicenceNumber);

      expect(result.candidateId).toBe(mockCandidate.candidateId);
    });

    test('returns undefined if licence doesn\'t already exist', async () => {
      const mockLicenceNumber = '404-licence-does-not-exist';

      const result = await crmGateway.getCandidateByLicenceNumber(mockLicenceNumber);

      expect(result).toBe(undefined);
    });
  });

  describe('createBooking', () => {
    test('creates a booking for a given candidate', async () => {
      const mockLicenceNumber = `int-test-${uuidv4()}`;
      const mockCandidate = await crmTestClient.createNewCandidate(mockLicenceNumber);
      const candidateData: Candidate = {
        ...mockSessionCandidate(),
        licenceId: mockCandidate.licenceId,
        candidateId: mockCandidate.candidateId,
        licenceNumber: mockLicenceNumber,
      };
      const bookingData: Booking = {
        ...mockSessionBooking(),
      };

      const result = await crmGateway.createBooking(candidateData, bookingData, CRMAdditionalSupport.None);

      const booking = await crmTestClient.retrieveBooking(result.id);
      const bookingProduct = await crmTestClient.retrieveBookingProductByBookingId(result.id);

      expect(booking.ftts_drivinglicence).toStrictEqual(mockLicenceNumber);
      expect(booking.ftts_testtype).toStrictEqual(toCRMTestType(bookingData.testType));
      expect(dayjs(booking.ftts_testdate).isSame(bookingData.dateTime)).toStrictEqual(true);
      expect(booking.ftts_reference).toBeTruthy();
      expect(TestLanguage.fromCRMTestLanguage(booking.ftts_language)).toBeTruthy();
      expect(booking.ftts_additionalsupportoptions).toStrictEqual(CRMAdditionalSupport.None);
      expect(booking.ftts_nivoiceoveroptions).toStrictEqual(CRMVoiceOver.English);
      expect(booking.ftts_origin).toStrictEqual(CRMOrigin.CitizenPortal);

      expect(bookingProduct.ftts_price).toBeTruthy();
    });
  });

  describe('createCandidateAndBooking', () => {
    test('creates a booking for a new candidate', async () => {
      const mockLicenceNumber = `int-test-${uuidv4()}`;
      const candidateData: Candidate = {
        ...mockSessionCandidate(),
        licenceNumber: mockLicenceNumber,
      };
      const bookingData: Booking = {
        ...mockSessionBooking(),
      };

      const result = await crmGateway.createCandidateAndBooking(candidateData, bookingData, CRMAdditionalSupport.None);

      const booking = await crmTestClient.retrieveBooking(result.booking.id);
      const candidate = await crmTestClient.retrieveCandidate(result.licence.candidateId);
      const licence = await crmTestClient.retrieveLicence(result.licence.licenceId);
      const bookingProduct = await crmTestClient.retrieveBookingProductByBookingId(result.booking.id);

      expect(booking.ftts_drivinglicence).toStrictEqual(mockLicenceNumber);
      expect(booking.ftts_testtype).toStrictEqual(toCRMTestType(bookingData.testType));
      expect(dayjs(booking.ftts_testdate).isSame(bookingData.dateTime)).toStrictEqual(true);
      expect(booking.ftts_reference).toBeTruthy();
      expect(TestLanguage.fromCRMTestLanguage(booking.ftts_language)).toBeTruthy();
      expect(booking.ftts_additionalsupportoptions).toStrictEqual(CRMAdditionalSupport.None);
      expect(booking.ftts_nivoiceoveroptions).toStrictEqual(CRMVoiceOver.English);
      expect(booking.ftts_origin).toStrictEqual(CRMOrigin.CitizenPortal);

      expect(bookingProduct.ftts_price).toBeTruthy();

      expect(candidate.contactid).toBeTruthy();
      expect(candidate.ftts_firstandmiddlenames).toStrictEqual(candidateData.firstnames);
      expect(candidate.lastname).toStrictEqual(candidateData.surname);
      expect(candidate.birthdate).toStrictEqual(candidateData.dateOfBirth);
      expect(candidate.ftts_personreference).toStrictEqual(candidateData.personReference);
      expect(candidate.emailaddress1).toStrictEqual(candidateData.email);

      expect(licence._ftts_person_value).toStrictEqual(candidate.contactid);
      expect(licence.ftts_licence).toStrictEqual(mockLicenceNumber);
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
      const mockCandidate = await crmTestClient.createNewCandidate(mockLicence);
      const mockBooking = await crmTestClient.createNewBooking(mockCandidate, CRMBookingStatus.Draft, CRMOrigin.CitizenPortal);
      await crmGateway.updateBookingStatus(mockBooking.bookingId, CRMBookingStatus.Confirmed);

      const updatedBookingProduct = await crmTestClient.retrieveBookingProduct(mockBooking.bookingProductId);
      const updatedBooking = await crmTestClient.retrieveBooking(mockBooking.bookingId);

      expect(updatedBookingProduct.ftts_bookingstatus).toBe(CRMBookingStatus.Confirmed);
      expect(updatedBooking.ftts_bookingstatus).toBe(CRMBookingStatus.Confirmed);
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

  describe('calculateThreeWorkingDays', () => {
    test('should successfully calculate 3 working days for Northern Ireland', async () => {
      const result = await crmGateway.calculateThreeWorkingDays(mockToday, CRMRemit.NorthernIreland);
      expect(result).toEqual('2021-01-31');
    });

    test('should successfully calculate 3 working days for England', async () => {
      const result = await crmGateway.calculateThreeWorkingDays(mockToday, CRMRemit.England);
      expect(result).toEqual('2021-01-31');
    });

    test('should successfully calculate 3 working days for Scotland', async () => {
      const result = await crmGateway.calculateThreeWorkingDays(mockToday, CRMRemit.Scotland);
      expect(result).toEqual('2021-01-31');
    });

    test('should successfully calculate 3 working days for Wales', async () => {
      const result = await crmGateway.calculateThreeWorkingDays(mockToday, CRMRemit.Wales);
      expect(result).toEqual('2021-01-31');
    });
  });

  describe('getCandidateBookings', () => {
    let mockCandidate;
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
        'additionalSupport', 'paymentStatus', 'price', 'salesReference', 'testType', 'origin',
        'testCentre.testCentreId', 'testCentre.name', 'testCentre.addressLine1',
        'testCentre.addressLine2', 'testCentre.addressCity', 'testCentre.addressPostalCode',
        'testCentre.remit', 'testCentre.accountId', 'testCentre.region', 'testCentre.siteId',
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
        payment: expect.objectContaining({
          paymentId: mockBooking.paymentId,
          paymentStatus: expect.any(Number),
        }),
        financeTransaction: expect.objectContaining({
          financeTransactionId: mockBooking.financeTransactionId,
          transactionStatus: expect.any(Number),
          transactionType: expect.any(Number),
        }),
      }));
    });
  });
});
