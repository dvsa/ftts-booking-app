import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';

export const buildPaymentReference = (limit: number): string => {
  const uuid: string = uuidv4();
  const uuidNoDashes = uuid.replace(/-/g, '');
  return `FTT-${uuidNoDashes.substring(limit, 32)}-${dayjs().format('YYMMDDHHMMss')}`.toUpperCase();
};

export const buildPersonReference = (): string => '999999999'; // TODO Remove hardcoded person reference
