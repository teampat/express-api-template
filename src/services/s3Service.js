const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const { logger } = require('../config/logger');

/**
 * S3 Service for Object Storage Operations
 * Supports S3-compatible object storage (AWS S3, MinIO, DigitalOcean Spaces, etc.)
 */
class S3Service {
  constructor() {
    this.client = null;
    this.bucket = process.env.S3_BUCKET;
    this.initializeClient();
  }

  /**
   * Initialize S3 client with configuration
   */
  initializeClient() {
    if (!process.env.S3_ENDPOINT || !process.env.S3_BUCKET || process.env.UPLOAD_STORAGE !== 's3') {
      return;
    }

    const config = {
      region: process.env.S3_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
    };

    // Add endpoint for S3-compatible services (MinIO, DigitalOcean Spaces, etc.)
    if (process.env.S3_ENDPOINT && process.env.S3_ENDPOINT !== 'aws') {
      config.endpoint = process.env.S3_ENDPOINT;
      config.forcePathStyle = process.env.S3_FORCE_PATH_STYLE === 'true';
    }

    this.client = new S3Client(config);
    logger.info('S3 client initialized successfully');
  }

  /**
   * Check if S3 is properly configured
   */
  isConfigured() {
    return this.client !== null && this.bucket;
  }

  /**
   * Generate a unique object key
   */
  generateObjectKey(originalName, prefix = '') {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const extension = originalName.split('.').pop();
    const baseName = originalName.split('.').slice(0, -1).join('.');
    
    if (prefix) {
      return `${prefix}/${timestamp}-${random}-${baseName}.${extension}`;
    }
    
    return `${timestamp}-${random}-${baseName}.${extension}`;
  }

  /**
   * Upload file to S3
   */
  async uploadFile(fileBuffer, originalName, mimeType, options = {}) {
    if (!this.isConfigured()) {
      throw new Error('S3 is not properly configured');
    }

    const objectKey = this.generateObjectKey(originalName, options.prefix);

    try {
      const uploadParams = {
        Bucket: this.bucket,
        Key: objectKey,
        Body: fileBuffer,
        ContentType: mimeType,
        ...options.metadata && { Metadata: options.metadata },
      };

      // Use multipart upload for larger files
      const upload = new Upload({
        client: this.client,
        params: uploadParams,
      });

      const result = await upload.done();
      
      logger.info(`File uploaded to S3: ${objectKey}`);
      
      return {
        key: objectKey,
        bucket: this.bucket,
        location: result.Location,
        etag: result.ETag,
        size: fileBuffer.length,
        mimeType,
        originalName,
      };
    } catch (error) {
      logger.error('Error uploading file to S3:', error);
      throw error;
    }
  }

  /**
   * Upload multiple files to S3
   */
  async uploadMultipleFiles(files, options = {}) {
    if (!this.isConfigured()) {
      throw new Error('S3 is not properly configured');
    }

    const uploadPromises = files.map(file => 
      this.uploadFile(file.buffer, file.originalname, file.mimetype, {
        ...options,
        prefix: options.prefix || 'uploads',
      })
    );

    try {
      const results = await Promise.all(uploadPromises);
      logger.info(`${results.length} files uploaded to S3 successfully`);
      return results;
    } catch (error) {
      logger.error('Error uploading multiple files to S3:', error);
      throw error;
    }
  }

  /**
   * Delete file from S3
   */
  async deleteFile(objectKey) {
    if (!this.isConfigured()) {
      throw new Error('S3 is not properly configured');
    }

    try {
      const deleteParams = {
        Bucket: this.bucket,
        Key: objectKey,
      };

      await this.client.send(new DeleteObjectCommand(deleteParams));
      logger.info(`File deleted from S3: ${objectKey}`);
      
      return { success: true, key: objectKey };
    } catch (error) {
      logger.error('Error deleting file from S3:', error);
      throw error;
    }
  }

  /**
   * Get file from S3
   */
  async getFile(objectKey) {
    if (!this.isConfigured()) {
      throw new Error('S3 is not properly configured');
    }

    try {
      const getParams = {
        Bucket: this.bucket,
        Key: objectKey,
      };

      const result = await this.client.send(new GetObjectCommand(getParams));
      return result;
    } catch (error) {
      logger.error('Error getting file from S3:', error);
      throw error;
    }
  }

  /**
   * Generate presigned URL for file access
   */
  getFileUrl(objectKey) {
    if (process.env.S3_ENDPOINT && process.env.S3_ENDPOINT !== 'aws') {
      // For S3-compatible services, construct URL manually
      const endpoint = process.env.S3_ENDPOINT.replace(/\/$/, '');
      return `${endpoint}/${this.bucket}/${objectKey}`;
    }
    
    // For AWS S3
    return `https://${this.bucket}.s3.${process.env.S3_REGION || 'us-east-1'}.amazonaws.com/${objectKey}`;
  }

  /**
   * List files in bucket (with optional prefix)
   */
  async listFiles(prefix = '', maxKeys = 1000) {
    if (!this.isConfigured()) {
      throw new Error('S3 is not properly configured');
    }

    try {
      const { ListObjectsV2Command } = require('@aws-sdk/client-s3');
      
      const listParams = {
        Bucket: this.bucket,
        Prefix: prefix,
        MaxKeys: maxKeys,
      };

      const result = await this.client.send(new ListObjectsV2Command(listParams));
      return result.Contents || [];
    } catch (error) {
      logger.error('Error listing files from S3:', error);
      throw error;
    }
  }
}

module.exports = new S3Service();
