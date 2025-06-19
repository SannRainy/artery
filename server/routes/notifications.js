// server/routes/notifications.js
const express = require('express');
const { authenticate } = require('../middleware/auth.js');

module.exports = function(db) {
  const router = express.Router();
  router.use(authenticate);

  router.get('/', async (req, res) => {
    try {
      const notifications = await db('notifications as n')
        .join('users as actor', 'n.actor_id', 'actor.id')
        .leftJoin('pins as p', 'n.entity_id', 'p.id')
        .where('n.user_id', req.user.id)
        .orderBy('n.created_at', 'desc')
        .select(
          'n.id',
          'n.type',
          'n.entity_id',
          'n.is_read',
          'n.created_at',
          'actor.id as actorId',
          'actor.username as actorUsername',
          'actor.avatar_url as actorAvatar',
          'p.image_url as pinThumbnail' 
        );
      res.json(notifications);
    } catch (err) {
      console.error("Gagal mengambil notifikasi:", err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.post('/mark-as-read', async (req, res) => {
    try {
      await db('notifications')
        .where({ user_id: req.user.id, is_read: false })
        .update({ is_read: true });
      res.status(200).json({ message: 'Semua notifikasi ditandai terbaca.' });
    } catch (err) {
      console.error("Gagal menandai notifikasi:", err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  return router;
};