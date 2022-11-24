import { v4 as uuid4 } from 'uuid';
import { ManageBookingLoginController } from '@pages/manage-booking-login/manage-booking-login';
import { PageNames } from '@constants';
import { CRMGovernmentAgency } from '../../../../src/services/crm-gateway/enums';
import { Context, Locale, Target } from '../../../../src/domain/enums';
import config from '../../../../src/config';
import { logger } from '../../../../src/helpers/logger';
import { CandidateService } from '../../../../src/services/candidates/candidate-service';
import { EligibilityLicenceNotFoundError } from '../../../../src/domain/errors/eligibility/EligibilityLicenceNotFoundError';
import { EligibilityNotLatestLicenceError } from '../../../../src/domain/errors/eligibility/EligibilityNotLatestLicenceError';
import { EligibilityAuthError } from '../../../../src/domain/errors/eligibility/EligibilityAuthError';
import { EligibilityTooManyRequestsError } from '../../../../src/domain/errors/eligibility/EligibilityTooManyRequestsError';
import { EligibilityServerError } from '../../../../src/domain/errors/eligibility/EligibilityServerError';
import { RequestValidationError } from '../../../../src/middleware/request-validator';

jest.mock('../../../../src/helpers/language');

const gbGovLink = 'https://www.gov.uk';
const niGovLink = 'https://www.nidirect.gov.uk';

