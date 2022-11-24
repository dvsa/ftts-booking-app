import { Logger as AzureLogger } from '@dvsa/azure-logger';
import { Logger } from '../../../src/helpers/logger';

const mockAzureRef = 'mockAzureRef';
const mockIncapId = 'mockIncapId';
const mockSessionId = 'mockSessionId';

jest.mock('cls-hooked', () => ({
  getNamespace: () => ({
    get: (key: string) => {
      if (key === 'X-Azure-Ref') {
        return 'mockAzureRef';
      }
      if (key === 'INCAP-REQ-ID') {
        return 'mockIncapId';
      }
      if (key === 'sessionId') {
        return mockSessionId;
      }
      throw new Error(`Key '${key}' not found'`);
    },
  }),
}));
jest.mock('@dvsa/azure-logger');

describe('Logger', () => {
  let logger: Logger;
  const msg = 'test message';
  const props = { candidateId: 'mockCandidateId' };

  beforeEach(() => {
    jest.resetAllMocks();

    logger = new Logger('FTTS', 'ftts-booking-app');
  });

  test('logs critical', () => {
    logger.critical(msg, props);

    expect(AzureLogger.prototype.critical).toHaveBeenCalledWith(msg, expect.objectContaining({
      ...props,
      sessionId: mockSessionId,
      'X-Azure-Ref': mockAzureRef,
      'INCAP-REQ-ID': mockIncapId,
    }));
  });

  test('logs warning', () => {
    logger.warn(msg, props);

    expect(AzureLogger.prototype.warn).toHaveBeenCalledWith(msg, expect.objectContaining({
      ...props,
      sessionId: mockSessionId,
      'X-Azure-Ref': mockAzureRef,
      'INCAP-REQ-ID': mockIncapId,
    }));
  });

  test('logs event', () => {
    logger.event('event name', msg, props);

    expect(AzureLogger.prototype.event).toHaveBeenCalledWith('event name', msg, expect.objectContaining({
      ...props,
      sessionId: mockSessionId,
      'X-Azure-Ref': mockAzureRef,
      'INCAP-REQ-ID': mockIncapId,
    }));
  });

  test('logs request', () => {
    logger.request(msg, props);

    expect(AzureLogger.prototype.request).toHaveBeenCalledWith(msg, expect.objectContaining({
      ...props,
      sessionId: mockSessionId,
      'X-Azure-Ref': mockAzureRef,
      'INCAP-REQ-ID': mockIncapId,
    }));
  });

  test('logs dependency', () => {
    logger.dependency(msg, 'data', props);

    expect(AzureLogger.prototype.dependency).toHaveBeenCalledWith(msg, 'data', expect.objectContaining({
      ...props,
      sessionId: mockSessionId,
      'X-Azure-Ref': mockAzureRef,
      'INCAP-REQ-ID': mockIncapId,
    }));
  });

  test('logs security', () => {
    logger.security(msg, props);

    expect(AzureLogger.prototype.security).toHaveBeenCalledWith(msg, expect.objectContaining({
      ...props,
      sessionId: mockSessionId,
      'X-Azure-Ref': mockAzureRef,
      'INCAP-REQ-ID': mockIncapId,
    }));
  });

  test('logs audit', () => {
    logger.audit(msg, props);

    expect(AzureLogger.prototype.audit).toHaveBeenCalledWith(msg, expect.objectContaining({
      ...props,
      sessionId: mockSessionId,
      'X-Azure-Ref': mockAzureRef,
      'INCAP-REQ-ID': mockIncapId,
    }));
  });

  test('logs log', () => {
    logger.log(msg, props);

    expect(AzureLogger.prototype.log).toHaveBeenCalledWith(msg, expect.objectContaining({
      ...props,
      sessionId: mockSessionId,
      'X-Azure-Ref': mockAzureRef,
      'INCAP-REQ-ID': mockIncapId,
    }));
  });

  test('logs info', () => {
    logger.info(msg, props);

    expect(AzureLogger.prototype.info).toHaveBeenCalledWith(msg, expect.objectContaining({
      ...props,
      sessionId: mockSessionId,
      'X-Azure-Ref': mockAzureRef,
      'INCAP-REQ-ID': mockIncapId,
    }));
  });

  test('logs debug', () => {
    logger.debug(msg, props);

    expect(AzureLogger.prototype.debug).toHaveBeenCalledWith(msg, expect.objectContaining({
      ...props,
      sessionId: mockSessionId,
      'X-Azure-Ref': mockAzureRef,
      'INCAP-REQ-ID': mockIncapId,
    }));
  });
});
