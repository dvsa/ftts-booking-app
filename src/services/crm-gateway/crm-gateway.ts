/* eslint-disable no-template-curly-in-string */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable no-underscore-dangle */
import { cdsRetry, proxifyWithRetryPolicy } from '@dvsa/cds-retry';
import { ELIG } from '@dvsa/ftts-eligibility-api-model';
import dayjs from 'dayjs';
import { FetchXmlResponse, RequestError, RetrieveMultipleRequest } from 'dynamics-web-api';
import fs from 'fs';
import config from '../../config';
import { Target, TestType } from '../../domain/enums';
import { CrmCreateBookingDataError } from '../../domain/errors/crm/CrmCreateBookingDataError';
import { KPIIdentifiers } from '../scheduling/types';
import { PriceListItem } from '../../domain/types';
import { BusinessTelemetryEvents, logger } from '../../helpers';
import {
  Booking, Candidate,
} from '../session';
import {
  mapCRMBookingResponseToBookingResponse,
  mapCRMRemitToCRMCalendarName,
  mapFromCrmXmlBookingDetailsToCRMBookingDetails,
  mapPaymentInformationToBookingDetails,
  mapToBookingDetails,
  mapToCandidate,
  mapToCandidateResponse,
  mapToCRMBooking,
  mapToCRMBookingProduct,
  mapToCRMContact,
  mapToCRMLicence,
} from './crm-helper';
import { dynamicsWebApiClient } from './dynamics-web-api';
import {
  Collection,
  CRMAdditionalSupport,
  CRMBookingStatus, CRMCancelReason, CRMEvidenceStatus, CRMGovernmentAgency,
  CRMNsaStatus,
  CRMOrigin,
  CRMPaymentStatus,
  CRMRemit,
  CRMStateCode,
  CRMTestLanguage,
  CRMVoiceOver,
  CRMZeroCostBookingReason,
} from './enums';
import {
  BookingDetails,
  BookingResponse,
  CandidateAndBookingResponse,
  CandidateResponse,
  CompensatedBooking,
  CreateBookingProductResponse,
  CreateCandidateResponse,
  CreateLicenceResponse,
  CRMBookingDetails,
  CRMBookingProduct,
  CRMBookingRescheduleCountResponse,
  CRMBookingResponse,
  CRMContact,

  CRMLicenceCandidateResponse,
  CRMLicenceResponse,
  CRMNsaBookingSlots,
  CRMProductPriceLevel,
  CRMXmlBookingDetails,
  GetPaymentInformationResponse,
  GetWorkingDaysResponse,
  NsaBookingDetail,
  RescheduleUpdateRequest,
} from './interfaces';
import { fromCRMProductNumber, toCRMProductNumber } from './maps';

interface CRMGatewayError {
  status: number;
}

export class CRMGateway {
  private static instance: CRMGateway;

  constructor(
    private dynamicsWebApi: DynamicsWebApi,
  ) { }

  public static getInstance(): CRMGateway {
    if (!CRMGateway.instance) {
      const dynamicsWebApi = dynamicsWebApiClient();
      proxifyWithRetryPolicy(dynamicsWebApi, this.retryLog, this.cdsRetryPolicy);
      CRMGateway.instance = new CRMGateway(dynamicsWebApi);
    }
    return CRMGateway.instance;
  }

  public static cdsRetryPolicy: Parameters<typeof cdsRetry>[1] = config.crm.retryPolicy;

  public async getLicenceNumberRecordsByCandidateId(candidateId: string, licenceNumber: string): Promise<Candidate | undefined> {
    try {
      logger.info('CRMGateway::getLicenceNumberRecordsByCandidateId: Attempting to retrieve Candidate and Licence from CRM', { candidateId });
      const rawXml = await this.readFile('getLicenceNumberRecordsByCandidateId.xml');
      const xml = rawXml.replace('${candidateId}', candidateId)
        .replace('${licenceNumber}', licenceNumber)
        .replace('${evidenceStatus}', CRMEvidenceStatus.Approved.toString())
        .replace('${licenceStatecode}', CRMStateCode.Active.toString())
        .replace('${contactStatecode}', CRMStateCode.Active.toString());
      logger.debug('CRMGateway::getLicenceNumberRecordsByCandidateId: Raw Request', { xml, entity: Collection.LICENCES });
      const response: FetchXmlResponse<CRMLicenceCandidateResponse> = await this.dynamicsWebApi.fetch(Collection.LICENCES, xml);
      logger.debug('CRMGateway::getLicenceNumberRecordsByCandidateId: Raw Response', { response, entity: Collection.LICENCES });
      if (!response.value?.length) {
        logger.info('CRMGateway::getLicenceNumberRecordsByCandidateId: No licence/candidate found for the given candidate id', { candidateId });
        return undefined;
      }
      const candidate: Candidate = mapToCandidate(response.value[0]);
      logger.info('CRMGateway::getLicenceNumberRecordsByCandidateId: Candidate was mapped from CRM', { candidateId });
      return candidate;
    } catch (error) {
      this.logGeneralError(error, 'CRMGateway::getLicenceNumberRecordsByCandidateId: Error retrieving licence/candidate from CRM', { candidateId });
      throw error;
    }
  }

  public async createLicence(licenceNumber: string, address: ELIG.Address, candidateId: string): Promise<string> {
    try {
      logger.info('CRMGateway::createLicence: Creating licence record in CRM', { candidateId });

      const candidateData: Partial<Candidate> = {
        address,
        ownerId: config.crm.ownerId.dvsa,
      };
      const request: DynamicsWebApi.CreateRequest = {
        collection: 'ftts_licences',
        entity: mapToCRMLicence(candidateId, licenceNumber, candidateData),
        returnRepresentation: true,
      };
      logger.debug('CRMGateway::createLicence: Raw Request', { request, candidateId });
      const response = await this.dynamicsWebApi.createRequest<CreateLicenceResponse>(request);
      logger.debug('CRMGateway::createLicence: Response from CRM', { response });

      const licenceId = response.ftts_licenceid;

      logger.info('CRMGateway::createLicence: Successfully created licence in CRM', { candidateId, licenceId });
      return licenceId;
    } catch (error) {
      this.logGeneralError(error, 'CRMGateway::createLicence: Could not create licence record for candidate in CRM', { candidateId });
      throw error;
    }
  }

  public async createCandidate(candidate: Candidate): Promise<string> {
    try {
      logger.info('CRMGateway::createCandidate: Creating candidate in CRM');

      const createCandidateRequest: DynamicsWebApi.CreateRequest = {
        collection: 'contacts',
        entity: mapToCRMContact({
          ...candidate,
          ownerId: config.crm.ownerId.dvsa,
        }),
        returnRepresentation: true,
      };

      logger.debug('CRMGateway::createCandidate: Raw Request', { createCandidateRequest });
      const candidateResponse = await this.dynamicsWebApi.createRequest<CreateCandidateResponse>(createCandidateRequest);
      logger.debug('CRMGateway::createCandidate: Create Candidate Raw Response', { candidateResponse });

      const candidateId = candidateResponse.contactid;

      logger.info('CRMGateway::createCandidate: Successfully created candidate in CRM', { candidateId });
      return candidateId;
    } catch (error) {
      this.logGeneralError(error, 'CRMGateway::createCandidate: Could not create candidate record for candidate in CRM', { candidate });
      throw error;
    }
  }

