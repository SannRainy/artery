const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate } = require('../middleware/auth.js'); // Pastikan path ini benar

// --- Konfigurasi Upload ---
const uploadPath = path.join(__dirname, '..', '..', 'public/uploads');

// Membuat direktori upload jika belum ada
// Sebaiknya dilakukan sekali saat aplikasi start, atau pastikan path dapat ditulis
try {
  fs.mkdirSync(uploadPath, { recursive: true });
} catch (err) {
  console.error('Failed to create upload directory:', err);
  // Pertimbangkan untuk menghentikan aplikasi jika direktori upload tidak bisa dibuat
  // process.exit(1);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Menggunakan ekstensi asli dari file untuk nama yang lebih baik
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    // Memberikan error yang lebih spesifik untuk multer
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Invalid file type. Only images are allowed.'), false);
  }
};

// Middleware multer untuk satu file dengan field 'image_url'
// Variabel 'uploadMiddleware' ini yang akan digunakan di route
const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
  fileFilter
}).single('image_url'); // Nama field di form-data harus 'image_url'


module.exports = function (db) {
  const router = express.Router();

  // --- GET /pins - Mengambil pin pengguna dengan paginasi ---
  router.get('/', authenticate, async (req, res) => {
    let { page = 1, limit = 30 } = req.query;
    const userId = req.user.id;
    const requestId = req.requestId || `req-${Date.now()}`; // Fallback jika requestId tidak ada
    const timestamp = new Date().toISOString();

    // Validasi input paginasi
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    if (isNaN(page) || page < 1) {
      page = 1;
    }
    if (isNaN(limit) || limit < 1 || limit > 100) { // Batas maksimum limit untuk performa
      limit = 30;
    }

    try {
      const pins = await db('pins')
        .where('user_id', userId)
        .offset((page - 1) * limit)
        .limit(limit)
        .orderBy('created_at', 'desc');

      // Bisa juga mengirim total pins untuk paginasi di frontend
      const totalPinsResult = await db('pins').where('user_id', userId).count('id as total');
      const totalPins = totalPinsResult[0] ? totalPinsResult[0].total : 0;

      res.json({
        data: pins,
        pagination: {
          page,
          limit,
          totalItems: totalPins,
          totalPages: Math.ceil(totalPins / limit)
        }
      });
    } catch (err) {
      console.error(`[${requestId}] [${timestamp}] Failed to fetch user pins:`, err.message, err.stack);
      res.status(500).json({
        error: {
          message: 'Failed to fetch pins.',
          requestId,
          timestamp
        }
      });
    }
  });

  // --- POST /pins - Membuat pin baru ---
  // 1. Autentikasi
  // 2. Handle upload file dengan middleware multer
  // 3. Proses data pin
  router.post('/', authenticate, (req, res, next) => {
    const requestId = req.requestId || `req-${Date.now()}`;
    const timestamp = new Date().toISOString();

    uploadMiddleware(req, res, (err) => {
      if (err) {
        // Penanganan error dari Multer
        if (err instanceof multer.MulterError) {
          let message = 'File upload error.';
          if (err.code === 'LIMIT_FILE_SIZE') {
            message = 'File is too large. Maximum size is 5MB.';
          } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            // Ini akan menangkap error dari fileFilter kustom kita
            message = err.message || 'Invalid file type or unexpected file.';
          }
          console.warn(`[${requestId}] [${timestamp}] Multer error: ${err.code} - ${message}`);
          return res.status(400).json({
            error: {
              message,
              code: err.code,
              requestId,
              timestamp
            }
          });
        }
        // Error lain yang tidak terduga selama upload
        console.error(`[${requestId}] [${timestamp}] Unexpected upload error:`, err.message, err.stack);
        return res.status(500).json({
          error: {
            message: 'An unexpected error occurred during file upload.',
            requestId,
            timestamp
          }
        });
      }
      // Jika tidak ada error dari multer, lanjutkan ke handler berikutnya
      next();
    });
  }, async (req, res) => {
    const requestId = req.requestId || `req-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const userId = req.user.id;

    try {
      const { title, description, link_url } = req.body; // Menambahkan link_url

      if (!title || title.trim().length === 0) {
        return res.status(400).json({
          error: {
            message: 'Title is required.',
            requestId,
            timestamp
          }
        });
      }

      if (!req.file) {
        return res.status(400).json({
          error: {
            message: 'Image file is required.',
            requestId,
            timestamp
          }
        });
      }

      const image_url = `/uploads/${req.file.filename}`; // Path relatif ke file

      const insertData = {
        title: title.trim(),
        description: description ? description.trim() : null,
        image_url,
        link_url: link_url ? link_url.trim() : null, // Menyimpan link_url jika ada
        user_id: userId,
        // created_at dan updated_at akan di-handle oleh database jika kolomnya datetime dengan default value
        // Jika tidak, Anda bisa set manual seperti ini:
        created_at: new Date(),
        updated_at: new Date()
      };

      // Menggunakan returning('*') atau serupa jika database mendukung untuk mendapatkan data yang baru diinsert
      const [insertedPin] = await db('pins').insert(insertData).returning('*'); // Asumsi PostgreSQL atau DB yang mendukung returning

      // Jika DB tidak mendukung returning('*') atau hanya mengembalikan ID:
      // const [insertId] = await db('pins').insert(insertData);
      // const insertedPin = await db('pins').where('id', insertId).first();

      if (!insertedPin) {
          console.error(`[${requestId}] [${timestamp}] Failed to retrieve pin after insert.`);
          return res.status(500).json({
            error: {
              message: 'Failed to create pin: could not retrieve created pin.',
              requestId,
              timestamp
            }
          });
      }

      res.status(201).json(insertedPin);

    } catch (err) {
      console.error(`[${requestId}] [${timestamp}] Error creating pin:`, err.message, err.stack);
      // Hapus file yang sudah terupload jika terjadi error saat insert DB
      if (req.file && req.file.path) {
        fs.unlink(req.file.path, (unlinkErr) => {
          if (unlinkErr) {
            console.error(`[${requestId}] [${timestamp}] Failed to delete uploaded file after DB error: ${req.file.path}`, unlinkErr);
          }
        });
      }
      res.status(500).json({
        error: {
          message: 'Failed to create pin.',
          details: err.message, // Hati-hati dalam mengekspos err.message ke client di production
          requestId,
          timestamp
        }
      });
    }
  });

  return router;
};