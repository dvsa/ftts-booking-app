import { Request } from 'express';

import { store } from '../../../src/services/session';
import { UtcDate } from '../../../src/domain/utc-date';
import { LOCALE, TARGET } from '../../../src/domain/enums';
import { mockCentres, mockSlots } from '../../../src/repository/mock-data';

describe('Session storage', () => {
  const mockRequest = { session: {} } as Request;
  let mockStore;
  let req: any = {};

  beforeEach(() => {
    req = {
      session: {
        currentBooking: {},
        editedLocationTime: {},
      },
    };
    mockStore = store;
    mockStore.reset(mockRequest);
  });

  test('base methods exist', () => {
    expect(mockStore.reset).toBeDefined();
    expect(mockStore.active).toBeDefined();
    expect(mockRequest.session?.candidate).toBeDefined();
    expect(mockRequest.session?.currentBooking).toBeDefined();
  });

  describe('candidate methods', () => {
    test('sucessfully updates session', () => {
      const candidate = {
        firstnames: 'Joseph',
        surname: 'Bloggs',
      };

      store.candidate.update(req, candidate);

      expect(req.session.candidate.firstnames).toEqual('Joseph');
      expect(req.session.candidate.surname).toEqual('Bloggs');
    });

    test('successfully retrieves candidate', () => {
      const candidate = {
        firstnames: 'Joseph',
        surname: 'Bloggs',
      };
      store.candidate.update(req, candidate);

      const actual = store.candidate.get(req);

      expect(actual.firstnames).toEqual('Joseph');
      expect(actual.surname).toEqual('Bloggs');
    });

    test('can reset candidate data', () => {
      const candidate = {
        firstnames: 'Joseph',
        surname: 'Bloggs',
      };
      store.candidate.update(req, candidate);

      store.candidate.reset(req);

      const actual = store.candidate.get(req);
      expect(actual).toStrictEqual({});
    });

    test('can get users licence', () => {
      store.candidate.update(req, {
        firstnames: 'Jane',
        surname: 'Smith',
        licenceNumber: 'JONES061102W97YT',
        entitlements: 'B,A',
        dateOfBirth: '2000-01-01',
      });

      const actual = store.candidate.licence(req);

      expect(actual.birthDate).toEqual(new UtcDate(new Date('2000-01-01')));
      expect(actual.entitlements.items.length).toBe(2);
      expect(actual.num.value).toBe('JONES061102W97YT');
    });
  });

  describe('currentBooking methods', () => {
    test('setting test data', () => {
      store.currentBooking.update(req, {
        centre: mockCentres[0],
      });

      const actual = store.currentBooking.get(req);

      expect(actual.centre).toBe(mockCentres[0]);
    });

    test('reset test data', () => {
      store.currentBooking.update(req, {
        centre: mockCentres[0],
      });

      store.currentBooking.reset(req);

      const actual = store.currentBooking.get(req);
      expect(actual).toStrictEqual({});
    });
  });

  describe('editLocationTime methods', () => {
    beforeEach(() => {
      store.editedLocationTime.update(req, {
        dateTime: mockSlots[0].startDateTime,
        centre: mockCentres[0],
      });
    });

    test('successsfully update and retrieve edited location and time data', () => {
      const result = store.editedLocationTime.get(req);

      expect(result.centre).toBe(mockCentres[0]);
      expect(result.dateTime).toBe(mockSlots[0].startDateTime);
    });

    test('succcessfully resets the edited location and time data', () => {
      store.editedLocationTime.reset(req);

      expect(req.session.editedLocationTime).toStrictEqual({});
    });
  });

  describe('manageBooking editLocationTime methods', () => {
    beforeEach(() => {
      store.manageBookingEdits.update(req, {
        dateTime: mockSlots[0].startDateTime,
        centre: mockCentres[0],
      });
    });

    test('successsfully update and retrieve edited location and time data', () => {
      const result = store.manageBookingEdits.get(req);

      expect(result.centre).toBe(mockCentres[0]);
      expect(result.dateTime).toBe(mockSlots[0].startDateTime);
    });

    test('succcessfully resets the edited location and time data', () => {
      store.manageBookingEdits.reset(req);

      expect(req.session.manageBookingEdits).toStrictEqual({});
    });
  });

  describe('Setting global target', () => {
    test('can set and retrieve target', () => {
      store.target.set(req, TARGET.NI);

      const actual = store.target.get(req);

      expect(actual).toBe(TARGET.NI);
    });
  });

  describe('Setting global locale', () => {
    test('can set and retrieve locale', () => {
      store.locale.set(req, LOCALE.CY);

      const actual = store.locale.get(req);

      expect(actual).toBe(LOCALE.CY);
    });
  });
});
