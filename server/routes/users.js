// server/routes/users.js
const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const multer = require('multer'); 
const jwt = require('jsonwebtoken');
const path = require('path');    
const fs = require('fs');        
const { authenticate } = require('../middleware/auth');
const supabase = require('../utils/supabaseClient');
const sendEmail = require('../utils/email');

const avatarStorage = multer.memoryStorage();
const avatarFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type for avatar.'), false);
  }
};
const uploadAvatar = multer({
   storage: avatarStorage, 
   limits: { fileSize: 2 * 1024 * 1024 },
   fileFilter: avatarFileFilter
}).single('avatar');

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
        is_verified: false,
        avatar_url: 'https://weuskrczzjbswnpsgbmp.supabase.co/storage/v1/object/public/avatars/default-avatar.gif', 
        bio: '',
        created_at: db.fn.now(),
        updated_at: db.fn.now()
      }).returning('id');


      const userId = userIdResult.id || userIdResult;

      if (!userId) {
          console.error(`[${requestId}] User registration failed, could not retrieve userId.`);
          return res.status(500).json({ error: { message: 'User registration failed.', requestId, timestamp } });
      }
      
      const user = await db('users')
        .where({ id: userId })
        .select('id', 'username', 'email', 'avatar_url', 'bio', 'created_at')
        .first();

      const verificationToken = crypto.randomBytes(32).toString('hex');
      const tokenExpires = new Date(Date.now() + 3600000);

      await db('users').where({ id: userId }).update({
        verification_token: verificationToken,
        verification_token_expires: tokenExpires,
      });

      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
      try {
        await sendEmail({
                    to: email,
                    subject: 'Verifikasi Akun Artery Anda',
                    html: `
                        <h1>Selamat Datang di Artery!</h1>
                        <p>Silakan klik link di bawah ini untuk memverifikasi email Anda:</p>
                        <a href="${verificationUrl}">${verificationUrl}</a>
                        <p>Link ini akan kedaluwarsa dalam 1 jam.</p>
                    `
                });
      } catch (emailError) {
        console.error("Gagal mengirim email verifikasi:", emailError);
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ user, token });
    } catch (err) {
      console.error(`[${requestId}] Register error:`, err);
      res.status(500).json({ error: { message: 'Internal server error', requestId, timestamp }});
    }
      res.status(201).json({ 
      success: true, 
      message: 'Registrasi berhasil. Silakan cek email Anda untuk verifikasi.' 
    });
  });

  router.post('/resend-verification', async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: { message: 'Email is required' } });
    }

    try {
      const user = await db('users').where({ email }).first();

      if (!user) {
        return res.json({ message: 'If an account with that email exists, a new verification link has been sent.' });
      }

      if (user.is_verified) {
        return res.status(400).json({ error: { message: 'This account is already verified.' } });
      }

      const verificationToken = crypto.randomBytes(32).toString('hex');
      const tokenExpires = new Date(Date.now() + 3600000); 

      await db('users').where({ id: user.id }).update({
        verification_token: verificationToken,
        verification_token_expires: tokenExpires,
      });

      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
      await sendEmail({
            to: email,
            subject: 'Selamat Datang! Verifikasi Akun Artery Anda',
            html: `
                <h1>Selamat Datang di Artery!</h1>
                <p>Silakan klik link di bawah ini untuk memverifikasi email Anda:</p>
                <a href="${verificationUrl}">${verificationUrl}</a>
                <p>Link ini akan kedaluwarsa dalam 1 jam.</p>
            `
        });

      res.json({ message: 'If an account with that email exists, a new verification link has been sent.' });

    } catch (err) {
      console.error('Resend verification error:', err);

      res.status(500).json({ error: { message: 'An internal error occurred. Please try again later.' } });
    }
  });

  router.get('/verify-email/:token', async (req, res) => {
  const { token } = req.params;
  try {
    const user = await db('users')
      .where({ verification_token: token })
      .andWhere('verification_token_expires', '>', new Date())
      .first();

    if (!user) {
      return res.status(400).json({ error: { message: 'Token verifikasi tidak valid atau sudah kedaluwarsa.' } });
    }

    await db('users').where({ id: user.id }).update({
      is_verified: true,
      verification_token: null,
      verification_token_expires: null,
    });

    res.json({ message: 'Email berhasil diverifikasi!' });
  } catch (err) {
    res.status(500).json({ error: { message: 'Gagal memverifikasi email.' } });
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
      if (!user.is_verified) {
        return res.status(401).json({ error: { message: 'Akun Anda belum diverifikasi. Silakan cek email Anda.' } });
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
        .select('id', 'username', 'email', 'avatar_url', 'bio', 'created_at', 'location', 'nationality', 'date_of_birth')
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


  router.get('/search', authenticate, async (req, res) => {
    const { q = '' } = req.query; // q adalah query pencarian
    const currentUserId = req.user.id;

    try {
      const users = await db('users')
        .where('username', 'like', `%${q}%`) // Cari username yang mirip
        .whereNot('id', currentUserId) // Jangan tampilkan diri sendiri
        .select(
          'id', 
          'username', 
          'avatar_url',
          // Subquery untuk mengecek apakah kita sudah follow user ini
          db.raw(`EXISTS (SELECT 1 FROM follows WHERE follower_id = ? AND following_id = users.id) as is_following`, [currentUserId])
        )
        .limit(10); // Batasi hasil pencarian

      res.json(users);
    } catch (error) {
      console.error("Error searching users:", error);
      res.status(500).json({ error: 'Gagal mencari pengguna.' });
    }
  });

  // ✅ GET USER PROFILE
  router.get('/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const currentUserId = req.user.id;
    const requestId = req.requestId;
    const timestamp = new Date().toISOString();

    try {
        const user = await db('users').where({ id }).first();
        if (!user) {
            return res.status(404).json({ error: { message: 'User not found' } });
        }

        // Ambil data agregat
        const [pinsCount, followingCount, followersCount] = await Promise.all([
            db('pins').where({ user_id: id }).count('id as count').first(),
            db('follows').where({ follower_id: id }).count('id as count').first(),
            db('follows').where({ following_id: id }).count('id as count').first()
        ]);

        // Cek status follow
        const isFollowing = await db('follows').where({ follower_id: currentUserId, following_id: id }).first();
        const isFollowingYou = await db('follows').where({ follower_id: id, following_id: currentUserId }).first();

        res.json({
            id: user.id,
            username: user.username,
            avatar_url: user.avatar_url,
            bio: user.bio,
            created_at: user.created_at,
            location: user.location,
            nationality: user.nationality,
            date_of_birth: user.date_of_birth,
            pinsCount: parseInt(pinsCount.count, 10),
            followingCount: parseInt(followingCount.count, 10),
            followersCount: parseInt(followersCount.count, 10),
            is_following: !!isFollowing,
            is_following_you: !!isFollowingYou
        });
    } catch (err) {
        console.error(`[${requestId}] [${timestamp}] Error fetching user profile:`, err.message);
        res.status(500).json({ error: { message: 'Internal Server Error' } });
    }
});

  // ✅ UPDATE USER PROFILE

  router.put('/:id', authenticate, uploadAvatar, async (req, res) => {
    const requestId = req.requestId;
    const timestamp = new Date().toISOString();

    try {
      if (parseInt(req.params.id, 10) !== req.user.id){
        return res.status(403).json({ error: { message: 'Unauthorized' }});
      }

      const { username, bio, location, nationality, date_of_birth, email } = req.body;
      const updates = { updated_at: new Date() };

      if (username !== undefined) updates.username = username.trim();
      if (email !== undefined) updates.email = email.trim(); 
      if (bio !== undefined) updates.bio = bio;
      if (location !== undefined) updates.location = location;
      if (nationality !== undefined) updates.nationality = nationality;
      if (date_of_birth !== undefined) {
        updates.date_of_birth = date_of_birth || null;
      }
      if (req.file) {
        // 1. Dapatkan info user lama untuk menghapus avatar lama
        const oldUserData = await db('users').where({ id: req.user.id }).select('avatar_url').first();
        if (oldUserData && oldUserData.avatar_url && oldUserData.avatar_url.includes('supabase')) {
          // Hanya hapus jika itu file dari Supabase, bukan default
          const oldFileName = oldUserData.avatar_url.split('/').pop();
          await supabase.storage.from('avatars').remove([oldFileName]);
        }
        
        // 2. Upload avatar baru
        const file = req.file;
        const fileExt = path.extname(file.originalname);
        const fileName = `avatar-${req.user.id}-${Date.now()}${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars') // Nama bucket avatar
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            cacheControl: '3600'
          });

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        // 3. Dapatkan URL publik dan simpan ke 'updates'
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        
        updates.avatar_url = publicUrl;
      }
      // ------------------------------------ 
      const fieldsToUpdate = Object.keys(updates);
      // Hanya update jika ada yang diubah
      if (fieldsToUpdate.length > 1 || req.file) {
        await db('users').where({ id: req.user.id }).update(updates);
      }

      const updatedUser = await db('users')
        .where({ id: req.user.id })
        .select('id', 'username', 'email', 'avatar_url', 'bio', 'created_at', 'location', 'nationality', 'date_of_birth')
        .first();
      res.json(updatedUser);
    } catch (err) {
      console.error(`[${requestId}] Update profile error:`, err);
      res.status(500).json({ error: { message: 'Internal server error while updating profile', details: err.message, requestId, timestamp }});
    }
  });

  router.post('/change-password', authenticate, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const { id } = req.user;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: { message: 'All fields are required.' } });
    }

    try {
      const user = await db('users').where({ id }).first();
      if (!user) {
        return res.status(404).json({ error: { message: 'User not found.' } });
      }

      const isValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isValid) {
        return res.status(401).json({ error: { message: 'Current password is incorrect.' } });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ error: { message: 'New password must be at least 6 characters long.' } });
      }

      const newPasswordHash = await bcrypt.hash(newPassword, 10);
      await db('users').where({ id }).update({ password_hash: newPasswordHash });

      res.status(200).json({ message: 'Password changed successfully.' });

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: { message: 'Internal server error.' } });
    }
  });

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

  router.get('/:id/pins', async (req, res) => {
    const requestId = req.requestId;
    const timestamp = new Date().toISOString();
    try {
      const pins = await db('pins')
        .where({ user_id: req.params.id })

        .select('id', 'title', 'description', 'image_url', 'created_at')
        .orderBy('created_at', 'desc');
      res.json(pins);
    } catch (err) {
      console.error(`[${requestId}] Get user pins error:`, err.sqlMessage || err.message); // Log pesan SQL jika ada
      res.status(500).json({ error: { message: 'Failed to fetch user pins.', requestId, timestamp }});
    }
  });

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


  router.post('/:id/toggle-follow', authenticate, async (req, res) => {
    const requestId = req.requestId;
    const timestamp = new Date().toISOString();
    try {

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

      if (targetUserId !== currentUserId && !existingFollow) { 
        await db('notifications').insert({
          user_id: targetUserId, 
          actor_id: currentUserId, 
          type: 'follow',
          entity_id: currentUserId 
        });
      }
    } catch (err) {
      console.error(`[${requestId}] Follow error:`, err);
      res.status(500).json({ error: { message: 'Internal server error', requestId, timestamp }});
    }
  });

  return router;
};