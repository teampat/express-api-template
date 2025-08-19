# Getting Started

This guide will help you get the Express.js API Template up and running quickly.

## Prerequisites

- Node.js (>= 18.0.0)
- npm or yarn
- Git

## Quick Setup

1. **Clone and navigate to the project:**

   ```bash
   git clone <your-repo-url>
   cd express-api-template
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Setup environment variables:**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` file with your configuration. The default SQLite setup works out of the box.

4. **Run the application:**

   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

5. **Verify installation:**
   - Open http://localhost:3000/health to check server status
   - Open http://localhost:3000/api-docs to view API documentation

## Database Setup

### SQLite (Default - No Setup Required)

The template uses SQLite by default, which requires no additional setup. The database file will be created automatically.

### MySQL

1. Install MySQL server
2. Create a database
3. Update `.env` file:
   ```env
   DB_DIALECT=mysql
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=your_database_name
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   ```

### PostgreSQL

1. Install PostgreSQL server
2. Create a database
3. Update `.env` file:
   ```env
   DB_DIALECT=postgres
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=your_database_name
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   ```

## Running Migrations and Seeds

```bash
# Run database migrations
npm run migrate

# Seed database with sample data
npm run seed

# Undo last migration
npm run migrate:undo

# Undo all seeds
npm run seed:undo
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage report
npm run test:coverage
```

## Default Users (after seeding)

- **Admin User:**

  - Email: admin@example.com
  - Password: admin123
  - Role: admin

- **Regular User:**
  - Email: user@example.com
  - Password: user123
  - Role: user

## API Endpoints Overview

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### User Management

- `GET /api/users` - List all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin only)
- `PATCH /api/users/:id/toggle-status` - Toggle user status (Admin only)

### File Upload

- `POST /api/upload/single` - Upload single file
- `POST /api/upload/multiple` - Upload multiple files
- `DELETE /api/upload/:filename` - Delete uploaded file

### System

- `GET /health` - Health check endpoint

## Next Steps

1. **Explore the API Documentation:**
   Visit http://localhost:3000/api-docs for interactive API documentation

2. **Test the API:**
   Use the provided test script or your favorite API client (Postman, curl, etc.)

3. **Customize for your needs:**

   - Add new models in `src/models/`
   - Create new routes in `src/routes/`
   - Add validation schemas in `src/validators/`
   - Implement business logic in `src/services/`

4. **Deploy to production:**
   - Set up your production database
   - Configure environment variables
   - Set up SSL/TLS
   - Configure reverse proxy (nginx)
   - Set up monitoring and logging

## Need Help?

- Check the [README.md](README.md) for detailed information
- Review the test files for usage examples
- Examine the code structure and comments
- Check the API documentation at `/api-docs`
