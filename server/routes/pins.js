// server/routes/pins.js
import express from 'express';
import { authenticate } from '../middleware/auth.js';

export default function (db) {
  const router = express.Router();

  // Create pin
  router.post('/', authenticate, async (req, res) => {
    const { title, description, image_url, link_url, board_id, tags } = req.body;
    const userId = req.user.id;

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

      if (board_id) {
        await db('board_pins').insert({
          board_id,
          pin_id: pin.id
        });
      }

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

        await db('pin_tags')
          .insert(tagIds.map(tag_id => ({
            pin_id: pin.id,
            tag_id
          })));
      }

      res.status(201).json(pin);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to create pin', error: err.message });
    }
  });

  return router;
}
