const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express API Template',
      version: '1.0.0',
      description: 'A comprehensive Express.js API template with modern features',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api/v1`,
        description: 'Development server - API v1'
      },
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Development server - Base URL'
      }
    ],
    tags: [
      {
        name: 'System',
        description: 'System health and information endpoints'
      },
      {
        name: 'Authentication',
        description: 'User authentication and authorization'
      },
      {
        name: 'Users',
        description: 'User management operations'
      },
      {
        name: 'Upload',
        description: 'File upload operations'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            id: {
              type: 'integer',
              description: 'User ID',
              example: 1
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'user@example.com'
            },
            firstName: {
              type: 'string',
              description: 'User first name',
              example: 'John'
            },
            lastName: {
              type: 'string',
              description: 'User last name',
              example: 'Doe'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              description: 'User role',
              example: 'user'
            },
            isActive: {
              type: 'boolean',
              description: 'User active status',
              example: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation date',
              example: '2025-01-01T00:00:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update date',
              example: '2025-01-01T00:00:00.000Z'
            }
          }
        },
        UserProfile: {
          type: 'object',
          description: 'User profile without sensitive information',
          properties: {
            id: {
              type: 'integer',
              description: 'User ID',
              example: 1
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'user@example.com'
            },
            firstName: {
              type: 'string',
              description: 'User first name',
              example: 'John'
            },
            lastName: {
              type: 'string',
              description: 'User last name',
              example: 'Doe'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              description: 'User role',
              example: 'user'
            },
            isActive: {
              type: 'boolean',
              description: 'User active status',
              example: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation date',
              example: '2025-01-01T00:00:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update date',
              example: '2025-01-01T00:00:00.000Z'
            }
          }
        },
        UpdateUserRequest: {
          type: 'object',
          properties: {
            firstName: {
              type: 'string',
              description: 'User first name',
              example: 'John'
            },
            lastName: {
              type: 'string',
              description: 'User last name',
              example: 'Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'user@example.com'
            }
          }
        },
        UserListResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object',
              properties: {
                users: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/UserProfile'
                  }
                },
                pagination: {
                  type: 'object',
                  properties: {
                    page: {
                      type: 'integer',
                      description: 'Current page number',
                      example: 1
                    },
                    limit: {
                      type: 'integer',
                      description: 'Number of items per page',
                      example: 10
                    },
                    total: {
                      type: 'integer',
                      description: 'Total number of users',
                      example: 50
                    },
                    pages: {
                      type: 'integer',
                      description: 'Total number of pages',
                      example: 5
                    }
                  }
                }
              }
            }
          }
        },
        UserResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              $ref: '#/components/schemas/UserProfile'
            }
          }
        },
        UserUpdateResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'User updated successfully'
            },
            data: {
              $ref: '#/components/schemas/UserProfile'
            }
          }
        },
        UserStatusResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'User activated successfully'
            },
            data: {
              $ref: '#/components/schemas/UserProfile'
            }
          }
        },
        UserDeleteResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'User deleted successfully'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean'
            },
            message: {
              type: 'string'
            },
            data: {
              type: 'object',
              properties: {
                user: {
                  $ref: '#/components/schemas/User'
                },
                token: {
                  type: 'string'
                }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object'
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js'] // Path to the API files
};

module.exports = swaggerOptions;
