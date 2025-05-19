const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { authenticate } = require('../middleware/auth');

module.exports = function (db) {
  const router = express.Router();

  // ✅ REGISTER
  router.post('/register', async (req, res) => {
    const requestId = req.requestId;
    const timestamp = new Date().toISOString();

    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({
          error: {
            message: 'Missing required fields',
            requestId,
            timestamp
          }
        });
      }

      const existingUser = await db('users')
        .where({ email })
        .orWhere({ username })
        .first();

      if (existingUser) {
        return res.status(400).json({
          error: {
            message: 'User already exists',
            requestId,
            timestamp
          }
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const [insertedId] = await db('users').insert({
        username,
        email,
        password_hash: hashedPassword,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const user = await db('users')
        .where({ id: insertedId })
        .select('id', 'username', 'email')
        .first();

      if (!process.env.JWT_SECRET) {
        console.error(`[${requestId}] Missing JWT_SECRET`);
        return res.status(500).json({
          error: {
            message: 'Server misconfiguration',
            requestId,
            timestamp
          }
        });
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });

      res.json({ user, token });

    } catch (err) {
      console.error(`[${requestId}] Register error:`, err.message, err.stack);
      res.status(500).json({
        error: {
          message: 'Internal server error',
          requestId,
          timestamp
        }
      });
    }
  });

  // ✅ LOGIN
  router.post('/login', async (req, res) => {
    const requestId = req.requestId;
    const timestamp = new Date().toISOString();

    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          error: {
            message: 'Email and password required',
            requestId,
            timestamp
          }
        });
      }

      const user = await db('users').where({ email }).first();
      if (!user) {
        return res.status(401).json({
          error: {
            message: 'Invalid credentials',
            requestId,
            timestamp
          }
        });
      }

      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        return res.status(401).json({
          error: {
            message: 'Invalid credentials',
            requestId,
            timestamp
          }
        });
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
        token,
      });

    } catch (err) {
      console.error(`[${requestId}] Login error:`, err.message, err.stack);
      res.status(500).json({
        error: {
          message: 'Internal server error',
          requestId,
          timestamp
        }
      });
    }
  });

  // ✅ GET CURRENT USER
  router.get('/me', authenticate, async (req, res) => {
    const requestId = req.requestId;
    const timestamp = new Date().toISOString();

    try {
      const user = await db('users')
        .where({ id: req.user.id })
        .select('id', 'username', 'email', 'created_at')
        .first();

      if (!user) {
        return res.status(404).json({
          error: {
            message: 'User not found',
            requestId,
            timestamp
          }
        });
      }

      res.json(user);
    } catch (err) {
      console.error(`[${requestId}] Get user error:`, err.message, err.stack);
      res.status(500).json({
        error: {
          message: 'Internal server error',
          requestId,
          timestamp
        }
      });
    }
  });

  return router;
};
