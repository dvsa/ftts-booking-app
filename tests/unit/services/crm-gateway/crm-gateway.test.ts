import MockDate from 'mockdate';
import { mockedDynamicsWebApi } from '../../../mocks/dynamicsWebApi.mock';
import { CRMGateway } from '../../../../src/services/crm-gateway/crm-gateway';
import {
  BookingResponse,
  CRMBookingResponse,
  CRMLicenceResponse,
  CRMProduct,
  GetWorkingDaysResponse,
  ProductResponse,
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
} from '../../../../src/services/crm-gateway/enums';
import { LANGUAGE, TestType, Voiceover } from '../../../../src/domain/enums';
import { Centre } from '../../../../src/domain/types';
import { mockCentres } from '../../../../src/repository/mock-data';

jest.mock('@dvsa/ftts-auth-client');

const productId = '3335e591-75ca-ea11-a812-00224801cecd';
const productParentId = 'expected-parent-id';
const candidateId = '81111111';
const licenceId = '22222';
const licenceNumber = '1234567890123456';
const bookingId = 'abcdefgh';
const bookingReference = 'poiuytrew';
const bookingProductId = 'mnbvcxz';

const mockCandidate: Candidate = {
  firstnames: 'Test',
  surname: 'User',
  dateOfBirth: '2000-01-01',
  email: 'test@user.com',
  licenceId,
  candidateId,
  licenceNumber,
  entitlements: '',
  personReference: '123456789',
};
const mockBooking: Booking = {
  bsl: true,
  testType: TestType.Car,
  centre: {} as Centre,
  dateTime: '2020-01-01',
  language: LANGUAGE.ENGLISH,
  otherSupport: false,
  reservationId: '123456',
  support: false,
  voiceover: Voiceover.ENGLISH,
  bookingId: 'booking-id',
  bookingProductId: 'booking-product-id',
  bookingRef: 'booking-ref',
  receiptReference: 'receipt-reference',
  salesReference: 'sales-reference',
  lastRefundDate: '',
};
const mockCRMBookingResponse: CRMBookingResponse = {
  ftts_bookingid: bookingId,
  ftts_reference: bookingReference,
};
const mockProductResponse: ProductResponse = {
  id: productId,
  parentId: productParentId,
};
const mockBookingResponse: BookingResponse = {
  id: bookingId,
  reference: bookingReference,
};
const mockDate = new Date('2020-11-11T14:30:45.979Z');

beforeEach(() => {
  MockDate.set(mockDate);
});

afterEach(() => {
  MockDate.reset();
});