  public async updateCandidate(candidateId: string, candidateDetails: Partial<Candidate>): Promise<Candidate> {
    try {
      logger.info('CRMGateway::updateCandidate: Attempting to update candidate details', { candidateId });

      const updatedCandidateDetails: Partial<CRMContact> = mapToCRMContact(candidateDetails);
      const candidateResponse = await this.updateCandidateRequest(candidateId, updatedCandidateDetails);

      logger.debug('CRMGateway::updateCandidate: Successfully updated candidate in CRM', { candidateResponse });
      return mapToCandidateResponse(candidateResponse);
    } catch (error) {
      this.logGeneralError(error, 'CRMGateway::updateCandidate: Could not update candidate details in CRM', { candidateId });
      throw error;
    }
  }

  public async updateLicence(licenceId: string, candidateId: string, address?: ELIG.Address): Promise<CRMLicenceResponse> {
    try {
      logger.info('CRMGateway::updateLicence: Attempting to update Licence details', {
        licenceId,
        candidateId,
      });
      const updatedLicenceDetails = mapToCRMLicence(candidateId, undefined, { address });
      const request = {
        key: licenceId,
        collection: 'ftts_licences',
        entity: updatedLicenceDetails,
        returnRepresentation: true,
      };
      logger.debug('CRMGateway::updateLicence: Raw Request', { request, licenceId, candidateId });
      const response = await this.dynamicsWebApi.updateRequest<CRMLicenceResponse>(request);
      logger.debug('CRMGateway::updateLicence: Response from CRM', { response, licenceId, candidateId });
      logger.info('CRMGateway::updateLicence: Successfully updated Licence in CRM', { licenceId, candidateId });
      return response;
    } catch (error) {
      this.logGeneralError(error, 'CRMGateway::updateLicence: Could not update Licence details in CRM', { licenceId, candidateId });
      throw error;
    }
  }

  public async updateCandidateAndCreateBooking(candidate: Candidate, booking: Booking, additionalSupport: CRMAdditionalSupport, isStandardAccommodation: boolean, priceListId: string): Promise<CandidateAndBookingResponse> {
    const { candidateId, licenceId } = candidate;
    try {
      logger.info(
        'CRMGateway:updateCandidateAndCreateBooking: Attempting to update candidate details and create booking',
        {
          candidateId,
          licenceId,
          bookingProduct: booking.bookingProductId,
        },
      );

      if (!candidateId || !licenceId) {
        throw new Error('CRMGateway::updateCandidateAndCreateBooking: Missing required candidate data');
      }

      const updatedCandidateDetails: Partial<CRMContact> = mapToCRMContact({ // We just need to update contact details here. Everything else will be up to date.
        telephone: candidate.telephone,
        email: candidate.email,
      });

      if (!isStandardAccommodation) {
        candidate.ownerId = config.crm.ownerId.dvsa;
      }
      this.dynamicsWebApi.startBatch();
      this.updateCandidateRequest(candidateId, updatedCandidateDetails);
      this.createBookingRequest(candidate, booking, additionalSupport, isStandardAccommodation, priceListId);
      const response = await this.dynamicsWebApi.executeBatch();
      logger.debug('CRMGateway::updateCandidateAndCreateBooking: Response from CRM', { response });
      const candidateResponse: CandidateResponse = mapToCandidateResponse(response[0] as CRMContact);
      let bookingResponse: BookingResponse = mapCRMBookingResponseToBookingResponse(response[1] as CRMBookingResponse);

      if (!this.isCreateBookingDataValid(bookingResponse, candidate)) {
        logger.event(
          BusinessTelemetryEvents.CDS_REQUEST_RESPONSE_MISMATCH,
          'CRMGateway::updateCandidateAndCreateBooking: request-response data mismatch',
          {
            candidateId: candidate.candidateId,
            licenceId: candidate.licenceId,
            responseBookingId: bookingResponse.id,
          },
        );
        bookingResponse = await this.validateBookingAndRetryIfNeeded(
          candidate,
          booking,
          additionalSupport,
          isStandardAccommodation,
          priceListId,
        );
      }

      const candidateAndBookingResponse: CandidateAndBookingResponse = {
        booking: bookingResponse,
        candidate: {
          ...candidateResponse,
        },
      };

      logger.info(
        'CRMGateway::updateCandidateAndCreateBooking: Successful',
        {
          candidateId,
          licenceId,
          bookingId: candidateAndBookingResponse.booking.id,
          bookingReference: candidateAndBookingResponse.booking.reference,
          bookingProduct: booking.bookingProductId,
        },
      );

      return candidateAndBookingResponse;
    } catch (error) {
      logger.error(
        error,
        'CRMGateway::updateCandidateAndCreateBooking: Could not update candidate or create the booking in CRM',
        {
          candidateId,
          licenceId,
          bookingProduct: booking.bookingProductId,
        },
      );
      logger.event(BusinessTelemetryEvents.CDS_FAIL_BOOKING_NEW_UPDATE, 'CRMGateway::updateCandidateAndCreateBooking: Failed', {
        error,
        candidateId,
        bookingProduct: booking.bookingProductId,
      });
      throw error;
    }
  }

  private async validateBookingAndRetryIfNeeded(
    candidate: Candidate,
    booking: Booking,
    additionalSupport: CRMAdditionalSupport,
    isStandardAccommodation: boolean,
    priceListId: string,
  ): Promise<BookingResponse> {
    // retry 3 times
    let retries = 3;
    while (retries > 0) {
      logger.info('CRMGateway::validateBookingAndRetryIfNeeded: retry attempt');
      retries--;
      // eslint-disable-next-line no-await-in-loop
      const response = await this.createBookingRequest(candidate, booking, additionalSupport, isStandardAccommodation, priceListId);
      const convertedResponse = mapCRMBookingResponseToBookingResponse(response);
      if (this.isCreateBookingDataValid(convertedResponse, candidate)) {
        return convertedResponse;
      }
      logger.event(
        BusinessTelemetryEvents.CDS_REQUEST_RESPONSE_MISMATCH,
        'CRMGateway::validateBookingAndRetryIfNeeded: request-response data mismatch',
        {
          candidateId: candidate.candidateId,
          licenceId: candidate.licenceId,
          responseBookingId: convertedResponse.id,
        },
      );
    }
    throw new CrmCreateBookingDataError('CRMGateway::validateBookingAndRetryIfNeeded: crm returned data from different booking');
  }

  private isCreateBookingDataValid(bookingResponse: BookingResponse, candidate: Candidate): boolean {
    return bookingResponse.firstName === candidate.firstnames
      && bookingResponse.lastName === candidate.surname
      && bookingResponse.candidateId === candidate.candidateId
      && bookingResponse.licenceId === candidate.licenceId;
  }

