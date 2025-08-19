const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { logger } = require('../config/logger');
const S3Service = require('./s3Service');
const { 
  generateUniqueFilename, 
  getFileExtension, 
  formatFileSize, 
  isValidFileType, 
  isValidFileSize,
  getMimeType,
  ensureDirectory 
} = require('../utils');

class FileService {
  /**
   * Get storage configuration
   */
  static getStorageConfig() {
    return {
      type: process.env.UPLOAD_STORAGE || 'local',
      localPath: process.env.UPLOAD_PATH || 'uploads/',
      s3: {
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION || 'us-east-1',
        bucket: process.env.S3_BUCKET,
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true'
      }
    };
  }

  /**
   * Save file to configured storage
   */
  static async saveFile(filePath, filename, data = null) {
    const storageConfig = this.getStorageConfig();
    
    if (storageConfig.type === 's3') {
      // For S3 storage, upload the file
      if (data) {
        return await S3Service.uploadFile(filename, data);
      } else {
        // Read file data and upload
        const fileData = fs.readFileSync(filePath);
        return await S3Service.uploadFile(filename, fileData);
      }
    } else {
      // For local storage, ensure the file is in the correct location
      const uploadDir = storageConfig.localPath;
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const targetPath = path.join(uploadDir, filename);
      if (filePath !== targetPath) {
        if (data) {
          fs.writeFileSync(targetPath, data);
        } else {
          fs.copyFileSync(filePath, targetPath);
        }
      }
      
      return {
        filename,
        url: `/uploads/${filename}`,
        size: fs.statSync(targetPath).size
      };
    }
  }

  /**
   * Delete file from configured storage
   */
  static async deleteFile(filename) {
    this.validateFilename(filename);
    const storageConfig = this.getStorageConfig();
    
    if (storageConfig.type === 's3') {
      return await S3Service.deleteFile(filename);
    } else {
      const uploadDir = storageConfig.localPath;
      const filePath = path.join(uploadDir, filename);

      if (!fs.existsSync(filePath)) {
        throw new Error('File not found');
      }

      fs.unlinkSync(filePath);
      return true;
    }
  }

  /**
   * Get file URL based on storage type
   */
  static getFileUrl(filename) {
    const storageConfig = this.getStorageConfig();
    
    if (storageConfig.type === 's3') {
      // For S3, generate a URL (this could be a signed URL if needed)
      return S3Service.getPublicUrl(filename);
    } else {
      // Remove trailing slash if present and add leading slash for URL
      const cleanPath = storageConfig.localPath.replace(/\/$/, '');
      return `/${cleanPath}/${filename}`;
    }
  }

  /**
   * Get image processing configuration
   */
  static getImageConfig() {
    return {
      enabled: process.env.IMAGE_RESIZE === 'true',
      autoConvert: process.env.IMAGE_CONVERT === 'true',
      maxWidth: parseInt(process.env.IMAGE_MAX_WIDTH) || 1920,
      maxHeight: parseInt(process.env.IMAGE_MAX_HEIGHT) || 1080,
      defaultQuality: parseInt(process.env.IMAGE_QUALITY) || 80,
      allowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
    };
  }

  /**
   * Validate image dimensions
   */
  static validateDimensions(width, height) {
    const config = this.getImageConfig();
    
    // Ensure dimensions don't exceed maximum allowed
    const validWidth = Math.min(width, config.maxWidth);
    const validHeight = Math.min(height, config.maxHeight);
    
    // Maintain aspect ratio
    const aspectRatio = width / height;
    
    if (validWidth / validHeight > aspectRatio) {
      return {
        width: Math.round(validHeight * aspectRatio),
        height: validHeight
      };
    } else {
      return {
        width: validWidth,
        height: Math.round(validWidth / aspectRatio)
      };
    }
  }

