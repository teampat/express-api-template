const errorHandler = require('../src/middleware/errorHandler');

// Mock logger
jest.mock('../src/config/logger', () => ({
  logger: {
    error: jest.fn()
  }
}));

const { logger } = require('../src/config/logger');

describe('Error Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      method: 'GET',
      url: '/test'
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('Sequelize Validation Error', () => {
    it('should handle SequelizeValidationError', () => {
      const error = {
        name: 'SequelizeValidationError',
        stack: 'test stack',
        errors: [
          { path: 'email', message: 'Email is required' },
          { path: 'password', message: 'Password is too short' }
        ]
      };

      errorHandler(error, req, res, next);

      expect(logger.error).toHaveBeenCalledWith(error.stack);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation error',
        errors: [
          { field: 'email', message: 'Email is required' },
          { field: 'password', message: 'Password is too short' }
        ]
      });
    });
  });

  describe('Sequelize Unique Constraint Error', () => {
    it('should handle SequelizeUniqueConstraintError with field', () => {
      const error = {
        name: 'SequelizeUniqueConstraintError',
        stack: 'test stack',
        errors: [{ path: 'email' }]
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'email already exists'
      });
    });

    it('should handle SequelizeUniqueConstraintError without field', () => {
      const error = {
        name: 'SequelizeUniqueConstraintError',
        stack: 'test stack',
        errors: [{}]
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'field already exists'
      });
    });
  });

  describe('JWT Errors', () => {
    it('should handle JsonWebTokenError', () => {
      const error = {
        name: 'JsonWebTokenError',
        stack: 'test stack'
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid token'
      });
    });

    it('should handle TokenExpiredError', () => {
      const error = {
        name: 'TokenExpiredError',
        stack: 'test stack'
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token expired'
      });
    });
  });

  describe('Joi Validation Error', () => {
    it('should handle Joi validation error', () => {
      const error = {
        isJoi: true,
        stack: 'test stack',
        details: [
          { path: ['email'], message: 'Email is required' },
          { path: ['password', 'length'], message: 'Password is too short' }
        ]
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation error',
        errors: [
          { field: 'email', message: 'Email is required' },
          { field: 'password.length', message: 'Password is too short' }
        ]
      });
    });
  });

  describe('Multer Errors', () => {
    it('should handle LIMIT_FILE_SIZE error', () => {
      const error = {
        code: 'LIMIT_FILE_SIZE',
        stack: 'test stack'
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'File too large'
      });
    });

    it('should handle LIMIT_FILE_COUNT error', () => {
      const error = {
        code: 'LIMIT_FILE_COUNT',
        stack: 'test stack'
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Too many files'
      });
    });

    it('should handle LIMIT_UNEXPECTED_FILE error', () => {
      const error = {
        code: 'LIMIT_UNEXPECTED_FILE',
        stack: 'test stack'
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unexpected file field'
      });
    });
  });

  describe('Custom Application Errors', () => {
    it('should handle error with statusCode property', () => {
      const error = {
        statusCode: 404,
        message: 'User not found',
        stack: 'test stack'
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found'
      });
    });

    it('should handle error with different statusCode', () => {
      const error = {
        statusCode: 403,
        message: 'Access forbidden',
        stack: 'test stack'
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access forbidden'
      });
    });
  });

  describe('Default Error Handling', () => {
    it('should handle generic errors in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = {
        stack: 'test stack',
        message: 'Something went wrong'
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Something went wrong'
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('should handle generic errors in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = {
        stack: 'test stack',
        message: 'Something went wrong'
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Something went wrong',
        stack: 'test stack'
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('should handle errors without message', () => {
      const error = {
        stack: 'test stack'
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error'
      });
    });
  });

  describe('Logging', () => {
    it('should always log error stack', () => {
      const error = {
        stack: 'test error stack',
        message: 'Test error'
      };

      errorHandler(error, req, res, next);

      expect(logger.error).toHaveBeenCalledWith('test error stack');
    });
  });
});
