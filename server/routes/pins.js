// server/routes/pins.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate } = require('../middleware/auth.js');

// Upload folder path
const uploadPath = path.join(__dirname, '..', '..', 'public/uploads');

// Ensure folder exists
fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  }
});


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

  router.post('/', authenticate, upload.single('image_url'), async (req, res) => {
  const requestId = req.requestId;
  const timestamp = new Date().toISOString();
  const userId = req.user.id;

  try {
    const { title, description, link_url, board_id } = req.body;

    // Validasi input
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title is required.' });
    }
    if (!description || description.trim().length === 0) {
      return res.status(400).json({ error: 'Description is required.' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required.' });
    }

    const image_url = `/uploads/${req.file.filename}`;

    const insertData = {
      title: title.trim(),
      description: description.trim(),
      image_url,
      link_url: link_url || null,
      user_id: userId,
      created_at: new Date(),
      updated_at: new Date()
    };

    const [insertId] = await db('pins').insert(insertData);
    const pin = await db('pins').where('id', insertId).first();

    // Optional: cek board_id validitas sebelum insert ke board_pins

    if (board_id) {
      await db('board_pins').insert({ board_id, pin_id: pin.id });
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
