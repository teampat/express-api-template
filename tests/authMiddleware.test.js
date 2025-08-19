const { authenticate, authorize } = require('../src/middleware/auth');
const User = require('../src/models/User');
const jwt = require('jsonwebtoken');

// Mock dependencies
jest.mock('../src/models/User');
jest.mock('jsonwebtoken');
jest.mock('../src/config/logger', () => ({
  logger: {
    error: jest.fn()
  }
}));

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      header: jest.fn()
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('authenticate', () => {
    it('should authenticate user with valid token', async () => {
      const mockUser = { id: 1, email: 'test@example.com', isActive: true };
      const mockToken = 'valid-jwt-token';
      const decodedToken = { id: 1, email: 'test@example.com' };

      req.header.mockReturnValue(`Bearer ${mockToken}`);
      jwt.verify.mockReturnValue(decodedToken);
      User.findByPk.mockResolvedValue(mockUser);

      await authenticate(req, res, next);

      expect(req.header).toHaveBeenCalledWith('Authorization');
      expect(jwt.verify).toHaveBeenCalledWith(mockToken, 'test-secret');
      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should deny access when no token provided', async () => {
      req.header.mockReturnValue(null);

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied. No token provided.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should deny access for invalid token', async () => {
      const mockToken = 'invalid-jwt-token';

      req.header.mockReturnValue(`Bearer ${mockToken}`);
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid token.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should deny access when user not found', async () => {
      const mockToken = 'valid-jwt-token';
      const decodedToken = { id: 1, email: 'test@example.com' };

      req.header.mockReturnValue(`Bearer ${mockToken}`);
      jwt.verify.mockReturnValue(decodedToken);
      User.findByPk.mockResolvedValue(null);

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid token or user not found.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should deny access for inactive user', async () => {
      const mockUser = { id: 1, email: 'test@example.com', isActive: false };
      const mockToken = 'valid-jwt-token';
      const decodedToken = { id: 1, email: 'test@example.com' };

      req.header.mockReturnValue(`Bearer ${mockToken}`);
      jwt.verify.mockReturnValue(decodedToken);
      User.findByPk.mockResolvedValue(mockUser);

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid token or user not found.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle token without Bearer prefix', async () => {
      req.header.mockReturnValue('invalid-format-token');

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid token or user not found.'
      });
    });
  });

  describe('authorize', () => {
    it('should allow access for user with correct role', () => {
      req.user = { id: 1, role: 'admin' };
      
      const middleware = authorize('admin', 'moderator');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should allow access for user with one of multiple roles', () => {
      req.user = { id: 1, role: 'moderator' };
      
      const middleware = authorize('admin', 'moderator');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should deny access for user with incorrect role', () => {
      req.user = { id: 1, role: 'user' };
      
      const middleware = authorize('admin', 'moderator');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should deny access when user is not authenticated', () => {
      req.user = null;
      
      const middleware = authorize('admin');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied. Authentication required.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should work with single role authorization', () => {
      req.user = { id: 1, role: 'admin' };
      
      const middleware = authorize('admin');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
