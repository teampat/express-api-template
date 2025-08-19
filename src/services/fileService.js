const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { logger } = require('../config/logger');

/**
 * File Service
 * Contains pure business logic for file operations
 */
class FileService {
  
  /**
   * Get image processing configuration from environment
   */
  static getImageConfig() {
    return {
      enabled: process.env.IMAGE_RESIZE === 'true',
      maxWidth: parseInt(process.env.IMAGE_MAX_WIDTH) || 2048,
      maxHeight: parseInt(process.env.IMAGE_MAX_HEIGHT) || 2048,
      quality: parseInt(process.env.IMAGE_QUALITY) || 80,
      autoConvert: process.env.IMAGE_CONVERT === 'true',
      convertFormat: process.env.IMAGE_CONVERT_FORMAT || 'jpg'
    };
  }

  /**
   * Validate and limit resize dimensions
   */
  static validateDimensions(width, height) {
    const config = this.getImageConfig();
    const maxW = config.maxWidth;
    const maxH = config.maxHeight;
    
    const needsResize = width > maxW || height > maxH;
    
    if (needsResize) {
      // Calculate aspect ratio to maintain proportions
      const aspectRatio = width / height;
      let newWidth = width;
      let newHeight = height;
      
      if (width > maxW) {
        newWidth = maxW;
        newHeight = Math.round(maxW / aspectRatio);
      }
      
      if (newHeight > maxH) {
        newHeight = maxH;
        newWidth = Math.round(maxH * aspectRatio);
      }
      
      return {
        needsResize: true,
        originalWidth: width,
        originalHeight: height,
        recommendedWidth: newWidth,
        recommendedHeight: newHeight
      };
    }
    
    return {
      needsResize: false,
      originalWidth: width,
      originalHeight: height,
      recommendedWidth: width,
      recommendedHeight: height
    };
  }

  /**
   * Get appropriate file extension for conversion
   */
  static getConvertedExtension(fromFormat, toFormat = null) {
    const targetFormat = toFormat || fromFormat;
    
    switch (targetFormat.toLowerCase()) {
      case 'jpg':
      case 'jpeg':
        return '.jpg';
      case 'webp':
        return '.webp';
      case 'avif':
        return '.avif';
      case 'png':
        return '.png';
      default:
        return '.jpg';
    }
  }

  /**
   * Process single file upload
   */
  static async processSingleFile(file, options = {}) {
    const config = this.getImageConfig();
    
    // Check if image processing is enabled
    if (!config.enabled) {
      return {
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        url: `/uploads/${file.filename}`,
        processed: false
      };
    }

    const { resize, quality, convert } = options;
    let processedFile = file;

    // Image processing with Sharp
    const shouldProcess = (resize || quality || convert || config.autoConvert) && file.mimetype.startsWith('image/');
    
    if (shouldProcess) {
      const uploadDir = process.env.UPLOAD_PATH || 'uploads/';
      
      // Determine output format
      let outputFormat = convert || (config.autoConvert ? config.convertFormat : null);
      let processedFilename = file.filename;
      
      if (outputFormat) {
        const ext = this.getConvertedExtension(outputFormat);
        const nameWithoutExt = path.parse(file.filename).name;
        processedFilename = `${nameWithoutExt}${ext}`;
      }
      
      const processedPath = path.join(uploadDir, `processed_${processedFilename}`);
      
      try {
        let sharpInstance = sharp(file.path);

        // Resize if dimensions provided or if exceeds max dimensions
        if (resize) {
          const [width, height] = resize.split('x').map(Number);
          if (width && height) {
            const validatedDims = this.validateDimensions(width, height);
            sharpInstance = sharpInstance.resize(validatedDims.width, validatedDims.height, { 
              fit: 'inside', 
              withoutEnlargement: true 
            });
            logger.info(`Resizing image to ${validatedDims.width}x${validatedDims.height}`);
          }
        } else {
          // Check if image exceeds max dimensions
          const metadata = await sharpInstance.metadata();
          if (metadata.width > config.maxWidth || metadata.height > config.maxHeight) {
            const validatedDims = this.validateDimensions(metadata.width, metadata.height);
            sharpInstance = sharpInstance.resize(validatedDims.width, validatedDims.height, { 
              fit: 'inside', 
              withoutEnlargement: true 
            });
            logger.info(`Auto-resizing oversized image to ${validatedDims.width}x${validatedDims.height}`);
          }
        }

        // Set quality (use provided quality or default from config)
        const imageQuality = quality ? parseInt(quality) : config.defaultQuality;
        
        // Apply format conversion and quality settings
        if (outputFormat) {
          switch (outputFormat.toLowerCase()) {
            case 'jpg':
            case 'jpeg':
              sharpInstance = sharpInstance.jpeg({ quality: imageQuality });
              break;
            case 'webp':
              sharpInstance = sharpInstance.webp({ quality: imageQuality });
              break;
            case 'avif':
              sharpInstance = sharpInstance.avif({ quality: imageQuality });
              break;
            case 'png':
              const pngQuality = Math.round((imageQuality / 100) * 9);
              sharpInstance = sharpInstance.png({ quality: pngQuality });
              break;
          }
          logger.info(`Converting to ${outputFormat.toUpperCase()} with quality ${imageQuality}`);
        } else {
          // Apply quality to original format
          if (file.mimetype === 'image/jpeg') {
            sharpInstance = sharpInstance.jpeg({ quality: imageQuality });
          } else if (file.mimetype === 'image/png') {
            const pngQuality = Math.round((imageQuality / 100) * 9);
            sharpInstance = sharpInstance.png({ quality: pngQuality });
          } else if (file.mimetype === 'image/webp') {
            sharpInstance = sharpInstance.webp({ quality: imageQuality });
          }
          if (imageQuality !== config.defaultQuality) {
            logger.info(`Setting quality to ${imageQuality}`);
          }
        }

        // Process the image
        await sharpInstance.toFile(processedPath);

        // Get stats of processed file
        const stats = fs.statSync(processedPath);

        // Remove original file and use processed one
        fs.unlinkSync(file.path);
        const finalPath = path.join(uploadDir, processedFilename);
        fs.renameSync(processedPath, finalPath);

        // Update file info
        processedFile = {
          ...file,
          filename: processedFilename,
          path: finalPath,
          size: stats.size,
          mimetype: outputFormat ? `image/${outputFormat === 'jpg' ? 'jpeg' : outputFormat}` : file.mimetype
        };

        logger.info(`Image processed successfully: ${file.originalname} -> ${processedFilename}`);
      } catch (error) {
        logger.error('Image processing error:', error);
        // If processing fails, use original file
        if (fs.existsSync(processedPath)) {
          fs.unlinkSync(processedPath);
        }
      }
    }

    return {
      filename: processedFile.filename,
      originalName: processedFile.originalname,
      size: processedFile.size,
      mimetype: processedFile.mimetype,
      url: `/uploads/${processedFile.filename}`,
      processed: shouldProcess && processedFile !== file
    };
  }

  /**
   * Process multiple file uploads
   */
  static async processMultipleFiles(files, options = {}) {
    const config = this.getImageConfig();
    
    // If image processing is disabled, return files as-is
    if (!config.enabled) {
      return files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        url: `/uploads/${file.filename}`,
        processed: false
      }));
    }

    const processedFiles = [];

    for (const file of files) {
      // Process each file individually using the same logic
      const processedFile = await this.processSingleFile(file, options);
      processedFiles.push(processedFile);
    }

    return processedFiles;
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
