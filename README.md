# Express.js API Template

A comprehensive Express.js API template with modern features including authentication, file upload, database migrations, testing, and auto-generated API documentation.

## 🚀 Features

- **Express.js v5** - Latest version of Express.js with native async/await support
- **Database Support** - SQLite (default), MySQL/MariaDB and PostgreSQL with Sequelize ORM
- **Zero Database Setup** - Uses SQLite by default for immediate development
- **Authentication** - JWT-based authentication system
- **File Upload Support** - Dual storage system supportImport specific utilities:
```javascript
const { formatDate, isValidEmail, successResponse } = require('./src/utils');
```

### 🔍 Utility Examples

Run the comprehensive examples to see all utilities in action:

**Using npm:**
```bash
npm run examples
```

**Using yarn:**
```bash
yarn examples
```

**Using pnpm:**
```bash
pnpm examples
```

**Using bun:**
```bash
bun run examples
```

This will demonstrate:
- **Enhanced date formatting and calculations** with dayjs
- **Advanced date comparisons and ranges** 
- **Timezone support and business day calculations**
- **String transformations and validation**
- **Data validation and sanitization** 
- **Cryptographic operations**
- **Standardized API responses**
- **File operations and validation**

## 🔒 Security Features

- **Helmet** - Sets various HTTP headers
- **CORS** - Cross-Origin Resource Sharing
- **Rate Limiting** - Prevents abuse
- **Input Validation** - Joi validation schemas
- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with salt rounds
- **SQL Injection Protection** - Sequelize ORM
- **Date/Time Operations** - Enhanced date utilities powered by dayjs
- **File Storage** - Dual storage system: local storage and S3-compatible object storage (AWS S3, MinIO, DigitalOcean Spaces) with advanced image processing
- **Image Processing** - Automatic resize, format conversion (JPG, WebP, AVIF, PNG), quality optimization with environment-based configuration
- **Redis Integration** - Optional Redis support for caching, session management, rate limiting, and background job processing
- **Database Migrations** - Full migration and seeding support
- **Auto-generated Documentation** - Swagger/OpenAPI 3.0 documentation
- **Input Validation** - Request validation with Joi
- **Unit Testing** - Comprehensive test suite with Jest
- **Utility Functions** - Comprehensive utils library for dates, strings, validation, crypto, responses, and files
- **Security** - Security best practices with Helmet, CORS, Rate limiting
- **Error Handling** - Centralized error handling
- **Code Organization** - Clean architecture with separation of concerns
- **Environment Configuration** - Multiple environment support
- **Logging** - Request logging with Morgan and Winston
- **Email Service** - SMTP email support with templates
- **Compression** - Response compression for better performance

## 📋 Prerequisites

- Node.js (>= 22.0.0) or Bun (>= 1.0.0)
- npm, yarn, pnpm, or bun

### Installing Package Managers

**pnpm with Corepack (Recommended - Node.js 16.13+):**
```bash
corepack enable
corepack prepare pnpm@latest --activate
```

**pnpm with npm:**
```bash
npm install -g pnpm
```

**pnpm with standalone script:**
```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

**Bun (All-in-one toolkit):**
```bash
curl -fsSL https://bun.sh/install | bash
```

## 🛠️ Installation

1. Clone the repository:
    ```bash
    git clone <repository-url>
    cd express-api-template
    ```

2. Install dependencies:

    **Using npm:**
    ```bash
    npm install
    ```

    **Using yarn:**
    ```bash
    yarn install
    ```

    **Using pnpm:**
    ```bash
    pnpm install
    ```

    **Using bun:**
    ```bash
    bun install
    ```

3. Copy environment variables:
    ```bash
    cp .env.example .env
    ```

4. Edit the `.env` file with your configuration

5. Run database migrations (optional - SQLite works out of the box):

    **Using npm:**
    ```bash
    npm run migrate
    ```

    **Using yarn:**
    ```bash
    yarn migrate
    ```

    **Using pnpm:**
    ```bash
    pnpm migrate
    ```

    **Using bun:**
    ```bash
    bun run migrate
    ```

6. Seed the database with sample data (optional):

    **Using npm:**
    ```bash
    npm run seed
    ```

    **Using yarn:**
    ```bash
    yarn seed
    ```

    **Using pnpm:**
    ```bash
    pnpm seed
    ```

    **Using bun:**
    ```bash
    bun run seed
    ```

## 🚀 Quick Start

1. Start the development server:

    **Using npm:**
    ```bash
    npm run dev
    ```

    **Using yarn:**
    ```bash
    yarn dev
    ```

    **Using pnpm:**
    ```bash
    pnpm dev
    ```

    **Using bun:**
    ```bash
    bun run dev
    ```

2. The API will be available at `http://localhost:3000`