  public async createBookingProduct(candidate: Candidate, booking: Booking, bookingResponse: BookingResponse, isStandardAccommodation: boolean, additionalSupport: CRMAdditionalSupport): Promise<string> {
    const { candidateId, licenceId } = candidate;
    const { bookingProductId: bookingProduct, bookingId } = booking;
    try {
      logger.info('CRMGateway::createBookingProduct: Creating Booking Product in CRM', {
        candidateId,
        licenceId,
        bookingId: bookingResponse.id,
        bookingRef: bookingResponse.reference,
      });
      const request: DynamicsWebApi.CreateRequest = {
        collection: 'ftts_bookingproducts',
        entity: mapToCRMBookingProduct(candidate, booking, bookingResponse, isStandardAccommodation, additionalSupport),
        returnRepresentation: true,
      };

      logger.debug('CRMGateway::createBookingProduct: Raw Request', { request });
      const response = await this.dynamicsWebApi.createRequest<CreateBookingProductResponse>(request);
      logger.debug('CRMGateway::createBookingProduct: Raw Response', { response });

      const bookingProductId = response.ftts_bookingproductid;

      logger.info('CRMGateway::createBookingProduct: Successfully created Booking Product in CRM', {
        candidateId,
        licenceId,
        bookingId: bookingResponse.id,
        bookingRef: bookingResponse.reference,
        bookingProductId,
        bookingProductRef: response.ftts_reference,
      });
      return bookingProductId;
    } catch (error) {
      logger.error(error, 'CRMGateway::createBookingProduct: Could not create booking product entity in CRM', {
        candidateId,
        licenceId,
        bookingId,
        bookingRef: booking?.bookingRef,
        bookingProduct,
      });
      logger.event(BusinessTelemetryEvents.CDS_FAIL_BOOKING_NEW_UPDATE, 'CRMGateway::createBookingProduct: Failed', {
        error,
        candidateId,
        licenceId,
        bookingId,
        bookingRef: booking?.bookingRef,
        bookingProduct,
      });
      throw error;
    }
  }

  public async rescheduleBookingAndConfirm(bookingId: string, dateTime: string, currentRescheduleCount: number, isCSCBooking?: boolean, testCentreAccountId?: string, preferredDate?: string, kpiIdentifiers?: KPIIdentifiers): Promise<void> {
    const rescheduleCount = currentRescheduleCount + 1;

    logger.info('CRMGateway::rescheduleBookingAndConfirm: Attempting to reschedule and confirm booking', { bookingId, dateTime, rescheduleCount });
    const entity: RescheduleUpdateRequest = {
      ftts_testdate: dateTime,
      ftts_bookingstatus: CRMBookingStatus.Confirmed,
      ftts_callamend: isCSCBooking ? isCSCBooking?.toString() : undefined,
      ftts_tcnpreferreddate: preferredDate,
      ftts_dateavailableonoraftertoday: kpiIdentifiers?.dateAvailableOnOrAfterToday,
      ftts_dateavailableonorbeforepreferreddate: kpiIdentifiers?.dateAvailableOnOrBeforePreferredDate,
      ftts_dateavailableonorafterpreferreddate: kpiIdentifiers?.dateAvailableOnOrAfterPreferredDate,
      ftts_reschedulecount: rescheduleCount,
    };

    if (testCentreAccountId) {
      entity['ftts_testcentre@odata.bind'] = `accounts(${testCentreAccountId})`;
    }

    try {
      const request: DynamicsWebApi.UpdateRequest = {
        key: bookingId,
        collection: 'ftts_bookings',
        entity,
      };
      logger.debug('CRMGateway::rescheduleBookingAndConfirm: Raw Request', { request });
      await this.dynamicsWebApi.updateRequest(request);
      logger.info('CRMGateway::rescheduleBookingAndConfirm: Booking rescheduled and confirmed', { bookingId, dateTime });
    } catch (error) {
      logger.error(error, 'CRMGateway::rescheduleBookingAndConfirm: Could not update booking date time and location in CRM', { bookingId, dateTime });
      logger.event(BusinessTelemetryEvents.CDS_FAIL_BOOKING_CHANGE_UPDATE, 'CRMGateway::rescheduleBookingAndConfirm: Failed', {
        error,
        bookingId,
      });
      throw error;
    }
  }

  public async updateBookingStatus(bookingId: string, crmBookingStatus: CRMBookingStatus, isCSCBooking?: boolean): Promise<void> {
    logger.info('CRMGateway::updateBookingStatus: Attempting to update booking status', { bookingId, crmBookingStatus });
    const request: DynamicsWebApi.UpdateRequest = {
      key: bookingId,
      collection: 'ftts_bookings',
      entity: {
        ftts_bookingstatus: crmBookingStatus,
        ftts_callamend: isCSCBooking ? isCSCBooking?.toString() : undefined,
      },
    };
    logger.debug('CRMGateway::updateBookingStatus: Raw Request', { request });
    try {
      await this.dynamicsWebApi.updateRequest(request);
      logger.info('CRMGateway::updateBookingStatus: Booking status updated', { bookingId, crmBookingStatus });
    } catch (error) {
      logger.error(error, 'CRMGateway::updateBookingStatus: Could not update booking status in CRM', { bookingId, crmBookingStatus });
      logger.event(BusinessTelemetryEvents.CDS_FAIL_BOOKING_CHANGE_UPDATE, 'CRMGateway::updateBookingStatus: Could not update booking status in CRM', {
        error,
        bookingId,
      });
      throw error;
    }
  }

  public async updateVoiceover(bookingId: string, bookingProductId: string, voiceover: CRMVoiceOver, isCSCBooking?: boolean): Promise<void> {
    logger.info('CRMGateway::updateVoiceover: Attempting to update voicover', { bookingId, bookingProductId, voiceover });
    try {
      this.dynamicsWebApi.startBatch();
      this.updateBookingProductVoiceover(bookingProductId, voiceover);
      this.updateBookingVoiceover(bookingId, voiceover, isCSCBooking);
      await this.dynamicsWebApi.executeBatch();
      logger.info('CRMGateway::updateVoiceover: Voiceover updated successfully', { bookingId, bookingProductId, voiceover });
    } catch (error) {
      logger.error(error, 'CRMGateway::updateVoiceover: Could not update voiceover in CRM', { bookingId, bookingProductId, voiceover });
      logger.event(BusinessTelemetryEvents.CDS_FAIL_BOOKING_CHANGE_UPDATE, 'CRMGateway::updateVoiceover: Could not update voiceover in CRM', {
        error,
        bookingId,
      });
      throw error;
    }
  }

  public async updateAdditionalSupport(bookingId: string, bookingProductId: string, additionalSupport: CRMAdditionalSupport, isCSCBooking?: boolean): Promise<void> {
    logger.info('CRMGateway::updateAdditionalSupport: Attempting to update additional support', { bookingId, bookingProductId, additionalSupport });
    try {
      this.dynamicsWebApi.startBatch();
      this.updateProductBookingAdditionalSupport(bookingProductId, additionalSupport);
      this.updateBookingAdditionalSupport(bookingId, additionalSupport, isCSCBooking);
      await this.dynamicsWebApi.executeBatch();
      logger.info('CRMGateway::updateAdditionalSupport: Additional support updated', { bookingId, bookingProductId, additionalSupport });
    } catch (error) {
      logger.error(error, 'CRMGateway::updateAdditionalSupport: Could not update additional support options in CRM', { bookingId, bookingProductId, additionalSupport });
      logger.event(BusinessTelemetryEvents.CDS_FAIL_BOOKING_CHANGE_UPDATE, 'CRMGateway::updateAdditionalSupport: Could not update additional support options in CRM', {
        error,
        bookingId,
      });
      throw error;
    }
  }

