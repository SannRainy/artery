import express from 'express';
const router = express.Router();
import { authenticate } from '../middleware/auth.js';
import knexConfig from '../knexfile.js'; // Import the knex configuration
import knex from 'knex';

const db = knex(knexConfig.development); // Initialize knex with the correct environment (development/production)

// Create pin
router.post('/', authenticate, async (req, res) => {
  const { title, description, image_url, link_url, board_id, tags } = req.body;
  const userId = req.user.id; // Get user ID from authenticate middleware

  try {
    // Insert new pin
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
      .returning('*');  // Return the inserted pin details

    // Insert into board_pins if board_id exists
    if (board_id) {
      await db('board_pins').insert({
        board_id,
        pin_id: pin.id
      });
    }

    // Insert into pin_tags if tags are provided
    if (tags && tags.length > 0) {
      // Use Promise.all to handle tag insertions concurrently
      const tagIds = await Promise.all(tags.map(async (tagName) => {
        let tag = await db('tags')
          .where('name', tagName.toLowerCase())
          .first();

        if (!tag) {
          // If tag does not exist, insert it and return the tag
          [tag] = await db('tags')
            .insert({ name: tagName.toLowerCase() })
            .returning('*');
        }
        return tag.id; // Return the tag id
      }));

      // Insert the tag ids into pin_tags table
      await db('pin_tags')
        .insert(tagIds.map(tag_id => ({
          pin_id: pin.id,
          tag_id
        })));
    }

    res.status(201).json(pin); // Return the created pin
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create pin', error: err.message });
  }
});

// Other pin routes...

export default router;