3. View API documentation at `http://localhost:3000/api-docs` (development only)

4. Check health endpoint: `http://localhost:3000/health`

## ⚡ Running with Bun

This project is fully compatible with Bun! Here are some Bun-specific benefits and commands:

### Why Bun?
- **🚀 Performance**: Up to 4x faster than Node.js for many operations
- **📦 Built-in package manager**: No need for separate package managers
- **🔧 Compatible test runner**: `bun run test` runs Jest tests efficiently
- **📁 Built-in bundler**: Fast bundling capabilities
- **🔄 Node.js compatibility**: Drop-in replacement for most Node.js apps

### Bun Commands
```bash
# Install dependencies
bun install

# Start development server (with hot reload)
bun run dev

# Start production server
bun run start

# Run tests (using Jest through Bun)
bun run test

# Run specific scripts
bun run migrate
bun run seed
```

### Note on Database Drivers
All database drivers (SQLite, MySQL/MariaDB, PostgreSQL) work seamlessly with Bun thanks to its Node.js compatibility layer.

### Note on Testing
This project uses Jest for testing, which runs efficiently through Bun using `bun run test`. While Bun has its own built-in test runner, we use Jest for:
- **Compatibility**: Extensive mocking capabilities with existing test suite
- **Ecosystem**: Rich Jest ecosystem and plugins
- **Migration**: Easy migration path for existing Node.js projects
- **Features**: Comprehensive testing features like coverage reports

## 📚 API Documentation

The API documentation is automatically generated using Swagger/OpenAPI 3.0 and is available in development environments:

- **Development/Local**: http://localhost:3000/api-docs
- **Production**: Disabled for security (API docs not exposed)

### Security Note
API documentation is automatically disabled in production environments (`NODE_ENV=production`) to prevent exposing internal API structure and sensitive information.

## 🗄️ Database Configuration

### SQLite (Default)

No additional configuration needed. The database file will be created automatically.

### MySQL/MariaDB

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

## � Redis Configuration (Optional)

Redis is included in Docker Compose setups for enhanced performance and scalability features. While the API works perfectly without Redis, it provides additional capabilities when available.

### 🚀 Redis Use Cases

#### **1. 🏪 Caching & Performance**
- **API Response Caching**: Cache expensive database queries and computed results
- **User Session Storage**: Enhanced session management for better performance
- **File Metadata Caching**: Cache file information for faster retrieval

#### **2. 🔒 Enhanced Security**
- **JWT Token Blacklist**: Store invalidated tokens for secure logout functionality
- **Rate Limiting Storage**: Persistent rate limiting across server restarts
- **IP Tracking**: Advanced request monitoring and abuse prevention

#### **3. 📧 Background Processing**
- **Email Queue**: Queue email sending jobs for better reliability
- **Job Processing**: Background task management and retry mechanisms
- **Notification System**: Real-time notification delivery

#### **4. 📊 Real-time Features**
- **WebSocket Management**: Connection state management for real-time features
- **Live Updates**: Push notifications and live data updates
- **Messaging**: Chat and messaging capabilities

### 🔧 Redis Configuration

**Docker Compose** (Included):
```yaml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
```

**Environment Variables** (Optional):
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_DB=0
```

### 💡 Current Status
- **Status**: Ready-to-use infrastructure included in Docker setups
- **Implementation**: Currently optional - API works without Redis
- **Future**: Easy to implement Redis features as needed
- **Benefits**: Significant performance gains in production environments

### 🎯 Quick Setup
```bash
# Start with Redis (Docker Compose)
docker-compose -f docker-compose.nodejs.yml up -d

# Redis will be available at localhost:6379
# No additional configuration needed
```

## �🔐 Authentication

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

## �️ Utility Functions

The API includes a comprehensive set of utility functions in `src/utils/` to help with common operations:

### 📅 Date Utils (Powered by dayjs)
```javascript
const { formatToISO, formatDate, addDays, isToday, getRelativeTime } = require('./src/utils');

// Format dates with flexible options
formatToISO(new Date()); // "2023-12-25T10:30:00.000Z"
formatDate(new Date()); // "December 25, 2023"
formatDate(new Date(), 'YYYY-MM-DD'); // "2023-12-25"
formatDateTime(new Date(), 'MMM D, YYYY [at] h:mm A'); // "Dec 25, 2023 at 10:30 AM"