  public async updateLanguage(bookingId: string, bookingProductId: string, language: CRMTestLanguage, isCSCBooking?: boolean): Promise<void> {
    logger.info('CRMGateway::updateLanguage: Attempting to update language', { bookingId, bookingProductId, language });
    try {
      const updateBookingRequest: DynamicsWebApi.UpdateRequest = {
        key: bookingId,
        collection: 'ftts_bookings',
        entity: {
          ftts_language: language,
          ftts_callamend: isCSCBooking ? isCSCBooking?.toString() : undefined,
        },
      };
      const updateBookingProductRequest: DynamicsWebApi.UpdateRequest = {
        key: bookingProductId,
        collection: 'ftts_bookingproducts',
        entity: {
          ftts_testlanguage: language,
        },
      };

      logger.debug('CRMGateway::updateLanguage: Raw Request', { updateBookingRequest, updateBookingProductRequest });

      this.dynamicsWebApi.startBatch();
      this.dynamicsWebApi.updateRequest(updateBookingRequest);
      this.dynamicsWebApi.updateRequest(updateBookingProductRequest);
      await this.dynamicsWebApi.executeBatch();
      logger.info('CRMGateway::updateLanguage: Language updated successfully', { bookingId, bookingProductId, language });
    } catch (error) {
      logger.error(error, 'CRMGateway::updateLanguage: Could not update language in CRM', { bookingId, bookingProductId, language });
      logger.event(BusinessTelemetryEvents.CDS_FAIL_BOOKING_CHANGE_UPDATE, 'CRMGateway::updateLanguage: Could not update language in CRM', {
        error,
        bookingId,
      });
      throw error;
    }
  }

  public async updateCompensationBooking(bookingId: string, owedCompensationBookingRecognised: string): Promise<void> {
    const identifiers = {
      bookingId,
      owedCompensationBookingRecognised,
    };
    logger.info('CRMGateway::updateCompensationBooking: Attempting to update compensation booking', identifiers);

    try {
      await this.updateOwedCompensationBookingRecognised(bookingId, owedCompensationBookingRecognised);
      logger.info('CRMGateway::updateCompensationBooking: Compensation booking has been updated in CRM', identifiers);
    } catch (error) {
      logger.error(error as Error, 'CRMGateway::updateCompensationBooking: Could not update compensation booking in CRM', identifiers);
      throw error;
    }
  }

  /**
   * Only booked or completed tests and only those from the booking app or CSC
   */
  public async getCandidateBookings(candidateId: string): Promise<BookingDetails[]> {
    try {
      let normalisedRecords: CRMBookingDetails[] = [];
      if (config.featureToggles.enableViewNsaBookingSlots) {
        // If a link entity doesn't contain an id, it won't return that record at all so we must split it into two requests
        const [rawStandardXml, rawNsaXml] = await Promise.all([
          this.readFile('getCandidateBookings.xml'),
          this.readFile('getNsaDraftCandidateBookings.xml'),
        ]);

        const standardBookingsQuery = rawStandardXml.replace('${candidateId}', candidateId);
        const nsaBookingsQuery = rawNsaXml.replace('${candidateId}', candidateId);

        logger.debug('CRMGateway::getCandidateBookings: Raw XML Request', {
          standardBookingsQuery,
          nsaBookingsQuery,
          entity: Collection.BOOKING_PRODUCT,
        });

        this.dynamicsWebApi.startBatch();
        await this.dynamicsWebApi.fetch(Collection.BOOKING_PRODUCT, standardBookingsQuery);
        await this.dynamicsWebApi.fetch(Collection.BOOKING_PRODUCT, nsaBookingsQuery);
        const response = await this.dynamicsWebApi.executeBatch();

        logger.debug('CRMGateway::getCandidateBookings: Raw XML Response', {
          response,
          entity: Collection.BOOKING_PRODUCT,
        });

        const [standardBookings, nsaBookings] = [response[0].value as CRMXmlBookingDetails[], response[1].value as CRMXmlBookingDetails[]];
        const nsaBookingSlots = await this.getNsaBookingSlots(nsaBookings);

        if (nsaBookingSlots) {
          // Combine the nsa booking slots with the nsa bookings array (related to booking id)
          nsaBookings.forEach((nsaBooking: CRMXmlBookingDetails) => {
            if (!nsaBookingSlots.length) {
              nsaBooking.ftts_nsabookingslots = undefined;
            }
            // Go through each booking slot and attach to the booking
            nsaBookingSlots.forEach((nsaBookingSlot: CRMNsaBookingSlots) => {
              if (nsaBookingSlot._ftts_bookingid_value === nsaBooking._ftts_bookingid_value) {
                const bookingSlot = nsaBooking.ftts_nsabookingslots as CRMNsaBookingSlots[];
                bookingSlot.push(nsaBookingSlot);
              }
            });
          });
        }

        const records = [...standardBookings, ...nsaBookings];
        normalisedRecords = records.map(mapFromCrmXmlBookingDetailsToCRMBookingDetails);
      } else {
        const bookingProductFields = ['ftts_bookingproductid', 'ftts_reference', '_ftts_bookingid_value', 'ftts_bookingstatus', 'ftts_testdate', 'ftts_testlanguage', 'ftts_voiceoverlanguage', 'ftts_additionalsupportoptions', 'ftts_paymentstatus', 'ftts_price', 'ftts_salesreference', 'createdon'];
        const bookingFields = ['ftts_governmentagency', 'ftts_reference', 'ftts_origin', 'ftts_enableeligibilitybypass', 'ftts_nonstandardaccommodation', 'ftts_owedcompbookingassigned', 'ftts_owedcompbookingrecognised', 'ftts_zerocostbooking', 'ftts_testsupportneed', 'ftts_foreignlanguageselected'];
        const testCentreFields = ['ftts_siteid', 'name', 'address1_line1', 'address1_line2', 'address1_city', 'address1_county', 'address1_postalcode', 'ftts_remit', 'ftts_fullyaccessible', '_parentaccountid_value', 'address1_latitude', 'address1_longitude', 'accountid', 'ftts_tcntestcentreid'];
        const parentAccountFields = ['ftts_regiona', 'ftts_regionb', 'ftts_regionc'];
        const productFields = ['productid', '_parentproductid_value', 'name', 'productnumber'];

        const filterQuery = `_ftts_candidateid_value eq ${candidateId} and (ftts_bookingstatus eq ${CRMBookingStatus.Confirmed} or ftts_bookingstatus eq ${CRMBookingStatus.CompletePassed} or ftts_bookingstatus eq ${CRMBookingStatus.CompleteFailed} or ftts_bookingstatus eq ${CRMBookingStatus.CancellationInProgress} or ftts_bookingstatus eq ${CRMBookingStatus.ChangeInProgress} or ftts_bookingstatus eq ${CRMBookingStatus.Cancelled})`;

        const request: RetrieveMultipleRequest = {
          collection: 'ftts_bookingproducts',
          select: bookingProductFields,
          orderBy: ['ftts_reference desc'],
          expand: [
            {
              property: 'ftts_bookingid',
              select: bookingFields,
              expand: [{
                property: 'ftts_testcentre',
                select: testCentreFields,
                expand: [{
                  property: 'parentaccountid',
                  select: parentAccountFields,
                }],
              }],
            },
            {
              property: 'ftts_productid',
              select: productFields,
            },
          ],
          filter: filterQuery,
        };

        logger.debug('CRMGateway::getCandidateBookings: Raw Request', { request });
        const response = await this.dynamicsWebApi.retrieveMultipleRequest<CRMBookingDetails>(request);
        logger.debug('CRMGateway::getCandidateBookings: Raw Response', { response });
        normalisedRecords = response?.value as CRMBookingDetails[];
      }

      if (!normalisedRecords.length) {
        logger.debug('CRMGateway::getCandidateBookings: No bookings found for candidate', { candidateId });
        return [];
      }

      const faultyBookingRefs: string[] = [];
      const result = normalisedRecords
        .filter((booking: CRMBookingDetails) => {
          // Can't filter booking origin on the expand query so filter here instead
          // Only want bookings made from the booking app or CSC
          // And if from CSC payment must be confirmed
          if (booking.ftts_bookingid.ftts_governmentagency === null) {
            if (booking.ftts_bookingid.ftts_origin === CRMOrigin.CitizenPortal
              || (booking.ftts_bookingid.ftts_origin === CRMOrigin.CustomerServiceCentre
                && booking.ftts_paymentstatus === CRMPaymentStatus.Success)) {
              faultyBookingRefs.push(booking?.ftts_bookingid?.ftts_reference as string);
            }
            return false;
          }
          // Can't filter Cancelled booking with below properties
          // Filtering Cancelled bookings that are eligible to be rebooked
          if (booking.ftts_bookingstatus === CRMBookingStatus.Cancelled) {
            return booking.ftts_bookingid.ftts_owedcompbookingassigned !== null && booking.ftts_bookingid.ftts_owedcompbookingrecognised === null;
          }

          // If from NSA, we want booking status to be draft and for non standard accommodation to be true
          if (booking.ftts_bookingstatus === CRMBookingStatus.Draft) {
            if (!booking.ftts_bookingid.ftts_nonstandardaccommodation) {
              return false;
            }
            if (booking.ftts_bookingid.ftts_nsastatus === null) {
              faultyBookingRefs.push(booking?.ftts_bookingid?.ftts_reference as string);
              return false;
            }
            return true;
          }

          if (booking.ftts_bookingid.ftts_origin === CRMOrigin.CitizenPortal) {
            return true;
          }

          if (booking.ftts_bookingid.ftts_origin === CRMOrigin.CustomerServiceCentre) {
            return booking.ftts_paymentstatus === CRMPaymentStatus.Success;
          }
          return false;
        })
        .map(mapToBookingDetails);

      if (faultyBookingRefs.length > 0) {
        logger.debug('CRMGateway::getCandidateBookings: The following bookings are filtered out because of missing data', { faultyBookingRefs, candidateId });
      }

      // We need to retrieve the payment information for any bookings which have the status Cancellation in Progress.
      const resultsThatContainBookingsWithPaymentInformation = await this.getPaymentInformationForBookingDetails(result);
      logger.debug('CRMGateway::getCandidateBookings: result of fetched bookings with bookings also containing payment information', { resultsThatContainBookingsWithPaymentInformation, candidateId });
      return resultsThatContainBookingsWithPaymentInformation;
    } catch (error) {
      this.logGeneralError(error, 'CRMGateway::getCandidateBookings: Could not retrieve booking products from CRM', { candidateId });
      throw error;
    }
  }

