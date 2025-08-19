const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
// const sharp = require('sharp'); // Optional - uncomment if you need image processing
const { authenticate } = require('../middleware/auth');
const { logger } = require('../config/logger');

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadDir = process.env.UPLOAD_PATH || 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif').split(',');

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 5 // Maximum 5 files
  }
});

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: File upload operations
 */

/**
 * @swagger
 * /api/upload/single:
 *   post:
 *     summary: Upload a single file
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               resize:
 *                 type: string
 *                 description: Resize dimensions (e.g., "800x600")
 *               quality:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100
 *                 description: JPEG quality (1-100)
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     filename:
 *                       type: string
 *                     originalName:
 *                       type: string
 *                     size:
 *                       type: integer
 *                     mimetype:
 *                       type: string
 *                     url:
 *                       type: string
 *       400:
 *         description: Upload error
 */
router.post('/single', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    let processedFile = req.file;

    // Image processing with Sharp (commented out - install sharp if needed)
    /*
    if (req.file.mimetype.startsWith('image/')) {
      const { resize, quality } = req.body;
      
      if (resize || quality) {
        const processedPath = path.join(uploadDir, `processed_${req.file.filename}`);
        let sharpInstance = sharp(req.file.path);

        // Resize if dimensions provided
        if (resize) {
          const [width, height] = resize.split('x').map(Number);
          if (width && height) {
            sharpInstance = sharpInstance.resize(width, height, { fit: 'inside', withoutEnlargement: true });
          }
        }

        // Set quality for JPEG
        if (quality && req.file.mimetype === 'image/jpeg') {
          sharpInstance = sharpInstance.jpeg({ quality: parseInt(quality) });
        }

        await sharpInstance.toFile(processedPath);

        // Remove original file and use processed one
        fs.unlinkSync(req.file.path);
        processedFile = {
          ...req.file,
          path: processedPath,
          size: fs.statSync(processedPath).size
        };
      }
    }
    */

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${path.basename(processedFile.path)}`;

    logger.info(`File uploaded: ${processedFile.originalname} by user ${req.user.email}`);

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename: path.basename(processedFile.path),
        originalName: processedFile.originalname,
        size: processedFile.size,
        mimetype: processedFile.mimetype,
        url: fileUrl
      }
    });
  } catch (error) {
    logger.error('File upload error:', error);

    // Clean up file if it exists
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'File upload failed',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/upload/multiple:
 *   post:
 *     summary: Upload multiple files
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Files uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       filename:
 *                         type: string
 *                       originalName:
 *                         type: string
 *                       size:
 *                         type: integer
 *                       mimetype:
 *                         type: string
 *                       url:
 *                         type: string
 */
router.post('/multiple', authenticate, upload.array('files', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadedFiles = req.files.map(file => {
      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;

      return {
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        url: fileUrl
      };
    });

    logger.info(`${req.files.length} files uploaded by user ${req.user.email}`);

    res.json({
      success: true,
      message: `${req.files.length} files uploaded successfully`,
      data: uploadedFiles
    });
  } catch (error) {
    logger.error('Multiple file upload error:', error);

    // Clean up files if they exist
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    res.status(500).json({
      success: false,
      message: 'File upload failed',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/upload/{filename}:
 *   delete:
 *     summary: Delete an uploaded file
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the file to delete
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       404:
 *         description: File not found
 */
router.delete('/:filename', authenticate, async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadDir, filename);

    // Security check: ensure filename doesn't contain path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename'
      });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    fs.unlinkSync(filePath);

    logger.info(`File deleted: ${filename} by user ${req.user.email}`);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    logger.error('File deletion error:', error);

    res.status(500).json({
      success: false,
      message: 'File deletion failed',
      error: error.message
    });
  }
});

module.exports = router;
