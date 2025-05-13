import express from 'express';
const router = express.Router();
import knexConfig from '../knexfile.js'; // Import the knex configuration
import knex from 'knex';

const db = knex(knexConfig.development); // Initialize knex with the correct environment (development/production)

// Get all tags
router.get('/', async (req, res) => {
  try {
    const tags = await db('tags')
      .select('*')
      .orderBy('name', 'asc');
    
    res.json(tags); // Return all tags
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch tags' });
  }
});

// Get popular tags
router.get('/popular', async (req, res) => {
  try {
    const tags = await db('pin_tags')  // Use `db` here, instead of `knex`
      .join('tags', 'pin_tags.tag_id', 'tags.id')
      .select('tags.id', 'tags.name')
      .count('* as count')
      .groupBy('tags.id', 'tags.name')
      .orderBy('count', 'desc')
      .limit(20);

    res.json(tags); // Return popular tags
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch popular tags' });
  }
});

// Get pins by tag
router.get('/:tag/pins', async (req, res) => {
  const { page = 1, limit = 30 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const pins = await db('pin_tags')  // Use `db` here, instead of `knex`
      .where('tags.name', req.params.tag.toLowerCase())
      .join('tags', 'pin_tags.tag_id', 'tags.id')
      .join('pins', 'pin_tags.pin_id', 'pins.id')
      .select('pins.*')
      .orderBy('pins.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    const total = await db('pin_tags')  // Use `db` here, instead of `knex`
      .where('tags.name', req.params.tag.toLowerCase())
      .join('tags', 'pin_tags.tag_id', 'tags.id')
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
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch pins for tag' });
  }
});

export default router;
