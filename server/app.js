const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const knex = require('knex');
const knexConfig = require('./knexfile');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');

// Load environment variables
dotenv.config();

// Initialize database connection
const db = knex(knexConfig[process.env.NODE_ENV || 'development']);

// Import route handlers
const userRoutes = require('./routes/users');
const tagRoutes = require('./routes/tags');
const boardRoutes = require('./routes/boards');
const pinRoutes = require('./routes/pins')(db);
const { authenticate } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Enhanced security middleware
app.use(helmet());
app.use(compression());

// Rate limiting for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: 'Too many requests from this IP, please try again later.'
});

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// Request logging
app.use(morgan('combined'));

// Add request ID for better tracing
app.use((req, res, next) => {
  req.requestId = uuidv4();
  next();
});

// Body parser with size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  });
});

// API documentation endpoint
app.get('/api-docs', (req, res) => {
  res.sendFile(__dirname + '/api-docs.html');
});

// Register routes with versioning and rate limiting
app.use('/api/v1/users', apiLimiter, userRoutes(db));
app.use('/api/v1/tags', authenticate, apiLimiter, tagRoutes(db));
app.use('/api/v1/boards', authenticate, apiLimiter, boardRoutes(db));
app.use('/api/v1/pins', apiLimiter, pinRoutes);

// Static files (for uploaded pin images)
app.use('/uploads', express.static('uploads'));

// Enhanced error handling
app.use((err, req, res, next) => {
  console.error(`[${req.requestId}] Error:`, err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Something went wrong!' : err.message;
  
  res.status(statusCode).json({
    error: {
      message,
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    }
  });
});

// Database connection check before starting
db.raw('SELECT 1')
  .then(() => {
    console.log('Database connection established');
    
    const server = app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`API docs available at http://localhost:${PORT}/api-docs`);
    });

    // Enhanced graceful shutdown
    const shutdown = async (signal) => {
      console.log(`Received ${signal}, shutting down gracefully...`);
      
      try {
        await db.destroy();
        console.log('Database connection closed');
        
        server.close(() => {
          console.log('Server has shut down gracefully');
          process.exit(0);
        });
        
        // Force shutdown after timeout
        setTimeout(() => {
          console.error('Could not close connections in time, forcefully shutting down');
          process.exit(1);
        }, 10000);
      } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
      }
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  })
  .catch(err => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  });

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});