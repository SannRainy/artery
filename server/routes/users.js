// server/routes/users.js
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authenticate } from '../middleware/auth.js';

export default function (db) {
  const router = express.Router();

  // ✅ REGISTER
  router.post('/register', async (req, res) => {
    try {
      const { username, email, password } = req.body;

      // Validasi input sederhana
      if (!username || !email || !password) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Cek apakah user sudah ada
      const existingUser = await db('users')
        .where({ email })
        .orWhere({ username })
        .first();

      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Simpan user ke database
      const [insertedId] = await db('users').insert({
        username,
        email,
        password_hash: hashedPassword,
        created_at: new Date(),
        updated_at: new Date(),
      });

      // Ambil data user yang baru
      const user = await db('users')
        .where({ id: insertedId })
        .select('id', 'username', 'email')
        .first();

      // Pastikan JWT_SECRET tersedia
      if (!process.env.JWT_SECRET) {
        console.error('Missing JWT_SECRET in environment!');
        return res.status(500).json({ message: 'Server misconfiguration' });
      }

      // Buat token
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });

      res.json({ user, token });
    } catch (err) {
      console.error('Register error:', err.message, err.stack);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // ✅ LOGIN
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await db('users').where({ email }).first();
      if (!user) return res.status(401).json({ message: 'Invalid credentials' });

      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });

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
      console.error('Login error:', err.message, err.stack);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // ✅ GET CURRENT USER
  router.get('/me', authenticate, async (req, res) => {
    try {
      const user = await db('users')
        .where({ id: req.user.id })
        .select('id', 'username', 'email', 'created_at')
        .first();

      if (!user) return res.status(404).json({ message: 'User not found' });

      res.json(user);
    } catch (err) {
      console.error('Get user error:', err.message, err.stack);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  return router;
}
