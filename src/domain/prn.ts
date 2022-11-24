import { Meta } from 'express-validator';
import { logger } from '../helpers/logger';
import { Target } from './enums';

export class PRN {
  public static isValid(prn: string, { req }: Meta): boolean {
    return PRN.isPRNValid(prn, req?.session?.target as Target || Target.GB);
  }

  public static isPRNValid(prn: string, target: Target): boolean {
    if (prn === undefined) {
      throw new Error('PRN is undefined');
    }

    if (prn.trim().length <= 0) {
      throw new Error('PRN is empty');
    }

    if (target === Target.NI) {
      if (prn.trim().length > 16) {
        logger.debug('PRN:isPRNValid PRN is invalid', { target, prnLength: prn.trim() });
        throw new Error('PRN is invalid');
      }
    }
    if (target === Target.GB) {
      if (prn.trim().length > 6) {
        logger.debug('PRN:isPRNValid PRN is invalid', { target, prnLength: prn.trim() });
        throw new Error('PRN is invalid');
      }
    }

    if (!(/^\d+$/.test(prn.trim()))) {
      logger.debug('PRN:isPRNValid PRN is invalid', { target, prnLength: prn.trim() });
      throw new Error('PRN is invalid');
    }

    return true;
  }
}
