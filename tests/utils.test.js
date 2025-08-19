/**
 * Utils Test Suite
 * Comprehensive tests for utility functions
 */

const {
  // Date utils
  formatToISO,
  formatDate,
  formatDateTime,
  getDaysDifference,
  addDays,
  isToday,
  isValidDate,
  
  // String utils
  capitalize,
  toCamelCase,
  toSnakeCase,
  toKebabCase,
  generateRandomString,
  truncate,
  stripHtml,
  escapeHtml,
  slugify,
  wordCount,
  
  // Validation utils
  isEmpty,
  isValidEmail,
  isValidPhone,
  isValidUrl,
  validatePassword,
  isValidCreditCard,
  isValidObjectId,
  isValidUUID,
  sanitizeInput,
  
  // Crypto utils
  generateSecureToken,
  generateUUID,
  hashPassword,
  comparePassword,
  createMD5Hash,
  createSHA256Hash,
  createHMAC,
  generateApiKey,
  generateOTP,
  createTimeBasedHash,
  
  // Response utils
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  
  // File utils
  getFileExtension,
  getFileNameWithoutExtension,
  generateUniqueFilename,
  isValidFileType,
  isValidFileSize,
  formatFileSize,
  getMimeType
} = require('../src/utils');

describe('Utils Test Suite', () => {
  
  // Date Utils Tests
  describe('Date Utils', () => {
    test('formatToISO should format date to ISO string', () => {
      const date = new Date('2023-01-01T00:00:00.000Z');
      expect(formatToISO(date)).toBe('2023-01-01T00:00:00.000Z');
    });

    test('formatDate should format date to readable string', () => {
      const date = new Date('2023-01-01');
      const result = formatDate(date);
      expect(result).toContain('2023');
      expect(result).toContain('January');
    });

    test('getDaysDifference should calculate days between dates', () => {
      const date1 = new Date('2023-01-01');
      const date2 = new Date('2023-01-05');
      expect(getDaysDifference(date1, date2)).toBe(4);
    });

    test('addDays should add days to date', () => {
      const date = new Date('2023-01-01');
      const result = addDays(date, 5);
      expect(result.getDate()).toBe(6);
    });

    test('isToday should check if date is today', () => {
      const today = new Date();
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      expect(isToday(today)).toBe(true);
      expect(isToday(yesterday)).toBe(false);
    });

    test('isValidDate should validate date objects', () => {
      expect(isValidDate(new Date())).toBe(true);
      expect(isValidDate(new Date('invalid'))).toBe(false);
      expect(isValidDate('not a date')).toBe(false);
    });
  });

  // String Utils Tests
  describe('String Utils', () => {
    test('capitalize should capitalize first letter', () => {
      expect(capitalize('hello world')).toBe('Hello world');
      expect(capitalize('HELLO WORLD')).toBe('Hello world');
    });

    test('toCamelCase should convert to camelCase', () => {
      expect(toCamelCase('hello world')).toBe('helloWorld');
      expect(toCamelCase('hello-world')).toBe('helloWorld');
    });

    test('toSnakeCase should convert to snake_case', () => {
      expect(toSnakeCase('hello world')).toBe('hello_world');
      expect(toSnakeCase('helloWorld')).toBe('hello_world');
    });

    test('toKebabCase should convert to kebab-case', () => {
      expect(toKebabCase('hello world')).toBe('hello-world');
      expect(toKebabCase('helloWorld')).toBe('hello-world');
    });

    test('generateRandomString should generate random string', () => {
      const result = generateRandomString(10);
      expect(result).toHaveLength(10);
      expect(typeof result).toBe('string');
    });

    test('truncate should truncate long strings', () => {
      const longString = 'This is a very long string that should be truncated';
      expect(truncate(longString, 20)).toBe('This is a very lo...');
    });

    test('stripHtml should remove HTML tags', () => {
      expect(stripHtml('<p>Hello <b>world</b></p>')).toBe('Hello world');
    });

    test('escapeHtml should escape HTML characters', () => {
      expect(escapeHtml('<script>alert("test")</script>')).toContain('&lt;');
      expect(escapeHtml('<script>alert("test")</script>')).toContain('&gt;');
    });

    test('slugify should create URL-friendly slugs', () => {
      expect(slugify('Hello World! This is a test.')).toBe('hello-world-this-is-a-test');
    });

    test('wordCount should count words in string', () => {
      expect(wordCount('Hello world test')).toBe(3);
      expect(wordCount('  Hello   world  ')).toBe(2);
    });
  });

  // Validation Utils Tests
  describe('Validation Utils', () => {
    test('isEmpty should check for empty values', () => {
      expect(isEmpty('')).toBe(true);
      expect(isEmpty('  ')).toBe(true);
      expect(isEmpty([])).toBe(true);
      expect(isEmpty({})).toBe(true);
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
      expect(isEmpty('hello')).toBe(false);
    });

    test('isValidEmail should validate email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true);
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
    });

    test('isValidPhone should validate phone numbers', () => {
      expect(isValidPhone('1234567890')).toBe(true);
      expect(isValidPhone('+1234567890')).toBe(true);
      expect(isValidPhone('123')).toBe(true);
      expect(isValidPhone('abc123')).toBe(false);
    });

    test('isValidUrl should validate URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('ftp://files.example.com')).toBe(true);
      expect(isValidUrl('not-a-url')).toBe(false);
    });

    test('validatePassword should validate password strength', () => {
      const strongPassword = validatePassword('StrongPass123!');
      expect(strongPassword.isValid).toBe(true);
      expect(strongPassword.score).toBeGreaterThan(3);

      const weakPassword = validatePassword('weak');
      expect(weakPassword.isValid).toBe(false);
      expect(weakPassword.feedback.length).toBeGreaterThan(0);
    });

    test('isValidCreditCard should validate credit card numbers', () => {
      expect(isValidCreditCard('4532015112830366')).toBe(true); // Valid test card
      expect(isValidCreditCard('1234567890123456')).toBe(false);
    });

    test('isValidObjectId should validate MongoDB ObjectIds', () => {
      expect(isValidObjectId('507f1f77bcf86cd799439011')).toBe(true);
      expect(isValidObjectId('invalid-id')).toBe(false);
    });

    test('isValidUUID should validate UUIDs', () => {
      expect(isValidUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
      expect(isValidUUID('invalid-uuid')).toBe(false);
    });

    test('sanitizeInput should sanitize user input', () => {
      const dangerous = '<script>alert("xss")</script>';
      const sanitized = sanitizeInput(dangerous);
      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
    });
  });

  // Crypto Utils Tests
  describe('Crypto Utils', () => {
    test('generateSecureToken should generate secure random token', () => {
      const token = generateSecureToken(16);
      expect(token).toHaveLength(32); // 16 bytes = 32 hex chars
      expect(typeof token).toBe('string');
    });

    test('generateUUID should generate valid UUID', () => {
      const uuid = generateUUID();
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    test('hashPassword and comparePassword should work together', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);
      
      expect(hash).not.toBe(password);
      expect(await comparePassword(password, hash)).toBe(true);
      expect(await comparePassword('wrongPassword', hash)).toBe(false);
    });

    test('createMD5Hash should create MD5 hash', () => {
      const hash = createMD5Hash('test');
      expect(hash).toHaveLength(32);
      expect(hash).toBe('098f6bcd4621d373cade4e832627b4f6');
    });

    test('createSHA256Hash should create SHA256 hash', () => {
      const hash = createSHA256Hash('test');
      expect(hash).toHaveLength(64);
    });

    test('createHMAC should create HMAC signature', () => {
      const hmac = createHMAC('test data', 'secret key');
      expect(typeof hmac).toBe('string');
      expect(hmac.length).toBeGreaterThan(0);
    });

    test('generateApiKey should generate API key', () => {
      const apiKey = generateApiKey('test', 16);
      expect(apiKey).toMatch(/^test_[a-f0-9]{32}$/);
    });

    test('generateOTP should generate numeric OTP', () => {
      const otp = generateOTP(6);
      expect(otp).toHaveLength(6);
      expect(otp).toMatch(/^\d{6}$/);
    });

    test('createTimeBasedHash should create consistent hash for same time window', () => {
      const hash1 = createTimeBasedHash('user123', 3600);
      const hash2 = createTimeBasedHash('user123', 3600);
      expect(hash1).toBe(hash2);
    });
  });

  // Response Utils Tests
  describe('Response Utils', () => {
    let mockRes;

    beforeEach(() => {
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis()
      };
    });

    test('successResponse should return success response', () => {
      successResponse(mockRes, { id: 1 }, 'Test success');
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Test success',
          data: { id: 1 }
        })
      );
    });

    test('errorResponse should return error response', () => {
      errorResponse(mockRes, 'Test error', 400);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Test error'
        })
      );
    });

    test('validationErrorResponse should return validation error', () => {
      const errors = ['Field is required'];
      validationErrorResponse(mockRes, errors);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          errors
        })
      );
    });

    test('notFoundResponse should return 404 response', () => {
      notFoundResponse(mockRes, 'User');
      
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'User not found'
        })
      );
    });

    test('unauthorizedResponse should return 401 response', () => {
      unauthorizedResponse(mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Unauthorized access'
        })
      );
    });

    test('forbiddenResponse should return 403 response', () => {
      forbiddenResponse(mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Access forbidden'
        })
      );
    });
  });

  // File Utils Tests
  describe('File Utils', () => {
    test('getFileExtension should extract file extension', () => {
      expect(getFileExtension('test.jpg')).toBe('jpg');
      expect(getFileExtension('document.pdf')).toBe('pdf');
      expect(getFileExtension('file.tar.gz')).toBe('gz');
    });

    test('getFileNameWithoutExtension should extract filename', () => {
      expect(getFileNameWithoutExtension('test.jpg')).toBe('test');
      expect(getFileNameWithoutExtension('/path/to/document.pdf')).toBe('document');
    });

    test('generateUniqueFilename should generate unique filename', () => {
      const filename1 = generateUniqueFilename('test.jpg');
      const filename2 = generateUniqueFilename('test.jpg');
      
      expect(filename1).not.toBe(filename2);
      expect(filename1).toContain('test');
      expect(filename1).toContain('.jpg');
    });

    test('isValidFileType should validate file types', () => {
      const allowedTypes = ['jpg', 'png', 'gif'];
      
      expect(isValidFileType('image.jpg', allowedTypes)).toBe(true);
      expect(isValidFileType('image.png', allowedTypes)).toBe(true);
      expect(isValidFileType('document.pdf', allowedTypes)).toBe(false);
    });

    test('isValidFileSize should validate file size', () => {
      expect(isValidFileSize(1024, 2048)).toBe(true);
      expect(isValidFileSize(3072, 2048)).toBe(false);
    });

    test('formatFileSize should format bytes to human readable', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });

    test('getMimeType should return correct MIME type', () => {
      expect(getMimeType('image.jpg')).toBe('image/jpeg');
      expect(getMimeType('document.pdf')).toBe('application/pdf');
      expect(getMimeType('data.json')).toBe('application/json');
      expect(getMimeType('unknown.xyz')).toBe('application/octet-stream');
    });
  });
});
