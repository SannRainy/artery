// server/routes/users.js
const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer'); // Sudah ada
const jwt = require('jsonwebtoken');
const path = require('path');    // Sudah ada
const fs = require('fs');        // <<< TAMBAHKAN INI untuk fs.unlink
const { authenticate } = require('../middleware/auth');

// --- Konfigurasi Multer untuk Avatar ---
const avatarUploadPath = path.join(__dirname, '..', '..', 'public/uploads/avatars');

try {
  fs.mkdirSync(avatarUploadPath, { recursive: true });
} catch (err) {
  // console.error('Failed to create avatar upload directory:', err);
}

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarUploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `avatar-${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const avatarFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Invalid file type for avatar. Only images are allowed.'), false);
  }
};

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Max 2MB untuk avatar
  fileFilter: avatarFileFilter
}).single('avatar'); // Nama field dari client harus 'avatar'

module.exports = function (db) {
  const router = express.Router();

  // ✅ REGISTER
  router.post('/register', async (req, res) => {
    const requestId = req.requestId;
    const timestamp = new Date().toISOString();
    try {
      const { username, email, password } = req.body;
      if (!username || !email || !password) {
        return res.status(400).json({ error: { message: 'Missing required fields', requestId, timestamp }});
      }
      const existingUser = await db('users').where({ email }).orWhere({ username }).first();
      if (existingUser) {
        return res.status(400).json({ error: { message: 'User already exists', requestId, timestamp }});
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const [userIdResult] = await db('users').insert({ // Knex insert mengembalikan array dengan ID
        username,
        email,
        password_hash: hashedPassword,
        avatar_url: '/img/default-avatar.png', // <<< GANTI DEFAULT AVATAR DI SINI
        bio: '',
        created_at: db.fn.now(),
        updated_at: db.fn.now()
      }).returning('id'); // .returning('id') mungkin tidak selalu mengembalikan objek di MySQL, tapi ID di array

      // Dapatkan ID dengan benar
      const userId = (typeof userIdResult === 'object' && userIdResult !== null) ? userIdResult.id : userIdResult;


      if (!userId) {
          console.error(`[${requestId}] User registration failed, could not retrieve userId.`);
          return res.status(500).json({ error: { message: 'User registration failed.', requestId, timestamp } });
      }
      
      const user = await db('users')
        .where({ id: userId })
        .select('id', 'username', 'email', 'avatar_url', 'bio', 'created_at')
        .first();
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ user, token });
    } catch (err) {
      console.error(`[${requestId}] Register error:`, err);
      res.status(500).json({ error: { message: 'Internal server error', requestId, timestamp }});
    }
  });

  // ✅ LOGIN
  router.post('/login', async (req, res) => {
    const requestId = req.requestId;
    const timestamp = new Date().toISOString();
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: { message: 'Email and password required', requestId, timestamp }});
      }
      const user = await db('users').where({ email }).first();
      if (!user) {
        return res.status(401).json({ error: { message: 'Invalid credentials', requestId, timestamp }});
      }
      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        return res.status(401).json({ error: { message: 'Invalid credentials', requestId, timestamp }});
      }
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({
        user: {
          id: user.id, username: user.username, email: user.email,
          avatar_url: user.avatar_url, bio: user.bio, created_at: user.created_at
        },
        token,
      });
    } catch (err) {
      console.error(`[${requestId}] Login error:`, err);
      res.status(500).json({ error: { message: 'Internal server error', requestId, timestamp }});
    }
  });

  // ✅ GET CURRENT USER
  router.get('/me', authenticate, async (req, res) => {
    const requestId = req.requestId;
    const timestamp = new Date().toISOString();
    try {
      const user = await db('users')
        .where({ id: req.user.id })
        .select('id', 'username', 'email', 'avatar_url', 'bio', 'created_at')
        .first();
      if (!user) {
        return res.status(404).json({ error: { message: 'User not found', requestId, timestamp }});
      }
      res.json(user);
    } catch (err) {
      console.error(`[${requestId}] Get user error:`, err);
      res.status(500).json({ error: { message: 'Internal server error', requestId, timestamp }});
    }
  });

  // ✅ GET USER PROFILE
  router.get('/:id', async (req, res) => {
    const requestId = req.requestId;
    const timestamp = new Date().toISOString();
    try {
      const user = await db('users')
        .where({ id: req.params.id })
        .select('id', 'username', 'email', 'avatar_url', 'bio', 'created_at')
        .first();
      if (!user) {
        return res.status(404).json({ error: { message: 'User not found', requestId, timestamp }});
      }
      const [pinsCount] = await db('pins').where({ user_id: req.params.id }).count('id as count');
      const [boardsCount] = await db('boards').where({ user_id: req.params.id }).count('id as count');
      const [followersCount] = await db('follows').where({ following_id: req.params.id }).count('id as count');
      const [followingCount] = await db('follows').where({ follower_id: req.params.id }).count('id as count');
      res.json({
        ...user,
        pinsCount: parseInt(pinsCount.count, 10) || 0,
        boardsCount: parseInt(boardsCount.count, 10) || 0,
        followersCount: parseInt(followersCount.count, 10) || 0,
        followingCount: parseInt(followingCount.count, 10) || 0
      });
    } catch (err) {
      console.error(`[${requestId}] Get profile error:`, err);
      res.status(500).json({ error: { message: 'Internal server error', requestId, timestamp }});
    }
  });

  // ✅ UPDATE USER PROFILE
  // HANYA SATU DEFINISI router.put('/:id', ...)
  router.put('/:id', authenticate, (req, res, next) => {
    uploadAvatar(req, res, function (err) {
      const requestId = req.requestId;
      const timestamp = new Date().toISOString();
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: { message: err.message, code: err.code, requestId, timestamp } });
      } else if (err) {
        console.error(`[${requestId}] Avatar upload error:`, err);
        return res.status(500).json({ error: { message: 'Avatar upload failed.', details: err.message, requestId, timestamp } });
      }
      next();
    });
  }, async (req, res) => {
    const requestId = req.requestId;
    const timestamp = new Date().toISOString();
    try {
      if (parseInt(req.params.id, 10) !== req.user.id) { // Pastikan tipe data cocok saat membandingkan
        return res.status(403).json({ error: { message: 'Unauthorized to update this profile', requestId, timestamp }});
      }

      const { username, bio } = req.body;
      const updates = { updated_at: db.fn.now() };

      if (username !== undefined && username.trim() !== '') {
        if (username.trim() !== req.user.username) {
            const existingUser = await db('users').where({ username: username.trim() }).whereNot({ id: req.user.id }).first();
            if (existingUser) {
                return res.status(400).json({ error: { message: 'Username already taken.', requestId, timestamp } });
            }
        }
        updates.username = username.trim();
      }
      
      if (bio !== undefined) {
        updates.bio = bio; // Bisa string kosong
      }

      if (req.file) {
        updates.avatar_url = `/uploads/avatars/${req.file.filename}`;
        const oldUserData = await db('users').where({ id: req.user.id }).select('avatar_url').first();
        // Ganti perbandingan dengan path default avatar lokal yang baru
        if (oldUserData && oldUserData.avatar_url && oldUserData.avatar_url !== '/img/default-avatar.png' && oldUserData.avatar_url.startsWith('/uploads/avatars/')) {
            const oldAvatarPath = path.join(__dirname, '..', '..', 'public', oldUserData.avatar_url);
            fs.unlink(oldAvatarPath, (err) => {
                if (err && err.code !== 'ENOENT') {
                    console.error(`[${requestId}] Failed to delete old avatar: ${oldAvatarPath}`, err);
                }
            });
        }
      }
      
      // Hanya update jika ada field yang benar-benar diubah (selain updated_at) atau ada file baru
      const fieldsToUpdate = { ...updates };
      delete fieldsToUpdate.updated_at; // Hapus updated_at untuk pengecekan
      
      if (Object.keys(fieldsToUpdate).length > 0 || req.file) {
          await db('users').where({ id: req.user.id }).update(updates);
      }

      const updatedUser = await db('users')
        .where({ id: req.user.id })
        .select('id', 'username', 'email', 'avatar_url', 'bio', 'created_at')
        .first();
      res.json(updatedUser);
    } catch (err) {
      console.error(`[${requestId}] Update profile error:`, err);
      if (req.file && req.file.path) {
        fs.unlink(req.file.path, (unlinkErr) => {
          if (unlinkErr) console.error(`[${requestId}] Failed to delete uploaded avatar after DB error: ${req.file.path}`, unlinkErr);
        });
      }
      res.status(500).json({ error: { message: 'Internal server error while updating profile', details: err.message, requestId, timestamp }});
    }
  });

  // ✅ GET USER BOARDS
  router.get('/:id/boards', async (req, res) => {
    const requestId = req.requestId;
    const timestamp = new Date().toISOString();
    try {
      const boards = await db('boards')
        .where({ user_id: req.params.id })
        .select('id', 'title', 'description', 'is_private', 'created_at')
        .orderBy('created_at', 'desc');
      res.json(boards);
    } catch (err) {
      console.error(`[${requestId}] Get boards error:`, err);
      res.status(500).json({ error: { message: 'Internal server error', requestId, timestamp }});
    }
  });

  // ✅ GET USER PINS
  router.get('/:id/pins', async (req, res) => {
    const requestId = req.requestId;
    const timestamp = new Date().toISOString();
    try {
      const pins = await db('pins')
        .where({ user_id: req.params.id })
        // link_url sudah dihapus dari select
        .select('id', 'title', 'description', 'image_url', 'created_at')
        .orderBy('created_at', 'desc');
      res.json(pins);
    } catch (err) {
      console.error(`[${requestId}] Get user pins error:`, err.sqlMessage || err.message); // Log pesan SQL jika ada
      res.status(500).json({ error: { message: 'Failed to fetch user pins.', requestId, timestamp }});
    }
  });

  // ✅ GET USER ACTIVITY
  router.get('/:id/activity', async (req, res) => {
    const requestId = req.requestId;
    const timestamp = new Date().toISOString();
    try {
      const pins = await db('pins')
        .where({ user_id: req.params.id })
        .select('id', 'title', 'created_at', db.raw("'pin' as type"));
      const boards = await db('boards')
        .where({ user_id: req.params.id })
        .select( 'id', 'title', 'created_at', db.raw("'board' as type"));
      const activities = [...pins, ...boards]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 20);
      res.json(activities);
    } catch (err) {
      console.error(`[${requestId}] Get activity error:`, err);
      res.status(500).json({ error: { message: 'Internal server error', requestId, timestamp }});
    }
  });

  // ✅ FOLLOW/UNFOLLOW USER
  router.post('/:id/follow', authenticate, async (req, res) => {
    const requestId = req.requestId;
    const timestamp = new Date().toISOString();
    try {
      // Pastikan ID user dari token dan params adalah angka sebelum dibandingkan
      const targetUserId = parseInt(req.params.id, 10);
      const currentUserId = req.user.id;

      if (isNaN(targetUserId)) {
          return res.status(400).json({ error: { message: 'Invalid target user ID.', requestId, timestamp } });
      }

      if (targetUserId === currentUserId) {
        return res.status(400).json({ error: { message: 'Cannot follow yourself', requestId, timestamp }});
      }
      const existingFollow = await db('follows')
        .where({ follower_id: currentUserId, following_id: targetUserId })
        .first();
      if (existingFollow) {
        await db('follows').where({ id: existingFollow.id }).del();
        res.json({ following: false });
      } else {
        await db('follows').insert({ follower_id: currentUserId, following_id: targetUserId, created_at: db.fn.now() });
        res.json({ following: true });
      }
    } catch (err) {
      console.error(`[${requestId}] Follow error:`, err);
      res.status(500).json({ error: { message: 'Internal server error', requestId, timestamp }});
    }
  });

  return router;
};