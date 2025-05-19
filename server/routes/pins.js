const express = require('express');
const { authenticate } = require('../middleware/auth.js');

module.exports = function (db) {
  const router = express.Router();

  // GET /pins - Get user's pins
  router.get('/', authenticate, async (req, res) => {
    const { page = 1, limit = 30 } = req.query;
    const userId = req.user.id;
    const requestId = req.requestId;
    const timestamp = new Date().toISOString();

    try {
      const pins = await db('pins')
        .where('user_id', userId)
        .offset((page - 1) * limit)
        .limit(limit)
        .orderBy('created_at', 'desc');

      res.json(pins);
    } catch (err) {
      console.error(`[${requestId}] Failed to fetch user pins:`, err.message, err.stack);
      res.status(500).json({
        error: {
          message: 'Failed to fetch pins',
          requestId,
          timestamp
        }
      });
    }
  });

  // POST /pins - Create new pin
  router.post('/', authenticate, async (req, res) => {
    const { title, description, image_url, link_url, board_id, tags } = req.body;
    const userId = req.user.id;
    const requestId = req.requestId;
    const timestamp = new Date().toISOString();

    try {
      const [pin] = await db('pins')
        .insert({
          title,
          description,
          image_url,
          link_url,
          user_id: userId,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning('*');

      // Relasi ke board (jika ada)
      if (board_id) {
        await db('board_pins').insert({
          board_id,
          pin_id: pin.id
        });
      }

      // Tambah tag (jika ada)
      if (tags && tags.length > 0) {
        const tagIds = await Promise.all(tags.map(async (tagName) => {
          let tag = await db('tags')
            .where('name', tagName.toLowerCase())
            .first();

          if (!tag) {
            [tag] = await db('tags')
              .insert({ name: tagName.toLowerCase() })
              .returning('*');
          }

          return tag.id;
        }));

        await db('pin_tags').insert(tagIds.map(tag_id => ({
          pin_id: pin.id,
          tag_id
        })));
      }

      res.status(201).json(pin);
    } catch (err) {
      console.error(`[${requestId}] Failed to create pin:`, err.message, err.stack);
      res.status(500).json({
        error: {
          message: 'Failed to create pin',
          requestId,
          timestamp
        }
      });
    }
  });

  return router;
};
