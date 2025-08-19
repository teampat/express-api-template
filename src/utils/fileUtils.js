/**
 * File Utility Functions
 * File operations and validations
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

/**
 * Check if file exists
 * @param {string} filePath - Path to file
 * @returns {Promise<boolean>} True if file exists
 */
const fileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get file size in bytes
 * @param {string} filePath - Path to file
 * @returns {Promise<number>} File size in bytes
 */
const getFileSize = async (filePath) => {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch {
    return 0;
  }
};

/**
 * Get file extension
 * @param {string} filename - Filename or path
 * @returns {string} File extension (without dot)
 */
const getFileExtension = (filename) => {
  return path.extname(filename).slice(1).toLowerCase();
};

/**
 * Get filename without extension
 * @param {string} filename - Filename or path
 * @returns {string} Filename without extension
 */
const getFileNameWithoutExtension = (filename) => {
  return path.basename(filename, path.extname(filename));
};

/**
 * Generate unique filename
 * @param {string} originalName - Original filename
 * @param {string} prefix - Optional prefix
 * @returns {string} Unique filename
 */
const generateUniqueFilename = (originalName, prefix = '') => {
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString('hex');
  const extension = getFileExtension(originalName);
  const baseName = getFileNameWithoutExtension(originalName);
  
  return `${prefix}${baseName}-${timestamp}-${random}.${extension}`;
};

/**
 * Validate file type
 * @param {string} filename - Filename
 * @param {Array} allowedTypes - Array of allowed file extensions
 * @returns {boolean} True if file type is allowed
 */
const isValidFileType = (filename, allowedTypes = []) => {
  if (!allowedTypes.length) return true;
  
  const extension = getFileExtension(filename);
  return allowedTypes.map(type => type.toLowerCase()).includes(extension);
};

/**
 * Validate file size
 * @param {number} fileSize - File size in bytes
 * @param {number} maxSize - Maximum allowed size in bytes
 * @returns {boolean} True if file size is valid
 */
const isValidFileSize = (fileSize, maxSize) => {
  return fileSize <= maxSize;
};

/**
 * Format file size to human readable format
 * @param {number} bytes - File size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted file size
 */
const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Create directory if it doesn't exist
 * @param {string} dirPath - Directory path
 * @returns {Promise<boolean>} True if directory was created or already exists
 */
const ensureDirectory = async (dirPath) => {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    return true;
  } catch {
    return false;
  }
};

/**
 * Delete file safely
 * @param {string} filePath - Path to file
 * @returns {Promise<boolean>} True if file was deleted
 */
const deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
    return true;
  } catch {
    return false;
  }
};

/**
 * Copy file
 * @param {string} source - Source file path
 * @param {string} destination - Destination file path
 * @returns {Promise<boolean>} True if file was copied
 */
const copyFile = async (source, destination) => {
  try {
    await ensureDirectory(path.dirname(destination));
    await fs.copyFile(source, destination);
    return true;
  } catch {
    return false;
  }
};

/**
 * Move file
 * @param {string} source - Source file path
 * @param {string} destination - Destination file path
 * @returns {Promise<boolean>} True if file was moved
 */
const moveFile = async (source, destination) => {
  try {
    await ensureDirectory(path.dirname(destination));
    await fs.rename(source, destination);
    return true;
  } catch {
    return false;
  }
};

/**
 * Read file content
 * @param {string} filePath - Path to file
 * @param {string} encoding - File encoding (default: 'utf8')
 * @returns {Promise<string>} File content
 */
const readFileContent = async (filePath, encoding = 'utf8') => {
  try {
    return await fs.readFile(filePath, encoding);
  } catch {
    return null;
  }
};

/**
 * Write file content
 * @param {string} filePath - Path to file
 * @param {string} content - Content to write
 * @param {string} encoding - File encoding (default: 'utf8')
 * @returns {Promise<boolean>} True if file was written
 */
const writeFileContent = async (filePath, content, encoding = 'utf8') => {
  try {
    await ensureDirectory(path.dirname(filePath));
    await fs.writeFile(filePath, content, encoding);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get file MIME type based on extension
 * @param {string} filename - Filename or path
 * @returns {string} MIME type
 */
const getMimeType = (filename) => {
  const extension = getFileExtension(filename);
  const mimeTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'txt': 'text/plain',
    'csv': 'text/csv',
    'json': 'application/json',
    'xml': 'application/xml',
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    'mp4': 'video/mp4',
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav'
  };
  
  return mimeTypes[extension] || 'application/octet-stream';
};

module.exports = {
  fileExists,
  getFileSize,
  getFileExtension,
  getFileNameWithoutExtension,
  generateUniqueFilename,
  isValidFileType,
  isValidFileSize,
  formatFileSize,
  ensureDirectory,
  deleteFile,
  copyFile,
  moveFile,
  readFileContent,
  writeFileContent,
  getMimeType
};
