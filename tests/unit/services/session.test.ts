import { store } from '../../../src/services/session';

jest.mock('uuid', () => ({
  v4: () => 'mockUuid',
}));

describe('Session storage', () => {
  let req;
  let res;

  let mockStore;

  beforeEach(() => {
    mockStore = store;

    req = {
      session: {
        journey: {},
      },
    };
  });

  test('base methods exist', () => {
    expect(mockStore.reset).toBeDefined();
  });

  describe('reset', () => {
    test('should reset session if one is available', () => {
      req.session.candidate = {
        firstName: 'mockName',
      };
      req.session.journey.inEditMode = true;
      req.session.manageBooking = 'some manage booking object';

      mockStore.reset(req, res);

      expect(req.session.journey.inEditMode).toBe(false);
      expect(req.session.journey.inManagedBookingEditMode).toBe(false);
      expect(req.session.journey.inManageBookingMode).toBe(false);
      expect(req.session.journey.managedBookingRescheduleChoice).toBe('');

      expect(req.session.candidate).toBeUndefined();
      expect(req.session.currentBooking).toBeUndefined();
      expect(req.session.testCentreSearch).toBeUndefined();
      expect(req.session.testCentres).toBeUndefined();
      expect(req.session.editedLocationTime).toBeUndefined();
      expect(req.session.manageBooking).toBeUndefined();
      expect(req.session.manageBookingEdits).toBeUndefined();
      expect(req.session.priceLists).toBeUndefined();
      expect(req.session.sessionId).toStrictEqual('mockUuid');
    });
  });
});