// Advanced date calculations
addDays(new Date(), 7); // Add 7 days
subtractDays(new Date(), 3); // Subtract 3 days
addTime(new Date(), 2, 'hour'); // Add 2 hours
getRelativeTime(pastDate); // "2 hours ago"

// Date comparisons and checks
isToday(someDate); // Check if date is today
isYesterday(someDate); // Check if date is yesterday
isFuture(someDate); // Check if date is in future
isBetween(date, startDate, endDate); // Check if date is in range

// Date ranges and business logic
startOfDay(new Date()); // Start of current day
endOfMonth(new Date()); // End of current month
getBusinessDays(startDate, endDate); // Count business days
getAge(birthdate); // Calculate age from birthdate

// Parsing and timezone support
parseDate('15/12/2023', 'DD/MM/YYYY'); // Parse with custom format
toTimezone(new Date(), 'America/New_York'); // Convert to timezone
```

### 🔤 String Utils
```javascript
const { capitalize, toCamelCase, slugify, truncate } = require('./src/utils');

// String transformations
capitalize('hello world'); // "Hello world"
toCamelCase('hello world'); // "helloWorld"
slugify('Hello World!'); // "hello-world"
truncate('Long text...', 50); // Truncate with ellipsis
```

### ✅ Validation Utils
```javascript
const { isValidEmail, validatePassword, isEmpty } = require('./src/utils');

// Validate data
isValidEmail('user@example.com'); // true
validatePassword('StrongPass123!'); // { isValid: true, score: 5 }
isEmpty(value); // Check for empty values
```

### 🔐 Crypto Utils
```javascript
const { generateSecureToken, hashPassword, generateUUID } = require('./src/utils');

// Secure operations
generateSecureToken(32); // Random hex token
generateUUID(); // UUID v4
await hashPassword('password'); // Bcrypt hash
```

### 📤 Response Utils
```javascript
const { successResponse, errorResponse, notFoundResponse } = require('./src/utils');

// Standardized API responses
successResponse(res, data, 'Success message');
errorResponse(res, 'Error message', 400);
notFoundResponse(res, 'User');
```

### 📁 File Utils
```javascript
const { getFileExtension, formatFileSize, isValidFileType } = require('./src/utils');

// File operations
getFileExtension('image.jpg'); // "jpg"
formatFileSize(1048576); // "1 MB"
isValidFileType('image.jpg', ['jpg', 'png']); // true
```

### 📚 Usage Examples

Import all utilities:
```javascript
const utils = require('./src/utils');
// Access: utils.formatDate(), utils.isValidEmail(), etc.
```

Import specific utilities:
```javascript
const { formatDate, isValidEmail, successResponse } = require('./src/utils');
```

## �🔒 Security Features

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
express-api-template/
├── src/                        # Source code
│   ├── config/                 # Configuration files
│   ├── controllers/            # Request handlers
│   ├── middleware/             # Express middleware
│   ├── models/                 # Sequelize database models
│   ├── routes/                 # Express route definitions
│   ├── services/               # Business logic layer
│   ├── utils/                  # Utility functions
│   │   ├── dateUtils.js        # Date operations
│   │   ├── stringUtils.js      # String transformations
│   │   ├── validationUtils.js  # Data validation helpers
│   │   ├── cryptoUtils.js      # Cryptographic functions
│   │   ├── responseUtils.js    # API response helpers
│   │   ├── fileUtils.js        # File operations
│   │   └── index.js            # Utils entry point
│   ├── validators/             # Input validation schemas
│   ├── migrations/             # Database migrations
│   ├── seeders/                # Database seeders
│   ├── templates/              # Email templates
│   └── server.js               # Application entry point
├── tests/                      # Unit test suites
├── examples/                   # Usage examples and demos
│   └── utils-examples.js       # Utils demonstration
├── uploads/                    # Local file storage
├── logs/                       # Application logs
├── coverage/                   # Test coverage reports
├── .env.example                # Environment variables template
├── package.json                # Dependencies and scripts
├── Dockerfile                  # Default Docker configuration
├── docker-compose.*.yml        # Docker Compose files
└── README.md                   # Project documentation
```

### Key Directories

- **`src/`** - Main application source code
- **`src/utils/`** - Comprehensive utility functions library with dayjs integration
- **`tests/`** - Comprehensive unit test suite (168+ tests)
- **`examples/`** - Usage examples and demonstrations
- **`uploads/`** - Local file storage directory
- **Docker files** - Multiple deployment configurations (Node.js, Bun)
- **Documentation** - README, API docs, and configuration guides

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