  public async getCandidateCompensatedBookings(candidateId: string, target: Target): Promise<CompensatedBooking[]> {
    try {
      const rawXml = await this.readFile('getCandidateCompensatedBookings.xml');
      const xml = rawXml.replace('${candidateId}', candidateId)
        .replace('${governmentAgency}', target === Target.NI ? String(CRMGovernmentAgency.Dva) : String(CRMGovernmentAgency.Dvsa));
      logger.debug('CRMGateway::getCandidateCompensatedBookings: Raw Request', { xml, entity: Collection.BOOKING_PRODUCT });
      const response: FetchXmlResponse<CompensatedBooking> = await this.dynamicsWebApi.fetch(Collection.BOOKING_PRODUCT, xml);
      logger.debug('CRMGateway::getCandidateCompensatedBookings: Raw Response', { response, entity: Collection.BOOKING_PRODUCT });

      return response.value ? response.value : [];
    } catch (error) {
      this.logGeneralError(error, 'CRMGateway::getCandidateCompensatedBookings: Could not retrieve compensated booking from CRM', { candidateId });
      throw error;
    }
  }

  public async calculateThreeWorkingDays(testDate: string, remit: CRMRemit): Promise<string> {
    try {
      const request = {
        TestDate: testDate,
        CalendarName: mapCRMRemitToCRMCalendarName(remit),
        NoOfDays: -4, // 4 to get date 3 clear working days before
      };
      logger.debug('CRMGateway::calculateThreeWorkingDays: Raw Request', { request });
      const response = await this.dynamicsWebApi.executeUnboundAction<GetWorkingDaysResponse>(
        'ftts_GetClearWorkingDay',
        request,
      );
      logger.debug('CRMGateway::calculateThreeWorkingDays: Raw Response', { response });
      const dueDate = response.DueDate instanceof Date ? response.DueDate : new Date(response.DueDate);
      const isoDateString = dueDate.toISOString().split('T')[0];
      return isoDateString;
    } catch (error) {
      this.logGeneralError(error, 'CRMGateway::calculateThreeWorkingDays: Could not get 3 working days', { testDate, remit });
      return '';
    }
  }

  public async updateTCNUpdateDate(bookingProductId: string): Promise<void> {
    logger.info('CRMGateway::updateTCNUpdateDate: Attempting to update ftts_tcn_update_date', { bookingProductId });
    try {
      const request: DynamicsWebApi.UpdateRequest = {
        key: bookingProductId,
        collection: 'ftts_bookingproducts',
        entity: {
          ftts_tcn_update_date: dayjs().toISOString(),
        },
      };
      logger.debug('CRMGateway::updateTCNUpdateDate: Raw Request', { request, bookingProductId });
      await this.dynamicsWebApi.updateRequest(request);
      logger.info('CRMGateway::updateTCNUpdateDate: ftts_tcn_update_date updated successfully', { bookingProductId });
    } catch (error) {
      logger.error(error, 'CRMGateway::updateTCNUpdateDate: Could not set the TCN Update Date on Booking Product ID', { bookingProductId });
      logger.event(BusinessTelemetryEvents.CDS_FAIL_BOOKING_CHANGE_UPDATE, 'CRMGateway::updateTCNUpdateDate: Could not set the TCN Update Date', { error, bookingProductId });
      throw error;
    }
  }