describe('Manage booking - login controller', () => {
  let req: any;
  let res: Response;

  const mockLicenceNumber = 'JONES061102W97YT';
  const mockNiLicenceNumber = '06159200';
  const mockLicenceId = uuid4();
  const mockCandidateId = uuid4();
  const mockCandidateResponse = {
    candidateId: mockCandidateId,
    firstnames: 'Wendy',
    surname: 'Jones',
    email: 'wendyjones@gmail.com',
    dateOfBirth: '2002-11-10',
    licenceId: mockLicenceId,
    licenceNumber: mockLicenceNumber,
    personReference: 'mockRef',
    telephone: '0121 222 1111',
    address: {
      line1: '42 Somewhere Street',
      line2: 'This Village',
      line3: 'This County',
      line4: 'Nowhere',
      line5: 'Birmingham',
      postcode: 'B5 1AA',
    },
  };
  const mockNiCandidateResponse = {
    ...mockCandidateResponse,
    licenceNumber: mockNiLicenceNumber,
  };
  const mockCandidateBookings = [
    {
      reference: 'B-000-000-001',
      governmentAgency: CRMGovernmentAgency.Dvsa,
    },
    {
      reference: 'B-000-000-002',
      governmentAgency: CRMGovernmentAgency.Dvsa,
    },
    {
      reference: 'B-000-000-003',
      governmentAgency: CRMGovernmentAgency.Dva,
    },
  ];

  let mockCrmGateway = {
    getCandidateBookings: jest.fn(),
    updateCandidate: jest.fn(),
    getLicenceNumberRecordsByCandidateId: jest.fn(),
    updateLicence: jest.fn(),
    createLicence: jest.fn(),
  };

  let mockEligibilityGateway = {
    getEligibility: jest.fn(),
  };

  let candidateService = new CandidateService(mockCrmGateway as any, mockEligibilityGateway as any);

  let isManageBooking: boolean | undefined;
  let controller: ManageBookingLoginController;

  beforeEach(() => {
    isManageBooking = true;
    req = {
      body: {
        licenceNumber: mockLicenceNumber,
        bookingReference: 'booking-ref',
      },
      hasErrors: false,
      errors: [],
      session: {
        context: Context.CITIZEN,
        target: Target.GB,
        locale: Locale.GB,
        journey: {},
      },
    };

    res = {
      status: () => res,
      redirect: jest.fn(),
      render: jest.fn(),
    } as unknown as Response;

    config.landing = {
      enableInternalEntrypoints: true,
      gb: {
        citizen: {
          book: `${gbGovLink}/book-theory-test`,
          check: `${gbGovLink}/check-theory-test`,
          change: `${gbGovLink}/change-theory-test`,
          cancel: `${gbGovLink}/cancel-theory-test`,
        },
        instructor: {
          book: `${gbGovLink}/book-your-instructor-theory-test`,
          manageBooking: `${gbGovLink}/check-change-cancel-your-instructor-theory-test`,
        },
      },
      cy: {
        citizen: {
          book: `${gbGovLink}/archebu-prawf-gyrru-theori`,
        },
      },
      ni: {
        citizen: {
          book: `${niGovLink}/services/book-change-or-cancel-your-theory-test-online`,
          manageBooking: `${niGovLink}/services/book-change-or-cancel-your-theory-test-online`,
        },
        instructor: {
          book: `${niGovLink}/services/adi-theory-test-part-one-hazard-perception-test`,
          manageBooking: `${niGovLink}/services/adi-theory-test-part-one-hazard-perception-test`,
        },
      },
    };

    mockCrmGateway = {
      getCandidateBookings: jest.fn(),
      updateCandidate: jest.fn(),
      getLicenceNumberRecordsByCandidateId: jest.fn(),
      updateLicence: jest.fn(),
      createLicence: jest.fn(),
    };

    mockEligibilityGateway = {
      getEligibility: jest.fn(),
    };

    candidateService = new CandidateService(mockCrmGateway as any, mockEligibilityGateway as any);
    candidateService.alignCandidateDataInCRM = jest.fn().mockResolvedValue({
      crmCandidate: mockCandidateResponse,
      licenceId: mockLicenceId,
    });

    controller = new ManageBookingLoginController(mockCrmGateway as any, mockEligibilityGateway as any, candidateService as any);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET', () => {
    test('clears any existing manage booking session', () => {
      req.session.manageBooking = {
        candidate: 'some existing session data',
      };

      controller.get(req, res);

      expect(req.session.manageBooking).toBeUndefined();
    });

    test('sets the manage booking mode flag to true if originally undefined', () => {
      delete req.session.journey.inManageBookingMode;

      controller.get(req, res);

      expect(req.session.journey.inManageBookingMode).toBeTruthy();
    });

    test('sets the manage booking mode flag to true if originally false', () => {
      req.session.journey.inManageBookingMode = false;

      controller.get(req, res);

      expect(req.session.journey.inManageBookingMode).toBeTruthy();
    });

    test('throws an error if the session is undefined', () => {
      delete req.session;

      expect(() => controller.get(req, res)).toThrow('Journey is not set in the session');
    });

    test('renders the manage booking login page', () => {
      controller.get(req, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_LOGIN, expect.objectContaining({}));
    });

    describe('back button navigation', () => {
      test('navigate back to gb change your test page', () => {
        controller.get(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_LOGIN, expect.objectContaining({
          backLink: 'https://www.gov.uk/change-theory-test',
        }));
      });

      test('navigate back to ni check/change/cancel your test page', () => {
        req.session.target = Target.NI;

        controller.get(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_LOGIN, expect.objectContaining({
          backLink: 'https://www.nidirect.gov.uk/services/book-change-or-cancel-your-theory-test-online',
        }));
      });

      test('if user came from instructor start page, navigate back to instructor check/change/cancel page', () => {
        req.session.context = Context.INSTRUCTOR;

        controller.get(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_LOGIN, expect.objectContaining({
          backLink: 'https://www.gov.uk/check-change-cancel-your-instructor-theory-test',
        }));
      });

      test('if user came from NI instructor start page, navigate back to NI instructor check/change/cancel page', () => {
        req.session.target = Target.NI;
        req.session.context = Context.INSTRUCTOR;

        controller.get(req, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_LOGIN, expect.objectContaining({
          backLink: 'https://www.nidirect.gov.uk/services/adi-theory-test-part-one-hazard-perception-test',
        }));
      });
    });
  });

  describe('POST', () => {
    describe('if the form input validation fails', () => {
      test('re-renders the view with an error with analytics logging', async () => {
        const validationError: RequestValidationError = {
          location: 'body',
          param: '',
          msg: 'Booking reference is invalid',
        };
        req.errors = [validationError];
        req.hasErrors = true;

        await controller.post(req, res);

        expect(logger.warn).toHaveBeenCalledWith('ManageBookingLoginController::post: Booking reference is invalid', {
          target: Target.GB,
          locale: Locale.GB,
        });
        expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_LOGIN, expect.objectContaining({
          bookingReference: 'booking-ref',
          errors: [{
            location: 'body',
            msg: undefined,
            param: '',
          }],
          licenceNumber: 'JONES061102W97YT',
        }));
      });
    });

    describe('if the form input validation succeeds', () => {
      describe('but eligibility api returns an error', () => {
        test('show retry page if eligibility api returns too many requests error - 429', async () => {
          const error = new EligibilityTooManyRequestsError();
          mockEligibilityGateway.getEligibility.mockRejectedValue(error);

          await controller.post(req, res);

          expect(mockEligibilityGateway.getEligibility).toHaveBeenCalledWith(mockLicenceNumber, isManageBooking, Target.GB, Target.GB);
          expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_ELIGIBILITY_RETRY_ERROR);
          expect(logger.error).toHaveBeenCalledWith(error, 'ManageBookingLoginController::post: Failed login attempt', {
            bookingRef: 'booking-ref',
            target: Target.GB,
            locale: Locale.GB,
          });
        });

        test('show retry page if eligibility api returns internal server error - 500', async () => {
          const error = new EligibilityServerError();
          mockEligibilityGateway.getEligibility.mockRejectedValue(error);

          await controller.post(req, res);

          expect(mockEligibilityGateway.getEligibility).toHaveBeenCalledWith(mockLicenceNumber, isManageBooking, Target.GB, Target.GB);
          expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_ELIGIBILITY_RETRY_ERROR);
          expect(logger.error).toHaveBeenCalledWith(error, 'ManageBookingLoginController::post: Failed login attempt', {
            bookingRef: 'booking-ref',
            target: Target.GB,
            locale: Locale.GB,
          });
        });

        test('show generic error page if eligibility api returns an auth error - 401 & 403', async () => {
          const error = new EligibilityAuthError();
          mockEligibilityGateway.getEligibility.mockRejectedValue(error);

          await expect(controller.post(req, res)).rejects.toThrow();

          expect(mockEligibilityGateway.getEligibility).toHaveBeenCalledWith(mockLicenceNumber, isManageBooking, Target.GB, Target.GB);
          expect(logger.error).toHaveBeenCalledWith(error, 'ManageBookingLoginController::post: Failed login attempt', {
            bookingRef: 'booking-ref',
            target: Target.GB,
            locale: Locale.GB,
          });
        });

        test('render login page with error response if driver licence number is not found - 404', async () => {
          const error = new EligibilityLicenceNotFoundError('Driver Licence Number was not found');
          mockEligibilityGateway.getEligibility.mockRejectedValue(error);

          await controller.post(req, res);

          expect(mockEligibilityGateway.getEligibility).toHaveBeenCalledWith(mockLicenceNumber, isManageBooking, Target.GB, Locale.GB);
          expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_LOGIN, expect.objectContaining({
            bookingReference: 'booking-ref',
            errors: [{
              location: 'body',
              msg: undefined,
              param: '',
            }],
            licenceNumber: 'JONES061102W97YT',
          }));
          expect(logger.warn).toHaveBeenCalledWith('ManageBookingLoginController::post: Driver Licence Number was not found', {
            target: Target.GB,
            locale: Locale.GB,
          });
        });

        test('render login page with error response if driver licence is not most recent - 409', async () => {
          const error = new EligibilityNotLatestLicenceError('Not most recent licence, response 409');
          mockEligibilityGateway.getEligibility.mockRejectedValue(error);

          await controller.post(req, res);

          expect(mockEligibilityGateway.getEligibility).toHaveBeenCalledWith(mockLicenceNumber, isManageBooking, Target.GB, Locale.GB);
          expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_LOGIN, expect.objectContaining({
            bookingReference: 'booking-ref',
            errors: [{
              location: 'body',
              msg: undefined,
              param: '',
            }],
            licenceNumber: 'JONES061102W97YT',
          }));
          expect(logger.warn).toHaveBeenCalledWith('ManageBookingLoginController::post: Not most recent licence, response 409', {
            target: Target.GB,
            locale: Locale.GB,
          });
        });
      });

      describe('but the given booking reference does not match the licence/candidate', () => {
        test('re-renders the view with an error', async () => {
          mockEligibilityGateway.getEligibility.mockResolvedValue(mockCandidateResponse);
          mockCrmGateway.getCandidateBookings.mockReturnValueOnce(mockCandidateBookings);
          req.body.bookingReference = 'not-one-of-my-bookings';

          await controller.post(req, res);

          expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_LOGIN, expect.objectContaining({
            bookingReference: 'not-one-of-my-bookings',
            errors: [{
              location: 'body',
              msg: undefined,
              param: '',
            }],
            licenceNumber: 'JONES061102W97YT',
          }));
        });
      });

      describe('but the given driving licence does not retrieve a candidate', () => {
        test('re-renders the view with an error', async () => {
          mockEligibilityGateway.getEligibility.mockResolvedValue({
            ...mockCandidateResponse,
            candidateId: undefined,
          });
          mockCrmGateway.getCandidateBookings.mockReturnValueOnce(mockCandidateBookings);
          req.body.bookingReference = 'booking-ref';

          await controller.post(req, res);

          expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_LOGIN, expect.objectContaining({
            bookingReference: 'booking-ref',
            errors: [{
              location: 'body',
              msg: undefined,
              param: '',
            }],
            licenceNumber: 'JONES061102W97YT',
          }));
          expect(logger.warn).toHaveBeenCalledWith('ManageBookingLoginController::post: Candidate record for the given licence number does not exist in CRM', {
            bookingRef: 'booking-ref',
            target: Target.GB,
            locale: Locale.GB,
          });
        });
      });

      describe('and the given booking reference matches the licence/candidate', () => {
        describe('and the licence number was not capitalised and had spaces', () => {
          test('successfully calls eligibility with a capitalised licence number without spaces', async () => {
            req.body.licenceNumber = ' jOnES  061102W97YT ';
            mockEligibilityGateway.getEligibility.mockResolvedValue(mockCandidateResponse);
            mockCrmGateway.getCandidateBookings.mockReturnValueOnce(mockCandidateBookings);
            // eslint-disable-next-line prefer-destructuring
            req.body.bookingReference = mockCandidateBookings[0].reference;

            await controller.post(req, res);

            expect(mockEligibilityGateway.getEligibility).toHaveBeenCalledWith('JONES061102W97YT', isManageBooking, Target.GB, Target.GB);
            expect(candidateService.alignCandidateDataInCRM).toHaveBeenCalledWith(mockCandidateResponse, mockLicenceNumber);
            expect(res.redirect).toHaveBeenCalledWith('home');
          });
        });

        describe('and the booking reference given was not capitalised and had spaces', () => {
          test('successfully logs the user in', async () => {
            mockEligibilityGateway.getEligibility.mockResolvedValue(mockCandidateResponse);
            mockCrmGateway.getCandidateBookings.mockReturnValueOnce(mockCandidateBookings);
            // eslint-disable-next-line prefer-destructuring
            req.body.bookingReference = 'b - 000 - 000 - 001';

            await controller.post(req, res);

            expect(mockEligibilityGateway.getEligibility).toHaveBeenCalledWith(mockLicenceNumber, isManageBooking, Target.GB, Target.GB);
            expect(candidateService.alignCandidateDataInCRM).toHaveBeenCalledWith(mockCandidateResponse, mockLicenceNumber);
            expect(res.redirect).toHaveBeenCalledWith('home');
          });
        });

        describe('and the booking reference given was not capitalised and had spaces (DVA)', () => {
          test('successfully logs the user in', async () => {
            req.session.locale = Target.NI;
            req.session.target = Target.NI;
            req.body.licenceNumber = mockNiLicenceNumber;
            mockEligibilityGateway.getEligibility.mockResolvedValue(mockCandidateResponse);
            mockCrmGateway.getCandidateBookings.mockReturnValueOnce(mockCandidateBookings);
            // eslint-disable-next-line prefer-destructuring
            req.body.bookingReference = 'b - 000 - 000 - 003';

            await controller.post(req, res);

            expect(mockEligibilityGateway.getEligibility).toHaveBeenCalledWith(mockNiLicenceNumber, isManageBooking, Target.NI, Target.NI);
            expect(candidateService.alignCandidateDataInCRM).toHaveBeenCalledWith(mockCandidateResponse, mockNiLicenceNumber);
            expect(res.redirect).toHaveBeenCalledWith('home');
          });
        });

        describe('but the booking was created in the context of NI and is attempted to be used in context of GB', () => {
          test('re-renders the view with an error', async () => {
            mockEligibilityGateway.getEligibility.mockResolvedValue(mockCandidateResponse);
            mockCrmGateway.getCandidateBookings.mockReturnValueOnce(mockCandidateBookings);
            // eslint-disable-next-line prefer-destructuring
            req.body.bookingReference = mockCandidateBookings[2].reference;

            await controller.post(req, res);

            expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_LOGIN, expect.objectContaining({
              bookingReference: 'B-000-000-003',
              errors: [{
                location: 'body',
                msg: undefined,
                param: '',
              }],
              licenceNumber: 'JONES061102W97YT',
            }));
          });
        });

        describe('but the booking was created in the context of GB and is attempted to be used in context of NI', () => {
          test('re-renders the view with an error', async () => {
            req.session.target = Target.NI;
            req.body.licenceNumber = mockNiLicenceNumber;
            mockEligibilityGateway.getEligibility.mockResolvedValue(mockCandidateResponse);
            mockCrmGateway.getCandidateBookings.mockReturnValueOnce(mockCandidateBookings);
            // eslint-disable-next-line prefer-destructuring
            req.body.bookingReference = mockCandidateBookings[0].reference;

            await controller.post(req, res);

            expect(res.render).toHaveBeenCalledWith(PageNames.MANAGE_BOOKING_LOGIN, expect.objectContaining({
              bookingReference: 'B-000-000-001',
              errors: [{
                location: 'body',
                msg: undefined,
                param: '',
              }],
              licenceNumber: mockNiLicenceNumber,
            }));
          });
        });

        describe('and the booking was created in the context of GB and is attempted to be used in context of GB', () => {
          test('successfully navigates to home, showing only the GB bookings', async () => {
            mockEligibilityGateway.getEligibility.mockResolvedValue(mockCandidateResponse);
            mockCrmGateway.getLicenceNumberRecordsByCandidateId.mockResolvedValue({
              ...mockCandidateResponse,
              licenceId: mockLicenceId,
              personReference: mockCandidateResponse.personReference,
            });
            mockCrmGateway.getCandidateBookings.mockResolvedValue(mockCandidateBookings);
            // eslint-disable-next-line prefer-destructuring
            req.body.bookingReference = mockCandidateBookings[0].reference;

            await controller.post(req, res);

            expect(mockEligibilityGateway.getEligibility).toHaveBeenCalledWith(mockLicenceNumber, isManageBooking, Target.GB, Target.GB);
            expect(candidateService.alignCandidateDataInCRM).toHaveBeenCalledWith(mockCandidateResponse, mockLicenceNumber);
            expect(req.session.manageBooking).toStrictEqual({
              candidate: mockCandidateResponse,
              bookings: mockCandidateBookings.slice(0, 2),
            });
            expect(res.redirect).toHaveBeenCalledWith('home');
          });
        });

        describe('and the booking was created in the context of NI and is attempted to be used in context of NI', () => {
          test('successfully navigates to home, showing only the NI bookings', async () => {
            req.session.target = Target.NI;
            req.session.locale = Target.NI;
            req.body.licenceNumber = mockNiLicenceNumber;
            mockEligibilityGateway.getEligibility.mockResolvedValue(mockCandidateResponse);
            mockCrmGateway.getCandidateBookings.mockReturnValueOnce(mockCandidateBookings);
            // eslint-disable-next-line prefer-destructuring
            req.body.bookingReference = mockCandidateBookings[2].reference;

            await controller.post(req, res);

            expect(mockEligibilityGateway.getEligibility).toHaveBeenCalledWith(mockNiLicenceNumber, isManageBooking, Target.NI, Locale.NI);
            expect(candidateService.alignCandidateDataInCRM).toHaveBeenCalledWith(mockCandidateResponse, mockNiLicenceNumber);
            expect(req.session.manageBooking).toStrictEqual({
              candidate: mockNiCandidateResponse,
              bookings: [mockCandidateBookings[2]],
            });
            expect(res.redirect).toHaveBeenCalledWith('home');
          });
        });

        describe('but an unknown error occurs', () => {
          test('error is thrown in order to show generic error page', async () => {
            req.session.target = Target.GB;
            const error = new Error('unknown error');
            mockEligibilityGateway.getEligibility.mockRejectedValue(error);
            mockCrmGateway.getLicenceNumberRecordsByCandidateId.mockResolvedValue({
              ...mockCandidateResponse,
              licenceId: mockLicenceId,
              personReference: mockCandidateResponse.personReference,
            });
            mockCrmGateway.getCandidateBookings.mockReturnValueOnce(mockCandidateBookings);
            // eslint-disable-next-line prefer-destructuring
            req.body.bookingReference = mockCandidateBookings[0].reference;

            await expect(controller.post(req, res))
              .rejects.toThrow();

            expect(logger.error).toHaveBeenCalledWith(error, 'ManageBookingLoginController::post: Failed login attempt', {
              bookingRef: 'B-000-000-001',
              target: Target.GB,
              locale: Locale.GB,
            });
          });
        });
      });
    });
  });
});
