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

      const [userId] = await db('users').insert({
        username,
        email,
        password_hash: hashedPassword,
        avatar_url: 'https://example.com/default-avatar.png',
        bio: '',
        created_at: db.fn.now(),
        updated_at: db.fn.now()
      });

      const user = await db('users')
        .where({ id: userId })
        .select('id', 'username', 'email', 'avatar_url', 'bio', 'created_at')
        .first();

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });

      res.json({ user, token });

    } catch (err) {
      console.error(`[${requestId}] Register error:`, err);
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
          avatar_url: user.avatar_url,
          bio: user.bio,
          created_at: user.created_at
        },
        token,
      });

    } catch (err) {
      console.error(`[${requestId}] Login error:`, err);
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
        .select('id', 'username', 'email', 'avatar_url', 'bio', 'created_at')
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
      console.error(`[${requestId}] Get user error:`, err);
      res.status(500).json({
        error: {
          message: 'Internal server error',
          requestId,
          timestamp
        }
      });
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
        return res.status(404).json({
          error: {
            message: 'User not found',
            requestId,
            timestamp
          }
        });
      }

      // Get counts
      const [pinsCount] = await db('pins')
        .where({ user_id: req.params.id })
        .count('id as count');

      const [boardsCount] = await db('boards')
        .where({ user_id: req.params.id })
        .count('id as count');

      const [followersCount] = await db('follows')
        .where({ following_id: req.params.id })
        .count('id as count');

      const [followingCount] = await db('follows')
        .where({ follower_id: req.params.id })
        .count('id as count');

      res.json({
        ...user,
        pinsCount: pinsCount.count,
        boardsCount: boardsCount.count,
        followersCount: followersCount.count,
        followingCount: followingCount.count
      });

    } catch (err) {
      console.error(`[${requestId}] Get profile error:`, err);
      res.status(500).json({
        error: {
          message: 'Internal server error',
          requestId,
          timestamp
        }
      });
    }
  });

  // ✅ UPDATE USER PROFILE
  router.put('/:id', authenticate, async (req, res) => {
    const requestId = req.requestId;
    const timestamp = new Date().toISOString();

    try {
      if (req.params.id !== req.user.id) {
        return res.status(403).json({
          error: {
            message: 'Unauthorized to update this profile',
            requestId,
            timestamp
          }
        });
      }

      const { avatar_url, bio } = req.body;
      const updates = {
        avatar_url,
        bio,
        updated_at: db.fn.now()
      };

      await db('users')
        .where({ id: req.params.id })
        .update(updates);

      const updatedUser = await db('users')
        .where({ id: req.params.id })
        .select('id', 'username', 'avatar_url', 'bio', 'created_at')
        .first();

      res.json(updatedUser);
    } catch (err) {
      console.error(`[${requestId}] Update profile error:`, err);
      res.status(500).json({
        error: {
          message: 'Internal server error',
          requestId,
          timestamp
        }
      });
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
      res.status(500).json({
        error: {
          message: 'Internal server error',
          requestId,
          timestamp
        }
      });
    }
  });

  // ✅ GET USER PINS
  router.get('/:id/pins', async (req, res) => {
    const requestId = req.requestId;
    const timestamp = new Date().toISOString();

    try {
      const pins = await db('pins')
        .where({ user_id: req.params.id })
        .select('id', 'title', 'description', 'image_url', 'link_url', 'created_at')
        .orderBy('created_at', 'desc');

      res.json(pins);
    } catch (err) {
      console.error(`[${requestId}] Get pins error:`, err);
      res.status(500).json({
        error: {
          message: 'Internal server error',
          requestId,
          timestamp
        }
      });
    }
  });

  // ✅ GET USER ACTIVITY
  router.get('/:id/activity', async (req, res) => {
    const requestId = req.requestId;
    const timestamp = new Date().toISOString();

    try {
      // Get pins activity
      const pins = await db('pins')
        .where({ user_id: req.params.id })
        .select(
          'id',
          'title',
          'created_at',
          db.raw("'pin' as type")
        );

      // Get boards activity
      const boards = await db('boards')
        .where({ user_id: req.params.id })
        .select(
          'id',
          'title',
          'created_at',
          db.raw("'board' as type")
        );

      // Combine and sort activities
      const activities = [...pins, ...boards]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 20);

      res.json(activities);
    } catch (err) {
      console.error(`[${requestId}] Get activity error:`, err);
      res.status(500).json({
        error: {
          message: 'Internal server error',
          requestId,
          timestamp
        }
      });
    }
  });

  // ✅ FOLLOW/UNFOLLOW USER
  router.post('/:id/follow', authenticate, async (req, res) => {
    const requestId = req.requestId;
    const timestamp = new Date().toISOString();

    try {
      if (req.params.id == req.user.id) { // Use == for loose comparison if req.params.id is string
        return res.status(400).json({
          error: {
            message: 'Cannot follow yourself',
            requestId,
            timestamp
          }
        });
      }

      const existingFollow = await db('follows')
        .where({
          follower_id: req.user.id,
          following_id: req.params.id
        })
        .first();

      if (existingFollow) {
        // Unfollow
        await db('follows')
          .where({
            follower_id: req.user.id,
            following_id: req.params.id
          })
          .del();

        res.json({ following: false });
      } else {
        // Follow
        await db('follows').insert({
          follower_id: req.user.id,
          following_id: req.params.id,
          created_at: db.fn.now()
        });

        res.json({ following: true });
      }
    } catch (err) {
      console.error(`[${requestId}] Follow error:`, err);
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