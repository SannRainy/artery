import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/users.js';
import tagRoutes from './routes/tags.js';
import boardRoutes from './routes/boards.js';
import pinRoutes from './routes/pins.js';
import { authenticate } from './middleware/auth.js';
import knex from 'knex';
import knexConfig from './knexfile.js';

dotenv.config();

const db = knex(knexConfig.development);

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Middleware CORS
app.use(cors());
app.options('*', cors()); // ⬅️ Taruh DI SINI, setelah `app.use(cors())`

app.use(express.json());

// ⛔ Jangan global authenticate
// app.use(authenticate);

// ✅ Public routes
app.use('/api/users', userRoutes(db));

// ✅ Protected routes
app.use('/api/tags', authenticate, tagRoutes(db));
app.use('/api/boards', authenticate, boardRoutes(db));
app.use('/api/pins', authenticate, pinRoutes(db));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
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
