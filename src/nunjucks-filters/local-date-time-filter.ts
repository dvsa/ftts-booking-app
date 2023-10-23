import dayjs from 'dayjs';
import config from '../config';
import * as DateHelper from '../domain/utc-date';

export const asShortDateNoDelimiters = localDateFormat('DD MM YYYY'); // "15 02 1995"
export const asFullDateWithoutWeekday = localDateFormat('D MMMM YYYY'); // "3 September 2020"
export const asFullDateTimeWithoutWeekday = localDateFormat('h:mma, D MMMM YYYY'); // "3:30pm, 3 September 2020"
export const asFullDateWithWeekday = localDateFormat('dddd D MMMM YYYY'); // "Tuesday 3 September 2020"
export const asFullDateWithoutYear = localDateFormat('D MMMM'); // "3 September"
export const asLocalTime = localDateFormat('h:mma'); // "3:30pm" (GDS recommended format)
export const asLocalTimeWithoutAmPm = localDateFormat('h:mm'); // "3:30"
export const asWeekday = localDateFormat('dddd'); // "Tuesday"

const replacements = [
  { pattern: /12:00am/i, replacement: 'midnight' },
  { pattern: /12:00pm/i, replacement: 'midday' }
];

function localDateFormat(mask: string): (isoDate: string) => string {
  return (isoDate: string): string => {
    let formattedTime = dayjs(isoDate).tz(config.defaultTimeZone).format(mask);

    replacements.forEach(({ pattern, replacement }) => {
      formattedTime = formattedTime.replace(pattern, replacement);
    });

    return formattedTime;
  };
}

export function toISODateString(date: string): string {
  return DateHelper.toISODateString(date);
}
