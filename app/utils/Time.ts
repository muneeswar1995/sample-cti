import { format, formatDistance, isValid, type Locale } from "date-fns";

type DateInput = string | number | Date;

/**
 * @method formatDate
 * @description
 * Formats a given date input into a specified string format.
 * If the input date is invalid, it returns an empty string.
 * The default format is "dd/MM/yyyy", but it can be customized by passing a different format string.
 * @param date - The date to format. Can be any valid date input accepted by the `Date` constructor.
 * @param formatDate - The format string to use for formatting the date. Defaults to "dd/MM/yyyy".
 * @example
 * formatDate(new Date()); // Returns the current date formatted as "dd/MM/yyyy"
 * formatDate("2023-10-01", "MM/dd/yyyy"); // Returns "10/01/2023"
 * formatDate("invalid date"); // Returns an empty string
 * @returns The formatted date string if the input is valid; otherwise, an empty string.
 * @see https://date-fns.org/v2.29.3/docs/format
 * @see https://date-fns.org/v2.29.3/docs/isValid
 */

export const formatDate = (date: DateInput, formatString = "dd/MM/yyyy") => {
  const parsedDate = new Date(date);
  if (isValid(parsedDate)) {
    return format(parsedDate, formatString);
  }
  return "";
};

/**
 * Checks whether a trip object occurred on today's date (or a specified YYYY-MM-DD target date).
 */
export const isTripToday = (trip: any, targetDateStr?: string): boolean => {
  if (!trip) return false;
  const todayStr = targetDateStr || format(new Date(), "yyyy-MM-dd");
  const rawDate =
    trip.start_time ||
    trip.startTime ||
    trip.created_at ||
    trip.createdAt ||
    trip.end_time ||
    trip.endTime ||
    trip.date;
  if (!rawDate) return false;

  if (typeof rawDate === "string" && rawDate.startsWith(todayStr)) {
    return true;
  }

  try {
    const d = new Date(rawDate);
    if (isValid(d)) {
      return format(d, "yyyy-MM-dd") === todayStr;
    }
  } catch {
    // ignore
  }

  return false;
};

/**
 * @method formatTime
 * @description
 * Formats a given date input into a specified string format.
 * If the input date is invalid, it returns an empty string.
 * The default format is "hh:mm:ss", but it can be customized by passing a different format string.
 * @param date - The date to format. Can be any valid date input accepted by the `Date` constructor.
 * @param formatTime - The format string to use for formatting the date. Defaults to "hh:mm:ss".
 * @example
 * formatDate(new Date()); // Returns the current date formatted as "hh:mm:ss"
 * formatDate("2023-10-01", "hh:mm:ss"); // Returns "10:01:20"
 * formatDate("invalid date"); // Returns an empty string
 * @returns The formatted date string if the input is valid; otherwise, an empty string.
 * @see https://date-fns.org/v2.29.3/docs/format
 * @see https://date-fns.org/v2.29.3/docs/isValid
 */

export const formatTime = (date: DateInput, formatString = "hh:mm:ss") => {
  const parsedDate = new Date(date);
  if (isValid(parsedDate)) {
    return format(parsedDate, formatString);
  }
  return "";
};

/**
 * @method getTimeStamp
 * @description
 * Returns a formatted timestamp string for the given date input.
 *
 * @param date - The date to format. Can be any valid date input accepted by the `Date` constructor.
 * @param formatType - Optional. The format string to use for formatting the date. Defaults to `"t"`.
 * @example
 * getTimeStamp(new Date()); // Returns the current date formatted as "t"
 * getTimeStamp("2023-10-01", "yyyy-MM-dd"); // Returns "2023-10-01"
 * getTimeStamp("invalid date"); // Returns `undefined`
 * @returns The formatted date string if the input is valid; otherwise, `undefined`.
 * @see https://date-fns.org/v2.29.3/docs/format
 * @see https://date-fns.org/v2.29.3/docs/isValid
 */
export const getTimeStamp = (date: DateInput, formatType = "t") => {
  if (isValid(new Date(date))) {
    return format(new Date(date), formatType);
  }
};

/**
 * @method getYear
 * @description
 * Returns the year component of a given date as a string in "yyyy" format.
 *
 * @param date - The input date, which can be any valid `DateInput`.
 * @example
 * getYear(new Date()); // Returns the current year as a four-digit string, e.g. "2023"
 * getYear("1998-24-02"); // Returns "2023"
 * getYear("invalid date"); // Returns `undefined`
 * @returns The year part of the date as a two-digit string.
 * @see https://date-fns.org/v2.29.3/docs/format
 * @see https://date-fns.org/v2.29.3/docs/isValid
 */

