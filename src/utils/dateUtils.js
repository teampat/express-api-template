/**
 * Date Utility Functions
 * Common date operations and formatting using dayjs
 */

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const relativeTime = require('dayjs/plugin/relativeTime');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const isSameOrBefore = require('dayjs/plugin/isSameOrBefore');
const isSameOrAfter = require('dayjs/plugin/isSameOrAfter');
const isBetweenPlugin = require('dayjs/plugin/isBetween');
const weekday = require('dayjs/plugin/weekday');

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(isBetweenPlugin);
dayjs.extend(weekday);

/**
 * Format date to ISO string
 * @param {Date|string|dayjs.Dayjs} date - Date input
 * @returns {string} ISO formatted date string
 */
const formatToISO = (date = new Date()) => {
  return dayjs(date).toISOString();
};

/**
 * Format date to readable string
 * @param {Date|string|dayjs.Dayjs} date - Date input
 * @param {string} format - Format string (default: 'MMMM D, YYYY')
 * @param {string} locale - Locale string (optional)
 * @returns {string} Formatted date string
 */
const formatDate = (date = new Date(), format = 'MMMM D, YYYY', locale = null) => {
  const dateObj = dayjs(date);
  if (locale) {
    return dateObj.locale(locale).format(format);
  }
  return dateObj.format(format);
};

/**
 * Format date to readable datetime string
 * @param {Date|string|dayjs.Dayjs} date - Date input
 * @param {string} format - Format string (default: 'MMM D, YYYY h:mm A')
 * @param {string} locale - Locale string (optional)
 * @returns {string} Formatted datetime string
 */
const formatDateTime = (date = new Date(), format = 'MMM D, YYYY h:mm A', locale = null) => {
  const dateObj = dayjs(date);
  if (locale) {
    return dateObj.locale(locale).format(format);
  }
  return dateObj.format(format);
};

/**
 * Get date difference in days
 * @param {Date|string|dayjs.Dayjs} date1 - First date
 * @param {Date|string|dayjs.Dayjs} date2 - Second date
 * @returns {number} Difference in days
 */
const getDaysDifference = (date1, date2) => {
  return Math.abs(dayjs(date2).diff(dayjs(date1), 'day'));
};

/**
 * Add days to date
 * @param {Date|string|dayjs.Dayjs} date - Base date
 * @param {number} days - Number of days to add
 * @returns {Date} New date object
 */
const addDays = (date, days) => {
  return dayjs(date).add(days, 'day').toDate();
};

/**
 * Subtract days from date
 * @param {Date|string|dayjs.Dayjs} date - Base date
 * @param {number} days - Number of days to subtract
 * @returns {Date} New date object
 */
const subtractDays = (date, days) => {
  return dayjs(date).subtract(days, 'day').toDate();
};

/**
 * Add time to date
 * @param {Date|string|dayjs.Dayjs} date - Base date
 * @param {number} amount - Amount to add
 * @param {string} unit - Unit (year, month, week, day, hour, minute, second)
 * @returns {Date} New date object
 */
const addTime = (date, amount, unit = 'day') => {
  return dayjs(date).add(amount, unit).toDate();
};

/**
 * Subtract time from date
 * @param {Date|string|dayjs.Dayjs} date - Base date
 * @param {number} amount - Amount to subtract
 * @param {string} unit - Unit (year, month, week, day, hour, minute, second)
 * @returns {Date} New date object
 */
const subtractTime = (date, amount, unit = 'day') => {
  return dayjs(date).subtract(amount, unit).toDate();
};

/**
 * Check if date is today
 * @param {Date|string|dayjs.Dayjs} date - Date to check
 * @returns {boolean} True if date is today
 */
const isToday = (date) => {
  return dayjs(date).isSame(dayjs(), 'day');
};

/**
 * Check if date is yesterday
 * @param {Date|string|dayjs.Dayjs} date - Date to check
 * @returns {boolean} True if date is yesterday
 */
const isYesterday = (date) => {
  return dayjs(date).isSame(dayjs().subtract(1, 'day'), 'day');
};