  public async updateBookingStatusPaymentStatusAndTCNUpdateDate(bookingId: string, bookingProductId: string, bookingStatus: CRMBookingStatus, paymentId?: string, isCSCBooking?: boolean): Promise<void> {
    logger.info('CRMGateway::updateBookingStatusPaymentStatusAndTCNUpdateDate: Attempting to update', {
      bookingId,
      bookingProductId,
      bookingStatus,
      paymentId,
    });
    let updatePaymentRequest: DynamicsWebApi.UpdateRequest = {};
    try {
      const updateBookingRequest: DynamicsWebApi.UpdateRequest = {
        key: bookingId,
        collection: 'ftts_bookings',
        entity: {
          ftts_bookingstatus: bookingStatus,
          ftts_callamend: isCSCBooking ? isCSCBooking.toString() : undefined,
        },
      };
      if (paymentId) {
        updateBookingRequest.entity['ftts_payment@odata.bind'] = `/ftts_payments(${paymentId})`;
      }
      const updateBookingProductRequest: DynamicsWebApi.UpdateRequest = {
        key: bookingProductId,
        collection: 'ftts_bookingproducts',
        entity: {
          ftts_tcn_update_date: dayjs().toISOString(),
        },
      };
      this.dynamicsWebApi.startBatch();
      this.dynamicsWebApi.updateRequest(updateBookingRequest);
      if (bookingStatus === CRMBookingStatus.AbandonedNonRecoverable) {
        updatePaymentRequest = {
          key: paymentId,
          collection: 'ftts_payments',
          entity: {
            ftts_status: CRMPaymentStatus.UserCancelled,
          },
        };
        this.dynamicsWebApi.updateRequest(updatePaymentRequest);
      }
      this.dynamicsWebApi.updateRequest(updateBookingProductRequest);
      logger.debug('CRMGateway::updateBookingStatusPaymentStatusAndTCNUpdateDate: Raw Request', {
        updateBookingRequest,
        updateBookingProductRequest,
        updatePaymentRequest,
      });
      await this.dynamicsWebApi.executeBatch();
      logger.info('CRMGateway::updateBookingStatusPaymentStatusAndTCNUpdateDate: Update finished successfully', {
        bookingId,
        bookingProductId,
        bookingStatus,
        paymentId,
      });
    } catch (error) {
      this.logGeneralError(error, 'CRMGateway::updateBookingStatusPaymentStatusAndTCNUpdateDate: Batch request failed', {
        bookingId,
        bookingProductId,
        bookingStatus,
      });
      throw error;
    }
  }

  public async updateNSABookings(nsaBookings: NsaBookingDetail[]): Promise<void> {
    if (nsaBookings.length >= 1000) {
      const error = Error('CRMGateway::updateNSABookings: The number of NSA bookings to update exceeds a thousand');
      logger.error(error, undefined, { numberOfNsaBookings: nsaBookings.length });
      throw error;
    }
    logger.info('CRMGateway::updateNSABookings: Attempting to update', {
      nsaBookings,
    });
    try {
      this.dynamicsWebApi.startBatch();
      // eslint-disable-next-line no-restricted-syntax
      for (const nsaBooking of nsaBookings) {
        if (nsaBooking.crmNsaStatus === CRMNsaStatus.AwaitingCscResponse || nsaBooking.crmNsaStatus === CRMNsaStatus.DuplicationsClosed) {
          const request: DynamicsWebApi.UpdateRequest = {
            key: nsaBooking.bookingId,
            collection: 'ftts_bookings',
            entity: {
              ftts_bookingstatus: CRMBookingStatus.NoLongerRequired,
              ftts_callamend: (nsaBooking.origin === CRMOrigin.CustomerServiceCentre) ? 'true' : undefined,
              ftts_nsastatus: CRMNsaStatus.StandardTestBooked,
            },
          };
          logger.debug('CRMGateway::updateNSABookings: Raw Request', {
            request,
          });
          this.dynamicsWebApi.updateRequest(request);
        }
      }
      await this.dynamicsWebApi.executeBatch();
      logger.info('CRMGateway::updateNSABookings: Update finished successfully', {
        nsaBookings,
      });
    } catch (error) {
      this.logGeneralError(error, 'CRMGateway::updateNSABookings: Batch request failed', {
        nsaBookings,
      });
      throw error;
    }
  }

  /**
   * Retrieves price list for DVSA/DVA based on the given target. Optionally fetches prices only for the given testTypes.
   */
  public async getPriceList(target: Target, testTypes?: TestType[]): Promise<PriceListItem[]> {
    const priceListId = target === Target.NI ? config.crm.priceListId.dva : config.crm.priceListId.dvsa;
    try {
      let filter = `_pricelevelid_value eq ${priceListId}`;
      if (testTypes) {
        const productNumbers = testTypes.map(toCRMProductNumber);
        filter += ` and Microsoft.Dynamics.CRM.In(PropertyName='productnumber',PropertyValues=[${productNumbers.map((p) => `'${p}'`).join(',')}])`;
      }

      const request = {
        collection: 'productpricelevels',
        select: ['productnumber', 'amount'],
        expand: [{
          property: 'productid',
          select: ['productid', '_parentproductid_value', 'name'],
        }],
        filter,
      };
      logger.debug('CRMGateway::getPriceList: Raw Request', { request });
      const response = await this.dynamicsWebApi.retrieveMultipleRequest<CRMProductPriceLevel>(request);
      logger.debug('CRMGateway::getPriceList: Raw Response', { response });
      if (!response.value?.length) {
        throw new Error('Empty response from CRM');
      }

      const priceList: PriceListItem[] = response.value.map((productPriceLevel) => ({
        testType: fromCRMProductNumber(productPriceLevel.productnumber),
        price: productPriceLevel.amount,
        product: {
          productId: productPriceLevel.productid.productid,
          parentId: productPriceLevel.productid._parentproductid_value,
          name: productPriceLevel.productid.name,
        },
      }));

      return priceList;
    } catch (error) {
      logger.error(error, 'CRMGateway::getPriceList: Failed to get price list from CRM', { priceListId, testTypes, target });
      throw error;
    }
  }

  public async createBindBetweenBookingAndPayment(bookingId?: string, paymentId?: string, receiptReference?: string): Promise<void> {
    logger.info('CRMGateway::createBindBetweenBookingAndPayment: Attempting to create a bind between a booking and a payment', {
      bookingId,
      paymentId,
      receiptReference,
    });
    try {
      if (!bookingId) {
        throw new Error('bookingId is not defined');
      }
      if (!paymentId) {
        throw new Error('paymentId is not defined');
      }
      const updateRequest: DynamicsWebApi.UpdateRequest = {
        key: bookingId,
        collection: 'ftts_bookings',
        entity: {
          'ftts_payment@odata.bind': `/ftts_payments(${paymentId})`,
        },
      };
      logger.debug('CRMGateway::createBindBetweenBookingAndPayment: Trying to update a booking', {
        updateRequest,
      });
      await this.dynamicsWebApi.updateRequest(updateRequest);
      logger.info('CRMGateway::createBindBetweenBookingAndPayment: Booking updated successfully', {
        bookingId,
        paymentId,
        receiptReference,
      });
    } catch (error) {
      this.logGeneralError(error, 'CRMGateway::createBindBetweenBookingAndPayment: Could not create a bind', {
        bookingId,
        paymentId,
        receiptReference,
      });
      throw error;
    }
  }

