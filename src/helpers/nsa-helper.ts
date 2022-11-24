import { CRMBookingStatus } from '../services/crm-gateway/enums';
import { CRMBookingDetails } from '../services/crm-gateway/interfaces';

export const isNsaDraftBooking = (b: CRMBookingDetails): boolean => Boolean(b.ftts_bookingstatus === CRMBookingStatus.Draft && b.ftts_bookingid.ftts_nonstandardaccommodation);
