import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import MockDate from 'mockdate';
import { ChooseAppointmentBody } from '@pages/choose-appointment/choose-appointment';
import { AppointmentService } from '../../../../src/services/appointment/appointment-service';
import { Target, TestType } from '../../../../src/domain/enums';
import { MockRequest } from '../../../mocks/data/session';
import { mockCentres, mockSlots } from '../../../mocks/data/mock-data';
import { Centre } from '../../../../src/domain/types';
import { toISODateString } from '../../../../src/domain/utc-date';
import { AppointmentSlot, KPIIdentifiers } from '../../../../src/services/scheduling/types';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isoWeek);

jest.mock('../../../../src/services/scheduling/scheduling-gateway');

describe('Appointment service tests', () => {
  let req: MockRequest<ChooseAppointmentBody>;
  let appointmentService: AppointmentService;
  let globalDate;

  const mockSchedulingGateway = {
    reserveSlot: jest.fn(),
    deleteBooking: jest.fn(),
    confirmBooking: jest.fn(),
    availableSlots: jest.fn(),
  };

  beforeEach(() => {
    globalDate = new Date('2020-11-11T14:30:45.979Z');
    MockDate.set(globalDate);

    appointmentService = new AppointmentService(mockSchedulingGateway as any);

    req = {
      session: {
        target: Target.NI,
        candidate: {
          eligibilities: [{
            testType: TestType.CAR,
            eligible: true,
            eligibleFrom: '2020-01-01',
            eligibleTo: '2030-01-01',
          }],
        },
      },
    };
  });

  afterEach(() => {
    MockDate.reset();
    jest.restoreAllMocks();
  });

  describe('getSlots', () => {
    let selectedDate = dayjs('2021-06-28');
    let selectedCentre: Centre;

    beforeEach(() => {
      globalDate = new Date('2021-05-20T14:30:45.979Z');
      MockDate.set(globalDate);
      mockSchedulingGateway.availableSlots.mockResolvedValue([{
        testCentreId: '0001:SITE-0207',
        testTypes: [
          'CAR',
        ],
        startDateTime: '2021-06-28T09:00:00.000Z',
        quantity: 1,
      }, {
        testCentreId: '0001:SITE-0207',
        testTypes: [
          'CAR',
        ],
        startDateTime: '2021-06-29T13:00:00.000Z',
        quantity: 1,
      }]);
      [selectedCentre] = mockCentres;
    });

    describe('no appointment slots returned for the week', () => {
      test('No slots returned', async () => {
        globalDate = new Date('2020-05-20T14:30:45.979Z');
        MockDate.set(globalDate);
        [selectedCentre] = mockCentres;
        const eligibility = req.session.candidate.eligibilities.find((elig) => elig.testType === TestType.CAR);

        const { slotsByDate } = await appointmentService.getSlots(selectedDate, selectedCentre, TestType.CAR, eligibility);

        expect(Object.keys(slotsByDate)).toHaveLength(0);
      });
    });

    describe('appointment slot processing for first day in result set', () => {
      let returnedSlots: Record<string, AppointmentSlot[]>;

      beforeEach(async () => {
        selectedDate = dayjs('2020-11-16');
        globalDate = new Date('2020-11-12T14:30:45.979Z');
        MockDate.set(globalDate);
        [selectedCentre] = mockCentres;
        const eligibility = req.session.candidate.eligibilities.find((elig) => elig.testType === TestType.CAR);

        mockSchedulingGateway.availableSlots.mockResolvedValue(mockSlots);

        const { slotsByDate } = await appointmentService.getSlots(selectedDate, selectedCentre, TestType.CAR, eligibility);

        returnedSlots = slotsByDate;
      });

      test('returns days and number of slots for each day', () => {
        expect(Object.keys(returnedSlots)).toHaveLength(7);
        expect(returnedSlots['2020-11-16']).toHaveLength(34);
        expect(returnedSlots['2020-11-17']).toHaveLength(31);
        expect(returnedSlots['2020-11-18']).toHaveLength(0);
        expect(returnedSlots['2020-11-19']).toHaveLength(17);
        expect(returnedSlots['2020-11-20']).toHaveLength(36);
        expect(returnedSlots['2020-11-21']).toHaveLength(28);
        expect(returnedSlots['2020-11-22']).toHaveLength(0);
      });
    });

    describe('When user searches for slots in the past', () => {
      let returnedSlots: Record<string, AppointmentSlot[]>;

      beforeEach(async () => {
        selectedDate = dayjs('2020-11-16');
        globalDate = new Date('2022-05-20T14:30:45.979Z');
        MockDate.set(globalDate);
        [selectedCentre] = mockCentres;
        const eligibility = req.session.candidate.eligibilities.find((elig) => elig.testType === TestType.CAR);

        const { slotsByDate } = await appointmentService.getSlots(selectedDate, selectedCentre, TestType.CAR, eligibility);

        returnedSlots = slotsByDate;
      });

      test('No slots returned', () => {
        expect(Object.keys(returnedSlots)).toHaveLength(0);
      });
    });

    describe('When user searches for slots more than 6 months in the future', () => {
      let returnedSlots: Record<string, AppointmentSlot[]>;

      beforeEach(async () => {
        selectedDate = dayjs('2020-11-16');
        globalDate = new Date('2020-02-16T14:30:45.979Z');
        MockDate.set(globalDate);
        [selectedCentre] = mockCentres;
        const eligibility = req.session.candidate.eligibilities.find((elig) => elig.testType === TestType.CAR);

        const { slotsByDate } = await appointmentService.getSlots(selectedDate, selectedCentre, TestType.CAR, eligibility);

        returnedSlots = slotsByDate;
      });

      test('No slots returned', () => {
        expect(Object.keys(returnedSlots)).toHaveLength(0);
      });
    });

    describe('test for kpiIdentifiers', () => {
      let returnedSlots: Record<string, AppointmentSlot[]>;
      let returnedKPI: KPIIdentifiers | undefined;

      beforeEach(async () => {
        selectedDate = dayjs('2020-11-16');
        globalDate = new Date('2020-09-16T14:30:45.979Z');
        MockDate.set(globalDate);
        [selectedCentre] = mockCentres;
        const eligibility = req.session.candidate.eligibilities.find((elig) => elig.testType === TestType.CAR);

        mockSchedulingGateway.availableSlots.mockResolvedValue([{
          testCentreId: '0001:SITE-0207',
          testTypes: [
            'CAR',
          ],
          startDateTime: '2020-11-19T09:00:00.000Z',
          quantity: 1,
          dateAvailableOnOrAfterToday: 'dummyDateAvailableOnOrAfterAfterToday',
          dateAvailableOnOrBeforePreferredDate: 'dummydateAvailableOnOrBeforePreferredDate',
          dateAvailableOnOrAfterPreferredDate: 'dummyDateAvailableOnOrAfterPreferredDate',
        },
        {
          testCentreId: '0001:SITE-0207',
          testTypes: [
            'CAR',
          ],
          startDateTime: '2020-11-16T09:00:00.000Z',
          quantity: 1,
          dateAvailableOnOrAfterToday: 'dummydateAvailableOnOrAfterToday',
          dateAvailableOnOrBeforePreferredDate: 'dummydateAvailableOnOrBeforePreferredDate',
          dateAvailableOnOrAfterPreferredDate: 'dummyDateAvailableOnOrAfterPreferredDate',
        }]);

        const { slotsByDate, kpiIdentifiers } = await appointmentService.getSlots(selectedDate, selectedCentre, TestType.CAR, eligibility, selectedDate.toString());

        returnedSlots = slotsByDate;
        returnedKPI = kpiIdentifiers;
      });

      test('returns KPI information', () => {
        expect(Object.keys(returnedSlots)).toHaveLength(7);
        expect(returnedKPI).toEqual({
          dateAvailableOnOrAfterToday: 'dummyDateAvailableOnOrAfterAfterToday',
          dateAvailableOnOrBeforePreferredDate: 'dummydateAvailableOnOrBeforePreferredDate',
          dateAvailableOnOrAfterPreferredDate: 'dummyDateAvailableOnOrAfterPreferredDate',
        });
      });
    });

    describe('dateFrom and dateTo logic', () => {
      let preferedDate: dayjs.Dayjs;
      beforeEach(() => {
        selectedDate = dayjs('2020-11-16');
        preferedDate = dayjs('2020-11-16');
        globalDate = new Date('2020-11-12T14:30:45.979Z');
        MockDate.set(globalDate);
        [selectedCentre] = mockCentres;
      });

      describe('DateFrom', () => {
        describe('eligibleFrom is set', () => {
          test('current date is start of the week', async () => {
            req.session.candidate.eligibilities = [{
              testType: TestType.CAR,
              eligible: true,
              eligibleFrom: '2020-01-01',
              eligibleTo: '2030-01-01',
            }];

            globalDate = new Date('2020-11-16T14:30:45.979Z');
            MockDate.set(globalDate);
            const eligibility = req.session.candidate.eligibilities.find((elig) => elig.testType === TestType.CAR);

            await appointmentService.getSlots(selectedDate, selectedCentre, TestType.CAR, eligibility, preferedDate.toString());
            expect(mockSchedulingGateway.availableSlots).toHaveBeenCalledWith(
              '2020-11-18',
              '2020-11-22',
              selectedCentre,
              TestType.CAR,
              preferedDate.toString(),
            );
          });
          test('eligibleFrom is after current date', async () => {
            req.session.candidate.eligibilities = [{
              testType: TestType.CAR,
              eligible: true,
              eligibleFrom: '2020-11-19',
              eligibleTo: '2030-01-01',
            }];

            globalDate = new Date('2020-11-16T14:30:45.979Z');
            MockDate.set(globalDate);
            const eligibility = req.session.candidate.eligibilities.find((elig) => elig.testType === TestType.CAR);

            await appointmentService.getSlots(selectedDate, selectedCentre, TestType.CAR, eligibility, preferedDate.toString());
            expect(mockSchedulingGateway.availableSlots).toHaveBeenCalledWith(
              '2020-11-19',
              '2020-11-22',
              selectedCentre,
              TestType.CAR,
              preferedDate.toString(),
            );
          });

          test('selected date is a month in the future', async () => {
            req.session.candidate.eligibilities = [{
              testType: TestType.CAR,
              eligible: true,
              eligibleFrom: '2020-01-01',
              eligibleTo: '2030-01-01',
            }];
            selectedDate = dayjs('2020-12-16');
            preferedDate = dayjs('2020-12-16');
            globalDate = new Date('2020-11-14T14:30:45.979Z');
            MockDate.set(globalDate);
            const eligibility = req.session.candidate.eligibilities.find((elig) => elig.testType === TestType.CAR);

            await appointmentService.getSlots(selectedDate, selectedCentre, TestType.CAR, eligibility, preferedDate.toString());
            expect(mockSchedulingGateway.availableSlots).toHaveBeenCalledWith(
              '2020-12-14',
              '2020-12-20',
              selectedCentre,
              TestType.CAR,
              preferedDate.toString(),
            );
          });
        });

        describe('eligibleFrom is not set', () => {
          test('current date is start of the week', async () => {
            req.session.candidate.eligibilities = [{
              testType: TestType.ERS,
              eligible: true,
              eligibleFrom: '2020-01-01',
              eligibleTo: '2030-01-01',
            }];

            globalDate = new Date('2020-11-16T14:30:45.979Z');
            MockDate.set(globalDate);
            const eligibility = req.session.candidate.eligibilities.find((elig) => elig.testType === TestType.CAR);

            await appointmentService.getSlots(selectedDate, selectedCentre, TestType.ERS, eligibility, preferedDate.toString());
            expect(mockSchedulingGateway.availableSlots).toHaveBeenCalledWith(
              '2020-11-18',
              '2020-11-22',
              selectedCentre,
              TestType.ERS,
              preferedDate.toString(),
            );
          });
          test('current date is a saturday', async () => {
            req.session.candidate.eligibilities = [{
              testType: TestType.ERS,
              eligible: true,
              eligibleFrom: '2020-01-01',
              eligibleTo: '2030-01-01',
            }];

            globalDate = new Date('2020-11-14T14:30:45.979Z');
            MockDate.set(globalDate);
            const eligibility = req.session.candidate.eligibilities.find((elig) => elig.testType === TestType.CAR);

            await appointmentService.getSlots(selectedDate, selectedCentre, TestType.ERS, eligibility, preferedDate.toString());
            expect(mockSchedulingGateway.availableSlots).toHaveBeenCalledWith(
              '2020-11-16',
              '2020-11-22',
              selectedCentre,
              TestType.ERS,
              preferedDate.toString(),
            );
          });
          test('selected date is a month in the future', async () => {
            req.session.candidate.eligibilities = [{
              testType: TestType.ERS,
              eligible: true,
              eligibleFrom: '2020-01-01',
              eligibleTo: '2030-01-01',
            }];
            selectedDate = dayjs('2020-12-16');
            preferedDate = dayjs('2020-12-16');
            globalDate = new Date('2020-11-14T14:30:45.979Z');
            MockDate.set(globalDate);
            const eligibility = req.session.candidate.eligibilities.find((elig) => elig.testType === TestType.CAR);

            await appointmentService.getSlots(selectedDate, selectedCentre, TestType.ERS, eligibility, preferedDate.toString());
            expect(mockSchedulingGateway.availableSlots).toHaveBeenCalledWith(
              '2020-12-14',
              '2020-12-20',
              selectedCentre,
              TestType.ERS,
              preferedDate.toString(),
            );
          });
        });
      });

      describe('DateTo', () => {
        describe('eligibleTo is set', () => {
          test('selected date is the end of the week', async () => {
            req.session.candidate.eligibilities = [{
              testType: TestType.CAR,
              eligible: true,
              eligibleFrom: '2020-01-01',
              eligibleTo: '2030-01-01',
            }];
            selectedDate = dayjs('2020-11-22');
            preferedDate = dayjs('2020-11-22');
            globalDate = new Date('2020-11-14T14:30:45.979Z');
            MockDate.set(globalDate);
            const eligibility = req.session.candidate.eligibilities.find((elig) => elig.testType === TestType.CAR);

            await appointmentService.getSlots(selectedDate, selectedCentre, TestType.CAR, eligibility, preferedDate.toString());
            expect(mockSchedulingGateway.availableSlots).toHaveBeenCalledWith(
              '2020-11-16',
              '2020-11-22',
              selectedCentre,
              TestType.CAR,
              preferedDate.toString(),
            );
          });
          test('selected date is less than 6 months away but the end of that week is more', async () => {
            req.session.candidate.eligibilities = [{
              testType: TestType.CAR,
              eligible: true,
              eligibleFrom: '2020-01-01',
              eligibleTo: '2030-01-01',
            }];
            selectedDate = dayjs('2021-05-15');
            preferedDate = dayjs('2021-05-15');
            globalDate = new Date('2020-11-16T14:30:45.979Z');
            MockDate.set(globalDate);
            const eligibility = req.session.candidate.eligibilities.find((elig) => elig.testType === TestType.CAR);

            await appointmentService.getSlots(selectedDate, selectedCentre, TestType.CAR, eligibility, preferedDate.toString());
            expect(mockSchedulingGateway.availableSlots).toHaveBeenCalledWith(
              '2021-05-10',
              '2021-05-15',
              selectedCentre,
              TestType.CAR,
              preferedDate.toString(),
            );
          });
          test('elibilityTo is less than chosen date', async () => {
            req.session.candidate.eligibilities = [{
              testType: TestType.CAR,
              eligible: true,
              eligibleFrom: '2020-01-01',
              eligibleTo: '2020-11-25',
            }];
            selectedDate = dayjs('2020-11-26');
            preferedDate = dayjs('2020-11-26');
            globalDate = new Date('2020-11-16T14:30:45.979Z');
            MockDate.set(globalDate);
            const eligibility = req.session.candidate.eligibilities.find((elig) => elig.testType === TestType.CAR);

            await appointmentService.getSlots(selectedDate, selectedCentre, TestType.CAR, eligibility, preferedDate.toString());
            expect(mockSchedulingGateway.availableSlots).toHaveBeenCalledWith(
              '2020-11-23',
              '2020-11-25',
              selectedCentre,
              TestType.CAR,
              preferedDate.toString(),
            );
          });
        });
        describe('eligibleTo is not set', () => {
          test('selected date is the end of the week', async () => {
            req.session.candidate.eligibilities = [{
              testType: TestType.ERS,
              eligible: true,
              eligibleFrom: '2020-01-01',
              eligibleTo: '2030-01-01',
            }];
            selectedDate = dayjs('2020-11-22');
            preferedDate = dayjs('2020-11-22');
            globalDate = new Date('2020-11-14T14:30:45.979Z');
            MockDate.set(globalDate);
            const eligibility = req.session.candidate.eligibilities.find((elig) => elig.testType === TestType.CAR);

            await appointmentService.getSlots(selectedDate, selectedCentre, TestType.ERS, eligibility, preferedDate.toString());
            expect(mockSchedulingGateway.availableSlots).toHaveBeenCalledWith(
              '2020-11-16',
              '2020-11-22',
              selectedCentre,
              TestType.ERS,
              preferedDate.toString(),
            );
          });
          test('selected date is less than 6 months away but the end of that week is more', async () => {
            req.session.candidate.eligibilities = [{
              testType: TestType.ERS,
              eligible: true,
              eligibleFrom: '2020-01-01',
              eligibleTo: '2030-01-01',
            }];
            selectedDate = dayjs('2021-05-15');
            preferedDate = dayjs('2021-05-15');
            globalDate = new Date('2020-11-16T14:30:45.979Z');
            MockDate.set(globalDate);
            const eligibility = req.session.candidate.eligibilities.find((elig) => elig.testType === TestType.CAR);

            await appointmentService.getSlots(selectedDate, selectedCentre, TestType.ERS, eligibility, preferedDate.toString());
            expect(mockSchedulingGateway.availableSlots).toHaveBeenCalledWith(
              '2021-05-10',
              '2021-05-15',
              selectedCentre,
              TestType.ERS,
              preferedDate.toString(),
            );
          });
        });
      });
    });

    describe('morning and evening slot tests', () => {
      test('morning slot', async () => {
        selectedDate = dayjs('2021-06-28');
        MockDate.set('2021-01-01T09:00:00.000Z');
        const preferredDay = dayjs().tz().toString();
        const eligibility = req.session.candidate.eligibilities.find((elig) => elig.testType === TestType.CAR);

        const { slotsByDate, kpiIdentifiers } = await appointmentService.getSlots(selectedDate, selectedCentre, TestType.CAR, eligibility, preferredDay);

        expect(slotsByDate[toISODateString('2021-06-28T09:00:00.000Z')]).toEqual([{
          quantity: 1,
          startDateTime: '2021-06-28T09:00:00.000Z',
          testCentreId: '0001:SITE-0207',
          testTypes: [
            'CAR',
          ],
        }]);
        expect(kpiIdentifiers['dateAvailableOnOrBeforePreferredDate']).toBeUndefined();
      });
      test('afternoon slot', async () => {
        selectedDate = dayjs('2021-06-28');
        MockDate.set('2021-01-01T09:00:00.000Z');
        const preferredDay = dayjs().tz().toString();
        const eligibility = req.session.candidate.eligibilities.find((elig) => elig.testType === TestType.CAR);

        const { slotsByDate, kpiIdentifiers } = await appointmentService.getSlots(selectedDate, selectedCentre, TestType.CAR, eligibility, preferredDay);

        expect(slotsByDate[toISODateString('2021-06-29T13:00:00.000Z')]).toEqual([{
          quantity: 1,
          startDateTime: '2021-06-29T13:00:00.000Z',
          testCentreId: '0001:SITE-0207',
          testTypes: [
            'CAR',
          ],
        }]);
        expect(kpiIdentifiers['dateAvailableOnOrBeforePreferredDate']).toBeUndefined();
      });
    });
  });

  describe('getPreviousDateMobile Tests', () => {
    test('startOfWeekDiff is greater than 2', () => {
      const date = dayjs().tz();
      const selectedDate = date.add(1, 'day').endOf('day');

      const Dates = appointmentService.getPreviousDateMobile(selectedDate);
      expect(Dates.toString()).toEqual('2020-11-09');
    });

    test('startOfWeekDiff is less than 2', () => {
      const date = dayjs().tz();
      const selectedDate = date.subtract(2, 'day').endOf('day');

      const Dates = appointmentService.getPreviousDateMobile(selectedDate);
      expect(Dates.toString()).toEqual('2020-11-07');
    });
  });

  describe('getNextDateMobile Tests', () => {
    test('endOfWeekDiff is greater than or equal -2', () => {
      const date = dayjs().tz();
      const selectedDate = date.add(1, 'day').endOf('day');

      const Dates = appointmentService.getNextDateMobile(selectedDate);
      expect(Dates.toString()).toEqual('2020-11-14');
    });

    test('endOfWeekDiff is less than -2', () => {
      const date = dayjs().tz();
      const selectedDate = date.subtract(2, 'day').endOf('day');

      const Dates = appointmentService.getNextDateMobile(selectedDate);
      expect(Dates.toString()).toEqual('2020-11-12');
    });
  });

  describe('getWeekViewDatesMobile', () => {
    test('When selected date is not at the end or start of the week', () => {
      const selectedDate = dayjs().tz();
      const startOfWeek = selectedDate.startOf('isoWeek').toString();
      const endOfWeek = selectedDate.endOf('isoWeek').toString();
      expect(appointmentService.getWeekViewDatesMobile(selectedDate, startOfWeek, endOfWeek)).toEqual(['2020-11-10', '2020-11-11', '2020-11-12']);
    });

    test('When selected date is at the start of the week', () => {
      const selectedDate = (dayjs().tz()).startOf('isoWeek');
      const startOfWeek = selectedDate.startOf('isoWeek').toString();
      const endOfWeek = selectedDate.endOf('isoWeek').toString();
      expect(appointmentService.getWeekViewDatesMobile(selectedDate, startOfWeek, endOfWeek)).toEqual(['2020-11-09', '2020-11-10', '2020-11-11']);
    });

    test('When selected date is at the end of the week', () => {
      const selectedDate = (dayjs().tz()).endOf('isoWeek');
      const startOfWeek = selectedDate.startOf('isoWeek').toString();
      const endOfWeek = selectedDate.endOf('isoWeek').toString();
      expect(appointmentService.getWeekViewDatesMobile(selectedDate, startOfWeek, endOfWeek)).toEqual(['2020-11-13', '2020-11-14', '2020-11-15']);
    });
  });

  describe('getWeekViewDatesDesktop', () => {
    const expectedReturnDates: string[] = [
      '2020-11-09',
      '2020-11-10',
      '2020-11-11',
      '2020-11-12',
      '2020-11-13',
      '2020-11-14',
      '2020-11-15',
    ];

    test('Returns a string array of dates for the given week when selectedDate is not at the start or end of week', () => {
      const selectedDate = dayjs().tz();
      expect(appointmentService.getWeekViewDatesDesktop(selectedDate)).toEqual(expectedReturnDates);
    });

    test('Returns a string array of dates for the given week when selectedDate is at the start of the week', () => {
      const selectedDate = (dayjs().tz()).startOf('isoWeek');
      expect(appointmentService.getWeekViewDatesDesktop(selectedDate)).toEqual(expectedReturnDates);
    });

    test('Returns a string array of dates for the given week when selectedDate is at the end of the week', () => {
      const selectedDate = (dayjs().tz()).endOf('isoWeek');
      expect(appointmentService.getWeekViewDatesDesktop(selectedDate)).toEqual(expectedReturnDates);
    });
  });
});
