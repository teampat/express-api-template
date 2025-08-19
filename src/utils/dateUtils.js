/**
 * Date Utility Functions
 * Common date operations and formatting
 */

/**
 * Format date to ISO string
 * @param {Date} date - Date object
 * @returns {string} ISO formatted date string
 */
const formatToISO = (date = new Date()) => {
  return date.toISOString();
};

/**
 * Format date to readable string
 * @param {Date} date - Date object
 * @param {string} locale - Locale string (default: 'en-US')
 * @returns {string} Formatted date string
 */
const formatDate = (date = new Date(), locale = 'en-US') => {
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Format date to readable datetime string
 * @param {Date} date - Date object
 * @param {string} locale - Locale string (default: 'en-US')
 * @returns {string} Formatted datetime string
 */
const formatDateTime = (date = new Date(), locale = 'en-US') => {
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Get date difference in days
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {number} Difference in days
 */
const getDaysDifference = (date1, date2) => {
  const timeDiff = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

/**
 * Add days to date
 * @param {Date} date - Base date
 * @param {number} days - Number of days to add
 * @returns {Date} New date object
 */
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Check if date is today
 * @param {Date} date - Date to check
 * @returns {boolean} True if date is today
 */
const isToday = (date) => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

/**
 * Check if date is valid
 * @param {Date} date - Date to validate
 * @returns {boolean} True if date is valid
 */
const isValidDate = (date) => {
  return date instanceof Date && !isNaN(date);
};

module.exports = {
  formatToISO,
  formatDate,
  formatDateTime,
  getDaysDifference,
  addDays,
  isToday,
  isValidDate
};
