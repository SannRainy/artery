// server/routes/linkedAccounts.js
const express = require('express');
const { authenticate } = require('../middleware/auth');

module.exports = function(db) {
  const router = express.Router();

  // GET: Mendapatkan semua akun yang ditautkan oleh user saat ini
  router.get('/', authenticate, async (req, res) => {
    try {
      const linkedUsers = await db('linked_accounts')
        .where('managing_user_id', req.user.id)
        .join('users', 'linked_accounts.linked_user_id', 'users.id')
        .select('users.id', 'users.username', 'users.avatar_url');
      
      res.json(linkedUsers);
    } catch (error) {
      console.error('Error fetching linked accounts:', error);
      res.status(500).json({ error: 'Failed to fetch linked accounts' });
    }
  });

  // POST: Menambahkan tautan akun baru
  router.post('/', authenticate, async (req, res) => {
    const { linkedUserId } = req.body;
    const managingUserId = req.user.id;

    if (!linkedUserId) {
      return res.status(400).json({ error: 'Linked user ID is required.' });
    }
    if (linkedUserId === managingUserId) {
      return res.status(400).json({ error: 'You cannot link your own account.' });
    }

    try {
      const newLink = {
        managing_user_id: managingUserId,
        linked_user_id: linkedUserId
      };
      
      // Cek apakah sudah ada
      const existing = await db('linked_accounts').where(newLink).first();
      if (existing) {
        return res.status(409).json({ error: 'This account is already linked.' });
      }

      await db('linked_accounts').insert(newLink);
      
      const linkedUser = await db('users').where({id: linkedUserId}).select('id', 'username', 'avatar_url').first();
      res.status(201).json(linkedUser);

    } catch (error) {
      console.error('Error linking account:', error);
      res.status(500).json({ error: 'Failed to link account.' });
    }
  });

  // DELETE: Menghapus tautan akun
  router.delete('/:linkedUserId', authenticate, async (req, res) => {
    const { linkedUserId } = req.params;
    const managingUserId = req.user.id;

    try {
      const deletedCount = await db('linked_accounts')
        .where({
          managing_user_id: managingUserId,
          linked_user_id: linkedUserId
        })
        .del();

      if (deletedCount === 0) {
        return res.status(404).json({ error: 'Linked account not found.' });
      }
      
      res.status(200).json({ message: 'Account unlinked successfully.' });

    } catch (error) {
      console.error('Error unlinking account:', error);
      res.status(500).json({ error: 'Failed to unlink account.' });
    }
  });

  return router;
};