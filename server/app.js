const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const knex = require('knex');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer'); 
const { attachPaginate } = require('knex-paginate')

dotenv.config({ path: path.resolve(__dirname, '../.env') }); 

const knexConfig = require('./knexfile');
const dbEnvironment = process.env.NODE_ENV || 'development';
const db = knex(knexConfig[dbEnvironment]);
attachPaginate();

const { authenticate } = require('./middleware/auth');
const userRoutes = require('./routes/users');
const tagRoutes = require('./routes/tags');
const pinRoutes = require('./routes/pins')(db);
const messageRoutes = require('./routes/messages')(db);
const notificationRoutes = require('./routes/notifications')(db);
const linkedAccountsRoutes = require('./routes/linkedAccounts');

const app = express();
const PORT = process.env.PORT || 3000; 

app.use(helmet());

app.use(compression());

app.use((req, res, next) => {
  req.requestId = uuidv4();
  next();
});

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// CORS configuration (sebelum routes)
const allowedOrigins = [
  'http://localhost:3001', // Untuk development di komputer Anda
  'https://arteryproject-sannrainys-projects.vercel.app', // URL lama Vercel
  'https://www.arteryproject.me', // Domain kustom Anda dengan www
  'https://arteryproject.me' // Domain kustom Anda tanpa www
];

const generalCorsOptions = {
  origin: function (origin, callback) {
    // Izinkan jika origin ada di dalam daftar, atau jika tidak ada origin (misal: request dari Postman)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // OPTIONS penting untuk preflight requests
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Jika Anda menggunakan cookies atau session
};
app.use(cors(generalCorsOptions));

// Body parser with size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting for API endpoints (setelah parsing body, sebelum routes)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 10000 : 1000, // Lebih tinggi untuk testing, atau sesuai kebutuhan
  message: {
    error: {
        message: 'Too many requests from this IP, please try again later.',
        // requestId akan ditambahkan oleh error handler umum jika ada
    }
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use('/api', apiLimiter); // Terapkan limiter ke semua rute /api

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
    environment: dbEnvironment
  });
});

const apiDocsPath = path.join(__dirname, 'api-docs.html');
try {
    if (require('fs').existsSync(apiDocsPath)) {
        app.get('/api-docs', (req, res) => {
            res.sendFile(apiDocsPath);
        });
    } else {
        console.warn('API documentation file not found at:', apiDocsPath);
    }
} catch(e) {
    console.warn('Could not check for API documentation file:', e.message);
}

app.use('/api/v1/users', userRoutes(db));
app.use('/api/v1/linked-accounts', linkedAccountsRoutes(db)); 
app.use('/api/v1/tags', authenticate, tagRoutes(db)); 
app.use('/api/v1/pins', pinRoutes); 
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/notifications', notificationRoutes);

if(messageRoutes) {
    app.use('/api/v1/messages', messageRoutes);
}

app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});

const uploadsStaticPath = path.join(__dirname, '..', 'public', 'uploads');
console.log(`Serving static files for /uploads from: ${uploadsStaticPath}`);
app.use('/uploads', express.static(uploadsStaticPath));

app.use((err, req, res, next) => {
  console.error(`[${req.requestId || 'N/A'}] Error encountered:`, err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'An unexpected error occurred on the server.';

  if (err instanceof multer.MulterError) {
    statusCode = 400; // Bad Request
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File is too large.';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files.';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected file field or invalid file type.';
        break;
      default:
        message = 'File upload error.';
    }
  } else if (err.name === 'UnauthorizedError') { // Contoh untuk error dari express-jwt
    statusCode = 401;
    message = 'Invalid token or not authenticated.';
  }
  // Tambahkan penanganan error spesifik lainnya di sini jika perlu
  // (misalnya, error validasi dari Joi, error dari Knex/database)

  // Jangan kirim stack trace ke client di production
  const errorResponse = {
    error: {
      message,
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
    }
  };
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    errorResponse.error.stack = err.stack.split('\n');
  }
  if (err.code) { // Tambahkan kode error jika ada (misalnya dari Multer)
    errorResponse.error.code = err.code;
  }


  res.status(statusCode).json(errorResponse);
});

// --- Server Startup Logic ---
const startServer = async () => {
  try {
    console.log(`Attempting to connect to database in ${dbEnvironment} mode...`);
    await db.raw('SELECT 1 AS result');
    console.log('Database connection established successfully.');

    const server = app.listen(PORT, () => {
      console.log(`Server running in ${dbEnvironment} mode on port ${PORT}`);
      if (require('fs').existsSync(apiDocsPath)) {
        console.log(`API docs available at http://localhost:${PORT}/api-docs`);
      }
      console.log(`Frontend expected at: ${generalCorsOptions.origin}`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`Received ${signal}. Starting graceful shutdown...`);
      server.close(async () => {
        console.log('HTTP server closed.');
        try {
          await db.destroy();
          console.log('Database connection closed.');
          process.exit(0);
        } catch (dbErr) {
          console.error('Error closing database connection:', dbErr);
          process.exit(1);
        }
      });

      // Force shutdown after a timeout
      setTimeout(() => {
        console.error('Graceful shutdown timed out. Forcefully shutting down.');
        process.exit(1);
      }, 15000); // 15 seconds
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

  } catch (err) {
    console.error('Failed to start server or connect to database:', err);
    process.exit(1);
  }
};

// Handle unhandled rejections and uncaught exceptions
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Pertimbangkan untuk shutdown gracefully di sini juga, tergantung kasus
  // throw reason; // Agar uncaughtException handler menangkapnya
});

process.on('uncaughtException', (err, origin) => {
  console.error(`Uncaught Exception at: ${origin}`, err);
  // Lakukan cleanup sinkron terakhir di sini jika perlu
  process.exit(1); // Wajib exit setelah uncaught exception
});

// Mulai server
if (require.main === module) { // Pastikan server hanya start jika file ini dijalankan langsung
    startServer();
}

module.exports = { app, db }; // Ekspor app dan db untuk testing atau penggunaan lain