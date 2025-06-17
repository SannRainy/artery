// server/routes/messages.js
const express = require('express');
const { authenticate } = require('../middleware/auth.js');

module.exports = function (db) {
  const router = express.Router();
  router.use(authenticate); // Semua rute pesan memerlukan autentikasi

  router.post('/initiate', async (req, res) => {
    const { recipientId } = req.body;
    const senderId = req.user.id;

    if (!recipientId) {
      return res.status(400).json({ error: 'Recipient ID is required.' });
    }
    if (recipientId === senderId) {
      return res.status(400).json({ error: 'Cannot start a conversation with yourself.' });
    }

    try {
      // Cari percakapan yang sudah ada antara kedua pengguna
      const existingConversation = await db('conversation_participants as cp1')
        .join('conversation_participants as cp2', 'cp1.conversation_id', 'cp2.conversation_id')
        .where('cp1.user_id', senderId)
        .where('cp2.user_id', recipientId)
        .select('cp1.conversation_id')
        .first();
      
      if (existingConversation) {
        // Jika sudah ada, kembalikan ID-nya
        return res.status(200).json({ conversationId: existingConversation.conversation_id });
      }

      // Jika tidak ada, buat percakapan baru dalam sebuah transaksi
      const newConversation = await db.transaction(async trx => {
        const [conversation] = await trx('conversations').insert({}).returning('id');
        const conversationId = conversation.id || conversation; // Penyesuaian untuk driver DB berbeda

        await trx('conversation_participants').insert([
          { user_id: senderId, conversation_id: conversationId },
          { user_id: recipientId, conversation_id: conversationId },
        ]);
        return { conversationId };
      });

      res.status(201).json(newConversation);

    } catch (err) {
      console.error('Error initiating conversation:', err);
      res.status(500).json({ error: 'Failed to initiate conversation.' });
    }
  });
  // GET /api/v1/messages - Mendapatkan daftar semua percakapan pengguna
  router.get('/', async (req, res) => {
    try {
      const conversations = await db('conversation_participants as cp1')
        .join('conversations as c', 'cp1.conversation_id', 'c.id')
        .join('conversation_participants as cp2', 'c.id', 'cp2.conversation_id')
        .join('users as u', 'cp2.user_id', 'u.id')
        .leftJoin('messages as m', function() {
          this.on('c.id', '=', 'm.conversation_id')
              .andOn(db.raw('m.id = (SELECT MAX(id) FROM messages WHERE conversation_id = c.id)'));
        })
        .where('cp1.user_id', req.user.id)
        .where('cp2.user_id', '!=', req.user.id)
        .select(
          'c.id as conversationId',
          'u.id as participantId',
          'u.username as participantUsername',
          'u.avatar_url as participantAvatar',
          'm.text as lastMessage',
          'm.created_at as lastMessageTime'
        )
        .orderBy('c.updated_at', 'desc');
      res.json(conversations);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      res.status(500).json({ error: 'Gagal mengambil percakapan.' });
    }
  });

  // GET /api/v1/messages/:conversationId - Mendapatkan semua pesan dalam satu percakapan
  router.get('/:conversationId', async (req, res) => {
    const { conversationId } = req.params;
    try {
      const messages = await db('messages')
        .where({ conversation_id: conversationId })
        .join('users', 'messages.sender_id', 'users.id')
        .select('messages.*', 'users.id as userId', 'users.username', 'users.avatar_url')
        .orderBy('messages.created_at', 'asc');
      
      // Format respons agar konsisten
      const formattedMessages = messages.map(msg => ({
        id: msg.id,
        text: msg.text,
        created_at: msg.created_at,
        sender_id: msg.sender_id,
        user: {
          id: msg.userId,
          username: msg.username,
          avatar_url: msg.avatar_url
        }
      }));
      
      res.json(formattedMessages);
    } catch (err) {
      console.error(`Error fetching messages for conversation ${conversationId}:`, err);
      res.status(500).json({ error: 'Gagal mengambil pesan.' });
    }
  });
  // ==============================

  // POST /api/v1/messages/:conversationId - Mengirim pesan
  router.post('/:conversationId', async (req, res) => {
    const { conversationId } = req.params;
    const { text } = req.body;
    if (!text || text.trim() === '') {
        return res.status(400).json({ error: 'Teks tidak boleh kosong.' });
    }
    try {
      const [newMessageId] = await db('messages').insert({
        conversation_id: conversationId,
        sender_id: req.user.id,
        text: text.trim(),
      }).returning('id');
      
      await db('conversations').where({ id: conversationId }).update({ updated_at: db.fn.now() });
      
      const fullNewMessage = await db('messages')
        .where('messages.id', newMessageId.id || newMessageId)
        .join('users', 'messages.sender_id', 'users.id')
        .select('messages.*', 'users.id as userId', 'users.username', 'users.avatar_url')
        .first();

      const responseMessage = {
          id: fullNewMessage.id, text: fullNewMessage.text, created_at: fullNewMessage.created_at,
          sender_id: fullNewMessage.sender_id,
          user: { id: fullNewMessage.userId, username: fullNewMessage.username, avatar_url: fullNewMessage.avatar_url }
      };
      
      res.status(201).json(responseMessage);
    } catch (err) {
      console.error('Error sending message:', err);
      res.status(500).json({ error: 'Gagal mengirim pesan.' });
    }
  });


  return router;
};