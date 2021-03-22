import { cdsRetry, proxifyWithRetryPolicy } from '@dvsa/cds-retry';
import dayjs from 'dayjs';
import { RetrieveMultipleRequest } from 'dynamics-web-api';
import { v4 as uuid4 } from 'uuid';

import { Booking, Candidate } from '../session';
import {
  CRMAdditionalSupport,
  CRMBookingStatus,
  CRMOrigin,
  CRMPaymentStatus,
  CRMRemit,
  CRMTestLanguage,
  CRMVoiceOver,
  TestEngineTestType,
} from './enums';
import { dynamicsWebApiClient } from './dynamics-web-api';
import logger from '../../helpers/logger';
import {
  BookingDetails,
  BookingResponse,
  CandidateAndBookingResponse,
  CRMBookingDetails,
  CRMBookingResponse,
  CRMLicenceCandidateResponse,
  CRMLicenceResponse,
  CRMProduct,
  GetPaymentInformationResponse,
  GetWorkingDaysResponse,
  LicenceAndProductResponse,
  ProductResponse,
  RescheduleUpdateRequest,
} from './interfaces';
import {
  mapCRMBookingResponseToBookingResponse,
  mapCRMLicenceToLicenceResponse,
  mapCRMProductToProductResponse,
  mapCRMRemitToCRMCalendarName,
  mapPaymentInformationToBookingDetails,
  mapToBookingDetails,
  mapToCandidate,
  mapToCRMBooking,
  mapToCRMBookingProduct,
  mapToCRMContact,
  mapToCRMLicence,
} from './crm-helper';
import config from '../../config';

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

  public static cdsRetryPolicy: Parameters<typeof cdsRetry>[1] = {
    retries: config.http.retryClient.maxRetries,
    backoff: config.http.retryClient.defaultRetryDelay,
    maxRetryAfter: config.http.retryClient.maxRetryAfter,
    exponentialFactor: 1.2,
  };

  public async getCandidateByLicenceNumber(licenceNumber: string): Promise<Candidate | undefined> {
    try {
      const request: RetrieveMultipleRequest = {
        collection: 'ftts_licences',
        select: ['ftts_licence', 'ftts_licenceid'],
        expand: [{
          property: 'ftts_Person',
          select: ['contactid', 'ftts_firstandmiddlenames', 'lastname', 'emailaddress1', 'birthdate', 'ftts_personreference'],
        }],
        filter: `ftts_licence eq '${licenceNumber}'`,
      };

      const response = await this.dynamicsWebApi.retrieveMultipleRequest<CRMLicenceCandidateResponse>(request);

      if (!response.value?.[0]) {
        logger.log(`No licence/candidate found for the given licenceNumber: ${licenceNumber}`);
        return undefined;
      }

      const candidate: Candidate = mapToCandidate(response.value[0]);
      logger.log(`Candidate was retrieved from CRM - Candidate ID: ${candidate.candidateId}`);

      return candidate;
    } catch (error) {
      logger.critical(`Error retrieving licence/candidate from CRM - ${error.message}`, { error });
      throw error;
    }
  }

  public async getLicenceAndProduct(licenceNumber: string, testEngineTestType: TestEngineTestType): Promise<LicenceAndProductResponse> {
    try {
      logger.log('CRMGateway::getLicenceAndProduct: Attempting to retrive Candidate, Licence and Product from CRM');

      this.dynamicsWebApi.startBatch();
      this.getLicenceRequest(licenceNumber);
      this.getProductRequest(testEngineTestType);
      const response = await this.dynamicsWebApi.executeBatch();

      const licences: CRMLicenceResponse[] = response[0].value as CRMLicenceResponse[];
      const products: CRMProduct[] = response[1].value as CRMProduct[];

      const licenceAndProductResponse: LicenceAndProductResponse = {
        licence: mapCRMLicenceToLicenceResponse(licences),
        product: mapCRMProductToProductResponse(products),
      };
      logger.log('CRMGateway::getLicenceAndProduct: Data retrived from CRM', { ...licenceAndProductResponse });
      return licenceAndProductResponse;
    } catch (error) {
      logger.error(error, 'CRMGateway::getLicenceAndProduct: Could not retrieve licence from CRM');
      throw error;
    }
  }

  public async createCandidateAndBooking(candidate: Candidate, booking: Booking, additionalSupport: CRMAdditionalSupport): Promise<CandidateAndBookingResponse> {
    try {
      const candidateContentId = uuid4();
      const licenceContentId = uuid4();
      const bookingContentId = uuid4();

      logger.log('CRMGateway::createCandidateAndBooking: Ready to Create Candidate, Licence and Booking in CRM ', {
        candidateContentId,
        licenceContentId,
        bookingContentId,
      });

      this.dynamicsWebApi.startBatch();
      this.createCandidateRequest(candidate, candidateContentId);
      this.createLicenceRequest(candidate.licenceNumber, candidateContentId, licenceContentId);
      this.createBookingRequest(candidate, booking, additionalSupport, candidateContentId, licenceContentId, bookingContentId);

      const response = await this.dynamicsWebApi.executeBatch();

      const candidateId: string = response[0] as string;
      const licenceId: string = response[1] as string;
      const bookingResponse: CRMBookingResponse = response[2] as CRMBookingResponse;

      const candidateAndBookingResponse: CandidateAndBookingResponse = {
        booking: mapCRMBookingResponseToBookingResponse(bookingResponse),
        licence: {
          candidateId,
          licenceId,
        },
      };

      logger.log('CRMGateway::createCandidateAndBooking: Sucessful Response from CRM', { ...candidateAndBookingResponse });

      return candidateAndBookingResponse;
    } catch (e) {
      logger.critical('CRMGateway::createCandidateAndBooking: Could not create entities in CRM', { error: JSON.stringify(e) });
      throw (e);
    }
  }

  public async createBooking(candidate: Candidate, booking: Booking, additionalSupport: CRMAdditionalSupport): Promise<BookingResponse> {
    try {
      logger.log('CRMGateway::createBooking: Attempting to create booking');

      const response = await this.dynamicsWebApi.createRequest<CRMBookingResponse>(
        {
          collection: 'ftts_bookings',
          entity: mapToCRMBooking(candidate, booking, candidate.candidateId, candidate.licenceId, additionalSupport, false),
          returnRepresentation: true,
        },
      );

      const bookingResponse: BookingResponse = mapCRMBookingResponseToBookingResponse(response);

      logger.log('CRMGateway::createBooking: Successful Response from CRM', { ...bookingResponse });

      return bookingResponse;
    } catch (error) {
      logger.critical('CRMGateway::createBooking: Could not create booking entity in CRM', { error });
      throw error;
    }
  }

  public async createBookingProduct(candidate: Candidate, booking: Booking, product: ProductResponse, bookingResponse: BookingResponse): Promise<string> {
    try {
      logger.log('CRMGateway::createBookingProduct: Creating Booking Product in CRM');
      const response = await this.dynamicsWebApi.createRequest<string>(
        {
          collection: 'ftts_bookingproducts',
          entity: mapToCRMBookingProduct(candidate, booking, product, bookingResponse),
        },
      );
      logger.log('CRMGateway::createBookingProduct: Successfully created Booking Product in CRM', { bookingProductId: response });
      return response;
    } catch (error) {
      logger.critical('Could not create booking product entity in CRM', { error });
      throw error;
    }
  }

  public async rescheduleBookingAndConfirm(bookingId: string, dateTime: string, testCentreAccountId?: string): Promise<void> {
    const entity: RescheduleUpdateRequest = {
      ftts_testdate: dateTime,
      ftts_bookingstatus: CRMBookingStatus.Confirmed,
    };

    if (testCentreAccountId) {
      entity['ftts_testcentre@odata.bind'] = `accounts(${testCentreAccountId})`;
    }

    try {
      await this.dynamicsWebApi.updateRequest({
        key: bookingId,
        collection: 'ftts_bookings',
        entity,
      });
    } catch (error) {
      logger.critical('CRMGateway::rescheduleBookingAndConfirm: Could not update booking date time and location in CRM', { error });
      throw error;
    }
  }

  public async updateBookingStatus(bookingId: string, crmBookingStatus: CRMBookingStatus): Promise<void> {
    try {
      await this.dynamicsWebApi.updateRequest({
        key: bookingId,
        collection: 'ftts_bookings',
        entity: {
          ftts_bookingstatus: crmBookingStatus,
        },
      });
    } catch (error) {
      logger.critical('CRMGateway::updateBookingStatus: Could not update booking status in CRM', { error });
      throw error;
    }
  }

  public async updateVoiceover(bookingId: string, bookingProductId: string, voiceover: CRMVoiceOver): Promise<void> {
    try {
      this.dynamicsWebApi.startBatch();
      // Do not await below - https://github.com/AleksandrRogov/DynamicsWebApi/issues/61
      this.updateBookingProductVoiceover(bookingProductId, voiceover);
      this.updateBookingVoiceover(bookingId, voiceover);
      await this.dynamicsWebApi.executeBatch();
    } catch (error) {
      logger.critical('CRMGateway::updateVoiceover: Could not update voiceover in CRM', { error });
      throw error;
    }
  }

  public async updateAdditionalSupport(bookingId: string, bookingProductId: string, additionalSupport: CRMAdditionalSupport): Promise<void> {
    try {
      this.dynamicsWebApi.startBatch();
      this.updateProductBookingAdditionalSupport(bookingProductId, additionalSupport);
      this.updateBookingAdditionalSupport(bookingId, additionalSupport);
      await this.dynamicsWebApi.executeBatch();
    } catch (error) {
      logger.critical('CRMGateway::updateAdditionalSupport: Could not update additional support options in CRM', { error });
      throw error;
    }
  }

  public async updateLanguage(bookingId: string, bookingProductId: string, language: CRMTestLanguage): Promise<void> {
    try {
      this.dynamicsWebApi.startBatch();
      this.dynamicsWebApi.updateRequest({
        key: bookingId,
        collection: 'ftts_bookings',
        entity: {
          ftts_language: language,
        },
      });
      this.dynamicsWebApi.updateRequest({
        key: bookingProductId,
        collection: 'ftts_bookingproducts',
        entity: {
          ftts_testlanguage: language,
        },
      });
      await this.dynamicsWebApi.executeBatch();
    } catch (error) {
      logger.critical('CRMGateway::updateLanguage: Could not update booking status in CRM', { error });
      throw error;
    }
  }

  /**
   * Only booked or completed tests and only those from the booking app or CSC
   */
  public async getCandidateBookings(candidateId: string): Promise<BookingDetails[]> {
    try {
      const bookingProductFields = ['ftts_bookingproductid', '_ftts_bookingid_value', 'ftts_bookingstatus', 'ftts_testdate', 'ftts_testlanguage', 'ftts_voiceoverlanguage', 'ftts_additionalsupportoptions', 'ftts_paymentstatus', 'ftts_price', 'ftts_salesreference'];
      const bookingFields = ['ftts_reference', 'ftts_testtype', 'ftts_origin'];
      const testCentreFields = ['ftts_siteid', 'name', 'address1_line1', 'address1_line2', 'address1_city', 'address1_county', 'address1_postalcode', 'ftts_remit', 'ftts_fullyaccessible', '_parentaccountid_value', 'address1_latitude', 'address1_longitude', 'accountid', 'ftts_regiona', 'ftts_regionb', 'ftts_regionc'];

      const filterQuery = `_ftts_candidateid_value eq ${candidateId} and (ftts_bookingstatus eq ${CRMBookingStatus.Confirmed} or ftts_bookingstatus eq ${CRMBookingStatus.CompletePassed} or ftts_bookingstatus eq ${CRMBookingStatus.CompleteFailed} or ftts_bookingstatus eq ${CRMBookingStatus.CancellationInProgress} or ftts_bookingstatus eq ${CRMBookingStatus.ChangeInProgress})`;

      const request: RetrieveMultipleRequest = {
        collection: 'ftts_bookingproducts',
        select: bookingProductFields,
        expand: [{
          property: 'ftts_bookingid',
          select: bookingFields,
          expand: [{
            property: 'ftts_testcentre',
            select: testCentreFields,
          }],
        }],
        filter: filterQuery,
      };

      const response = await this.dynamicsWebApi.retrieveMultipleRequest<CRMBookingDetails>(request);
      if (!response.value?.length) {
        return [];
      }

      const result = response.value
        .map(mapToBookingDetails)
        .filter((booking) => {
          // Can't filter booking origin on the expand query so filter here instead
          // Only want bookings made from the booking app or CSC
          // And if from CSC payment must be confirmed
          if (booking.origin === CRMOrigin.CitizenPortal) {
            return true;
          }
          if (booking.origin === CRMOrigin.CustomerServiceCentre) {
            return booking.paymentStatus === CRMPaymentStatus.Success;
          }
          return false;
        });

      // We need to retrive the payment information for any bookings
      // which have the status Cancellation in Progress.
      return await this.getPaymentInformationForBookingDetails(result);
    } catch (error) {
      logger.critical(`CRMGateway::getCandidateBookings: Could not retrieve booking products from CRM - ${error.message}`, { error });
      throw error;
    }
  }

  public async calculateThreeWorkingDays(testDate: string, remit: CRMRemit): Promise<string> {
    try {
      const response = await this.dynamicsWebApi.executeUnboundAction<GetWorkingDaysResponse>(
        'ftts_GetClearWorkingDay',
        {
          TestDate: testDate,
          CalendarName: mapCRMRemitToCRMCalendarName(remit),
          NoOfDays: -4, // 4 to get date 3 clear working days before
        },
      );
      const dueDate = response.DueDate instanceof Date ? response.DueDate : new Date(response.DueDate);
      const isoDateString = dueDate.toISOString().split('T')[0];
      return isoDateString;
    } catch (error) {
      logger.critical('CRMGateway::calculateThreeWorkingDays: Could not get 3 working days', { error });
      return '';
    }
  }

  public async updateTCNUpdateDate(bookingProductId: string): Promise<void> {
    try {
      await this.dynamicsWebApi.updateRequest({
        key: bookingProductId,
        collection: 'ftts_bookingproducts',
        entity: {
          ftts_tcn_update_date: dayjs().toISOString(),
        },
      });
    } catch (error) {
      logger.critical(`CRMGateway::updateTCNUpdateDate: Could not set the TCN Update Date on Booking Product ID ${bookingProductId}`);
      throw error;
    }
  }

  private updateProductBookingAdditionalSupport(bookingProductId: string, additionalSupport: CRMAdditionalSupport): void {
    this.dynamicsWebApi.updateRequest({
      key: bookingProductId,
      collection: 'ftts_bookingproducts',
      entity: {
        ftts_additionalsupportoptions: additionalSupport, // Only to handle BSL for now.
      },
    });
  }

  private updateBookingAdditionalSupport(bookingId: string, additionalSupport: CRMAdditionalSupport): void {
    this.dynamicsWebApi.updateRequest({
      key: bookingId,
      collection: 'ftts_bookings',
      entity: {
        ftts_additionalsupportoptions: additionalSupport, // Only to handle BSL for now.
      },
    });
  }

  private async updateBookingProductVoiceover(bookingProductId: string, voiceover: CRMVoiceOver): Promise<void> {
    await this.dynamicsWebApi.updateRequest({
      key: bookingProductId,
      collection: 'ftts_bookingproducts',
      entity: {
        ftts_voiceoverlanguage: voiceover,
      },
    });
  }

  private async updateBookingVoiceover(bookingId: string, voiceover: CRMVoiceOver): Promise<void> {
    await this.dynamicsWebApi.updateRequest({
      key: bookingId,
      collection: 'ftts_bookings',
      entity: {
        ftts_nivoiceoveroptions: voiceover,
      },
    });
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
      logger.critical(`CRMGateway::getPaymentInformationForBookingDetails: Could not retrive payment information for bookings that have the status Cancellation in Progress- ${error.message}`, { error });
      throw error;
    }
  }

  private createCandidateRequest(candidate: Candidate, candidateContentId: string): void {
    this.dynamicsWebApi.createRequest<string>({
      collection: 'contacts',
      entity: mapToCRMContact(candidate),
      contentId: candidateContentId,
    });
  }

  private createLicenceRequest(licenceNumber: string, candidateContentId: string, licenceContentId: string): void {
    this.dynamicsWebApi.createRequest<string>({
      collection: 'ftts_licences',
      entity: mapToCRMLicence(candidateContentId, licenceNumber),
      contentId: licenceContentId,
    });
  }

  private createBookingRequest(candidate: Candidate, booking: Booking, additionalSupport: CRMAdditionalSupport, candidateContentId: string, licenceContentId: string, bookingContentId: string): void {
    this.dynamicsWebApi.createRequest<CRMBookingResponse>(
      {
        collection: 'ftts_bookings',
        entity: mapToCRMBooking(candidate, booking, candidateContentId, licenceContentId, additionalSupport, true),
        returnRepresentation: true,
        contentId: bookingContentId,
      },
    );
  }

  private getProductRequest(testEngineTestType: TestEngineTestType): void {
    // We query for Product via *test engine* test type (as CRM test type is not a field)
    this.dynamicsWebApi.retrieveMultipleRequest<CRMProduct>({
      collection: 'products',
      select: ['productid', '_parentproductid_value'],
      filter: `ftts_testenginetesttype eq ${testEngineTestType}`,
    });
  }

  private getLicenceRequest(licenceNumber: string): void {
    this.dynamicsWebApi.retrieveMultipleRequest<CRMLicenceResponse>({
      collection: 'ftts_licences',
      select: ['ftts_licenceid', '_ftts_person_value'],
      filter: `ftts_licence eq '${licenceNumber}'`,
    });
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  public static retryLog(warnMessage: string, properties?: Record<string, any>): void {
    logger.warn(warnMessage, properties);
  }
}
