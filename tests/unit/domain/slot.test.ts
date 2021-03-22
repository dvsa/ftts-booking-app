import { Slots } from '../../../src/domain/slot';

describe('Slots', () => {
  const fakeMorningSlot = {
    slotId: 'slot1',
    providerBookingId: 1,
    testCentreId: 'testMorning',
    testDateTime: '2019-01-29T08:00:00.000Z',
  };
  const fakeAfternoonSlot = {
    slotId: 'slot2',
    providerBookingId: 2,
    testCentreId: 'testAfternoon',
    testDateTime: '2019-01-29T14:00:00.000Z',
  };
  const fakeSlots = [fakeMorningSlot, fakeAfternoonSlot];
  const slots = new Slots(fakeSlots);
  const emptySlots = new Slots([]);

  describe('morningSlots()', () => {
    test('retrieves morning slots', () => {
      expect(slots.morningSlots()).toStrictEqual([fakeMorningSlot]);
    });
    test('is empty when there are no morning slots', () => {
      expect(emptySlots.afternoonSlots()).toHaveLength(0);
    });
  });

  describe('afternoonSlots()', () => {
    test('retrieves afternoon slots', () => {
      expect(slots.afternoonSlots()).toStrictEqual([fakeAfternoonSlot]);
    });
    test('is empty when there are no afternoon slots', () => {
      expect(emptySlots.afternoonSlots()).toHaveLength(0);
    });
  });

  describe('distinctDates()', () => {
    test('retrieves unique dates', () => {
      expect(slots.distinctDates()).toStrictEqual(['2019-01-29']);
    });
    test('is empty when there are no distinct dates', () => {
      expect(emptySlots.distinctDates()).toHaveLength(0);
    });
  });
});
