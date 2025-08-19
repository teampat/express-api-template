# Express.js API Template

A comprehensive Express.js API template with modern features including authentication, file upload, database migrations, testing, and auto-generated API documentation.

## 🚀 Features

- **Express.js v4** - Stable version of Express.js
- **Database Support** - SQLite (default), MySQL and PostgreSQL with Sequelize ORM
- **Zero Database Setup** - Uses SQLite by default for immediate development
- **Authentication** - JWT-based authentication system
- **File Upload Support** - Local storage and S3-compatible cloud storage with image processing
- **Database Migrations** - Full migration and seeding support
- **Auto-generated Documentation** - Swagger/OpenAPI 3.0 documentation
- **Input Validation** - Request validation with Joi
- **Unit Testing** - Comprehensive test suite with Jest and Supertest
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

## 📁 File Upload

### Upload Endpoints:

- `POST /api/upload/single` - Upload single file
- `POST /api/upload/multiple` - Upload multiple files
- `DELETE /api/upload/:filename` - Delete uploaded file

### Features:

- Image processing with Sharp (resize, quality adjustment)
- File type validation
- File size limits
- Automatic thumbnail generation

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
NODE_ENV=development
PORT=3000
DB_DIALECT=sqlite
JWT_SECRET=your-jwt-secret
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password
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
├── routes/             # Express routes
│   ├── auth.js         # Authentication endpoints
│   ├── users.js        # User management endpoints
│   └── upload.js       # File upload endpoints
├── services/           # Business logic services
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
