import { Request, Response } from 'express';
import { ELIG } from '@dvsa/ftts-eligibility-api-model';
import MockDate from 'mockdate';
import { ChooseAppointmentBody, ChooseAppointmentController } from '@pages/choose-appointment/choose-appointment';
import { PageNames } from '@constants';
import { Target, TestType } from '../../../../src/domain/enums';
import { AppointmentSlot } from '../../../../src/services/scheduling/types';
import { mockCentres } from '../../../mocks/data/mock-data';
import { AppointmentService } from '../../../../src/services/appointment/appointment-service';
import { SchedulingGateway } from '../../../../src/services/scheduling/scheduling-gateway';
import { MockRequest } from '../../../mocks/data/session';

jest.mock('../../../../src/services/appointment/appointment-service');

describe('Choose appointment controller', () => {
  const mockedAppointmentService = new AppointmentService({} as SchedulingGateway) as jest.Mocked<AppointmentService>;
  const controller = new ChooseAppointmentController(mockedAppointmentService);
  const mockSlotsByDate: Record<string, AppointmentSlot[]> = {
    '2022-01-26': [] as AppointmentSlot[],
    '2022-01-27': [{ startDateTime: '2022-01-27T09:30:00.000Z' }, { startDateTime: '2022-01-27T15:15:00.000Z' }] as AppointmentSlot[],
    '2022-01-28': [{ startDateTime: '2022-01-28T14:15:00.000Z' }] as AppointmentSlot[],
  };
  const mockWeekViewDates = ['2022-01-24', '2022-01-25', '2022-01-26', '2022-01-27', '2022-01-28', '2022-01-29', '2022-01-30'];
  const mockWeekViewMobileDates = ['2022-01-26', '2022-01-27', '2022-01-28'];

  let req: MockRequest<ChooseAppointmentBody>;
  let res: Response;

  beforeAll(() => {
    mockedAppointmentService.getSlots.mockResolvedValue({ slotsByDate: mockSlotsByDate });
    mockedAppointmentService.getWeekViewDatesDesktop.mockReturnValue(mockWeekViewDates);
    mockedAppointmentService.getWeekViewDatesMobile.mockReturnValue(mockWeekViewMobileDates);
    mockedAppointmentService.getNextDateMobile.mockReturnValue('2022-01-29');
    mockedAppointmentService.getPreviousDateMobile.mockReturnValue('2022-01-25');
  });

  beforeEach(() => {
    const globalDate = new Date('2022-01-18T14:30:45.979Z');
    MockDate.set(globalDate);

    req = {
      body: {
        slotId: '',
      },
      query: {
        selectedDate: '2022-01-27',
      },
      hasErrors: false,
      session: {
        target: Target.NI,
        candidate: {
          title: 'Mr',
          gender: ELIG.CandidateDetails.GenderEnum.M,
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
          licenceId: 'licence-id',
          candidateId: 'candidate-id',
          licenceNumber: 'licence-number',
          eligibilities: [{
            testType: TestType.CAR,
            eligible: true,
            eligibleFrom: '2020-01-01',
            eligibleTo: '2030-01-01',
          }],
          personReference: '123456789',
        },
        currentBooking: {
          testType: TestType.CAR,
          centre: mockCentres[0],
        },
        journey: {
          inEditMode: false,
          inManagedBookingEditMode: false,
          managedBookingRescheduleChoice: '',
        },
        editedLocationTime: {
          dateTime: 'newly-changed-slot',
        },
        manageBooking: {},
        manageBookingEdits: {},
        testCentreSearch: {},
      },
    };

    res = {
      status: () => res,
      redirect: jest.fn(),
      render: jest.fn(),
    } as unknown as Response;
  });

  afterEach(() => {
    MockDate.reset();
    jest.clearAllMocks();
  });

  describe('GET request', () => {
    test('redirects to select-test-centre when centre missing in session', async () => {
      delete req.session.currentBooking.centre;

      await controller.get(req as unknown as Request, res);

      expect(res.redirect).toHaveBeenCalledWith('select-test-centre');
    });

    test('redirects to manage-booking/select-test-centre when in manage booking journey and centre missing in session', async () => {
      req.session.journey.inManagedBookingEditMode = true;
      delete req.session.currentBooking.centre;

      await controller.get(req as unknown as Request, res);

      expect(res.redirect).toHaveBeenCalledWith('/manage-booking/select-test-centre');
    });

    test('renders the page with errors when there are errors', async () => {
      req.hasErrors = true;
      req.errors = [{ param: 'test' }];

      await controller.get(req as unknown as Request, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.CHOOSE_APPOINTMENT, expect.objectContaining({
        errors: req.errors,
      }));
    });

    test('sets back link to select-date in standard journey', async () => {
      await controller.get(req as unknown as Request, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.CHOOSE_APPOINTMENT, expect.objectContaining({
        backLink: 'select-date',
      }));
    });

    test('sets back link to manage-change-location-time page when coming from that page in manage booking journey', async () => {
      req.session.journey.inManagedBookingEditMode = true;
      req.session.journey.managedBookingRescheduleChoice = '/manage-booking/choose-appointment';
      req.url = '/manage-booking/choose-appointment';
      req.session.currentBooking.bookingRef = 'mockRef';

      await controller.get(req as unknown as Request, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.CHOOSE_APPOINTMENT, expect.objectContaining({
        backLink: 'manage-change-location-time/mockRef',
      }));
    });

    test('renders the page with slots view data', async () => {
      await controller.get(req as unknown as Request, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.CHOOSE_APPOINTMENT, expect.objectContaining({
        weekView: mockWeekViewDates,
        weekViewMobile: mockWeekViewMobileDates,
        navigation: {
          desktop: {
            previous: '2022-01-20',
            next: '2022-02-03',
          },
          mobile: {
            previous: '2022-01-25',
            next: '2022-01-29',
          },
        },
        slotsByDate: mockSlotsByDate,
        morningSlots: [{ startDateTime: '2022-01-27T09:30:00.000Z' }],
        afternoonSlots: [{ startDateTime: '2022-01-27T15:15:00.000Z' }],
        selectedDate: req.query?.selectedDate,
        isBeforeToday: false,
        isAfterSixMonths: false,
        isBeforeEligible: false,
        isAfterEligible: false,
        eligibleFromDate: req.session.candidate.eligibilities?.[0].eligibleFrom,
        testCentreName: mockCentres[0].name,
      }));
    });

    test('groups morning/afternoon slots correctly in BST', async () => {
      MockDate.set('2022-06-01');
      req.query = { selectedDate: '2022-06-05' };
      mockedAppointmentService.getSlots.mockResolvedValue({
        slotsByDate: {
          '2022-06-05': [
            { startDateTime: '2022-06-04T23:00:00.000Z' }, // 00:00am in BST
            { startDateTime: '2022-06-05T10:30:00.000Z' }, // 11:30am in BST
            { startDateTime: '2022-06-05T11:30:00.000Z' }, // 12:30pm in BST
            { startDateTime: '2022-06-05T12:30:00.000Z' }, // 13:30pm in BST
          ] as AppointmentSlot[],
        },
      });

      await controller.get(req as unknown as Request, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.CHOOSE_APPOINTMENT, expect.objectContaining({
        morningSlots: [
          { startDateTime: '2022-06-04T23:00:00.000Z' },
          { startDateTime: '2022-06-05T10:30:00.000Z' },
        ],
        afternoonSlots: [
          { startDateTime: '2022-06-05T11:30:00.000Z' },
          { startDateTime: '2022-06-05T12:30:00.000Z' },
        ],
      }));
    });

    test('uses selected date from session if not present in req.query', async () => {
      req.query = {};
      req.session.testCentreSearch.selectedDate = '2022-01-30';

      await controller.get(req as unknown as Request, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.CHOOSE_APPOINTMENT, expect.objectContaining({
        selectedDate: '2022-01-30',
      }));
    });

    test('renders choose-appointment with the changed test centre when in edit mode', async () => {
      req.session.journey.inEditMode = true;
      req.session.editedLocationTime = { centre: mockCentres[1] };

      await controller.get(req as unknown as Request, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.CHOOSE_APPOINTMENT, expect.objectContaining({
        testCentreName: mockCentres[1].name,
      }));
    });

    describe('selected date in the past', () => {
      test('selected date which is today sets flag isBeforeToday to false', async () => {
        req.query = { selectedDate: '2022-01-18' };

        await controller.get(req as unknown as Request, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.CHOOSE_APPOINTMENT, expect.objectContaining({
          isBeforeToday: false,
        }));
      });

      test('selected date which is before today sets flag isBeforeToday to true', async () => {
        req.query = { selectedDate: '2022-01-17' };

        await controller.get(req as unknown as Request, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.CHOOSE_APPOINTMENT, expect.objectContaining({
          isBeforeToday: true,
        }));
      });
    });

    describe('selected date near six months', () => {
      test('selected date which is before six months sets flag isAfterSixMonths to false', async () => {
        req.query = { selectedDate: '2022-07-16' };

        await controller.get(req as unknown as Request, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.CHOOSE_APPOINTMENT, expect.objectContaining({
          isAfterSixMonths: false,
        }));
      });

      test('selected date which is six months away sets flag isAfterSixMonths to true', async () => {
        req.query = { selectedDate: '2022-07-18' };

        await controller.get(req as unknown as Request, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.CHOOSE_APPOINTMENT, expect.objectContaining({
          isAfterSixMonths: true,
        }));
      });
    });

    describe('eligibility dates', () => {
      test('selected date on/after eligibleFrom sets flag isBeforeEligible to false', async () => {
        req.query = { selectedDate: '2022-07-17' };
        req.session.candidate.eligibilities = [{ eligibleFrom: '2022-07-17', testType: TestType.CAR } as any];

        await controller.get(req as unknown as Request, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.CHOOSE_APPOINTMENT, expect.objectContaining({
          isBeforeEligible: false,
        }));
      });

      test('selected date before eligibleFrom sets flag isBeforeEligible to true', async () => {
        req.query = { selectedDate: '2022-07-16' };
        req.session.candidate.eligibilities = [{ eligibleFrom: '2022-07-17', testType: TestType.CAR } as any];

        await controller.get(req as unknown as Request, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.CHOOSE_APPOINTMENT, expect.objectContaining({
          isBeforeEligible: true,
          eligibleFromDate: '2022-07-17',
        }));
      });

      test('selected date on/before eligibleTo sets flag isAfterEligible to false', async () => {
        req.query = { selectedDate: '2022-07-17' };
        req.session.candidate.eligibilities = [{ eligibleTo: '2022-07-17', testType: TestType.CAR } as any];

        await controller.get(req as unknown as Request, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.CHOOSE_APPOINTMENT, expect.objectContaining({
          isAfterEligible: false,
        }));
      });

      test('selected date after eligibleTo sets flag isAfterEligible to true', async () => {
        req.query = { selectedDate: '2022-07-18' };
        req.session.candidate.eligibilities = [{ eligibleTo: '2022-07-17', testType: TestType.CAR } as any];

        await controller.get(req as unknown as Request, res);

        expect(res.render).toHaveBeenCalledWith(PageNames.CHOOSE_APPOINTMENT, expect.objectContaining({
          isAfterEligible: true,
        }));
      });

      test('to enable ERS rescheduling, ignore eligible from/to for ERS tests', async () => {
        req.query = { selectedDate: '2022-07-18' };
        req.session.currentBooking.testType = TestType.ERS;
        req.session.candidate.eligibilities = [{
          eligibleFrom: '2022-07-16',
          eligibleTo: '2022-07-17',
          testType: TestType.ERS,
        } as any];

        await controller.get(req as unknown as Request, res);

        expect(mockedAppointmentService.getSlots).toHaveBeenCalledWith(
          ...Array(3).fill(expect.anything()),
          expect.objectContaining({
            eligibleFrom: undefined,
            eligibleTo: undefined,
          }),
          undefined,
        );
        expect(res.render).toHaveBeenCalledWith(PageNames.CHOOSE_APPOINTMENT, expect.objectContaining({
          isAfterEligible: false,
          isBeforeEligible: false,
        }));
      });
    });

    describe('KPI indicators', () => {
      test('stores KPI indicators in session when returned from TCN given preferred date', async () => {
        req.session.currentBooking.firstSelectedDate = '2022-01-27';
        mockedAppointmentService.getSlots.mockResolvedValue({
          slotsByDate: mockSlotsByDate,
          kpiIdentifiers: {
            dateAvailableOnOrAfterToday: 'mock-date-1',
            dateAvailableOnOrBeforePreferredDate: 'mock-date-2',
            dateAvailableOnOrAfterPreferredDate: 'mock-date-3',
          },
        });

        await controller.get(req as unknown as Request, res);

        expect(mockedAppointmentService.getSlots).toHaveBeenCalledWith(
          ...Array(4).fill(expect.anything()), req.session.currentBooking.firstSelectedDate,
        );
        expect(req.session.currentBooking.dateAvailableOnOrAfterToday).toBe('mock-date-1');
        expect(req.session.currentBooking.dateAvailableOnOrBeforePreferredDate).toBe('mock-date-2');
        expect(req.session.currentBooking.dateAvailableOnOrAfterPreferredDate).toBe('mock-date-3');
      });

      test('calls appointment service without preferred date if KPI indicators already set in session', async () => {
        req.session.currentBooking.firstSelectedDate = '2022-01-27';
        req.session.currentBooking.dateAvailableOnOrAfterToday = 'mock-date-1';
        req.session.currentBooking.dateAvailableOnOrBeforePreferredDate = 'mock-date-2';
        req.session.currentBooking.dateAvailableOnOrAfterPreferredDate = 'mock-date-3';

        await controller.get(req as unknown as Request, res);

        expect(mockedAppointmentService.getSlots).toHaveBeenCalledWith(
          ...Array(4).fill(expect.anything()), undefined,
        );
      });
    });
  });

  describe('POST request', () => {
    test('re-renders the page when there are errors', async () => {
      req.hasErrors = true;
      req.errors = [{ param: 'test' }];

      await controller.post(req as unknown as Request, res);

      expect(res.render).toHaveBeenCalledWith(PageNames.CHOOSE_APPOINTMENT, expect.objectContaining({
        errors: req.errors,
      }));
    });

    test('stores the selected slot datetime in the session', async () => {
      const mockSelectedDatetime = '2022-01-28T14:15:00.000Z';
      req.body = {
        slotId: mockSelectedDatetime,
      };

      await controller.post(req as unknown as Request, res);

      expect(req.session.currentBooking.dateTime).toBe(mockSelectedDatetime);
    });

    test('in edit mode stores the selected slot datetime in the edited location/time session', async () => {
      req.session.journey.inEditMode = true;
      const mockSelectedDatetime = '2022-01-28T14:15:00.000Z';
      req.body = {
        slotId: mockSelectedDatetime,
      };

      await controller.post(req as unknown as Request, res);

      expect(req.session.currentBooking.dateTime).toBeUndefined();
      expect(req.session.editedLocationTime.dateTime).toBe(mockSelectedDatetime);
    });

    test('in manage booking journey stores the selected slot datetime in the manage booking session', async () => {
      req.session.journey.inManagedBookingEditMode = true;
      const mockSelectedDatetime = '2022-01-28T14:15:00.000Z';
      req.body = {
        slotId: mockSelectedDatetime,
      };

      await controller.post(req as unknown as Request, res);

      expect(req.session.currentBooking.dateTime).toBeUndefined();
      expect(req.session.manageBookingEdits.dateTime).toBe(mockSelectedDatetime);
    });

    test('in standard journey redirects to the check-your-answers page', async () => {
      req.body = {
        slotId: '2022-01-28T14:15:00.000Z',
      };

      await controller.post(req as unknown as Request, res);

      expect(res.redirect).toHaveBeenCalledWith('check-your-answers');
    });

    test('in manage booking journey redirects to the check-change page', async () => {
      req.session.journey.inManagedBookingEditMode = true;
      req.body = {
        slotId: '2022-01-28T14:15:00.000Z',
      };

      await controller.post(req as unknown as Request, res);

      expect(res.redirect).toHaveBeenCalledWith('/manage-booking/check-change');
    });
  });
});
