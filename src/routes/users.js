const express = require('express');
const UserController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { updateProfileSchema, changePasswordSchema } = require('../validators/authValidator');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *             examples:
 *               success:
 *                 summary: Successful response
 *                 value:
 *                   success: true
 *                   data:
 *                     id: 1
 *                     email: "user@example.com"
 *                     firstName: "John"
 *                     lastName: "Doe"
 *                     role: "user"
 *                     isActive: true
 *                     createdAt: "2025-01-01T00:00:00.000Z"
 *                     updatedAt: "2025-01-01T00:00:00.000Z"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/me', authenticate, UserController.getCurrentUser);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of users per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by email, first name, or last name
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, admin]
 *         description: Filter by role
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserListResponse'
 *             examples:
 *               success:
 *                 summary: Successful response
 *                 value:
 *                   success: true
 *                   data:
 *                     users:
 *                       - id: 1
 *                         email: "admin@example.com"
 *                         firstName: "Admin"
 *                         lastName: "User"
 *                         role: "admin"
 *                         isActive: true
 *                         createdAt: "2025-01-01T00:00:00.000Z"
 *                         updatedAt: "2025-01-01T00:00:00.000Z"
 *                       - id: 2
 *                         email: "user@example.com"
 *                         firstName: "Regular"
 *                         lastName: "User"
 *                         role: "user"
 *                         isActive: true
 *                         createdAt: "2025-01-01T00:00:00.000Z"
 *                         updatedAt: "2025-01-01T00:00:00.000Z"
 *                     pagination:
 *                       page: 1
 *                       limit: 10
 *                       total: 2
 *                       pages: 1
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', authenticate, authorize('admin'), UserController.getAllUsers);

/**
 * @swagger
 * /api/users/me/change-password:
 *   put:
 *     summary: Change current user password
 *     tags: [Users]
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
 *                 description: Current password
 *                 example: "oldpassword123"
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 description: New password (min 6 characters)
 *                 example: "newpassword123"
 *           examples:
 *             changePassword:
 *               summary: Change password
 *               value:
 *                 currentPassword: "oldpassword123"
 *                 newPassword: "newpassword123"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Password changed successfully"
 *             examples:
 *               success:
 *                 summary: Successful password change
 *                 value:
 *                   success: true
 *                   message: "Password changed successfully"
 *       400:
 *         description: Bad request - Invalid current password or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/me/change-password', authenticate, validate(changePasswordSchema), UserController.changePassword);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *             examples:
 *               success:
 *                 summary: Successful response
 *                 value:
 *                   success: true
 *                   data:
 *                     id: 1
 *                     email: "user@example.com"
 *                     firstName: "John"
 *                     lastName: "Doe"
 *                     role: "user"
 *                     isActive: true
 *                     createdAt: "2025-01-01T00:00:00.000Z"
 *                     updatedAt: "2025-01-01T00:00:00.000Z"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Cannot view other user's profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', authenticate, UserController.getUserById);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *           examples:
 *             updateProfile:
 *               summary: Update user profile
 *               value:
 *                 firstName: "John"
 *                 lastName: "Doe"
 *                 email: "john.doe@example.com"
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserUpdateResponse'
 *             examples:
 *               success:
 *                 summary: Successful update
 *                 value:
 *                   success: true
 *                   message: "User updated successfully"
 *                   data:
 *                     id: 1
 *                     email: "john.doe@example.com"
 *                     firstName: "John"
 *                     lastName: "Doe"
 *                     role: "user"
 *                     isActive: true
 *                     createdAt: "2025-01-01T00:00:00.000Z"
 *                     updatedAt: "2025-01-01T12:00:00.000Z"
 *       400:
 *         description: Bad request - Email already taken or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Cannot update other user's profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', authenticate, validate(updateProfileSchema), UserController.updateUserById);

/**
 * @swagger
 * /api/users/{id}/toggle-status:
 *   patch:
 *     summary: Toggle user active status (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserStatusResponse'
 *             examples:
 *               activated:
 *                 summary: User activated
 *                 value:
 *                   success: true
 *                   message: "User activated successfully"
 *                   data:
 *                     id: 1
 *                     email: "user@example.com"
 *                     firstName: "John"
 *                     lastName: "Doe"
 *                     role: "user"
 *                     isActive: true
 *                     createdAt: "2025-01-01T00:00:00.000Z"
 *                     updatedAt: "2025-01-01T12:00:00.000Z"
 *               deactivated:
 *                 summary: User deactivated
 *                 value:
 *                   success: true
 *                   message: "User deactivated successfully"
 *                   data:
 *                     id: 1
 *                     email: "user@example.com"
 *                     firstName: "John"
 *                     lastName: "Doe"
 *                     role: "user"
 *                     isActive: false
 *                     createdAt: "2025-01-01T00:00:00.000Z"
 *                     updatedAt: "2025-01-01T12:00:00.000Z"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/:id/toggle-status', authenticate, authorize('admin'), async (req, res) => {
  const { id } = req.params;

  const user = await User.findByPk(id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  await user.update({ isActive: !user.isActive });

  logger.info(`User status toggled: ${user.email} - ${user.isActive ? 'activated' : 'deactivated'}`);

  res.json({
    success: true,
    message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
    data: user
  });
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserDeleteResponse'
 *             examples:
 *               success:
 *                 summary: Successful deletion
 *                 value:
 *                   success: true
 *                   message: "User deleted successfully"
 *       400:
 *         description: Bad request - Cannot delete own account
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', authenticate, authorize('admin'), UserController.deleteUser);

module.exports = router;
