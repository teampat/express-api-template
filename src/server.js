require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const { sequelize } = require('./config/database');
const { logger } = require('./config/logger');
const rateLimiter = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const swaggerOptions = require('./config/swagger');

// Import routes
const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(compression());

// Rate limiting
app.use(rateLimiter);

// Request logging
app.use(
  morgan('combined', {
    stream: {
      write: message => logger.info(message.trim())
    }
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Swagger documentation (only in development)
if (process.env.NODE_ENV !== 'production') {
  const specs = swaggerJsdoc(swaggerOptions);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
}

// System routes (root and health check)
app.use('/', healthRoutes);

// Create API v1 router
const apiV1Router = express.Router();

// API v1 routes
apiV1Router.use('/auth', authRoutes);
apiV1Router.use('/users', userRoutes);
apiV1Router.use('/upload', uploadRoutes);

// Mount API v1 router
app.use('/api/v1', apiV1Router);

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// 404 handler - Express v5 compatible
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(errorHandler);

// Database connection and server start
async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.info('Database connection established successfully');

    // Sync database (in development)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.info('Database synchronized');
    }

    // Start server
    app.listen(PORT, () => {
      console.info(`Server running on port ${PORT}`);
      console.info(`Environment: ${process.env.NODE_ENV}`);
      if (process.env.NODE_ENV !== 'production') {
        console.info(`API Documentation: http://localhost:${PORT}/api-docs`);
      }
    });
  } catch (error) {
    logger.error('Unable to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await sequelize.close();
  process.exit(0);
});

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = app;
