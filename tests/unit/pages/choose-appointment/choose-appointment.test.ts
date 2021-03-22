import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isoWeek from 'dayjs/plugin/isoWeek';
import MockDate from 'mockdate';
import { FutureBookingDate } from '../../../../src/domain/future-booking-date';
import { ValidatorSchema } from '../../../../src/middleware/request-validator';
import controller, { ChooseAppointmentController } from '../../../../src/pages/choose-appointment/choose-appointment';

import { VisibleMonths } from '../../../../src/pages/choose-appointment/visible-months';
import { mockCentres, mockSlots } from '../../../../src/repository/mock-data';
import { Scheduler } from '../../../../src/services/scheduling/scheduling-service';
import { TestType } from '../../../../src/domain/enums';
import { mockCurrentBooking } from '../../../mocks/data/manage-bookings';

jest.mock('../../../../src/services/scheduling/scheduling-service');

describe('Choose appointment tests', () => {
  beforeEach(() => {
    const globalDate = new Date('2020-11-11T14:30:45.979Z');
    MockDate.set(globalDate);
  });

  afterEach(() => {
    MockDate.reset();
  });

  describe('Choose appointment controller validation schema checks', () => {
    test('GET request', () => {
      const expectedValidationSchema: ValidatorSchema = {
        current: {
          in: ['query'],
          optional: true,
          custom: {
            options: VisibleMonths.isValid,
          },
        },
        theoryTestDate: {
          in: ['query'],
          optional: true,
          custom: {
            options: FutureBookingDate.isValid,
          },
        },
      };
      expect(controller.getSchemaValidation).toStrictEqual(expectedValidationSchema);
    });

    test('POST request', () => {
      const expectedValidationSchema: ValidatorSchema = {
        slotId: {
          in: ['body'],
          isEmpty: {
            errorMessage: 'Booking Slot is required. Please pick a Slot.',
            negated: true,
          },
        },
        current: {
          in: ['query'],
          optional: true,
          custom: {
            options: VisibleMonths.isValid,
          },
        },
        theoryTestDate: {
          in: ['query'],
          optional: true,
          custom: {
            options: FutureBookingDate.isValid,
          },
        },
      };
      expect(controller.postSchemaValidation).toStrictEqual(expectedValidationSchema);
    });
  });

  describe('Choose appointment controller', () => {
    let chooseAppointmentController: ChooseAppointmentController;
    let req: any;
    let res: any;
    const schedulingAPI = Scheduler.prototype;

    beforeEach(() => {
      schedulingAPI.availableSlots = jest.fn().mockReturnValue([{
        startDateTime: '2022-01-01T00:00',
      }]);
      chooseAppointmentController = new ChooseAppointmentController(schedulingAPI);

      req = {
        body: {},
        query: {
          theoryTestDate: '12-08-2040',
        },
        hasErrors: false,
        session: {
          candidate: {
            firstnames: 'WENDY',
            surname: 'JONES',
            licenceNumber: 'JONES061102W97YT',
            dateOfBirth: '2002-11-10',
            entitlements: 'AM,A1,B',
          },
          currentBooking: {
            testType: TestType.Car,
            centre: mockCentres[0],
          },
          journey: {
            inEditMode: false,
          },
          editedLocationTime: {},
        },
      };

      res = {
        res_url: '',
        res_status: 200,
        res_template: '',
        status: (status: number): object => {
          res.res_status = status;
          return res;
        },
        redirect: (url: string): void => {
          res.res_url = url;
          res.res_status = 302;
        },
        render: (template: string, args: object): void => {
          res.res_template = template;
          res.args = args;
        },
      };
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    describe('GET request', () => {
      test('redirects to /select-test-centre when missing "centre" param', async () => {
        delete req.session.currentBooking.centre;
        req.query.hasOwnProperty = (): boolean => false;

        await chooseAppointmentController.get(req, res);

        expect(res.res_url).toStrictEqual('/select-test-centre');
      });

      test('when in manage booking mode redirects to manage-booking/select-test-centre when missing "centre" param', async () => {
        req.session.journey.inManagedBookingEditMode = true;
        req.session.currentBooking = mockCurrentBooking();
        delete req.session.currentBooking.centre;
        req.query.hasOwnProperty = (): boolean => false;

        await chooseAppointmentController.get(req, res);

        expect(res.res_url).toStrictEqual('/manage-booking/select-test-centre');
      });

      test('back link goes to select date', async () => {
        await chooseAppointmentController.get(req, res);

        expect(res.args).toStrictEqual(expect.objectContaining({
          selectDateLink: '/select-date',
        }));
      });

      test('when in manage booking mode, back link goes to manage booking select date', async () => {
        req.session.journey.inManagedBookingEditMode = true;
        req.session.currentBooking = mockCurrentBooking();
        req.url = '/manage-booking/find-test-centre';

        await chooseAppointmentController.get(req, res);

        expect(res.args).toStrictEqual(expect.objectContaining({
          selectDateLink: '/manage-booking/select-date',
        }));
      });

      test('when in manage booking mode, back link goes to manage choices if choice was choose appointment screen', async () => {
        req.session.journey.inManagedBookingEditMode = true;
        req.session.journey.managedBookingRescheduleChoice = '/manage-booking/choose-appointment';
        req.url = '/manage-booking/choose-appointment';
        req.session.currentBooking = mockCurrentBooking();

        await chooseAppointmentController.get(req, res);

        expect(res.args).toStrictEqual(expect.objectContaining({
          selectDateLink: '/manage-change-location-time/mockRef',
        }));
      });

      test('returns 400 response to same page when request validation fails', async () => {
        req.query.centre = true;
        req.hasErrors = true;
        req.errors = [{}];

        await chooseAppointmentController.get(req, res);

        expect(res.res_status).toBe(400);
        expect(res.res_template).toBe('choose-appointment');
      });

      test('renders choose-appointment template', async () => {
        req.query.theoryTestDate = '12-08-2040';
        req.query.centre = ['0001:Site097'];

        await chooseAppointmentController.get(req, res);

        expect(res.res_template).toBe('choose-appointment');
      });

      test('renders choose-appointment with the changed test centre when in edit mode', async () => {
        req.session.journey.inEditMode = true;
        req.session.editedLocationTime = { centre: mockCentres[1] };

        await chooseAppointmentController.get(req, res);

        expect(res.res_template).toBe('choose-appointment');
        expect(res.args).toEqual(expect.objectContaining({ selectedCentre: mockCentres[1] }));
      });
    });

    describe('POST request', () => {
      test('returns to same page when request validation fails', async () => {
        req.query.theoryTestDate = '12-08-2040';
        req.query.centre = ['0001:Site097'];
        req.hasErrors = true;
        req.errors = [{}];

        await chooseAppointmentController.post(req, res);

        expect(res.res_template).toBe('choose-appointment');
      });

      test('return 500 response if booking Slot reservation is unsuccessful', async () => {
        await chooseAppointmentController.post(req, res);

        expect(res.res_status).toBe(500);
        expect(res.res_template).toBe('error500');
      });

      describe('redirects to /check-your-answers after successful booking Slot reservation', () => {
        test('when not in edit mode stores the chosen slot on the booking session object', async () => {
          req.body = {
            slotId: 'someslot',
            chosenCentre: 'someCentre',
          };
          await chooseAppointmentController.post(req, res);

          expect(res.res_url).toStrictEqual('/check-your-answers');
          expect(req.session.currentBooking).toEqual(expect.objectContaining({ dateTime: 'someslot' }));
          expect(req.session.editedLocationTime).not.toEqual(
            expect.objectContaining({ dateTime: 'someslot' }),
          );
        });

        test('when in edit mode stores the newly updated slot on the edited location time session object', async () => {
          req.body = {
            slotId: 'newly-changed-slot',
            chosenCentre: 'someCentre',
          };
          req.session.journey.inEditMode = true;

          await chooseAppointmentController.post(req, res);

          expect(res.res_url).toStrictEqual('/check-your-answers');
          expect(req.session.editedLocationTime).toStrictEqual({
            dateTime: 'newly-changed-slot',
          });
          expect(req.session.currentBooking).not.toEqual(
            expect.objectContaining({ dateTime: 'newly-changed-slot' }),
          );
        });

        test('when in managed booking mode, stores the newly updated slot in managed booking edited location time session object', async () => {
          req.body = {
            slotId: 'newly-changed-slot',
            chosenCentre: 'someCentre',
          };
          req.session.journey.inManagedBookingEditMode = true;

          await chooseAppointmentController.post(req, res);

          expect(res.res_url).toStrictEqual('/manage-booking/check-change');
          expect(req.session.manageBookingEdits).toStrictEqual({
            dateTime: 'newly-changed-slot',
          });
        });
      });
    });
  });

  describe('appointment slot processing for first day in result set', () => {
    let chooseAppointmentController: ChooseAppointmentController;
    let selectedCentre;
    let returnedDays;
    let returnedSlots;

    beforeEach(async () => {
      dayjs.extend(utc);
      dayjs.extend(timezone);
      dayjs.extend(isoWeek);
      Scheduler.prototype.availableSlots = jest.fn().mockImplementation(() => Promise.resolve(mockSlots));
      const schedulingAPI = Scheduler.prototype;
      chooseAppointmentController = new ChooseAppointmentController(schedulingAPI);
      [selectedCentre] = mockCentres;
      const selectedDate = dayjs('2020-11-16');

      const { days, slots } = await chooseAppointmentController.getAppointments(selectedDate, selectedCentre, TestType.Car);

      returnedDays = days;
      returnedSlots = slots;
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('returns days and slots', () => {
      expect(returnedDays.size).toEqual(7);
      expect(returnedSlots.size).toEqual(34);
    });

    [
      ['2020-11-16', 0, true],
      ['2020-11-17', 1, true],
      ['2020-11-18', 2, true],
      ['2020-11-19', 3, false],
      ['2020-11-20', 4, false],
      ['2020-11-21', 5, false],
      ['2020-11-22', 6, false],
    ].forEach(([expectedDate, expectedOffset, expectedMobile]) => {
      test(`Check ${expectedDate} is displayed and show on mobile is ${expectedMobile}`, () => {
        const expectedDateObj = dayjs(expectedDate as string);

        const dateUnderTest = returnedDays.get(expectedDateObj.toISOString());

        expect(returnedDays.has(expectedDateObj.toISOString())).toBeTruthy();
        expect(dateUnderTest.distance).toEqual(expectedOffset);
        expect(dateUnderTest.mobile).toBe(expectedMobile);
      });
    });
  });

  describe('appointment slot processing for second day in result set', () => {
    let chooseAppointmentController: ChooseAppointmentController;
    let selectedCentre;
    let returnedDays;
    let returnedSlots;
    const schedulingAPI = Scheduler.prototype;

    beforeEach(async () => {
      dayjs.extend(utc);
      dayjs.extend(timezone);
      dayjs.extend(isoWeek);
      schedulingAPI.availableSlots = jest.fn().mockImplementation(() => Promise.resolve(mockSlots));
      chooseAppointmentController = new ChooseAppointmentController(schedulingAPI);
      [selectedCentre] = mockCentres;

      const selectedDate = dayjs('2020-11-17');

      const { days, slots } = await chooseAppointmentController.getAppointments(selectedDate, selectedCentre, TestType.Car);
      returnedDays = days;
      returnedSlots = slots;
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('happy path', () => {
      expect(returnedDays.size).toEqual(7);
      expect(returnedSlots.size).toEqual(31);
    });

    [
      ['2020-11-16', -1, true],
      ['2020-11-17', 0, true],
      ['2020-11-18', 1, true],
      ['2020-11-19', 2, false],
      ['2020-11-20', 3, false],
      ['2020-11-21', 4, false],
      ['2020-11-22', 5, false],
    ].forEach(([expectedDate, expectedOffset, expectedMobile]) => {
      test(`Check ${expectedDate} is displayed and show on mobile is ${expectedMobile}`, () => {
        const expectedDateObj = dayjs(expectedDate as string);

        const dateUnderTest = returnedDays.get(expectedDateObj.toISOString());

        expect(returnedDays.has(expectedDateObj.toISOString())).toBeTruthy();
        expect(dateUnderTest.distance).toEqual(expectedOffset);
        expect(dateUnderTest.mobile).toBe(expectedMobile);
      });
    });
  });

  describe('appointment slot processing for day in middle of result set', () => {
    let chooseAppointmentController: ChooseAppointmentController;
    let selectedCentre;
    let returnedDays;
    let returnedSlots;
    const schedulingAPI = Scheduler.prototype;

    beforeEach(async () => {
      dayjs.extend(utc);
      dayjs.extend(timezone);
      dayjs.extend(isoWeek);
      schedulingAPI.availableSlots = jest.fn().mockImplementation(() => Promise.resolve(mockSlots));
      chooseAppointmentController = new ChooseAppointmentController(schedulingAPI);
      [selectedCentre] = mockCentres;

      const selectedDate = dayjs('2020-11-19');

      const { days, slots } = await chooseAppointmentController.getAppointments(selectedDate, selectedCentre, TestType.Car);
      returnedDays = days;
      returnedSlots = slots;
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('happy path', () => {
      expect(returnedDays.size).toEqual(7);
      expect(returnedSlots.size).toEqual(17);
    });

    [
      ['2020-11-16', -3, false],
      ['2020-11-17', -2, false],
      ['2020-11-18', -1, true],
      ['2020-11-19', 0, true],
      ['2020-11-20', 1, true],
      ['2020-11-21', 2, false],
      ['2020-11-22', 3, false],
    ].forEach(([expectedDate, expectedOffset, expectedMobile]) => {
      test(`Check ${expectedDate} is displayed and show on mobile is ${expectedMobile}`, () => {
        const expectedDateObj = dayjs(expectedDate as string);

        const dateUnderTest = returnedDays.get(expectedDateObj.toISOString());

        expect(returnedDays.has(expectedDateObj.toISOString())).toBeTruthy();
        expect(dateUnderTest.distance).toEqual(expectedOffset);
        expect(dateUnderTest.mobile).toBe(expectedMobile);
      });
    });
  });

  describe('appointment slot processing for the penultimate day in the result set', () => {
    let chooseAppointmentController: ChooseAppointmentController;
    let selectedCentre;
    let returnedDays;
    let returnedSlots;
    const schedulingAPI = Scheduler.prototype;

    beforeEach(async () => {
      schedulingAPI.availableSlots = jest.fn().mockImplementation(() => Promise.resolve(mockSlots));
      chooseAppointmentController = new ChooseAppointmentController(schedulingAPI);
      [selectedCentre] = mockCentres;
      const selectedDate = dayjs('2020-11-20');

      const { days, slots } = await chooseAppointmentController.getAppointments(selectedDate, selectedCentre, TestType.Car);
      returnedDays = days;
      returnedSlots = slots;
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('happy path', () => {
      expect(returnedDays.size).toEqual(7);
      expect(returnedSlots.size).toEqual(36);
    });

    [
      ['2020-11-16', -4, false],
      ['2020-11-17', -3, false],
      ['2020-11-18', -2, false],
      ['2020-11-19', -1, true],
      ['2020-11-20', 0, true],
      ['2020-11-21', 1, true],
      ['2020-11-22', 2, false],
    ].forEach(([expectedDate, expectedOffset, expectedMobile]) => {
      test(`Check ${expectedDate} is displayed and show on mobile is ${expectedMobile}`, () => {
        const expectedDateObj = dayjs(expectedDate as string);

        const dateUnderTest = returnedDays.get(expectedDateObj.toISOString());

        expect(returnedDays.has(expectedDateObj.toISOString())).toBeTruthy();
        expect(dateUnderTest.distance).toEqual(expectedOffset);
        expect(dateUnderTest.mobile).toBe(expectedMobile);
      });
    });
  });

  describe('appointment slot processing for last day of the result set', () => {
    let chooseAppointmentController: ChooseAppointmentController;
    let selectedCentre;
    let returnedDays;
    let returnedSlots;
    const schedulingAPI = Scheduler.prototype;

    beforeEach(async () => {
      schedulingAPI.availableSlots = jest.fn().mockImplementation(() => Promise.resolve(mockSlots));
      chooseAppointmentController = new ChooseAppointmentController(schedulingAPI);
      [selectedCentre] = mockCentres;

      const selectedDate = dayjs('2020-11-22');

      const { days, slots } = await chooseAppointmentController.getAppointments(selectedDate, selectedCentre, TestType.Car);
      returnedDays = days;
      returnedSlots = slots;
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('happy path', () => {
      expect(returnedDays.size).toEqual(7);
      expect(returnedSlots.size).toEqual(0);
    });

    [
      ['2020-11-16', -6, false],
      ['2020-11-17', -5, false],
      ['2020-11-18', -4, false],
      ['2020-11-19', -3, false],
      ['2020-11-20', -2, true],
      ['2020-11-21', -1, true],
      ['2020-11-22', 0, true],
    ].forEach(([expectedDate, expectedOffset, expectedMobile]) => {
      test(`Check ${expectedDate} is displayed and show on mobile is ${expectedMobile}`, () => {
        const expectedDateObj = dayjs(expectedDate as string);

        const dateUnderTest = returnedDays.get(expectedDateObj.toISOString());

        expect(returnedDays.has(expectedDateObj.toISOString())).toBeTruthy();
        expect(dateUnderTest.distance).toEqual(expectedOffset);
        expect(dateUnderTest.mobile).toBe(expectedMobile);
      });
    });
  });

  describe('appointment slot processing to account for GMT/BST', () => {
    let chooseAppointmentController: ChooseAppointmentController;
    let selectedCentre;
    const schedulingAPI = Scheduler.prototype;

    beforeEach(() => {
      schedulingAPI.availableSlots = jest.fn().mockImplementation(() => Promise.resolve([{
        testCentreId: '0001:SITE-0207',
        testTypes: [
          'CAR',
        ],
        startDateTime: '2021-03-27T09:00:00.000Z',
        quantity: 1,
      }, {
        testCentreId: '0001:SITE-0207',
        testTypes: [
          'CAR',
        ],
        startDateTime: '2021-03-28T09:00:00.000Z',
        quantity: 1,
      }]));
      chooseAppointmentController = new ChooseAppointmentController(schedulingAPI);
      [selectedCentre] = mockCentres;
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('GMT', async () => {
      const selectedDate = dayjs('2021-03-27');
      const { slots } = await chooseAppointmentController.getAppointments(selectedDate, selectedCentre, TestType.Car);

      expect(slots.entries().next().value[1].startDateTime).toEqual('2021-03-27T09:00:00.000Z');
      expect(slots.entries().next().value[1].displayTime).toEqual('9:00');
    });

    test('BST', async () => {
      const selectedDate = dayjs('2021-03-28');
      const { slots } = await chooseAppointmentController.getAppointments(selectedDate, selectedCentre, TestType.Car);

      expect(slots.entries().next().value[1].startDateTime).toEqual('2021-03-28T09:00:00.000Z');
      expect(slots.entries().next().value[1].displayTime).toEqual('10:00');
    });
  });
});