  /**
   * Get file extension from mimetype
   */
  static getExtensionFromMimeType(mimetype) {
    const mimeToExt = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/avif': 'avif'
    };
    return mimeToExt[mimetype] || 'jpg';
  }

  /**
   * Generate unique filename for uploaded files
   */
  static generateFilename(originalName, options = {}) {
    // Use utility function for consistent filename generation
    const prefix = options.prefix || '';
    return generateUniqueFilename(originalName, prefix);
  }

  /**
   * Process a single file upload with image processing
   */
  static async processSingleFile(file, options = {}) {
    const config = this.getImageConfig();
    const storageConfig = this.getStorageConfig();
    const { resize, quality, outputFormat } = options;

    logger.info(`Processing file: ${file.originalname}, Size: ${file.size} bytes`);

    // Check if file is an image
    const isImage = file.mimetype && file.mimetype.startsWith('image/');
    
    // Determine if we should process the image
    const shouldProcess = config.enabled && isImage;
    
    let processedFile = file;
    let processedFilename = file.filename;

    if (shouldProcess) {
      // Determine output format
      let finalFormat = outputFormat;
      if (!finalFormat && config.autoConvert) {
        finalFormat = 'webp'; // Default auto-convert format
      }

      // Generate processed filename
      processedFilename = this.generateFilename(file.originalname, { outputFormat: finalFormat });

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
        if (finalFormat) {
          switch (finalFormat.toLowerCase()) {
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
          logger.info(`Converting to ${finalFormat.toUpperCase()} with quality ${imageQuality}`);
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

        // Process the image to buffer
        const processedBuffer = await sharpInstance.toBuffer();

        // Save processed file to storage
        const saveResult = await this.saveFile(file.path, processedFilename, processedBuffer);

        // Clean up original temporary file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }

        // Update file info
        processedFile = {
          ...file,
          filename: processedFilename,
          size: processedBuffer.length,
          mimetype: finalFormat ? `image/${finalFormat === 'jpg' ? 'jpeg' : finalFormat}` : file.mimetype
        };

        logger.info(`Image processed successfully: ${file.originalname} -> ${processedFilename}`);

        return {
          filename: processedFile.filename,
          originalName: processedFile.originalname,
          size: processedFile.size,
          mimetype: processedFile.mimetype,
          url: saveResult.url || this.getFileUrl(processedFile.filename),
          processed: true,
          storage: storageConfig.type,
          s3Key: storageConfig.type === 's3' ? saveResult.key : undefined
        };

      } catch (error) {
        logger.error('Image processing error:', error);
        // If processing fails, save original file
        const saveResult = await this.saveFile(file.path, file.filename);
        
        // Clean up original temporary file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }

        return {
          filename: file.filename,
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          url: saveResult.url || this.getFileUrl(file.filename),
          processed: false,
          storage: storageConfig.type,
          error: 'Processing failed, original file saved',
          s3Key: storageConfig.type === 's3' ? saveResult.key : undefined
        };
      }
    } else {
      // No processing needed, just save the file
      const saveResult = await this.saveFile(file.path, file.filename);
      
      // Clean up original temporary file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      return {
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        url: saveResult.url || this.getFileUrl(file.filename),
        processed: false,
        storage: storageConfig.type,
        s3Key: storageConfig.type === 's3' ? saveResult.key : undefined
      };
    }
  }

  /**
   * Process multiple file uploads
   */
  static async processMultipleFiles(files, options = {}) {
    const processedFiles = [];

    for (const file of files) {
      try {
        const processedFile = await this.processSingleFile(file, options);
        processedFiles.push(processedFile);
      } catch (error) {
        logger.error(`Failed to process file ${file.originalname}:`, error);
        
        // Clean up file on error
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        
        processedFiles.push({
          filename: file.filename,
          originalName: file.originalname,
          error: error.message,
          processed: false
        });
      }
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
   * Get file information
   */
  static async getFileInfo(filename) {
    this.validateFilename(filename);
    const storageConfig = this.getStorageConfig();

    if (storageConfig.type === 's3') {
      // For S3, get file info from S3
      try {
        const fileInfo = await S3Service.getFileInfo(filename);
        return {
          filename,
          size: fileInfo.size,
          created: fileInfo.lastModified,
          modified: fileInfo.lastModified,
          url: this.getFileUrl(filename),
          storage: 's3',
          etag: fileInfo.etag
        };
      } catch (error) {
        throw new Error('File not found');
      }
    } else {
      // For local storage
      const uploadDir = storageConfig.localPath;
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
        url: this.getFileUrl(filename),
        storage: 'local'
      };
    }
  }

  /**
   * List all files in upload storage
   */
  static async listAllFiles() {
    const storageConfig = this.getStorageConfig();

    if (storageConfig.type === 's3') {
      // For S3, list files from S3
      try {
        const s3Files = await S3Service.listFiles();
        return s3Files.map(file => ({
          filename: file.key,
          size: file.size,
          created: file.lastModified,
          modified: file.lastModified,
          url: this.getFileUrl(file.key),
          storage: 's3',
          etag: file.etag
        })).sort((a, b) => new Date(b.created) - new Date(a.created));
      } catch (error) {
        logger.error('Failed to list S3 files:', error);
        return [];
      }
    } else {
      // For local storage
      const uploadDir = storageConfig.localPath;
      
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
            url: this.getFileUrl(filename),
            storage: 'local'
          };
        })
        .sort((a, b) => new Date(b.created) - new Date(a.created));
    }
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

  /**
   * Download file from S3 (if using S3 storage)
   */
  static async downloadFile(filename) {
    this.validateFilename(filename);
    const storageConfig = this.getStorageConfig();

    if (storageConfig.type === 's3') {
      return await S3Service.getFile(filename);
    } else {
      // For local storage, read file directly
      const uploadDir = storageConfig.localPath;
      const filePath = path.join(uploadDir, filename);

      if (!fs.existsSync(filePath)) {
        throw new Error('File not found');
      }

      return fs.readFileSync(filePath);
    }
  }
}

module.exports = FileService;
