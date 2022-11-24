/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable no-underscore-dangle */
import { cdsRetry, proxifyWithRetryPolicy } from '@dvsa/cds-retry';
import { CRMZeroCostBookingReason } from '@dvsa/ftts-crm-test-client/dist/enums';
import { ELIG } from '@dvsa/ftts-eligibility-api-model';
import dayjs from 'dayjs';
import { RetrieveMultipleRequest } from 'dynamics-web-api';
import { v4 as uuidv4 } from 'uuid';
import config from '../../../../src/config';
import { TestType } from '../../../../src/domain/enums';
import { PriceListItem } from '../../../../src/domain/types';
import { logger } from '../../../../src/helpers/logger';
import {
  CRMAdditionalSupport,
  CRMBookingStatus,
  CRMPaymentStatus,
  CRMTestSupportNeed,
} from '../../../../src/services/crm-gateway/enums';
import {
  BookingResponse, CreateCandidateResponse, CreateLicenceResponse, CRMBookingResponse, CRMContact, CRMLicenceResponse,

  CRMProductPriceLevel, LicenceBatchResponse,
} from '../../../../src/services/crm-gateway/interfaces';
import { fromCRMProductNumber, toCRMProductNumber } from '../../../../src/services/crm-gateway/maps';
import { Booking, Candidate, SessionData } from '../../data/session-data';
import {
  mapCRMBookingResponseToBookingResponse, mapCRMLicenceToLicenceResponse, mapToCRMBooking, mapToCRMBookingProduct, mapToCRMLicence, mapToCRMContact,
} from './crm-helper';
import { dynamicsWebApiClient } from './dynamics-web-api';

export class CRMGateway {
  constructor(
    private dynamicsWebApi: DynamicsWebApi,
  ) {
    this.dynamicsWebApi = dynamicsWebApiClient();
    this.dynamicsWebApi.setConfig({ timeout: 120000 });
    proxifyWithRetryPolicy(dynamicsWebApi, CRMGateway.retryLog, CRMGateway.cdsRetryPolicy);
  }

  public static cdsRetryPolicy: Parameters<typeof cdsRetry>[1] = config.crm.retryPolicy;

  /* eslint-disable @typescript-eslint/no-explicit-any */
  public static retryLog(warnMessage: string, properties?: Record<string, any>): void {
    logger.warn(warnMessage, properties);
  }