export const getYear = (date: DateInput) => {
  return format(new Date(date), "yyyy");
};

/**
 * @method getMonth
 * @description
 * Returns the month component of a given date as a string in "MM" format.
 *
 * @param date - The input date, which can be any valid `DateInput`.
 * @example
 * getMonth(new Date()); // Returns the current month as a tow-digit string, e.g. "02"
 * getMonth("1998-24-02"); // Returns "02"
 * getMonth("invalid date"); // Returns `undefined`
 * @returns The month part of the date as a two-digit string.
 * @see https://date-fns.org/v2.29.3/docs/format
 * @see https://date-fns.org/v2.29.3/docs/isValid
 */

export const getMonth = (date: DateInput) => {
  return format(new Date(date), "MM");
};

/**
 * @method getDay
 * @description
 * Returns the day of the month from the given date as a two-digit string.
 *
 * @param date - The input date, which can be any valid date input type.
 * @example
 * getDay(new Date()); // Returns the current day as a tow-digit string, e.g. "24"
 * getDay("1998-24-02"); // Returns "24"
 * getDay("invalid date"); // Returns `undefined`
 * @returns The day of the month in "dd" format (e.g., "01", "15").
 * @see https://date-fns.org/v2.29.3/docs/format
 * @see https://date-fns.org/v2.29.3/docs/isValid
 */

export const getDay = (date: DateInput) => {
  return format(new Date(date), "dd");
};

/**
 * @method getHour
 * @description
 * Returns the hour component of a given date as a string in "hh" format.
 *
 * @param date - The input date, which can be any valid date input type.
 * @example
 * getHour(new Date()); // Returns the current hour as a tow-digit string, e.g. "06"
 * getHour("invalid date"); // Returns `undefined`
 * @returns The hours part of the date as a two-digit string.
 * @see https://date-fns.org/v2.29.3/docs/format
 * @see https://date-fns.org/v2.29.3/docs/isValid
 */

export const getHour = (date: DateInput) => {
  return format(new Date(date), "hh");
};

/**
 * @method getMinute
 * @description
 * Returns the minute component of a given date as a string in "mm" format.
 *
 * @param date - The input date, which can be any valid date input type.
 * @example
 * getMinute(new Date()); // Returns the current minute as a tow-digit string, e.g. "36"
 * getMinute("invalid date"); // Returns `undefined`
 * @returns The minute part of the date as a two-digit string.
 * @see https://date-fns.org/v2.29.3/docs/format
 * @see https://date-fns.org/v2.29.3/docs/isValid
 */

export const getMinute = (date: DateInput) => {
  return format(new Date(date), "mm");
};

/**
 * @method getSeconds
 * @description
 * Returns the seconds component of a given date as a string in "ss" format.
 *
 * @param date - The input date, which can be any valid date input type.
 * @example
 * getSeconds(new Date()); // Returns the current seconds as a tow-digit string, e.g. "36"
 * getSeconds("invalid date"); // Returns `undefined`
 * @returns The seconds part of the date as a two-digit string.
 * @see https://date-fns.org/v2.29.3/docs/format
 * @see https://date-fns.org/v2.29.3/docs/isValid
 */
export const getSeconds = (date: DateInput) => {
  return format(new Date(date), "ss");
};

/**
 * @method getTimeDistance
 * @description
 * Calculates the distance between two dates and returns it as a human-readable string.
 *
 * @param startDate - The start date of the interval. Can be a Date object, string, or number.
 * @param endDate - The end date of the interval. Can be a Date object, string, or number.
 * @param options - Optional settings for formatting the distance.
 * @param options.includeSeconds - Whether to include seconds in the output.
 * @param options.addSuffix - Whether to add a suffix indicating past or future.
 * @param options.locale - The locale to use for formatting.
 * @example
 * getTimeDistance(new Date('2023-01-01'), new Date('2023-01-02'), { includeSeconds: true, addSuffix: true });
 * // Returns "1 day"
 * getTimeDistance('2023-01-01', '2023-01-02', { includeSeconds: false, addSuffix: false });
 * // Returns "1 day"
 * @returns A string representing the distance between the two dates in a human-readable format.
 * @see https://date-fns.org/v2.29.3/docs/formatDistance
 * @see https://date-fns.org/v2.29.3/docs/isValid
 */
export const getTimeDistance = (
  startDate: DateInput,
  endDate: DateInput,
  options: { includeSeconds?: boolean; addSuffix?: boolean; locale?: Locale } | undefined
) => {
  return formatDistance(new Date(startDate), new Date(endDate), options);
};
