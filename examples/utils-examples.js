/**
 * Example Usage of Utils
 * This file demonstrates various utility functions
 */

const utils = require('../src/utils');

// Date utilities example
console.log('=== Date Utils Examples ===');
const now = new Date();
console.log('Current date (ISO):', utils.formatToISO(now));
console.log('Formatted date:', utils.formatDate(now));
console.log('Date + 7 days:', utils.formatDate(utils.addDays(now, 7)));
console.log('Is today?:', utils.isToday(now));

// String utilities example
console.log('\n=== String Utils Examples ===');
const text = 'Hello World! This is a Test.';
console.log('Original:', text);
console.log('Capitalized:', utils.capitalize(text.toLowerCase()));
console.log('CamelCase:', utils.toCamelCase(text));
console.log('Snake_case:', utils.toSnakeCase(text));
console.log('Kebab-case:', utils.toKebabCase(text));
console.log('Slugified:', utils.slugify(text));
console.log('Truncated (20):', utils.truncate(text, 20));
console.log('Word count:', utils.wordCount(text));

// Validation utilities example
console.log('\n=== Validation Utils Examples ===');
console.log('Valid email test@example.com:', utils.isValidEmail('test@example.com'));
console.log('Invalid email test@:', utils.isValidEmail('test@'));
console.log('Valid URL https://example.com:', utils.isValidUrl('https://example.com'));
console.log('Invalid URL not-a-url:', utils.isValidUrl('not-a-url'));

const passwordValidation = utils.validatePassword('StrongPass123!');
console.log('Password validation result:', {
  isValid: passwordValidation.isValid,
  score: passwordValidation.score,
  feedback: passwordValidation.feedback
});

// Crypto utilities example (async examples)
async function cryptoExamples() {
  console.log('\n=== Crypto Utils Examples ===');
  
  // Generate secure tokens
  console.log('Secure token (32 bytes):', utils.generateSecureToken(32));
  console.log('UUID:', utils.generateUUID());
  console.log('API Key:', utils.generateApiKey('app', 24));
  console.log('OTP (6 digits):', utils.generateOTP(6));
  
  // Hash examples
  console.log('MD5 hash of "test":', utils.createMD5Hash('test'));
  console.log('SHA256 hash of "test":', utils.createSHA256Hash('test'));
  console.log('HMAC signature:', utils.createHMAC('data', 'secret'));
  
  // Password hashing
  const password = 'mySecretPassword';
  const hashedPassword = await utils.hashPassword(password);
  console.log('Hashed password:', hashedPassword);
  console.log('Password matches:', await utils.comparePassword(password, hashedPassword));
  console.log('Wrong password matches:', await utils.comparePassword('wrongPassword', hashedPassword));
}

// File utilities example
console.log('\n=== File Utils Examples ===');
const filename = 'my-document.pdf';
console.log('Original filename:', filename);
console.log('File extension:', utils.getFileExtension(filename));
console.log('Name without extension:', utils.getFileNameWithoutExtension(filename));
console.log('Unique filename:', utils.generateUniqueFilename(filename));
console.log('MIME type:', utils.getMimeType(filename));

// File size formatting
const sizes = [1024, 1048576, 1073741824, 1099511627776];
sizes.forEach(size => {
  console.log(`${size} bytes = ${utils.formatFileSize(size)}`);
});

// File validation
const allowedTypes = ['pdf', 'doc', 'docx'];
console.log('PDF allowed?:', utils.isValidFileType(filename, allowedTypes));
console.log('JPG allowed?:', utils.isValidFileType('image.jpg', allowedTypes));
console.log('5MB file valid (10MB limit)?:', utils.isValidFileSize(5 * 1024 * 1024, 10 * 1024 * 1024));

// Response utilities example (mock response object)
console.log('\n=== Response Utils Examples ===');
const mockRes = {
  status: (code) => {
    console.log(`Status: ${code}`);
    return mockRes;
  },
  json: (data) => {
    console.log('Response:', JSON.stringify(data, null, 2));
    return mockRes;
  }
};

console.log('Success response:');
utils.successResponse(mockRes, { id: 1, name: 'John' }, 'User retrieved successfully');

console.log('\nError response:');
utils.errorResponse(mockRes, 'User not found', 404);

console.log('\nValidation error response:');
utils.validationErrorResponse(mockRes, ['Email is required', 'Password too short']);

// Run async examples
cryptoExamples().catch(console.error);