  public async updateZeroCostBooking(bookingId: string): Promise<void> {
    logger.info('CRMGateway::updateZeroCostBooking: Attempting to update', { bookingId });
    try {
      const request: DynamicsWebApi.UpdateRequest = {
        key: bookingId,
        collection: 'ftts_bookings',
        entity: {
          ftts_zerocostbooking: true,
          ftts_zerocostbookingreason: CRMZeroCostBookingReason.EXAMINER,
        },
      };
      logger.debug('CRMGateway::updateZeroCostBooking: Raw Request', { request, bookingId });
      await this.dynamicsWebApi.updateRequest(request);
      logger.info('CRMGateway::updateZeroCostBooking: Update finished successfully', { bookingId });
    } catch (error) {
      logger.error(error, 'CRMGateway::updateZeroCostBooking: Could not update Booking', { bookingId });
      logger.event(BusinessTelemetryEvents.CDS_FAIL_BOOKING_NEW_UPDATE, 'CRMGateway::updateZeroCostBooking: Could not update Booking', { error, bookingId });
      throw error;
    }
  }

  public async markBookingCancelled(bookingId: string, bookingProductId: string, isCSCBooking?: boolean): Promise<void> {
    logger.info('CRMGateway::markBookingCancelled: Attempting to update booking status and cancel date', { bookingId, bookingProductId });
    try {
      this.dynamicsWebApi.startBatch();
      const request: DynamicsWebApi.UpdateRequest = {
        key: bookingProductId,
        collection: 'ftts_bookingproducts',
        entity: {
          ftts_canceldate: dayjs().toISOString(),
          ftts_cancelreason: CRMCancelReason.Other,
          ftts_cancelreasondetails: 'Booking cancelled by candidate online',
        },
      };
      await this.dynamicsWebApi.updateRequest(request);
      this.updateBookingStatus(bookingId, CRMBookingStatus.Cancelled, isCSCBooking);
      const response = await this.dynamicsWebApi.executeBatch();
      logger.info('CRMGateway::markBookingCancelled: Booking status and Booking product cancel date updated', { bookingId, bookingProductId });
      logger.debug('CRMGateway::markBookingCancelled:: Raw response', { response, bookingId });
    } catch (error) {
      logger.error(error, 'CRMGateway::markBookingCancelled: Could not update booking status in CRM', { bookingId, bookingProductId });
      logger.event(BusinessTelemetryEvents.CDS_FAIL_BOOKING_CHANGE_UPDATE, 'CRMGateway::markBookingCancelled: Could not update booking status in CRM', {
        error,
        bookingId,
      });
      throw error;
    }
  }

  private async updateProductBookingAdditionalSupport(bookingProductId: string, additionalSupport: CRMAdditionalSupport): Promise<CRMBookingProduct> {
    const request: DynamicsWebApi.UpdateRequest = {
      key: bookingProductId,
      collection: 'ftts_bookingproducts',
      entity: {
        ftts_additionalsupportoptions: additionalSupport, // Only to handle BSL for now.
      },
    };
    logger.debug('CRMGateway::updateProductBookingAdditionalSupport: Raw Request', { request, bookingProductId });
    return this.dynamicsWebApi.updateRequest(request);
  }

  private async updateBookingAdditionalSupport(bookingId: string, additionalSupport: CRMAdditionalSupport, isCSCBooking?: boolean): Promise<CRMBookingResponse> {
    const request: DynamicsWebApi.UpdateRequest = {
      key: bookingId,
      collection: 'ftts_bookings',
      entity: {
        ftts_additionalsupportoptions: additionalSupport, // Only to handle BSL for now.
        ftts_callamend: isCSCBooking ? isCSCBooking?.toString() : undefined,
      },
    };
    logger.debug('CRMGateway::updateBookingAdditionalSupport: Raw Request', { request, bookingId });
    return this.dynamicsWebApi.updateRequest(request);
  }

  private async updateBookingProductVoiceover(bookingProductId: string, voiceover: CRMVoiceOver): Promise<CRMBookingProduct> {
    const request: DynamicsWebApi.UpdateRequest = {
      key: bookingProductId,
      collection: 'ftts_bookingproducts',
      entity: {
        ftts_voiceoverlanguage: voiceover,
      },
    };
    logger.debug('CRMGateway::updateBookingProductVoiceover: Raw Request', { request, bookingProductId });
    return this.dynamicsWebApi.updateRequest(request);
  }

  private async updateCandidateRequest(candidateId: string, updatedCandidateDetails: Partial<CRMContact>): Promise<CRMContact> {
    const request: DynamicsWebApi.UpdateRequest = {
      key: candidateId,
      collection: 'contacts',
      entity: updatedCandidateDetails,
      returnRepresentation: true,
    };
    logger.debug('CRMGateway::updateCandidateRequest: Raw Request', { request, candidateId });
    return this.dynamicsWebApi.updateRequest(request);
  }

  private async updateBookingVoiceover(bookingId: string, voiceover: CRMVoiceOver, isCSCBooking?: boolean): Promise<CRMBookingResponse> {
    const request: DynamicsWebApi.UpdateRequest = {
      key: bookingId,
      collection: 'ftts_bookings',
      entity: {
        ftts_nivoiceoveroptions: voiceover,
        ftts_callamend: isCSCBooking ? isCSCBooking?.toString() : undefined,
      },
    };
    logger.debug('CRMGateway::updateBookingVoiceover: Raw Request', { request, bookingId });
    return this.dynamicsWebApi.updateRequest(request);
  }

  private async updateOwedCompensationBookingRecognised(bookingId: string, owedCompensationBookingRecognised: string): Promise<void> {
    const request: DynamicsWebApi.UpdateRequest = {
      key: bookingId,
      collection: 'ftts_bookings',
      entity: {
        ftts_owedcompbookingrecognised: owedCompensationBookingRecognised,
      },
    };
    logger.debug('CRMGateway:updateOwedCompensationBookingRecognised: Raw Request', { request, bookingId });
    return this.dynamicsWebApi.updateRequest(request);
  }

  private async getPaymentInformationForBookingDetails(bookingDetails: BookingDetails[]): Promise<BookingDetails[]> {
    if (bookingDetails.length === 0) {
      return [];
    }

    const filteredBookings = bookingDetails.filter((booking) => booking.bookingStatus === CRMBookingStatus.CancellationInProgress);

    if (filteredBookings.length === 0) {
      return bookingDetails;
    }

    try {
      this.dynamicsWebApi.startBatch();

      filteredBookings.forEach((bookingDetail) => {
        this.dynamicsWebApi.retrieveMultipleRequest<GetPaymentInformationResponse>({
          collection: 'ftts_financetransactions',
          select: ['ftts_type', 'ftts_status', '_ftts_bookingproduct_value'],
          expand: [{
            property: 'ftts_payment',
            select: ['ftts_status'],
          }],
          filter: `_ftts_bookingproduct_value eq ${bookingDetail.bookingProductId}`,
        });
      });

      const results = await this.dynamicsWebApi.executeBatch();
      logger.debug('CRMGateway::getPaymentInformationForBookingDetails: Raw Response', { results });
      let updatedBookingDetails: BookingDetails[] = [...bookingDetails];

      results.forEach((result) => {
        if (result.value.length === 0) {
          return;
        }
        updatedBookingDetails = updatedBookingDetails.map((bookingDetail) => {
          // eslint-disable-next-line no-underscore-dangle
          if (bookingDetail.bookingProductId === result.value[0]._ftts_bookingproduct_value) {
            return mapPaymentInformationToBookingDetails(result.value[0], bookingDetail);
          }
          return bookingDetail;
        });
      });

      return updatedBookingDetails;
    } catch (error) {
      logger.error(error, `CRMGateway::getPaymentInformationForBookingDetails: Could not retrieve payment information for bookings that have the status Cancellation in Progress- ${error.message}`);
      throw error;
    }
  }

