const request = require('supertest');
const app = require('../src/server');
const { sequelize } = require('../src/config/database');

describe('Health Check Endpoints', () => {
  beforeAll(async () => {
    // Ensure database is connected for tests
    await sequelize.authenticate();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /', () => {
    test('should return API information', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('name', 'Express API Template');
      expect(response.body).toHaveProperty('version', '1.0.0');
      expect(response.body).toHaveProperty('status', 'running');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('endpoints');
      expect(response.body.endpoints).toHaveProperty('health', '/health');
      expect(response.body.endpoints).toHaveProperty('api', '/api/v1');
    });

    test('should return valid timestamp format', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).not.toBeNaN();
    });
  });

  describe('GET /health', () => {
    test('should return health status when database is connected', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('database', 'connected');
      expect(response.body).toHaveProperty('memory');
      expect(response.body.memory).toHaveProperty('used');
      expect(response.body.memory).toHaveProperty('total');
    });

    test('should return valid timestamp format', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).not.toBeNaN();
    });

    test('should return numeric uptime', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(typeof response.body.uptime).toBe('number');
      expect(response.body.uptime).toBeGreaterThan(0);
    });

    test('should return memory information in correct format', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.memory.used).toMatch(/^\d+ MB$/);
      expect(response.body.memory.total).toMatch(/^\d+ MB$/);
    });

    test('should return environment information', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.environment).toBeDefined();
      expect(typeof response.body.environment).toBe('string');
    });
  });

  describe('Health endpoint resilience', () => {
    test('should handle database connection issues gracefully', async () => {
      // Mock sequelize.authenticate to throw an error
      const originalAuthenticate = sequelize.authenticate;
      sequelize.authenticate = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/health')
        .expect(503);

      expect(response.body).toHaveProperty('status', 'ERROR');
      expect(response.body).toHaveProperty('database', 'disconnected');
      expect(response.body).toHaveProperty('error', 'Database connection failed');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');

      // Restore original method
      sequelize.authenticate = originalAuthenticate;
    });
  });
});
