# Layered Architecture Documentation

This Express.js API template now implements a sophisticated **3-layer architecture** with clear separation of concerns.

## Architecture Overview

```
┌─────────────────┐
│   Controllers   │  ← HTTP Request/Response handling
├─────────────────┤
│    Services     │  ← Business Logic Layer
├─────────────────┤
│     Models      │  ← Data Access Layer
└─────────────────┘
```

## Layer Responsibilities

### 1. Controller Layer (`src/controllers/`)
**Purpose**: Handle HTTP requests and responses
- Validate incoming requests
- Call appropriate service methods
- Format and return responses
- Handle HTTP-specific concerns (status codes, headers)
- **NO business logic**

### 2. Service Layer (`src/services/`)
**Purpose**: Contain pure business logic
- Implement business rules and workflows
- Coordinate between multiple models if needed
- Handle complex operations and validations
- **NO HTTP concerns**
- **NO direct database operations** (use models)

### 3. Model Layer (`src/models/`)
**Purpose**: Data access and persistence
- Database operations (CRUD)
- Data validation and relationships
- Business-specific database queries

## Current Implementation

### AuthController → AuthService
```javascript
// Controller: Handles HTTP concerns
static async register(req, res) {
  try {
    const user = await AuthService.createUser(req.body);
    const token = AuthService.generateToken(user);
    res.status(201).json({ success: true, data: { user, token } });
  } catch (error) {
    // Handle specific errors and HTTP responses
  }
}

// Service: Pure business logic
static async createUser(userData) {
  // Check business rules
  const existingUser = await User.findOne({ where: { email: userData.email } });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }
  // Create and return user
  return await User.create(userData);
}
```

### UserController → UserService
- **UserService.getPaginatedUsers()** - Complex filtering and pagination logic
- **UserService.updateUserProfile()** - Access control and validation
- **UserService.deleteUser()** - Business rules for deletion

### UploadController → FileService
- **FileService.processSingleFile()** - File processing logic
- **FileService.validateFilename()** - Security validations
- **FileService.cleanupFiles()** - Error cleanup operations

## Benefits of This Architecture

### 1. **Separation of Concerns**
- Controllers focus only on HTTP handling
- Services contain reusable business logic
- Models handle data persistence

### 2. **Testability**
- Services can be unit tested independently
- Business logic testing without HTTP mocking
- Controllers can be tested with service mocks

### 3. **Reusability**
- Services can be used by multiple controllers
- Business logic can be shared across different endpoints
- Easy to create CLI tools or scheduled jobs

### 4. **Maintainability**
- Changes to business logic only affect services
- HTTP changes only affect controllers
- Clear code organization and responsibilities

### 5. **Scalability**
- Easy to add new features
- Services can be extracted to microservices later
- Clear dependency management

## Service Layer Features

### Error Handling
Services throw descriptive errors that controllers can interpret:
```javascript
// Service throws business-specific errors
throw new Error('User with this email already exists');

// Controller handles HTTP response
if (error.message === 'User with this email already exists') {
  return res.status(400).json({ success: false, message: error.message });
}
```

### Business Logic Isolation
```javascript
// ❌ Before: Business logic mixed with HTTP concerns
static async login(req, res) {
  const user = await User.findOne({ where: { email: req.body.email } });
  if (!user || !(await user.comparePassword(req.body.password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  // More business logic mixed with HTTP...
}

// ✅ After: Clean separation
// Controller
static async login(req, res) {
  try {
    const user = await AuthService.authenticateUser(req.body.email, req.body.password);
    const token = AuthService.generateToken(user);
    res.json({ success: true, data: { user, token } });
  } catch (error) {
    // Handle HTTP response based on service error
  }
}
```

## Best Practices

### 1. **Controllers Should**
- Be thin and lightweight
- Handle only HTTP concerns
- Validate input (via middleware)
- Call service methods
- Format responses

### 2. **Services Should**
- Contain business logic
- Be framework-agnostic
- Throw meaningful errors
- Be easily testable
- Handle complex workflows

### 3. **Models Should**
- Handle data persistence
- Define relationships
- Provide data validation
- Offer query methods

## Future Enhancements

### 1. **Repository Pattern**
Add repository layer between services and models for more complex queries:
```
Controllers → Services → Repositories → Models
```

### 2. **DTOs (Data Transfer Objects)**
Add input/output data validation and transformation:
```javascript
class CreateUserDTO {
  constructor(data) {
    this.email = data.email?.toLowerCase();
    this.firstName = data.firstName?.trim();
    // ... validation and transformation
  }
}
```

### 3. **Dependency Injection**
Implement DI container for better testability and flexibility.

This architecture provides a solid foundation for building maintainable, testable, and scalable Express.js applications.
