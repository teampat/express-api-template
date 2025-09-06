const express = require('express');
const { sequelize } = require('../config/database');
const { logger } = require('../config/logger');

const router = express.Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: Root endpoint
 *     description: Returns basic API information and available endpoints
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "Express API Template"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 status:
 *                   type: string
 *                   example: "running"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 endpoints:
 *                   type: object
 *                   properties:
 *                     health:
 *                       type: string
 *                       example: "/health"
 *                     docs:
 *                       type: string
 *                       example: "/api-docs"
 *                     api:
 *                       type: string
 *                       example: "/api/v1"
 */
router.get('/', (req, res) => {
  res.status(200).json({
    name: 'Express API Template',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      docs: process.env.NODE_ENV !== 'production' ? '/api-docs' : 'N/A (production)',
      api: '/api/v1'
    }
  });
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the API and its dependencies
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: Server uptime in seconds
 *                   example: 3600
 *                 environment:
 *                   type: string
 *                   example: "development"
 *                 database:
 *                   type: string
 *                   example: "connected"
 *                 memory:
 *                   type: object
 *                   properties:
 *                     used:
 *                       type: string
 *                       example: "50 MB"
 *                     total:
 *                       type: string
 *                       example: "100 MB"
 *       503:
 *         description: API is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   example: 3600
 *                 environment:
 *                   type: string
 *                   example: "development"
 *                 database:
 *                   type: string
 *                   example: "disconnected"
 *                 error:
 *                   type: string
 *                   example: "Database connection failed"
 */
router.get('/health', async (req, res) => {
  try {
    // Check database connection
    await sequelize.authenticate();
    
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      database: 'connected',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
      }
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      database: 'disconnected',
      error: 'Database connection failed'
    });
  }
});

module.exports = router;
