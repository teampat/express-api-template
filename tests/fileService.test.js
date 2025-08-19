const FileService = require('../src/services/fileService');

describe('FileService', () => {
  it('should be defined', () => {
    expect(FileService).toBeDefined();
  });

  describe('getStorageConfig', () => {
    it('should return default local storage config', () => {
      const config = FileService.getStorageConfig();
      expect(config.type).toBe('local');
      expect(config.localPath).toBe('uploads/');
    });
  });

  describe('generateFilename', () => {
    it('should generate unique filename', () => {
      const filename = FileService.generateFilename('test.jpg');
      expect(filename).toMatch(/test_\d+_[a-z0-9]+\.jpg/);
    });
  });
});