describe('CRM Gateway', () => {
  let crmGateway: CRMGateway;

  beforeEach(() => {
    crmGateway = new CRMGateway(mockedDynamicsWebApi);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getCandidateByLicenceNumber', () => {
    describe('calls CRM to get candidate given a licence number', () => {
      const mockCRMLicenceCandidate = {
        ftts_licenceid: 'licence-id',
        ftts_licence: 'licence-number',
        ftts_Person: {
          contactid: 'candidate-id',
          ftts_firstandmiddlenames: 'Firstname Middlename',
          lastname: 'Lastname',
          emailaddress1: 'test@email.com',
          birthdate: '1998-10-09',
          ftts_personreference: '123456789',
        },
      };

      test('returns and maps the first record in the response', async () => {
        mockedDynamicsWebApi.retrieveMultipleRequest.mockResolvedValue({
          value: [mockCRMLicenceCandidate],
        });

        const result = await crmGateway.getCandidateByLicenceNumber(licenceNumber);

        expect(mockedDynamicsWebApi.retrieveMultipleRequest).toHaveBeenCalledWith(expect.objectContaining({
          collection: 'ftts_licences',
          select: ['ftts_licence', 'ftts_licenceid'],
          filter: `ftts_licence eq '${licenceNumber}'`,
        }));
        expect(result).toStrictEqual({
          candidateId: 'candidate-id',
          firstnames: 'Firstname Middlename',
          surname: 'Lastname',
          email: 'test@email.com',
          dateOfBirth: '1998-10-09',
          licenceId: 'licence-id',
          licenceNumber: 'licence-number',
          personReference: '123456789',
        });
      });

      test('returns undefined if no licence/candidate found', async () => {
        mockedDynamicsWebApi.retrieveMultipleRequest.mockResolvedValue({
          value: [],
        });

        const result = await crmGateway.getCandidateByLicenceNumber('');

        expect(result).toBe(undefined);
      });

      test('throws an error when the call to CRM fails', async () => {
        const error = {
          message: 'Unknown error',
          status: 500,
        };
        mockedDynamicsWebApi.retrieveMultipleRequest.mockRejectedValue(error);

        await expect(crmGateway.getCandidateByLicenceNumber('licenceInvalid')).rejects.toEqual(error);
      });
    });
  });

  describe('getLicenceAndProduct', () => {
    const productTestType = 0;
    const mockCRMLicence: CRMLicenceResponse = {
      ftts_licenceid: licenceId,
      _ftts_person_value: candidateId,
      ftts_licence: licenceNumber,
    };
    const mockCRMProduct: CRMProduct = {
      productid: productId,
      _parentproductid_value: productParentId,
    };

    test('calls CRM and gets a driving licence and product', async () => {
      mockedDynamicsWebApi.executeBatch.mockResolvedValue([
        {
          value: [mockCRMLicence],
        },
        {
          value: [mockCRMProduct],
        },
      ]);

      const response = await crmGateway.getLicenceAndProduct(licenceNumber, productTestType);

      expect(response).toEqual({
        licence: {
          candidateId,
          licenceId,
        },
        product: {
          id: productId,
          parentId: productParentId,
        },
      });
    });

    test('calls CRM and returns undefined if no licence exists', async () => {
      mockedDynamicsWebApi.executeBatch.mockResolvedValue([
        {
          value: [],
        },
        {
          value: [mockCRMProduct],
        },
      ]);

      const response = await crmGateway.getLicenceAndProduct(licenceNumber, productTestType);

      expect(response).toEqual({
        licence: undefined,
        product: {
          id: productId,
          parentId: productParentId,
        },
      });
    });

    test('calls CRM and throws an error if product could not be found', async () => {
      mockedDynamicsWebApi.executeBatch.mockResolvedValue([
        {
          value: [mockCRMLicence],
        },
        {
          value: [],
        },
      ]);

      await expect(crmGateway.getLicenceAndProduct(licenceNumber, productTestType)).rejects.toEqual(new Error('No Product Found in CRM'));
    });

    test('calls CRM and is able to handle an error', async () => {
      const mockError = {
        message: 'Unknown error',
        status: 500,
      };

      mockedDynamicsWebApi.executeBatch.mockRejectedValue([mockError]);

      await expect(crmGateway.getLicenceAndProduct(licenceNumber, productTestType)).rejects.toEqual([mockError]);
    });
  });

  describe('createCandidateAndBooking', () => {
    test('calls CRM and sucessfully creates a Candidate, Licence and Booking', async () => {
      mockedDynamicsWebApi.executeBatch.mockResolvedValue([
        candidateId,
        licenceId,
        mockCRMBookingResponse,
      ]);

      const response = await crmGateway.createCandidateAndBooking(mockCandidate, mockBooking, CRMAdditionalSupport.None);

      expect(response).toEqual({
        booking: {
          id: bookingId,
          reference: bookingReference,
        },
        licence: {
          licenceId,
          candidateId,
        },
      });
    });

    test('calls CRM and is able to handle an error', async () => {
      const mockError = {
        message: 'Unknown error',
        status: 500,
      };

      mockedDynamicsWebApi.executeBatch.mockRejectedValue([mockError]);

      await expect(crmGateway.createCandidateAndBooking(mockCandidate, mockBooking, CRMAdditionalSupport.None)).rejects.toEqual([mockError]);
    });
  });

  describe('createBooking', () => {
    test('successfully calls CRM to create a Booking and returns the booking id and reference', async () => {
      mockedDynamicsWebApi.createRequest.mockResolvedValue(mockCRMBookingResponse);

      const result = await crmGateway.createBooking(mockCandidate, mockBooking, CRMAdditionalSupport.None);

      expect(result).toStrictEqual({
        id: bookingId,
        reference: bookingReference,
      });
    });

    test('throws an error when the call to CRM fails', async () => {
      const error = {
        message: 'Unknown error',
        status: 500,
      };

      mockedDynamicsWebApi.createRequest.mockRejectedValue(error);

      await expect(crmGateway.createBooking(mockCandidate, mockBooking, CRMAdditionalSupport.None)).rejects.toEqual(error);
    });
  });

  describe('createBookingProduct', () => {
    test('successfully calls CRM to create a Booking Product and returns its id', async () => {
      const expectedId = '1115e591-75ca-ea11-a812-00224801cecd';
      mockedDynamicsWebApi.createRequest.mockResolvedValue(expectedId);

      const result = await crmGateway.createBookingProduct(mockCandidate, mockBooking, mockProductResponse, mockBookingResponse);

      expect(result).toEqual(expectedId);
    });

    test('throws an error when the call to CRM fails', async () => {
      const error = {
        message: 'Unknown error',
        status: 500,
      };

      mockedDynamicsWebApi.createRequest.mockRejectedValue(error);

      await expect(crmGateway.createBookingProduct(mockCandidate, mockBooking, mockProductResponse, mockBookingResponse)).rejects.toEqual(error);
    });
  });

  describe('updateBookingStatus', () => {
    test('successfully calls CRM to update the booking status of a given booking', async () => {
      mockedDynamicsWebApi.updateRequest.mockResolvedValue({});

      await crmGateway.updateBookingStatus(bookingId, CRMBookingStatus.Cancelled);

      expect(mockedDynamicsWebApi.updateRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          key: bookingId,
          collection: 'ftts_bookings',
          entity: expect.objectContaining({
            ftts_bookingstatus: CRMBookingStatus.Cancelled,
          }),
        }),
      );
    });

    test('throws an error when the call to CRM fails', async () => {
      const error = {
        message: 'Unknown error',
        status: 500,
      };

      mockedDynamicsWebApi.updateRequest.mockRejectedValue(error);

      await expect(crmGateway.updateBookingStatus(bookingId, CRMBookingStatus.Cancelled))
        .rejects.toEqual(error);
    });
  });

  describe('updateLanguage', () => {
    test('successfully calls CRM to update the booking language of a given booking', async () => {
      await crmGateway.updateLanguage(bookingId, bookingProductId, CRMTestLanguage.Welsh);

      expect(mockedDynamicsWebApi.updateRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          key: bookingId,
          collection: 'ftts_bookings',
          entity: expect.objectContaining({
            ftts_language: CRMTestLanguage.Welsh,
          }),
        }),
      );
      expect(mockedDynamicsWebApi.updateRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          key: bookingProductId,
          collection: 'ftts_bookingproducts',
          entity: expect.objectContaining({
            ftts_testlanguage: CRMTestLanguage.Welsh,
          }),
        }),
      );
    });

    test('throws an error when the call to CRM fails', async () => {
      const error = {
        message: 'Unknown error',
        status: 500,
      };

      mockedDynamicsWebApi.executeBatch.mockRejectedValue(error);

      await expect(crmGateway.updateLanguage(bookingId, bookingProductId, CRMTestLanguage.Welsh))
        .rejects.toEqual(error);
    });
  });

  describe('updateVoiceover', () => {
    test('successfully calls CRM to update the voiceover of a given booking', async () => {
      await crmGateway.updateVoiceover(bookingId, bookingProductId, CRMVoiceOver.English);

      expect(mockedDynamicsWebApi.updateRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          key: bookingId,
          collection: 'ftts_bookings',
          entity: expect.objectContaining({
            ftts_nivoiceoveroptions: CRMVoiceOver.English,
          }),
        }),
      );
      expect(mockedDynamicsWebApi.updateRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          key: bookingProductId,
          collection: 'ftts_bookingproducts',
          entity: expect.objectContaining({
            ftts_voiceoverlanguage: CRMVoiceOver.English,
          }),
        }),
      );
    });

    test('throws an error when the call to CRM fails', async () => {
      const error = {
        message: 'Unknown error',
        status: 500,
      };

      mockedDynamicsWebApi.executeBatch.mockRejectedValue(error);

      await expect(crmGateway.updateVoiceover(bookingId, bookingProductId, CRMVoiceOver.English))
        .rejects.toEqual(error);
    });
  });

  describe('updateAdditionalSupport', () => {
    test('successfully calls CRM to update the bsl option of a given booking', async () => {
      await crmGateway.updateAdditionalSupport(bookingId, bookingProductId, CRMAdditionalSupport.BritishSignLanguage);

      expect(mockedDynamicsWebApi.updateRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          key: bookingId,
          collection: 'ftts_bookings',
          entity: expect.objectContaining({
            ftts_additionalsupportoptions: CRMAdditionalSupport.BritishSignLanguage,
          }),
        }),
      );
      expect(mockedDynamicsWebApi.updateRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          key: bookingProductId,
          collection: 'ftts_bookingproducts',
          entity: expect.objectContaining({
            ftts_additionalsupportoptions: CRMAdditionalSupport.BritishSignLanguage,
          }),
        }),
      );
    });

    test('throws an error when the call to CRM fails', async () => {
      const error = {
        message: 'Unknown error',
        status: 500,
      };

      mockedDynamicsWebApi.executeBatch.mockRejectedValue(error);

      await expect(crmGateway.updateAdditionalSupport(bookingId, bookingProductId, CRMAdditionalSupport.BritishSignLanguage))
        .rejects.toEqual(error);
    });
  });

  describe('rescheduleBookingAndConfirm', () => {
    test('successfully calls CRM to update the booking time and date of a given booking & changes status to confirmed', async () => {
      mockedDynamicsWebApi.updateRequest.mockResolvedValue({});
      const dateTime = '2021-02-16T09:30:00Z';

      await crmGateway.rescheduleBookingAndConfirm(bookingId, dateTime);

      expect(mockedDynamicsWebApi.updateRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          key: bookingId,
          collection: 'ftts_bookings',
          entity: {
            ftts_testdate: dateTime,
            ftts_bookingstatus: CRMBookingStatus.Confirmed,
          },
        }),
      );
    });

    test('successfully calls CRM to update the booking time, date and location of a given booking & changes status to confirmed', async () => {
      mockedDynamicsWebApi.updateRequest.mockResolvedValue({});
      const dateTime = '2021-02-16T09:30:00Z';
      const centre = { ...mockCentres[0] };

      await crmGateway.rescheduleBookingAndConfirm(bookingId, dateTime, centre.accountId);

      expect(mockedDynamicsWebApi.updateRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          key: bookingId,
          collection: 'ftts_bookings',
          entity: {
            ftts_testdate: dateTime,
            'ftts_testcentre@odata.bind': `accounts(${centre.accountId})`,
            ftts_bookingstatus: CRMBookingStatus.Confirmed,
          },
        }),
      );
    });

    test('throws an error when the call to CRM fails', async () => {
      const error = {
        message: 'Unknown error',
        status: 500,
      };

      mockedDynamicsWebApi.updateRequest.mockRejectedValue(error);

      await expect(crmGateway.rescheduleBookingAndConfirm(bookingId, '2021-02-16T09:30:00Z'))
        .rejects.toEqual(error);
    });
  });

  describe('getCandidateBookings', () => {
    test('successfully calls CRM to get the given candidate\'s bookings from booking app/CSC', async () => {
      mockedDynamicsWebApi.retrieveMultipleRequest.mockResolvedValue({
        value: [
          { ftts_bookingproductid: '001', ftts_bookingid: { ftts_origin: CRMOrigin.CitizenPortal, ftts_testcentre: { ftts_regiona: true } } },
          { ftts_bookingproductid: '002', ftts_bookingid: { ftts_origin: CRMOrigin.IHTTCPortal, ftts_testcentre: { ftts_regionb: true } } },
          { ftts_bookingproductid: '003', ftts_paymentstatus: null, ftts_bookingid: { ftts_origin: CRMOrigin.CustomerServiceCentre, ftts_testcentre: { ftts_regionc: true } } },
          { ftts_bookingproductid: '004', ftts_paymentstatus: CRMPaymentStatus.Success, ftts_bookingid: { ftts_origin: CRMOrigin.CustomerServiceCentre, ftts_testcentre: { ftts_regionb: true } } },
        ],
      });

      const result = await crmGateway.getCandidateBookings(candidateId);

      const expectedIds = ['001', '004']; // Should filter out non-booking app/CSC bookings and CSC bookings with unconfirmed payment
      const actualIds = result.map((booking) => booking.bookingProductId);
      expect(actualIds).toStrictEqual(expectedIds);
    });

    test('is able to load bookings with a status of Change in Progress', async () => {
      mockedDynamicsWebApi.retrieveMultipleRequest.mockResolvedValue({
        value: [
          { ftts_bookingproductid: '001', ftts_bookingstatus: CRMBookingStatus.ChangeInProgress, ftts_bookingid: { ftts_origin: CRMOrigin.CitizenPortal, ftts_testcentre: { ftts_regiona: true } } },
        ],
      });

      const result = await crmGateway.getCandidateBookings(candidateId);

      const expectedIds = ['001'];
      const actualIds = result.map((booking) => booking.bookingProductId);
      expect(actualIds).toStrictEqual(expectedIds);
    });

    test('is able to retrive payment information for bookings with a status of Cancellation in Progress', async () => {
      mockedDynamicsWebApi.retrieveMultipleRequest.mockResolvedValue({
        value: [
          { ftts_bookingproductid: '001', ftts_bookingstatus: CRMBookingStatus.CancellationInProgress, ftts_bookingid: { ftts_origin: CRMOrigin.CitizenPortal, ftts_testcentre: { ftts_regiona: true } } },
        ],
      });
      mockedDynamicsWebApi.executeBatch.mockResolvedValue(
        [{
          value: [
            {
              ftts_type: CRMTransactionType.Booking, ftts_status: CRMFinanceTransactionStatus.Deferred, _ftts_bookingproduct_value: '001', ftts_financetransactionid: '011', ftts_payment: { ftts_status: CRMPaymentStatus.Success, ftts_paymentid: '111' },
            },
          ],
        }],
      );

      const result = await crmGateway.getCandidateBookings(candidateId);

      expect(result[0].payment).toStrictEqual({
        paymentId: '111',
        paymentStatus: CRMPaymentStatus.Success,
      });
      expect(result[0].financeTransaction).toStrictEqual({
        financeTransactionId: '011',
        transactionStatus: CRMFinanceTransactionStatus.Deferred,
        transactionType: CRMTransactionType.Booking,
      });
    });

    test('does not attempt to get any payment information if no bookings are returned from the get bookings api call ', async () => {
      mockedDynamicsWebApi.retrieveMultipleRequest.mockResolvedValue({ value: [] });

      await crmGateway.getCandidateBookings(candidateId);

      expect(mockedDynamicsWebApi.startBatch).not.toHaveBeenCalled();
      expect(mockedDynamicsWebApi.executeBatch).not.toHaveBeenCalled();
    });
    test('does not attempt to get any payment info if there are no bookings with the Cancellation in Progress Status', async () => {
      mockedDynamicsWebApi.retrieveMultipleRequest.mockResolvedValue({
        value: [
          { ftts_bookingproductid: '001', ftts_bookingstatus: CRMBookingStatus.Confirmed, ftts_bookingid: { ftts_origin: CRMOrigin.CitizenPortal, ftts_testcentre: { ftts_regionc: true } } },
        ],
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
    });

    test('returns an empty string if an error is thrown', async () => {
      mockedDynamicsWebApi.executeUnboundAction.mockRejectedValue('Error');
      expect(await crmGateway.calculateThreeWorkingDays('2020-01-01', CRMRemit.England)).toEqual('');
    });
  });

  describe('updateTCNUpdateDate', () => {
    test('sucessfully updates the date', async () => {
      mockedDynamicsWebApi.updateRequest.mockResolvedValue({});
      await crmGateway.updateTCNUpdateDate('booking-product-id');
      expect(mockedDynamicsWebApi.updateRequest).toHaveBeenCalledWith(
        {
          collection: 'ftts_bookingproducts',
          entity: {
            ftts_tcn_update_date: '2020-11-11T14:30:45.979Z',
          },
          key: 'booking-product-id',
        },
      );
    });

    test('throws and error if one occurs', async () => {
      mockedDynamicsWebApi.updateRequest.mockRejectedValue('Error');
      await expect(crmGateway.updateTCNUpdateDate('')).rejects.toEqual('Error');
    });
  });
});
