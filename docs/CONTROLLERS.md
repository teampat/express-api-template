# Controller Architecture

This Express.js API template now follows the MVC (Model-View-Controller) pattern with dedicated controller classes for better code organization and separation of concerns.

## Controller Structure

### AuthController (`src/controllers/authController.js`)
Handles all authentication-related business logic:
- `register()` - User registration with JWT token generation
- `login()` - User authentication and login
- `getCurrentUser()` - Get current authenticated user profile
- `changePassword()` - Password change functionality
- `forgotPassword()` - Password reset request with email notification
- `resetPassword()` - Password reset with token validation

### UserController (`src/controllers/userController.js`)
Handles user management operations:
- `getCurrentUser()` - Get current user profile (for users routes)
- `getAllUsers()` - Get paginated list of users with filtering (Admin only)
- `changePassword()` - Alternative password change method for users routes
- `getUserById()` - Get user by ID with access control
- `updateUserById()` - Update user profile (users can update own, admin can update any)
- `deleteUser()` - Delete user account (Admin only)

### UploadController (`src/controllers/uploadController.js`)
Handles file upload operations:
- `uploadSingle()` - Upload single file with optional image processing
- `uploadMultiple()` - Upload multiple files
- `deleteFile()` - Delete uploaded file with security checks
- `getFileInfo()` - Get file metadata
- `listFiles()` - List all uploaded files

## Benefits of Controller Architecture

1. **Separation of Concerns**: Business logic is separated from routing logic
2. **Reusability**: Controller methods can be reused across different routes
3. **Testability**: Controllers can be easily unit tested independently
4. **Maintainability**: Code is better organized and easier to maintain
5. **Scalability**: New features can be added by extending controllers

## Route Integration

Routes now act as thin layers that:
- Handle HTTP request/response
- Apply middleware (authentication, validation, etc.)
- Delegate business logic to appropriate controller methods
- Maintain comprehensive Swagger documentation

Example route definition:
```javascript
router.post('/register', validate(registerSchema), AuthController.register);
```

## Error Handling

All controllers implement consistent error handling:
- Try-catch blocks around all async operations
- Structured error responses with success/failure indicators
- Detailed logging for debugging
- Proper HTTP status codes

## Security Features

Controllers maintain all security features:
- Input validation through middleware
- Authentication and authorization checks
- Access control (users can only modify own data unless admin)
- File upload security (path traversal prevention)
- Password hashing and JWT token management

This architecture provides a solid foundation for building scalable Express.js APIs while maintaining clean, readable, and testable code.
