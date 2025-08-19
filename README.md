# Express.js API Template

A comprehensive Express.js API template with modern features including authentication, file upload, database migrations, testing, and auto-generated API documentation.

## 🚀 Features

- **Express.js v5** - Latest version of Express.js with native async/await support
- **Database Support** - SQLite (default), MySQL and PostgreSQL with Sequelize ORM
- **Zero Database Setup** - Uses SQLite by default for immediate development
- **Authentication** - JWT-based authentication system
- **File Upload Support** - Dual storage system supporting both local storage and S3-compatible object storage (AWS S3, MinIO, DigitalOcean Spaces) with advanced image processing
- **Image Processing** - Automatic resize, format conversion (JPG, WebP, AVIF, PNG), quality optimization with environment-based configuration
- **Database Migrations** - Full migration and seeding support
- **Auto-generated Documentation** - Swagger/OpenAPI 3.0 documentation
- **Input Validation** - Request validation with Joi
- **Unit Testing** - Comprehensive test suite with Jest
- **Security** - Security best practices with Helmet, CORS, Rate limiting
- **Error Handling** - Centralized error handling
- **Code Organization** - Clean architecture with separation of concerns
- **Environment Configuration** - Multiple environment support
- **Logging** - Request logging with Morgan and Winston
- **Email Service** - SMTP email support with templates
- **Compression** - Response compression for better performance

## 📋 Prerequisites

- Node.js (>= 18.0.0)
- npm or yarn

## 🛠️ Installation

1. Clone the repository:
    ```bash
    git clone <repository-url>
    cd express-api-template
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Copy environment variables:
    ```bash
    cp .env.example .env
    ```

4. Edit the `.env` file with your configuration

5. Run database migrations (optional - SQLite works out of the box):
    ```bash
    npm run migrate
    ```

6. Seed the database with sample data (optional):
    ```bash
    npm run seed
    ```

## 🚀 Quick Start

1. Start the development server:
    ```bash
    npm run dev
    ```

2. The API will be available at `http://localhost:3000`

3. View API documentation at `http://localhost:3000/api-docs`

4. Check health endpoint: `http://localhost:3000/health`

## 📚 API Documentation

The API documentation is automatically generated using Swagger/OpenAPI 3.0 and is available at:

- **Local**: http://localhost:3000/api-docs
- **Production**: https://your-domain.com/api-docs

## 🗄️ Database Configuration

### SQLite (Default)

No additional configuration needed. The database file will be created automatically.

### MySQL

Update your `.env` file:

```env
DB_DIALECT=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=your_database_name
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### PostgreSQL

Update your `.env` file:

```env
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database_name
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

## 🔐 Authentication

The API uses JWT-based authentication. Default users (created by seeder):

- **Admin**: admin@example.com / admin123
- **User**: user@example.com / user123

### Authentication Endpoints:

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

## 👥 User Management

### User Endpoints:

- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin only)
- `PATCH /api/users/:id/toggle-status` - Toggle user status (Admin only)

## 📁 File Upload & Storage

### Dual Storage System

The API supports both local storage and S3-compatible object storage with seamless switching:

- **Local Storage**: Files stored on server filesystem
- **S3-Compatible Storage**: AWS S3, MinIO, DigitalOcean Spaces, and other S3-compatible services

### Storage Configuration

Switch between storage types using environment variables:

```env
# Local Storage (default)
UPLOAD_STORAGE=local
UPLOAD_PATH=uploads/

# S3-Compatible Storage
UPLOAD_STORAGE=s3
S3_ENDPOINT=https://s3.amazonaws.com  # For AWS S3, or your S3-compatible endpoint
S3_REGION=us-east-1
S3_BUCKET=your-bucket-name
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_FORCE_PATH_STYLE=false  # Set to true for MinIO or other S3-compatible services
```

### Image Processing Configuration

Control image processing behavior via environment variables:

```env
# Image Processing Control
IMAGE_RESIZE=true                    # Enable/disable image resizing
IMAGE_CONVERT=true                   # Enable/disable automatic format conversion
IMAGE_QUALITY=80                     # Default image quality (1-100)
IMAGE_MAX_WIDTH=1920                 # Maximum allowed width
IMAGE_MAX_HEIGHT=1080                # Maximum allowed height
MAX_FILE_SIZE=10485760              # Maximum file size in bytes (10MB)
```

### Upload Endpoints:

- `POST /api/upload/single` - Upload single file with optional image processing
- `POST /api/upload/multiple` - Upload multiple files with optional image processing
- `DELETE /api/upload/:filename` - Delete uploaded file
- `GET /api/upload/info/:filename` - Get file information
- `GET /api/upload/list` - List all uploaded files
- `GET /api/upload/download/:filename` - Download file
- `GET /api/upload/storage/status` - Get current storage configuration

### Image Processing Features:

- **Intelligent Resize**: Automatically resize images that exceed maximum dimensions
- **Format Conversion**: Convert images to modern formats (WebP, AVIF) for better compression
- **Quality Control**: Optimize image quality for perfect balance between size and quality
- **Format Support**: JPEG, PNG, WebP, and AVIF
- **Conditional Processing**: Only processes image files, preserves other file types
- **Error Recovery**: Falls back to original file if processing fails
- **Multi-format Output**: Support for JPG, PNG, WebP, and AVIF output formats