/**
 * Check if date is tomorrow
 * @param {Date|string|dayjs.Dayjs} date - Date to check
 * @returns {boolean} True if date is tomorrow
 */
const isTomorrow = (date) => {
  return dayjs(date).isSame(dayjs().add(1, 'day'), 'day');
};

/**
 * Check if date is in the past
 * @param {Date|string|dayjs.Dayjs} date - Date to check
 * @returns {boolean} True if date is in the past
 */
const isPast = (date) => {
  return dayjs(date).isBefore(dayjs());
};

/**
 * Check if date is in the future
 * @param {Date|string|dayjs.Dayjs} date - Date to check
 * @returns {boolean} True if date is in the future
 */
const isFuture = (date) => {
  return dayjs(date).isAfter(dayjs());
};

/**
 * Check if date is valid
 * @param {Date|string|dayjs.Dayjs} date - Date to validate
 * @returns {boolean} True if date is valid
 */
const isValidDate = (date) => {
  return dayjs(date).isValid();
};

/**
 * Get relative time from now (e.g., "2 hours ago", "in 3 days")
 * @param {Date|string|dayjs.Dayjs} date - Date to compare
 * @returns {string} Relative time string
 */
const getRelativeTime = (date) => {
  return dayjs(date).fromNow();
};

/**
 * Get relative time to a specific date
 * @param {Date|string|dayjs.Dayjs} date - Date to compare from
 * @param {Date|string|dayjs.Dayjs} toDate - Date to compare to
 * @returns {string} Relative time string
 */
const getRelativeTimeTo = (date, toDate) => {
  return dayjs(date).to(dayjs(toDate));
};

/**
 * Get start of day
 * @param {Date|string|dayjs.Dayjs} date - Date input
 * @returns {Date} Start of day
 */
const startOfDay = (date) => {
  return dayjs(date).startOf('day').toDate();
};

/**
 * Get end of day
 * @param {Date|string|dayjs.Dayjs} date - Date input
 * @returns {Date} End of day
 */
const endOfDay = (date) => {
  return dayjs(date).endOf('day').toDate();
};

/**
 * Get start of week
 * @param {Date|string|dayjs.Dayjs} date - Date input
 * @returns {Date} Start of week
 */
const startOfWeek = (date) => {
  return dayjs(date).startOf('week').toDate();
};

/**
 * Get end of week
 * @param {Date|string|dayjs.Dayjs} date - Date input
 * @returns {Date} End of week
 */
const endOfWeek = (date) => {
  return dayjs(date).endOf('week').toDate();
};

/**
 * Get start of month
 * @param {Date|string|dayjs.Dayjs} date - Date input
 * @returns {Date} Start of month
 */
const startOfMonth = (date) => {
  return dayjs(date).startOf('month').toDate();
};

/**
 * Get end of month
 * @param {Date|string|dayjs.Dayjs} date - Date input
 * @returns {Date} End of month
 */
const endOfMonth = (date) => {
  return dayjs(date).endOf('month').toDate();
};

/**
 * Get start of year
 * @param {Date|string|dayjs.Dayjs} date - Date input
 * @returns {Date} Start of year
 */
const startOfYear = (date) => {
  return dayjs(date).startOf('year').toDate();
};

/**
 * Get end of year
 * @param {Date|string|dayjs.Dayjs} date - Date input
 * @returns {Date} End of year
 */
const endOfYear = (date) => {
  return dayjs(date).endOf('year').toDate();
};

/**
 * Check if two dates are the same
 * @param {Date|string|dayjs.Dayjs} date1 - First date
 * @param {Date|string|dayjs.Dayjs} date2 - Second date
 * @param {string} unit - Unit of comparison (year, month, week, day, hour, minute, second)
 * @returns {boolean} True if dates are the same
 */
const isSame = (date1, date2, unit = 'day') => {
  return dayjs(date1).isSame(dayjs(date2), unit);
};

/**
 * Check if date1 is before date2
 * @param {Date|string|dayjs.Dayjs} date1 - First date
 * @param {Date|string|dayjs.Dayjs} date2 - Second date
 * @param {string} unit - Unit of comparison
 * @returns {boolean} True if date1 is before date2
 */
