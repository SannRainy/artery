const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const userRoutes = require('./routes/users');
const tagRoutes = require('./routes/tags');
const boardRoutes = require('./routes/boards');
const pinRoutes = require('./routes/pins');
const { authenticate } = require('./middleware/auth');
const knex = require('knex');
const knexConfig = require('./knexfile');

dotenv.config();

const db = knex(knexConfig.development);

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Middleware CORS
app.use(cors());
app.options('*', cors());

app.get('/', (req, res) => {
  res.send('API is running!');
});

app.use(express.json());

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

process.on('SIGINT', shutdown);  // Catch SIGINT (Ctrl+C)
process.on('SIGTERM', shutdown); // Catch SIGTERM (e.g., from docker stop)
