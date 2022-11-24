// dayjs config in one place
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';
import isoWeek from 'dayjs/plugin/isoWeek';
import timezone from 'dayjs/plugin/timezone';
import minMax from 'dayjs/plugin/minMax';
import config from '../config';

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(isoWeek);
dayjs.extend(timezone);
dayjs.extend(minMax);
dayjs.tz.setDefault(config.defaultTimeZone);
