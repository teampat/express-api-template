const path = require('path');
const fs = require('fs');
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
      let filePath = req.file.path;

      // Optional image processing with Sharp
      if (resize || quality) {
        // Uncomment if you want to use image processing
        /*
        const sharp = require('sharp');
        const processedPath = `${filePath}-processed${path.extname(req.file.filename)}`;
        
        let sharpInstance = sharp(filePath);
        
        if (resize) {
          const [width, height] = resize.split('x').map(Number);
          sharpInstance = sharpInstance.resize(width, height);
        }
        
        if (quality && req.file.mimetype === 'image/jpeg') {
          sharpInstance = sharpInstance.jpeg({ quality: parseInt(quality) });
        }
        
        await sharpInstance.toFile(processedPath);
        
        // Replace original file with processed one
        fs.unlinkSync(filePath);
        fs.renameSync(processedPath, filePath);
        */
      }

      const fileInfo = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: `/uploads/${req.file.filename}`
      };

      logger.info(`File uploaded: ${req.file.originalname} by user ${req.user.email}`);

      res.json({
        success: true,
        message: 'File uploaded successfully',
        data: fileInfo
      });
    } catch (error) {
      logger.error('Upload single file error:', error);
      
      // Clean up file if error occurs
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

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

      const fileInfos = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        url: `/uploads/${file.filename}`
      }));

      logger.info(`${req.files.length} files uploaded by user ${req.user.email}`);

      res.json({
        success: true,
        message: `${req.files.length} files uploaded successfully`,
        data: fileInfos
      });
    } catch (error) {
      logger.error('Upload multiple files error:', error);
      
      // Clean up files if error occurs
      if (req.files) {
        req.files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }

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
      const uploadDir = process.env.UPLOAD_PATH || 'uploads/';
      const filePath = path.join(uploadDir, filename);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      // Security check - ensure filename doesn't contain path traversal
      if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return res.status(400).json({
          success: false,
          message: 'Invalid filename'
        });
      }

      // Delete file
      fs.unlinkSync(filePath);

      logger.info(`File deleted: ${filename} by user ${req.user.email}`);

      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      logger.error('Delete file error:', error);
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
      const uploadDir = process.env.UPLOAD_PATH || 'uploads/';
      const filePath = path.join(uploadDir, filename);

      // Security check - ensure filename doesn't contain path traversal
      if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return res.status(400).json({
          success: false,
          message: 'Invalid filename'
        });
      }

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      const stats = fs.statSync(filePath);
      const fileInfo = {
        filename,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        url: `/uploads/${filename}`
      };

      res.json({
        success: true,
        data: fileInfo
      });
    } catch (error) {
      logger.error('Get file info error:', error);
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
      const uploadDir = process.env.UPLOAD_PATH || 'uploads/';
      
      if (!fs.existsSync(uploadDir)) {
        return res.json({
          success: true,
          data: []
        });
      }

      const files = fs.readdirSync(uploadDir)
        .filter(file => fs.statSync(path.join(uploadDir, file)).isFile())
        .map(filename => {
          const stats = fs.statSync(path.join(uploadDir, filename));
          return {
            filename,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            url: `/uploads/${filename}`
          };
        })
        .sort((a, b) => new Date(b.created) - new Date(a.created));

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
