const FileService = require('../services/fileService');
const { logger } = require('../config/logger');

/**
 * Upload Controller
 * Handles file upload business logic
 */
class UploadController {
  /**
   * Upload single file
   */
  static async uploadSingle(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const { resize, quality } = req.body;
      const fileInfo = await FileService.processSingleFile(req.file, { resize, quality });

      logger.info(`File uploaded: ${req.file.originalname} by user ${req.user.email}`);

      res.json({
        success: true,
        message: 'File uploaded successfully',
        data: fileInfo
      });
    } catch (error) {
      logger.error('Upload single file error:', error);
      
      // Clean up file if error occurs
      FileService.cleanupFiles(req.file);

      res.status(500).json({
        success: false,
        message: 'File upload failed'
      });
    }
  }

  /**
   * Upload multiple files
   */
  static async uploadMultiple(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      const fileInfos = await FileService.processMultipleFiles(req.files);

      logger.info(`${req.files.length} files uploaded by user ${req.user.email}`);

      res.json({
        success: true,
        message: `${req.files.length} files uploaded successfully`,
        data: fileInfos
      });
    } catch (error) {
      logger.error('Upload multiple files error:', error);
      
      // Clean up files if error occurs
      FileService.cleanupFiles(req.files);

      res.status(500).json({
        success: false,
        message: 'File upload failed'
      });
    }
  }

  /**
   * Delete uploaded file
   */
  static async deleteFile(req, res) {
    try {
      const { filename } = req.params;
      
      await FileService.deleteFile(filename);

      logger.info(`File deleted: ${filename} by user ${req.user.email}`);

      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      logger.error('Delete file error:', error);
      
      if (error.message === 'File not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      if (error.message === 'Invalid filename') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to delete file'
      });
    }
  }

  /**
   * Get file info
   */
  static async getFileInfo(req, res) {
    try {
      const { filename } = req.params;
      
      const fileInfo = await FileService.getFileInfo(filename);

      res.json({
        success: true,
        data: fileInfo
      });
    } catch (error) {
      logger.error('Get file info error:', error);
      
      if (error.message === 'File not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      if (error.message === 'Invalid filename') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to get file info'
      });
    }
  }

  /**
   * List uploaded files
   */
  static async listFiles(req, res) {
    try {
      const files = await FileService.listAllFiles();

      res.json({
        success: true,
        data: files
      });
    } catch (error) {
      logger.error('List files error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to list files'
      });
    }
  }
}

module.exports = UploadController;
