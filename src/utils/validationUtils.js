/**
 * Validation Utility Functions
 * Common validation helpers
 */

/**
 * Check if value is empty
 * @param {*} value - Value to check
 * @returns {boolean} True if empty
 */
const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Validate email format
 * @param {string} email - Email string
 * @returns {boolean} True if valid email
 */
const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (basic format)
 * @param {string} phone - Phone number string
 * @returns {boolean} True if valid phone
 */
const isValidPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

/**
 * Validate URL format
 * @param {string} url - URL string
 * @returns {boolean} True if valid URL
 */
const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate password strength
 * @param {string} password - Password string
 * @param {Object} options - Validation options
 * @returns {Object} Validation result with score and feedback
 */
const validatePassword = (password, options = {}) => {
  const defaults = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true
  };
  
  const config = { ...defaults, ...options };
  const result = {
    isValid: true,
    score: 0,
    feedback: []
  };

  if (!password || typeof password !== 'string') {
    result.isValid = false;
    result.feedback.push('Password is required');
    return result;
  }

  // Length check
  if (password.length < config.minLength) {
    result.isValid = false;
    result.feedback.push(`Password must be at least ${config.minLength} characters long`);
  } else {
    result.score += 1;
  }

  // Uppercase check
  if (config.requireUppercase && !/[A-Z]/.test(password)) {
    result.isValid = false;
    result.feedback.push('Password must contain at least one uppercase letter');
  } else if (/[A-Z]/.test(password)) {
    result.score += 1;
  }

  // Lowercase check
  if (config.requireLowercase && !/[a-z]/.test(password)) {
    result.isValid = false;
    result.feedback.push('Password must contain at least one lowercase letter');
  } else if (/[a-z]/.test(password)) {
    result.score += 1;
  }

  // Numbers check
  if (config.requireNumbers && !/\d/.test(password)) {
    result.isValid = false;
    result.feedback.push('Password must contain at least one number');
  } else if (/\d/.test(password)) {
    result.score += 1;
  }

  // Special characters check
  if (config.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    result.isValid = false;
    result.feedback.push('Password must contain at least one special character');
  } else if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    result.score += 1;
  }

  return result;
};

/**
 * Validate credit card number (Luhn algorithm)
 * @param {string} cardNumber - Credit card number
 * @returns {boolean} True if valid card number
 */
const isValidCreditCard = (cardNumber) => {
  if (!cardNumber || typeof cardNumber !== 'string') return false;
  
  const cleanedNumber = cardNumber.replace(/\s/g, '');
  if (!/^\d+$/.test(cleanedNumber)) return false;
  
  let sum = 0;
  let shouldDouble = false;
  
  // Loop through digits from right to left
  for (let i = cleanedNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanedNumber.charAt(i));
    
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  
  return (sum % 10) === 0;
};

/**
 * Validate MongoDB ObjectId
 * @param {string} id - ObjectId string
 * @returns {boolean} True if valid ObjectId
 */
const isValidObjectId = (id) => {
  if (!id || typeof id !== 'string') return false;
  return /^[a-f\d]{24}$/i.test(id);
};

/**
 * Validate UUID
 * @param {string} uuid - UUID string
 * @returns {boolean} True if valid UUID
 */
const isValidUUID = (uuid) => {
  if (!uuid || typeof uuid !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Sanitize input string
 * @param {string} input - Input string
 * @returns {string} Sanitized string
 */
const sanitizeInput = (input) => {
  if (!input || typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes
    .substring(0, 1000); // Limit length
};

module.exports = {
  isEmpty,
  isValidEmail,
  isValidPhone,
  isValidUrl,
  validatePassword,
  isValidCreditCard,
  isValidObjectId,
  isValidUUID,
  sanitizeInput
};
