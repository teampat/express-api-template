const path = require('path');
const fs = require('fs');
const { logger } = require('../config/logger');

/**
 * File Service
 * Contains pure business logic for file operations
 */
class FileService {
  /**
   * Process single file upload
   */
  static async processSingleFile(file, options = {}) {
    const { resize, quality } = options;
    let filePath = file.path;

    // Optional image processing with Sharp
    if (resize || quality) {
      // Uncomment if you want to use image processing
      /*
      const sharp = require('sharp');
      const processedPath = `${filePath}-processed${path.extname(file.filename)}`;
      
      let sharpInstance = sharp(filePath);
      
      if (resize) {
        const [width, height] = resize.split('x').map(Number);
        sharpInstance = sharpInstance.resize(width, height);
      }
      
      if (quality && file.mimetype === 'image/jpeg') {
        sharpInstance = sharpInstance.jpeg({ quality: parseInt(quality) });
      }
      
      await sharpInstance.toFile(processedPath);
      
      // Replace original file with processed one
      fs.unlinkSync(filePath);
      fs.renameSync(processedPath, filePath);
      */
    }

    return {
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url: `/uploads/${file.filename}`
    };
  }

  /**
   * Process multiple file uploads
   */
  static async processMultipleFiles(files) {
    return files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url: `/uploads/${file.filename}`
    }));
  }

  /**
   * Validate filename for security
   */
  static validateFilename(filename) {
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      throw new Error('Invalid filename');
    }
    return true;
  }

  /**
   * Delete file from filesystem
   */
  static async deleteFile(filename) {
    this.validateFilename(filename);

    const uploadDir = process.env.UPLOAD_PATH || 'uploads/';
    const filePath = path.join(uploadDir, filename);

    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }

    fs.unlinkSync(filePath);
    return true;
  }

  /**
   * Get file information
   */
  static async getFileInfo(filename) {
    this.validateFilename(filename);

    const uploadDir = process.env.UPLOAD_PATH || 'uploads/';
    const filePath = path.join(uploadDir, filename);

    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }

    const stats = fs.statSync(filePath);
    return {
      filename,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      url: `/uploads/${filename}`
    };
  }

  /**
   * List all files in upload directory
   */
  static async listAllFiles() {
    const uploadDir = process.env.UPLOAD_PATH || 'uploads/';
    
    if (!fs.existsSync(uploadDir)) {
      return [];
    }

    return fs.readdirSync(uploadDir)
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
  }

  /**
   * Clean up files on error
   */
  static cleanupFiles(files) {
    if (!files) return;

    const fileArray = Array.isArray(files) ? files : [files];
    
    fileArray.forEach(file => {
      if (file && file.path && fs.existsSync(file.path)) {
        try {
          fs.unlinkSync(file.path);
        } catch (error) {
          logger.error(`Failed to cleanup file: ${file.path}`, error);
        }
      }
    });
  }
}

module.exports = FileService;