### Example Usage:

```bash
# Upload with automatic WebP conversion and quality optimization
curl -X POST http://localhost:3000/api/upload/single \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@image.jpg" \
  -F "outputFormat=webp" \
  -F "quality=85"

# Upload with custom resize dimensions
curl -X POST http://localhost:3000/api/upload/single \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@image.jpg" \
  -F "resize=800x600" \
  -F "outputFormat=avif" \
  -F "quality=90"

# Check storage status
curl -X GET http://localhost:3000/api/upload/storage/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### S3-Compatible Storage Features:

- **Multi-provider Support**: AWS S3, MinIO, DigitalOcean Spaces, and more
- **Multipart Upload**: Efficient handling of large files
- **Object Metadata**: Automatic content-type detection and metadata storage
- **Path-style URLs**: Support for both virtual-hosted-style and path-style URLs
- **Security**: Proper access control and error handling

### File Security:

- File type validation based on MIME type
- File size limits enforced
- Secure filename generation
- Path traversal protection
- Malicious file detection

## 🧪 Testing

Run tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Generate test coverage:

```bash
npm run test:coverage
```

## 📊 Database Migrations

Create a new migration:

```bash
npx sequelize-cli migration:generate --name migration-name
```

Run migrations:

```bash
npm run migrate
```

Undo last migration:

```bash
npm run migrate:undo
```

Create a new seeder:

```bash
npx sequelize-cli seed:generate --name seeder-name
```

Run seeders:

```bash
npm run seed
```

## 📧 Email Service

Configure SMTP settings in your `.env` file:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

Email templates are located in `src/templates/`.

## 🔒 Security Features

- **Helmet** - Sets various HTTP headers
- **CORS** - Cross-Origin Resource Sharing
- **Rate Limiting** - Prevents abuse
- **Input Validation** - Joi validation schemas
- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with salt rounds
- **SQL Injection Protection** - Sequelize ORM

## 📝 Logging

Logs are stored in the `logs/` directory:

- `error.log` - Error logs only
- `combined.log` - All logs

Log levels: error, warn, info, debug

## 🌍 Environment Variables

Key environment variables:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
DB_DIALECT=sqlite
DB_HOST=localhost
DB_NAME=your_database_name
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Authentication
JWT_SECRET=your-jwt-secret

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password

# File Upload & Storage
UPLOAD_STORAGE=local                 # 'local' or 's3'
UPLOAD_PATH=uploads/                 # Local storage path
MAX_FILE_SIZE=10485760              # Maximum file size (10MB)
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif

# Image Processing
IMAGE_RESIZE=true                    # Enable automatic resizing
IMAGE_CONVERT=true                   # Enable format conversion
IMAGE_QUALITY=80                     # Default quality (1-100)
IMAGE_MAX_WIDTH=1920                 # Maximum width
IMAGE_MAX_HEIGHT=1080                # Maximum height

# S3-Compatible Storage
S3_ENDPOINT=https://s3.amazonaws.com # S3 endpoint URL
S3_REGION=us-east-1                  # S3 region
S3_BUCKET=your-bucket-name           # S3 bucket name
S3_ACCESS_KEY_ID=your-access-key     # S3 access key
S3_SECRET_ACCESS_KEY=your-secret-key # S3 secret key
S3_FORCE_PATH_STYLE=false           # Use path-style URLs
```

## 📁 Project Structure

```
src/
├── config/             # Configuration files
│   ├── database.js     # Database configuration
│   ├── logger.js       # Winston logger setup
│   └── swagger.js      # Swagger/OpenAPI configuration
├── middleware/         # Express middleware
│   ├── auth.js         # JWT authentication middleware
│   ├── errorHandler.js # Global error handling
│   ├── rateLimiter.js  # Rate limiting configuration
│   └── validate.js     # Request validation middleware
├── models/             # Sequelize models
│   ├── User.js         # User model definition
│   └── index.js        # Model initialization and associations
├── controllers/        # Request handlers
│   ├── authController.js    # Authentication endpoints
│   ├── userController.js    # User management endpoints
│   └── uploadController.js  # File upload endpoints
├── routes/             # Express routes
│   ├── auth.js         # Authentication endpoints
│   ├── users.js        # User management endpoints
│   └── upload.js       # File upload endpoints
├── services/           # Business logic services
│   ├── authService.js  # Authentication business logic
│   ├── userService.js  # User management business logic
│   ├── fileService.js  # File upload and processing service
│   ├── s3Service.js    # S3-compatible storage service
│   └── emailService.js # Email sending service
├── validators/         # Joi validation schemas
│   └── authValidator.js # Authentication request validators
├── migrations/         # Database migrations
├── seeders/           # Database seeders
├── templates/         # Email templates
└── server.js          # Application entry point
```

## 🚀 Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Configure production database
3. Set secure JWT secret
4. Configure SMTP for emails
5. Set up SSL/TLS
6. Configure reverse proxy (nginx)
7. Set up monitoring and logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue on GitHub
- Check the API documentation
- Review the test files for usage examples
