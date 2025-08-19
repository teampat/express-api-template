const express = require('express');
const AuthController = require('../controllers/authController');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} = require('../validators/authValidator');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and authorization
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *                 example: "newuser@example.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: User password (minimum 6 characters)
 *                 example: "newpassword123"
 *               firstName:
 *                 type: string
 *                 description: User first name
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 description: User last name
 *                 example: "Doe"
 *           examples:
 *             newUser:
 *               summary: Register new user
 *               value:
 *                 email: "newuser@example.com"
 *                 password: "newpassword123"
 *                 firstName: "John"
 *                 lastName: "Doe"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             examples:
 *               success:
 *                 summary: Successful registration
 *                 value:
 *                   success: true
 *                   message: "User registered successfully"
 *                   data:
 *                     user:
 *                       id: 3
 *                       email: "newuser@example.com"
 *                       firstName: "John"
 *                       lastName: "Doe"
 *                       role: "user"
 *                       isActive: true
 *                       createdAt: "2025-08-19T21:47:00.000Z"
 *                       updatedAt: "2025-08-19T21:47:00.000Z"
 *                     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Validation error or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               userExists:
 *                 summary: User already exists
 *                 value:
 *                   success: false
 *                   message: "User with this email already exists"
 *               validationError:
 *                 summary: Validation error
 *                 value:
 *                   success: false
 *                   message: "Validation failed"
 *                   errors:
 *                     - "Password must be at least 6 characters long"
 */
router.post('/register', validate(registerSchema), AuthController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 description: User password
 *                 example: "user123"
 *           examples:
 *             regularUser:
 *               summary: Regular user login
 *               value:
 *                 email: "user@example.com"
 *                 password: "user123"
 *             adminUser:
 *               summary: Admin user login
 *               value:
 *                 email: "admin@example.com"
 *                 password: "admin123"
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             examples:
 *               success:
 *                 summary: Successful login
 *                 value:
 *                   success: true
 *                   message: "Login successful"
 *                   data:
 *                     user:
 *                       id: 1
 *                       email: "user@example.com"
 *                       firstName: "Regular"
 *                       lastName: "User"
 *                       role: "user"
 *                       isActive: true
 *                       createdAt: "2025-01-01T00:00:00.000Z"
 *                       updatedAt: "2025-01-01T00:00:00.000Z"
 *                     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: Invalid credentials or account deactivated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               invalidCredentials:
 *                 summary: Invalid credentials
 *                 value:
 *                   success: false
 *                   message: "Invalid email or password"
 *               accountDeactivated:
 *                 summary: Account deactivated
 *                 value:
 *                   success: false
 *                   message: "Account is deactivated"
 */
router.post('/login', validate(loginSchema), AuthController.login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 */
router.get('/me', authenticate, AuthController.getCurrentUser);

/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     summary: Change user password
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid current password
 */
router.put('/change-password', authenticate, validate(changePasswordSchema), AuthController.changePassword);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset email sent
 */
router.post('/forgot-password', validate(forgotPasswordSchema), AuthController.forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired token
 */
router.post('/reset-password', validate(resetPasswordSchema), AuthController.resetPassword);

module.exports = router;
