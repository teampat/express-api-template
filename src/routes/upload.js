const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const UploadController = require('../controllers/uploadController');
// const sharp = require('sharp'); // Optional - uncomment if you need image processing
const { authenticate } = require('../middleware/auth');

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
 * /upload/single:
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
 *                 description: Image quality (1-100)
 *               outputFormat:
 *                 type: string
 *                 description: Output format (jpg, webp, avif, png)
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
router.post('/single', authenticate, upload.single('file'), UploadController.uploadSingle);

/**
 * @swagger
 * /upload/multiple:
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
 *               resize:
 *                 type: string
 *                 description: Resize dimensions (e.g., "800x600")
 *               quality:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100
 *                 description: Image quality (1-100)
 *               outputFormat:
 *                 type: string
 *                 description: Output format (jpg, webp, avif, png)
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
router.post('/multiple', authenticate, upload.array('files', 5), UploadController.uploadMultiple);

/**
 * @swagger
 * /upload/{filename}:
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
router.delete('/:filename', authenticate, UploadController.deleteFile);

/**
 * @swagger
 * /upload/info/{filename}:
 *   get:
 *     summary: Get file information
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the file
 *     responses:
 *       200:
 *         description: File information retrieved successfully
 *       404:
 *         description: File not found
 */
router.get('/info/:filename', authenticate, UploadController.getFileInfo);

/**
 * @swagger
 * /upload/list:
 *   get:
 *     summary: List all uploaded files
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Files listed successfully
 */
router.get('/list', authenticate, UploadController.listFiles);

/**
 * @swagger
 * /upload/download/{filename}:
 *   get:
 *     summary: Download a file
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the file to download
 *     responses:
 *       200:
 *         description: File downloaded successfully
 *       404:
 *         description: File not found
 */
router.get('/download/:filename', authenticate, UploadController.downloadFile);

/**
 * @swagger
 * /upload/storage/status:
 *   get:
 *     summary: Get current storage configuration status
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Storage status retrieved successfully
 */
router.get('/storage/status', authenticate, UploadController.getStorageStatus);

module.exports = router;
