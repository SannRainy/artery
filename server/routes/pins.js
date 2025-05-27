const express = require('express');
const multer = require('multer');
const path = require('path');
const { authenticate } = require('../middleware/auth.js');
const fs = require('fs');

// Setup multer untuk upload file ke folder 'uploads/'
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    // Buat folder jika belum ada
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Nama file unik: timestamp + originalname
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

module.exports = function (db) {
  const router = express.Router();

  // GET /pins - get user's pins with pagination
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

  // POST /pins - create new pin (multipart/form-data with image file)
  router.post('/', authenticate, upload.single('image'), async (req, res) => {
    const requestId = req.requestId;
    const timestamp = new Date().toISOString();
    const userId = req.user.id;

    try {
      const { title, description, tags: tagsJson, link_url, board_id } = req.body;

      // Parse tags JSON string menjadi array, kalau kosong maka array kosong
      let tags = [];
      if (tagsJson) {
        try {
          tags = JSON.parse(tagsJson);
          if (!Array.isArray(tags)) {
            tags = [];
          }
        } catch {
          tags = [];
        }
      }

      // Simpan path file image jika ada file
      let image_url = null;
      if (req.file) {
        // Contoh: simpan relative path agar bisa dipakai frontend
        image_url = `/uploads/${req.file.filename}`;
      }

      // Insert data pin ke DB
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

      // Jika ada board_id, masukkan ke tabel relasi
      if (board_id) {
        await db('board_pins').insert({
          board_id,
          pin_id: pin.id
        });
      }

      // Handle tags: insert tags baru jika belum ada, lalu relasikan dengan pin
      if (tags.length > 0) {
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
