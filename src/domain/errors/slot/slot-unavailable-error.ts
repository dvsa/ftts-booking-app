class SlotUnavailableError extends Error {
  constructor() {
    super('Slot is unavailable');
  }
}

export default SlotUnavailableError;