const isBefore = (date1, date2, unit = 'day') => {
  return dayjs(date1).isBefore(dayjs(date2), unit);
};

/**
 * Check if date1 is after date2
 * @param {Date|string|dayjs.Dayjs} date1 - First date
 * @param {Date|string|dayjs.Dayjs} date2 - Second date
 * @param {string} unit - Unit of comparison
 * @returns {boolean} True if date1 is after date2
 */
const isAfter = (date1, date2, unit = 'day') => {
  return dayjs(date1).isAfter(dayjs(date2), unit);
};

/**
 * Check if date is between two dates
 * @param {Date|string|dayjs.Dayjs} date - Date to check
 * @param {Date|string|dayjs.Dayjs} startDate - Start date
 * @param {Date|string|dayjs.Dayjs} endDate - End date
 * @param {string} unit - Unit of comparison
 * @param {string} inclusivity - '()' | '[)' | '(]' | '[]'
 * @returns {boolean} True if date is between the range
 */
const isBetween = (date, startDate, endDate, unit = 'day', inclusivity = '()') => {
  return dayjs(date).isBetween(dayjs(startDate), dayjs(endDate), unit, inclusivity);
};

/**
 * Parse date from string with custom format
 * @param {string} dateString - Date string
 * @param {string} format - Format pattern
 * @returns {Date} Parsed date object
 */
const parseDate = (dateString, format) => {
  return dayjs(dateString, format).toDate();
};

/**
 * Convert date to timezone
 * @param {Date|string|dayjs.Dayjs} date - Date input
 * @param {string} timezone - Target timezone (e.g., 'America/New_York')
 * @returns {Date} Date in target timezone
 */
const toTimezone = (date, timezone) => {
  return dayjs(date).tz(timezone).toDate();
};

/**
 * Get timezone offset in minutes
 * @param {Date|string|dayjs.Dayjs} date - Date input
 * @param {string} timezone - Timezone (optional)
 * @returns {number} Timezone offset in minutes
 */
const getTimezoneOffset = (date, timezone = null) => {
  if (timezone) {
    return dayjs(date).tz(timezone).utcOffset();
  }
  return dayjs(date).utcOffset();
};

/**
 * Get age from birthdate
 * @param {Date|string|dayjs.Dayjs} birthdate - Birth date
 * @returns {number} Age in years
 */
const getAge = (birthdate) => {
  return dayjs().diff(dayjs(birthdate), 'year');
};

/**
 * Get weekday name
 * @param {Date|string|dayjs.Dayjs} date - Date input
 * @param {string} locale - Locale (optional)
 * @returns {string} Weekday name
 */
const getWeekdayName = (date, locale = 'en') => {
  return dayjs(date).locale(locale).format('dddd');
};

/**
 * Get month name
 * @param {Date|string|dayjs.Dayjs} date - Date input
 * @param {string} locale - Locale (optional)
 * @returns {string} Month name
 */
const getMonthName = (date, locale = 'en') => {
  return dayjs(date).locale(locale).format('MMMM');
};

/**
 * Get business days between two dates
 * @param {Date|string|dayjs.Dayjs} startDate - Start date
 * @param {Date|string|dayjs.Dayjs} endDate - End date
 * @returns {number} Number of business days
 */
const getBusinessDays = (startDate, endDate) => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  let businessDays = 0;
  let current = start;

  while (current.isSameOrBefore(end, 'day')) {
    const dayOfWeek = current.day();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
      businessDays++;
    }
    current = current.add(1, 'day');
  }

  return businessDays;
};

module.exports = {
  formatToISO,
  formatDate,
  formatDateTime,
  getDaysDifference,
  addDays,
  subtractDays,
  addTime,
  subtractTime,
  isToday,
  isYesterday,
  isTomorrow,
  isPast,
  isFuture,
  isValidDate,
  getRelativeTime,
  getRelativeTimeTo,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isSame,
  isBefore,
  isAfter,
  isBetween,
  parseDate,
  toTimezone,
  getTimezoneOffset,
  getAge,
  getWeekdayName,
  getMonthName,
  getBusinessDays
};
