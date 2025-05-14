const express = require('express');
const { authenticate } = require('../middleware/auth.js');

module.exports = function (db) {
  const router = express.Router();

  // Create a new board
  router.post('/', authenticate, async (req, res) => {
    const { title, description, is_private } = req.body;
    const userId = req.user.id;

    try {
      const [board] = await db('boards')
        .insert({
          title,
          description,
          is_private: is_private || false,
          user_id: userId,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning('*');

      res.status(201).json(board);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to create board', error: err.message });
    }
  });

  // Get all boards for current user
  router.get('/me', authenticate, async (req, res) => {
    try {
      const boards = await db('boards')
        .where('user_id', req.user.id)
        .orderBy('created_at', 'desc');

      res.json(boards);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch boards', error: err.message });
    }
  });

  // Get a single board with its pins
  router.get('/:id', async (req, res) => {
    try {
      const board = await db('boards')
        .where('boards.id', req.params.id)
        .first();

      if (!board) {
        return res.status(404).json({ message: 'Board not found' });
      }

      if (board.is_private && (!req.user || board.user_id !== req.user.id)) {
        return res.status(403).json({ message: 'Not authorized to view this board' });
      }

      const pins = await db('board_pins')
        .where('board_id', board.id)
        .join('pins', 'board_pins.pin_id', 'pins.id')
        .select('pins.*')
        .orderBy('board_pins.created_at', 'desc');

      const user = await db('users')
        .where('id', board.user_id)
        .select('id', 'username', 'avatar_url')
        .first();

      res.json({
        ...board,
        user,
        pins
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch board', error: err.message });
    }
  });

  // Update a board
  router.put('/:id', authenticate, async (req, res) => {
    const { title, description, is_private } = req.body;

    try {
      const board = await db('boards')
        .where({ id: req.params.id })
        .first();

      if (!board) {
        return res.status(404).json({ message: 'Board not found' });
      }

      if (board.user_id !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const [updatedBoard] = await db('boards')
        .where({ id: req.params.id })
        .update({
          title,
          description,
          is_private,
          updated_at: new Date()
        })
        .returning('*');

      res.json(updatedBoard);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to update board', error: err.message });
    }
  });

  // Delete a board
  router.delete('/:id', authenticate, async (req, res) => {
    try {
      const board = await db('boards')
        .where({ id: req.params.id })
        .first();

      if (!board) {
        return res.status(404).json({ message: 'Board not found' });
      }

      if (board.user_id !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      await db('boards')
        .where({ id: req.params.id })
        .del();

      res.json({ message: 'Board deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to delete board', error: err.message });
    }
  });

  // Add pin to board
  router.post('/:id/pins', authenticate, async (req, res) => {
    const { pin_id } = req.body;

    try {
      const board = await db('boards')
        .where({ id: req.params.id })
        .first();

      if (!board) {
        return res.status(404).json({ message: 'Board not found' });
      }

      if (board.user_id !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const pin = await db('pins')
        .where({ id: pin_id })
        .first();

      if (!pin) {
        return res.status(404).json({ message: 'Pin not found' });
      }

      const existingPin = await db('board_pins')
        .where({ board_id: req.params.id, pin_id })
        .first();

      if (existingPin) {
        return res.status(400).json({ message: 'Pin already exists in this board' });
      }

      await db('board_pins').insert({
        board_id: req.params.id,
        pin_id,
        created_at: new Date()
      });

      res.json({ message: 'Pin added to board successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to add pin to board', error: err.message });
    }
  });

  // Remove pin from board
  router.delete('/:id/pins/:pin_id', authenticate, async (req, res) => {
    try {
      const board = await db('boards')
        .where({ id: req.params.id })
        .first();

      if (!board) {
        return res.status(404).json({ message: 'Board not found' });
      }

      if (board.user_id !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      await db('board_pins')
        .where({
          board_id: req.params.id,
          pin_id: req.params.pin_id
        })
        .del();

      res.json({ message: 'Pin removed from board successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to remove pin from board', error: err.message });
    }
  });

  return router;
};