  private async createBookingRequest(candidate: Candidate, booking: Booking, additionalSupport: CRMAdditionalSupport, isStandardAccommodation: boolean, priceListId: string): Promise<CRMBookingResponse> {
    const request: DynamicsWebApi.CreateRequest = {
      collection: 'ftts_bookings',
      entity: mapToCRMBooking(candidate, booking, candidate.candidateId as string, candidate.licenceId as string, additionalSupport, isStandardAccommodation, priceListId),
      returnRepresentation: true,
    };

    logger.debug('CRMGateway::createBookingRequest: Raw Request', { request });

    return this.dynamicsWebApi.createRequest<CRMBookingResponse>(request);
  }

  private async getNsaBookingSlots(nsaBookings: CRMXmlBookingDetails[]): Promise<CRMNsaBookingSlots[] | undefined> {
    const rawNsaBookingSlotXml = await this.readFile('getNsaBookingSlots.xml');
    let filterQuery = '';

    if (!nsaBookings) {
      return undefined;
    }

    nsaBookings.forEach((nsaBooking: CRMXmlBookingDetails) => {
      nsaBooking.ftts_nsabookingslots = [];
      const bookingId = nsaBooking._ftts_bookingid_value;
      filterQuery = filterQuery.concat(`<condition attribute="ftts_bookingid" operator="eq" value="${bookingId}" />\n`);
    });

    const nsaBookingSlotQuery = rawNsaBookingSlotXml.replace('${bookingidConditions}', filterQuery);
    logger.debug('CRMGateway::getNsaBookingSlots: Raw XML Request', {
      nsaBookingSlotQuery,
      entity: Collection.NSA_BOOKING_SLOTS,
    });
    const response: FetchXmlResponse<CRMNsaBookingSlots> = await this.dynamicsWebApi.fetch(Collection.NSA_BOOKING_SLOTS, nsaBookingSlotQuery);
    const nsaBookingSlots = response.value as CRMNsaBookingSlots[];

    logger.debug('CRMGateway::getNsaBookingSlots: Raw XML Response', {
      nsaBookingSlots,
      entity: Collection.NSA_BOOKING_SLOTS,
    });

    return nsaBookingSlots;
  }

  public async getUserDraftNSABookingsIfExist(candidateId: string, testType: TestType): Promise<NsaBookingDetail[] | undefined> {
    if (config.featureToggles.enableExistingBookingValidation === false) {
      return Promise.resolve(undefined);
    }
    try {
      const rawXml = await this.readFile('getDraftNSABookings.xml');
      const xml = rawXml.replace('${candidateId}', candidateId)
        .replace('${testType}', toCRMProductNumber(testType));
      logger.debug('CRMGateway::getUserDraftNSABookingsIfExist: Raw Request', { xml, entity: Collection.BOOKING_PRODUCT });
      const response = await this.dynamicsWebApi.fetch(Collection.BOOKING_PRODUCT, xml);
      logger.debug('CRMGateway::getUserDraftNSABookingsIfExist: Raw Response', { response, entity: Collection.BOOKING_PRODUCT, candidateId });
      if (!response.value?.length) {
        logger.debug('CRMGateway::getUserDraftNSABookingsIfExist: No draft bookings found for candidate', { candidateId });
        return undefined;
      }
      return response.value.map((booking) => (
        {
          bookingId: booking['ftts_booking.ftts_bookingid'],
          nsaStatus: booking['ftts_booking.ftts_nsastatus'],
          origin: booking['ftts_booking.ftts_origin'],
        }
      ));
    } catch (error) {
      this.logGeneralError(error, 'CRMGateway::getUserDraftNSABookingsIfExist: Could not retrieve NSA draft booking from CRM', { candidateId });
      throw error;
    }
  }

  public async doesCandidateHaveExistingBookingsByTestType(candidateId: string, testType: TestType): Promise<boolean> {
    try {
      const rawXml = await this.readFile('getCandidateBookingsByCurrentTestType.xml');
      const xml = rawXml.replace('${candidateId}', candidateId)
        .replace('${testType}', toCRMProductNumber(testType))
        .replace('${BOOKING_STATUS_CONFIRMED}', CRMBookingStatus.Confirmed.toString())
        .replace('${DATE_NOW}', new Date().toISOString());

      logger.debug('CRMGateway::doesCandidateHaveExistingBookingsByTestType: Raw Request', {
        xml, entity: Collection.BOOKING_PRODUCT, candidateId, testType,
      });
      const response: FetchXmlResponse<string> = await this.dynamicsWebApi.fetch(Collection.BOOKING_PRODUCT, xml);
      logger.debug('CRMGateway::doesCandidateHaveExistingBookingsByTestType: Raw Response', {
        response, entity: Collection.BOOKING_PRODUCT, candidateId, testType,
      });

      if (!response.value?.length) {
        logger.debug('CRMGateway::doesCandidateHaveExistingBookingsByTestType: No bookings found with existing test type for candidate', { candidateId, testType });
        return false;
      }
      return true;
    } catch (error) {
      this.logGeneralError(error, 'CRMGateway::doesCandidateHaveExistingBookingsByTestType: Could not retrieve candidate bookings from CRM', { candidateId, testType });
      throw error;
    }
  }

  /**
   * Retrieves the number of times a booking has been rescheduled.
   */
  public async getRescheduleCount(bookingId: string): Promise<number> {
    try {
      const request = {
        collection: 'ftts_bookings',
        select: ['ftts_reschedulecount'],
        key: bookingId,
      };

      logger.debug('CRMGateway::getRescheduleCount: Raw Request', { request });
      const response = await this.dynamicsWebApi.retrieveRequest<CRMBookingRescheduleCountResponse>(request);
      logger.debug('CRMGateway::getRescheduleCount: Raw Response', { response });

      if (!response) {
        throw new Error('CRMGateway::getRescheduleCount: Empty response from CRM');
      }

      if (!response.ftts_reschedulecount) {
        return 0;
      }

      return response.ftts_reschedulecount;
    } catch (error) {
      logger.error(error as Error, 'CRMGateway::getRescheduleCount: Failed to get reschdule count from CRM', { bookingId });
      throw error;
    }
  }

  logGeneralError(error: CRMGatewayError, message: string, props?: Record<string, unknown>): void {
    logger.error(error as RequestError, message, props);
    if (error.status === 401 || error.status === 403) {
      logger.event(BusinessTelemetryEvents.CDS_AUTH_ISSUE, message, {
        error,
        ...props,
      });
    }
    if (error.status >= 400 && error.status < 500) {
      logger.event(BusinessTelemetryEvents.CDS_REQUEST_ISSUE, message, {
        error,
        ...props,
      });
    }
    if (error.status >= 500 && error.status < 600) {
      logger.event(BusinessTelemetryEvents.CDS_ERROR, message, {
        error,
        ...props,
      });
    }
  }

  private async readFile(fileName: string): Promise<string> {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    return fs.promises.readFile(`./src/services/crm-gateway/data/${fileName}`, 'utf-8');
  }

  public static retryLog(warnMessage: string, properties?: Record<string, unknown>): void {
    logger.warn(warnMessage, properties);
  }
}
