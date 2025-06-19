const express = require('express');

module.exports = function (db) {
  const router = express.Router();

  router.get('/', async (req, res) => {
    const requestId = req.requestId;
    const timestamp = new Date().toISOString();

    try {
      const tags = await db('tags')
        .select('*')
        .orderBy('name', 'asc');

      res.json(tags);
    } catch (err) {
      console.error(`[${requestId}] Failed to fetch tags:`, err.message, err.stack);
      res.status(500).json({
        error: {
          message: 'Failed to fetch tags',
          requestId,
          timestamp
        }
      });
    }
  });

  router.get('/popular', async (req, res) => {
    const requestId = req.requestId;
    const timestamp = new Date().toISOString();

    try {
      const tags = await db('pin_tags')
        .join('tags', 'pin_tags.tag_id', 'tags.id')
        .select('tags.id', 'tags.name')
        .count('* as count')
        .groupBy('tags.id', 'tags.name')
        .orderBy('count', 'desc')
        .limit(20);

      res.json(tags);
    } catch (err) {
      console.error(`[${requestId}] Failed to fetch popular tags:`, err.message, err.stack);
      res.status(500).json({
        error: {
          message: 'Failed to fetch popular tags',
          requestId,
          timestamp
        }
      });
    }
  });

  router.get('/:tag/pins', async (req, res) => {
    const requestId = req.requestId;
    const timestamp = new Date().toISOString();
    const { page = 1, limit = 30 } = req.query;
    const offset = (page - 1) * limit;

    try {
      const tagName = req.params.tag.toLowerCase();

      const pins = await db('pin_tags')
        .join('tags', 'pin_tags.tag_id', 'tags.id')
        .join('pins', 'pin_tags.pin_id', 'pins.id')
        .where('tags.name', tagName)
        .select('pins.*')
        .orderBy('pins.created_at', 'desc')
        .limit(limit)
        .offset(offset);

      const total = await db('pin_tags')
        .join('tags', 'pin_tags.tag_id', 'tags.id')
        .where('tags.name', tagName)
        .count('* as count')
        .first();

      res.json({
        data: pins,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(total.count)
        }
      });
    } catch (err) {
      console.error(`[${requestId}] Failed to fetch pins for tag '${req.params.tag}':`, err.message, err.stack);
      res.status(500).json({
        error: {
          message: 'Failed to fetch pins for tag',
          requestId,
          timestamp
        }
      });
    }
  });

  return router;
};