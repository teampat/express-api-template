const FileService = require('../src/services/fileService');
const S3Service = require('../src/services/s3Service');
const fs = require('fs');
const path = require('path');

// Mock S3Service
jest.mock('../src/services/s3Service', () => ({
  uploadFile: jest.fn(),
  deleteFile: jest.fn(),
  listFiles: jest.fn(),
  getPublicUrl: jest.fn(),
  isConfigured: jest.fn()
}));

// Mock logger
jest.mock('../src/config/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  }
}));

// Mock fs
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  copyFileSync: jest.fn(),
  unlinkSync: jest.fn(),
  readdirSync: jest.fn(),
  statSync: jest.fn(),
  promises: {
    unlink: jest.fn()
  }
}));

// Mock path
jest.mock('path', () => ({
  extname: jest.fn((filename) => {
    const parts = filename.split('.');
    return parts.length > 1 ? '.' + parts[parts.length - 1] : '';
  }),
  basename: jest.fn((filename, ext) => {
    const base = filename.replace(ext || '', '');
    return base;
  }),
  join: jest.fn((...args) => args.join('/'))
}));

describe('FileService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset environment variables
    delete process.env.UPLOAD_STORAGE;
    delete process.env.UPLOAD_PATH;
    delete process.env.S3_BUCKET;
    delete process.env.S3_REGION;
  });

  it('should be defined', () => {
    expect(FileService).toBeDefined();
  });

  describe('getStorageConfig', () => {
    it('should return default local storage config', () => {
      const config = FileService.getStorageConfig();
      expect(config.type).toBe('local');
      expect(config.localPath).toBe('uploads/');
    });

    it('should return S3 storage config when configured', () => {
      process.env.UPLOAD_STORAGE = 's3';
      process.env.S3_BUCKET = 'test-bucket';
      process.env.S3_REGION = 'us-west-2';
      
      const config = FileService.getStorageConfig();
      expect(config.type).toBe('s3');
      expect(config.s3.bucket).toBe('test-bucket');
      expect(config.s3.region).toBe('us-west-2');
    });

    it('should handle custom upload path', () => {
      process.env.UPLOAD_PATH = 'custom/uploads/';
      
      const config = FileService.getStorageConfig();
      expect(config.localPath).toBe('custom/uploads/');
    });
  });

  describe('generateFilename', () => {
    it('should generate unique filename', () => {
      const filename = FileService.generateFilename('test.jpg');
      expect(filename).toMatch(/test_\d+_[a-z0-9]+\.jpg/);
    });

    it('should generate filename with new extension when outputFormat specified', () => {
      const filename = FileService.generateFilename('test.png', { outputFormat: 'webp' });
      expect(filename).toMatch(/test_\d+_[a-z0-9]+\.webp/);
    });

    it('should clean filename with special characters', () => {
      const filename = FileService.generateFilename('test image!@#.jpg');
      expect(filename).toMatch(/test_image____\d+_[a-z0-9]+\.jpg/);
    });

    it('should handle jpg format correctly', () => {
      const filename = FileService.generateFilename('test.png', { outputFormat: 'jpg' });
      expect(filename).toMatch(/test_\d+_[a-z0-9]+\.jpg/);
    });

    it('should generate different filenames for same input', () => {
      const filename1 = FileService.generateFilename('test.jpg');
      const filename2 = FileService.generateFilename('test.jpg');
      expect(filename1).not.toBe(filename2);
    });
  });

  describe('getFileUrl', () => {
    beforeEach(() => {
      // Reset environment variables
      delete process.env.UPLOAD_STORAGE;
      delete process.env.UPLOAD_PATH;
      jest.clearAllMocks();
    });

    it('should return local URL for local storage', () => {
      process.env.UPLOAD_STORAGE = 'local';
      
      const url = FileService.getFileUrl('test-file.jpg');
      expect(url).toBe('/uploads/test-file.jpg');
    });

    it('should return S3 URL for S3 storage', () => {
      process.env.UPLOAD_STORAGE = 's3';
      S3Service.getPublicUrl.mockReturnValue('https://s3.example.com/test-file.jpg');
      
      const url = FileService.getFileUrl('test-file.jpg');
      expect(url).toBe('https://s3.example.com/test-file.jpg');
      expect(S3Service.getPublicUrl).toHaveBeenCalledWith('test-file.jpg');
    });

    it('should use custom upload path for local URLs', () => {
      process.env.UPLOAD_STORAGE = 'local';
      process.env.UPLOAD_PATH = 'custom/path/';
      
      const url = FileService.getFileUrl('test-file.jpg');
      expect(url).toBe('/custom/path/test-file.jpg');
    });
  });

  describe('validateFilename', () => {
    it('should validate safe filenames', () => {
      expect(() => FileService.validateFilename('test-file.jpg')).not.toThrow();
      expect(() => FileService.validateFilename('image123.png')).not.toThrow();
      expect(() => FileService.validateFilename('file_with_underscores.txt')).not.toThrow();
    });

    it('should reject filenames with path traversal', () => {
      expect(() => FileService.validateFilename('../test.jpg')).toThrow('Invalid filename');
      expect(() => FileService.validateFilename('test/../../secret.txt')).toThrow('Invalid filename');
      expect(() => FileService.validateFilename('..\\test.jpg')).toThrow('Invalid filename');
    });
  });

  describe('getExtensionFromMimeType', () => {
    it('should return correct extensions for supported MIME types', () => {
      expect(FileService.getExtensionFromMimeType('image/jpeg')).toBe('jpg');
      expect(FileService.getExtensionFromMimeType('image/png')).toBe('png');
      expect(FileService.getExtensionFromMimeType('image/webp')).toBe('webp');
    });

    it('should return jpg as default for unsupported MIME types', () => {
      expect(FileService.getExtensionFromMimeType('application/unknown')).toBe('jpg');
      expect(FileService.getExtensionFromMimeType('text/unknown')).toBe('jpg');
      expect(FileService.getExtensionFromMimeType('')).toBe('jpg');
      expect(FileService.getExtensionFromMimeType(null)).toBe('jpg');
    });

    it('should handle case insensitive MIME types', () => {
      expect(FileService.getExtensionFromMimeType('IMAGE/JPEG')).toBe('jpg');
    });
  });

  describe('cleanupFiles', () => {
    it('should handle cleanup gracefully with null input', () => {
      expect(() => FileService.cleanupFiles(null)).not.toThrow();
      expect(() => FileService.cleanupFiles(undefined)).not.toThrow();
    });

    it('should handle cleanup gracefully with empty array', () => {
      expect(() => FileService.cleanupFiles([])).not.toThrow();
    });
  });
});