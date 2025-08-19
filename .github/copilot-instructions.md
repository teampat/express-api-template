# Express.js API Template - GitHub Copilot Instructions

This is a comprehensive Express.js API template project with the following structure and conventions:

## Project Overview

- **Framework**: Express.js v5
- **Language**: JavaScript (Node.js)
- **Database**: Sequelize ORM (supports SQLite, MySQL, PostgreSQL)
- **Authentication**: JWT-based authentication
- **Testing**: Jest with Supertest
- **Documentation**: Swagger/OpenAPI 3.0
- **Architecture**: RESTful API with clean separation of concerns

## Key Features

- User authentication and authorization
- File upload with image processing
- Database migrations and seeders
- Email service with templates
- Request validation with Joi
- Comprehensive error handling
- Rate limiting and security middleware
- Logging with Winston

## Code Structure

```
src/
├── config/         # Configuration files
├── middleware/     # Express middleware
├── models/         # Sequelize models
├── routes/         # Express routes
├── services/       # Business logic
├── validators/     # Joi validation schemas
├── migrations/     # Database migrations
├── seeders/        # Database seeders
└── templates/      # Email templates
```

## Coding Conventions

- Use async/await for asynchronous operations
- Follow RESTful API design principles
- Use Joi for request validation
- Implement proper error handling with try-catch
- Use Sequelize ORM for database operations
- Follow security best practices
- Write comprehensive tests for all endpoints
- Use JSDoc comments for API documentation

## When adding new features:

1. Create appropriate models in `src/models/`
2. Add validation schemas in `src/validators/`
3. Implement routes in `src/routes/`
4. Add business logic in `src/services/`
5. Create database migrations if needed
6. Write comprehensive tests
7. Update Swagger documentation with JSDoc comments

## Database

- Use Sequelize models for all database interactions
- Create migrations for schema changes
- Use seeders for sample data
- Follow naming conventions (PascalCase for models, snake_case for database)

## Authentication

- Use JWT tokens for authentication
- Implement role-based access control
- Protect routes with authentication middleware
- Hash passwords with bcrypt

## Testing

- Write unit tests for all endpoints
- Use Jest and Supertest
- Test both success and error scenarios
- Maintain good test coverage

## API Documentation

- Use Swagger/OpenAPI 3.0 annotations
- Document all endpoints with JSDoc comments
- Include request/response schemas
- Provide examples for complex endpoints

Remember to follow the existing patterns and conventions when adding new features or making modifications.
