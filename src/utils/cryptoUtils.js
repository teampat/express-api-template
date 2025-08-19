/**
 * Cryptographic Utility Functions
 * Secure hashing, encryption, and token generation
 */

const crypto = require('crypto');
const bcrypt = require('bcryptjs');

/**
 * Generate secure random token
 * @param {number} length - Token length in bytes (default: 32)
 * @returns {string} Hex encoded random token
 */
const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate UUID v4
 * @returns {string} UUID v4 string
 */
const generateUUID = () => {
  return crypto.randomUUID();
};

/**
 * Hash password using bcrypt
 * @param {string} password - Plain text password
 * @param {number} saltRounds - Number of salt rounds (default: 12)
 * @returns {Promise<string>} Hashed password
 */
const hashPassword = async (password, saltRounds = 12) => {
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare password with hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} True if password matches
 */
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Create MD5 hash
 * @param {string} data - Data to hash
 * @returns {string} MD5 hash
 */
const createMD5Hash = (data) => {
  return crypto.createHash('md5').update(data).digest('hex');
};

/**
 * Create SHA256 hash
 * @param {string} data - Data to hash
 * @returns {string} SHA256 hash
 */
const createSHA256Hash = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Create HMAC signature
 * @param {string} data - Data to sign
 * @param {string} secret - Secret key
 * @param {string} algorithm - Hash algorithm (default: 'sha256')
 * @returns {string} HMAC signature
 */
const createHMAC = (data, secret, algorithm = 'sha256') => {
  return crypto.createHmac(algorithm, secret).update(data).digest('hex');
};

/**
 * Encrypt data using AES-256-GCM
 * @param {string} text - Text to encrypt
 * @param {string} password - Encryption password
 * @returns {Object} Encrypted data with iv and authTag
 */
const encrypt = (text, password) => {
  const algorithm = 'aes-256-gcm';
  const key = crypto.scryptSync(password, 'salt', 32);
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipher(algorithm, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
};

/**
 * Decrypt data using AES-256-GCM
 * @param {Object} encryptedData - Encrypted data object
 * @param {string} password - Decryption password
 * @returns {string} Decrypted text
 */
const decrypt = (encryptedData, password) => {
  const algorithm = 'aes-256-gcm';
  const key = crypto.scryptSync(password, 'salt', 32);
  const iv = Buffer.from(encryptedData.iv, 'hex');
  const authTag = Buffer.from(encryptedData.authTag, 'hex');
  
  const decipher = crypto.createDecipher(algorithm, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

/**
 * Generate API key
 * @param {string} prefix - Key prefix (default: 'ak')
 * @param {number} length - Key length (default: 32)
 * @returns {string} API key
 */
const generateApiKey = (prefix = 'ak', length = 32) => {
  const randomPart = crypto.randomBytes(length).toString('hex');
  return `${prefix}_${randomPart}`;
};

/**
 * Generate OTP (One-Time Password)
 * @param {number} length - OTP length (default: 6)
 * @returns {string} Numeric OTP
 */
const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits[crypto.randomInt(0, digits.length)];
  }
  
  return otp;
};

/**
 * Create time-based hash for rate limiting or caching
 * @param {string} identifier - Unique identifier
 * @param {number} timeWindow - Time window in seconds
 * @returns {string} Time-based hash
 */
const createTimeBasedHash = (identifier, timeWindow = 3600) => {
  const currentWindow = Math.floor(Date.now() / 1000 / timeWindow);
  return createSHA256Hash(`${identifier}:${currentWindow}`);
};

module.exports = {
  generateSecureToken,
  generateUUID,
  hashPassword,
  comparePassword,
  createMD5Hash,
  createSHA256Hash,
  createHMAC,
  encrypt,
  decrypt,
  generateApiKey,
  generateOTP,
  createTimeBasedHash
};