  /**
   * Retrieves price list for DVSA/DVA based on the given target. Optionally fetches prices only for the given testTypes.
   */
  public async getPriceList(priceListId: string, testTypes?: TestType[]): Promise<PriceListItem[]> {
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
          select: ['productid', '_parentproductid_value'],
        }],
        filter,
      };
      const response = await this.dynamicsWebApi.retrieveMultipleRequest<CRMProductPriceLevel>(request);
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
      logger.error(error, 'CRMGateway::getPriceList: Failed to get price list from CRM', { priceListId, testTypes });
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
      const response = await this.dynamicsWebApi.createRequest<CreateLicenceResponse>(request);

      const licenceId = response.ftts_licenceid;

      logger.info('CRMGateway::createLicence: Successfully created licence in CRM', { candidateId, licenceId });
      return licenceId;
    } catch (error) {
      logger.error(error, 'CRMGateway::createLicence: Could not create licence record for candidate in CRM', { candidateId });
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

      const candidateResponse = await this.dynamicsWebApi.createRequest<CreateCandidateResponse>(createCandidateRequest);

      const candidateId = candidateResponse.contactid;

      logger.info('CRMGateway::createCandidate: Successfully created candidate in CRM', { candidateId });
      return candidateId;
    } catch (error) {
      logger.error(error, 'CRMGateway::createCandidate: Could not create candidate record for candidate in CRM', { candidate });
      throw error;
    }
  }

  public async createBooking(candidate: Candidate, booking: Booking, additionalSupport: CRMAdditionalSupport, isStandardAccommodation: boolean, priceListId: string, overrideCreatedOnDate = true): Promise<BookingResponse> {
    try {
      logger.info('CRMGateway:createBooking: Attempting to create booking');

      if (!candidate.candidateId || !candidate.licenceId) {
        throw new Error('CRMGateway::createBooking: Missing required candidate data');
      }

      this.dynamicsWebApi.startBatch();
      this.createBookingRequest(candidate, booking, additionalSupport, isStandardAccommodation, priceListId, overrideCreatedOnDate);
      const response = await this.dynamicsWebApi.executeBatch();
      const bookingResponse: BookingResponse = mapCRMBookingResponseToBookingResponse(response[0] as CRMBookingResponse);

      return bookingResponse;
    } catch (error) {
      logger.critical('CRMGateway::createBooking: Could not create the booking in CRM', { error });
      throw error;
    }
  }

  private async createBookingRequest(candidate: Candidate, booking: Booking, additionalSupport: CRMAdditionalSupport, isStandardAccommodation: boolean, priceListId: string, overrideCreatedOnDate = true): Promise<CRMBookingResponse> {
    const request = {
      collection: 'ftts_bookings',
      entity: {
        ...mapToCRMBooking(candidate, booking, candidate.candidateId as string, candidate.licenceId as string, additionalSupport, isStandardAccommodation, priceListId),
        overriddencreatedon: overrideCreatedOnDate ? dayjs().subtract(1, 'day').toISOString() : dayjs().toISOString(),
      },
      returnRepresentation: true,
    };

    return this.dynamicsWebApi.createRequest<CRMBookingResponse>(request);
  }

  public async getLicence(licenceNumber: string): Promise<LicenceBatchResponse> {
    try {
      logger.info('CRMGateway::getLicence: Attempting to retrive Candidate, Licence and Product from CRM');

      const licences: CRMLicenceResponse[] = await this.getLicenceRequest(licenceNumber);

      const licenceResponse: LicenceBatchResponse = {
        licence: mapCRMLicenceToLicenceResponse(licences),
      };
      logger.info('CRMGateway::getLicence: Data retrived from CRM');
      return licenceResponse;
    } catch (error) {
      logger.error(error, 'CRMGateway::getLicence: Could not retrieve licence from CRM');
      throw error;
    }
  }

  public async createBookingProduct(candidate: Candidate, booking: Booking, bookingResponse: BookingResponse, isStandardAccommodation: boolean, additionalSupport: CRMAdditionalSupport, overrideCreatedOnDate = true): Promise<string> {
    try {
      logger.info('CRMGateway::createBookingProduct: Creating Booking Product in CRM', { candidate, booking, bookingResponse });
      const request = {
        collection: 'ftts_bookingproducts',
        entity: {
          ...mapToCRMBookingProduct(candidate, booking, bookingResponse, isStandardAccommodation, additionalSupport),
          overriddencreatedon: overrideCreatedOnDate ? dayjs().subtract(1, 'day').toISOString() : dayjs().toISOString(),
        },
        returnRepresentation: true,
      };

      const response = await this.dynamicsWebApi.createRequest<any>(request);
      logger.info('CRMGateway::createBookingProduct: Successfully created Booking Product in CRM', {
        candidate, booking, bookingResponse, response,
      });
      return response.ftts_bookingproductid as string;
    } catch (error) {
      logger.error(error, 'CRMGateway::createBookingProduct: Could not create booking product entity in CRM', {
        candidate, booking, bookingResponse,
      });
      throw error;
    }
  }

  public async updateBookingStatus(bookingId: string, crmBookingStatus: CRMBookingStatus, isCSCBooking?: boolean): Promise<void> {
    const request = {
      key: bookingId,
      collection: 'ftts_bookings',
      entity: {
        ftts_bookingstatus: crmBookingStatus,
        ftts_callamend: isCSCBooking ? isCSCBooking?.toString() : undefined,
      },
    };
    logger.info('CRMGateway::updateBookingStatus: Raw Request', { request });
    try {
      await this.dynamicsWebApi.updateRequest(request);
    } catch (error) {
      logger.error(error, 'CRMGateway::updateBookingStatus: Could not update booking status in CRM', { bookingId, error });
      throw error;
    }
  }

  private async getLicenceRequest(licenceNumber: string): Promise<any> {
    const response = await this.dynamicsWebApi.retrieveMultipleRequest<CRMLicenceResponse>({
      collection: 'ftts_licences',
      select: ['ftts_licenceid', '_ftts_person_value'],
      filter: `ftts_licence eq '${licenceNumber}'`,
    });
    return response.value;
  }

  public async getPersonReference(candidateId: string): Promise<any> {
    const response = await this.dynamicsWebApi.retrieveMultipleRequest<CRMContact>({
      collection: 'contacts',
      select: ['ftts_personreference'],
      filter: `contactid eq '${candidateId}'`,
    });
    return response.value[0].ftts_personreference;
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
      await this.dynamicsWebApi.updateRequest(updateRequest);
      logger.info('CRMGateway::createBindBetweenBookingAndPayment: Booking updated successfully', {
        bookingId,
        paymentId,
        receiptReference,
      });
    } catch (error) {
      logger.info('CRMGateway::createBindBetweenBookingAndPayment: Could not create a bind', {
        error,
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
      logger.info('CRMGateway::updateZeroCostBooking: Raw Request', { request, bookingId });
      await this.dynamicsWebApi.updateRequest(request);
      logger.info('CRMGateway::updateZeroCostBooking: Update finished successfully', { bookingId });
    } catch (error) {
      logger.error(error, 'CRMGateway::updateZeroCostBooking: Could not update Booking', { bookingId });
      throw error;
    }
  }

  public async createPayment(sessionData: SessionData): Promise<string> {
    try {
      logger.info('CRMGateway::createPayment: Attempting to create payment');
      const receiptReference = uuidv4();

      const entity = {
        'ftts_person@odata.bind': `/contacts(${sessionData.candidate.candidateId})`,
        ftts_reference: receiptReference,
        ftts_amount: sessionData.currentBooking.priceList.price,
        ftts_origin: 1, // Citizen Portal
        ftts_scheme: 1, // FTTS
        ftts_type: 1, // Card
        ftts_status: CRMPaymentStatus.Success,
        ftts_createdon: new Date().toISOString(),
      };

      const response = await this.dynamicsWebApi.createRequest({
        collection: 'ftts_payments',
        entity,
        returnRepresentation: true,
      });

      logger.info('CRMGateway::createPayment: Created payment successfully');
      sessionData.currentBooking.receiptReference = receiptReference;
      return response.ftts_paymentid as string;
    } catch (error) {
      logger.error(error, 'CRMGateway::createPayment: Could not create record in CRM');
      throw error;
    }
  }

  public async createFinanceTransaction(sessionData: SessionData, paymentId: string): Promise<void> {
    try {
      logger.info('CRMGateway::createFinanceTransaction: Attempting to create finance transaction');

      const entity = {
        'ftts_creatingcontact@odata.bind': `/contacts(${sessionData.candidate.candidateId})`,
        'ftts_bookingproduct@odata.bind': `/ftts_bookingproducts(${sessionData.currentBooking.bookingProductId})`,
        'ftts_payment@odata.bind': `/ftts_payments(${paymentId})`,
        'ftts_organisation@odata.bind': `/accounts(${sessionData.currentBooking.centre.accountId})`,
        ftts_amount: sessionData.currentBooking.priceList.price,
        ftts_type: 675030004, // Booking
        ftts_status: 675030000, // Deferred
        ftts_posteddate: new Date().toISOString(),
        ftts_invoiceid: sessionData.currentBooking.salesReference,
      };

      await this.dynamicsWebApi.createRequest({
        collection: 'ftts_financetransactions',
        entity,
        returnRepresentation: true,
      });

      logger.info('CRMGateway::createFinanceTransaction: Created finance transaction successfully');
    } catch (error) {
      logger.error(error, 'CRMGateway::createFinanceTransaction: Could not create record in CRM');
      throw error;
    }
  }

  public async updatePaymentStatus(bookingProductId: string): Promise<void> {
    try {
      logger.info('CRMGateway:updatePaymentStatus: Attempting to update payment status');

      const request = {
        key: bookingProductId,
        collection: 'ftts_bookingproducts',
        entity: {
          ftts_paymentstatus: CRMPaymentStatus.Success,
        },
      };
      await this.dynamicsWebApi.updateRequest(request);
    } catch (error) {
      console.error(error);
    }
  }

  public async enableEligibilityBypass(bookingId: string): Promise<void> {
    try {
      logger.info('CRMGateway:enableEligibilityBypass: Attempting to update eligibility bypass', { bookingId });

      const request = {
        key: bookingId,
        collection: 'ftts_bookings',
        entity: {
          ftts_enableeligibilitybypass: true,
        },
      };
      await this.dynamicsWebApi.updateRequest(request);
    } catch (error) {
      console.error(error);
    }
  }

  public async setCompensationBookingAssigned(bookingId: string, assignedDate: string): Promise<void> {
    try {
      logger.info('CRMGateway:setCompensationBookingAssigned: Attempting to update compensation booking assigned', { bookingId });

      const request = {
        key: bookingId,
        collection: 'ftts_bookings',
        entity: {
          ftts_owedcompbookingassigned: assignedDate,
        },
      };
      await this.dynamicsWebApi.updateRequest(request);
    } catch (error) {
      console.error(error);
    }
  }

  public async setCompensationBookingRecognised(bookingId: string, recognisedDate: string): Promise<void> {
    try {
      logger.info('CRMGateway:setCompensationBookingRecognised: Attempting to update compensation booking recognised', { bookingId });

      const request = {
        key: bookingId,
        collection: 'ftts_bookings',
        entity: {
          ftts_owedcompbookingrecognised: recognisedDate,
        },
      };
      await this.dynamicsWebApi.updateRequest(request);
    } catch (error) {
      console.error(error);
    }
  }

  public async assignTestSupportNeedsToBooking(bookingId: string, testSupportNeeds: CRMTestSupportNeed[], translatorLanguage: string): Promise<void> {
    try {
      logger.info('CRMGateway:assignTestSupportNeedsToBooking: Attempting to assign test support needs', { bookingId });

      const request = {
        key: bookingId,
        collection: 'ftts_bookings',
        entity: {
          ftts_testsupportneed: testSupportNeeds.toString(),
          ftts_foreignlanguageselected: translatorLanguage,
        },
      };
      await this.dynamicsWebApi.updateRequest(request);
    } catch (error) {
      console.error(error);
    }
  }

  public async cleanUpBookingProducts(bookingProductId: string): Promise<void> {
    if (bookingProductId) {
      try {
        logger.info('CRMGateway:cleanUpBookingProducts: Attempting to cancel booking product', { bookingProductId });

        const request = {
          key: bookingProductId,
          collection: 'ftts_bookingproducts',
          entity: {
            ftts_bookingstatus: 675030008,
          },
        };
        await this.dynamicsWebApi.updateRequest(request);
      } catch (error) {
        console.error(error);
      }
    }
  }

  public async cleanUpBookingProductsByBookingRef(bookingReference: string): Promise<void> {
    if (bookingReference) {
      try {
        logger.info('CRMGateway:cleanUpBookingProducts: Attempting to cancel booking product', { bookingReference });

        const requestBookingProductId: RetrieveMultipleRequest = {
          collection: 'ftts_bookingproducts',
          filter: `startswith(ftts_reference, '${bookingReference}') and ftts_selected eq true`,
          select: ['ftts_bookingproductid'],
        };
        const response = await this.dynamicsWebApi.retrieveMultipleRequest<any>(requestBookingProductId);

        if (response.value[0].ftts_bookingproductid) {
          await this.cleanUpBookingProducts(response.value[0].ftts_bookingproductid);
        }
      } catch (error) {
        console.error(error);
      }
    }
  }
}
