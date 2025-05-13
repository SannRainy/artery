import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import knex from 'knex';
import userRoutes from './routes/users.js';
import tagRoutes from './routes/tags.js';
import boardRoutes from './routes/boards.js';
import pinRoutes from './routes/pins.js';
import { authenticate } from './middleware/auth.js';  // Include authentication middleware

dotenv.config();

// Validate environment variables
const requiredEnvVars = ['DB_USER', 'DB_PASS', 'DB_NAME', 'PORT'];
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

const app = express();
const PORT = process.env.PORT || 3000;

// Setup database connection
const db = knex({
  client: 'mysql2',
  connection: {
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
});

// Middleware
app.use(cors({ origin: 'http://localhost:3001', credentials: true }));
app.use(express.json());

// Authentication middleware (if needed for certain routes)
app.use(authenticate); // Apply authentication globally or to specific routes

// Routes
app.use('/api/users', userRoutes(db));      // Route for user-related actions
app.use('/api/tags', tagRoutes(db));        // Route for tag-related actions
app.use('/api/boards', boardRoutes(db));    // Route for board-related actions
app.use('/api/pins', pinRoutes(db));        // Route for pin-related actions

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
const shutdown = () => {
  console.log('Shutting down the server...');
  server.close(() => {
    console.log('Server has shut down gracefully.');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown); // Catch SIGINT (Ctrl+C)
process.on('SIGTERM', shutdown); // Catch SIGTERM (e.g., from docker stop)
