// sannrainy/artery/artery-f0078462aa51f476ac9e9fea77afac719e3dfd12/server/routes/pins.js

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate } = require('../middleware/auth.js');

const uploadPath = path.join(__dirname, '..', '..', 'public/uploads');

try {
  fs.mkdirSync(uploadPath, { recursive: true });
} catch (err) {
  // Silent error is fine if directory already exists
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => { 
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Invalid file type. Only images are allowed.'), false);
  }
};

const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter
}).single('image_url');


module.exports = function (db) {
  const router = express.Router();

  const pinBasicColumns = [
    'p.id', 'p.title', 'p.description', 'p.image_url', 
    'p.created_at', 'p.updated_at', 'p.user_id'
  ];

  router.get('/', async (req, res) => {
    let { page = 1, limit = 30, category = '', user_id: filter_user_id, mode } = req.query;
    const currentAuthenticatedUserId = req.user ? req.user.id : null;
    const requestId = req.requestId || `req-${Date.now()}`;
    const timestamp = new Date().toISOString();

    page = parseInt(page, 10);
    limit = parseInt(limit, 10);
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1 || limit > 100) limit = 30;
    const offset = (page - 1) * limit;

    try {
      let pinsQuery = db
        .select(
          ...pinBasicColumns,
          'u.username as user_username',
          'u.avatar_url as user_avatar_url',
          db.raw(`(SELECT COUNT(*) FROM pin_likes WHERE pin_likes.pin_id = p.id) as like_count`),
          db.raw(`(SELECT COUNT(*) FROM pin_comments WHERE pin_comments.pin_id = p.id) as comment_count`)
        )
        .from('pins as p')
        .join('users as u', 'p.user_id', 'u.id');

      let countQueryBuilder = db('pins as p_count');

      if (filter_user_id) {
        pinsQuery.where('p.user_id', filter_user_id);
        countQueryBuilder.where('p_count.user_id', filter_user_id);
      }
      
      // === PERUBAHAN LOGIKA FILTER UTAMA DI SINI ===
      if (category && category.trim() !== '' && category !== 'Semua') {
        const categoryName = category.trim().toLowerCase();
        
        // Buat subquery untuk mendapatkan semua pin_id yang sesuai dengan kategori
        const subquery = db('pin_tags')
          .join('tags', 'pin_tags.tag_id', 'tags.id')
          .where('tags.name', categoryName)
          .select('pin_tags.pin_id');

        // Filter query utama dan query hitung menggunakan hasil dari subquery
        pinsQuery.whereIn('p.id', subquery);
        countQueryBuilder.whereIn('p_count.id', subquery);
      }
      // === AKHIR PERUBAHAN ===
      
      // GroupBy tidak lagi diperlukan karena subquery sudah menangani duplikasi
      // pinsQuery.groupBy(...pinBasicColumns.map(col => col.startsWith('p.') ? col : `p.${col}`), 'u.username', 'u.avatar_url'); 
      
      if (mode === 'random') {
        pinsQuery.orderBy(db.raw('RAND()'));
      } else {
        pinsQuery.orderBy('p.created_at', 'desc');
      }

      pinsQuery.limit(limit).offset(offset);

      const pinsData = await pinsQuery;
      const totalPinsResult = await countQueryBuilder.countDistinct('p_count.id as total').first();
      const totalPins = totalPinsResult ? parseInt(totalPinsResult.total, 10) : 0;

      let processedPins = [];
      if (pinsData.length > 0) {
        const pinIds = pinsData.map(p => p.id);
        
        const tagsData = await db('pin_tags as pt')
          .join('tags as t', 'pt.tag_id', 't.id')
          .whereIn('pt.pin_id', pinIds)
          .select('pt.pin_id', 't.id as tag_id', 't.name as tag_name');

        let userLikesData = [];
        if (currentAuthenticatedUserId) {
            userLikesData = await db('pin_likes')
                .whereIn('pin_id', pinIds)
                .andWhere('user_id', currentAuthenticatedUserId)
                .select('pin_id');
        }
        const likedPinIds = new Set(userLikesData.map(like => like.pin_id));

        processedPins = pinsData.map(pin => {
          const pinTags = tagsData
            .filter(tag => tag.pin_id === pin.id)
            .map(tag => ({ id: tag.tag_id, name: tag.tag_name }));
          return {
            ...pin,
            tags: pinTags,
            user: { 
              id: pin.user_id,
              username: pin.user_username,
              avatar_url: pin.user_avatar_url
            },
            like_count: parseInt(pin.like_count, 10) || 0,
            comment_count: parseInt(pin.comment_count, 10) || 0,
            is_liked: currentAuthenticatedUserId ? likedPinIds.has(pin.id) : false
          };
        });
      }

      res.json({
        data: processedPins,
        pagination: { page, limit, totalItems: totalPins, totalPages: Math.ceil(totalPins / limit)}
      });
    } catch (err) {
      console.error(`[${requestId}] [${timestamp}] Failed to fetch pins:`, err.message, err.stack);
      res.status(500).json({
        error: { message: 'Failed to fetch pins. Check server logs.', requestId, timestamp }
      });
    }
  });

  // --- POST /pins - Membuat pin baru ---
  router.post('/', authenticate, (req, res, next) => {
    const requestId = req.requestId || `req-${Date.now()}`;
    const timestamp = new Date().toISOString();
    uploadMiddleware(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          let message = 'File upload error.';
          if (err.code === 'LIMIT_FILE_SIZE') message = 'File is too large. Maximum size is 5MB.';
          else if (err.code === 'LIMIT_UNEXPECTED_FILE') message = err.message || 'Invalid file type or unexpected file.';
          return res.status(400).json({ error: { message, code: err.code, requestId, timestamp }});
        }
        return res.status(500).json({ error: { message: 'An unexpected error occurred during file upload.', requestId, timestamp }});
      }
      next();
    });
  }, async (req, res) => {
    const requestId = req.requestId || `req-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const userId = req.user.id;
    try {
      const { title, description, category } = req.body;
      if (!title || title.trim().length === 0) {
        return res.status(400).json({ error: { message: 'Title is required.', requestId, timestamp }});
      }
      if (!req.file) {
        return res.status(400).json({ error: { message: 'Image file is required.', requestId, timestamp }});
      }
      const image_url_path = `/uploads/${req.file.filename}`;
      const insertData = {
        title: title.trim(),
        description: description ? description.trim() : null,
        image_url: image_url_path,
        user_id: userId,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      const newPinResponse = await db.transaction(async trx => {
        const result = await trx('pins').insert(insertData);
        const pinId = result[0]; 
        if (!pinId) throw new Error('Failed to insert pin or retrieve its ID.');

        const insertedPinDetails = await trx('pins').where({ id: pinId }).first();
        if (!insertedPinDetails) throw new Error('Failed to fetch newly created pin details.');

        let tagsForNewPin = [];
        if (category && category.trim() !== '') {
          const tagName = category.trim().toLowerCase();
          let tag = await trx('tags').where({ name: tagName }).first();
          let tagId;
          if (tag) {
            tagId = tag.id;
          } else {
            const tagInsertResult = await trx('tags').insert({ name: tagName });
            tagId = tagInsertResult[0]; 
          }
          if (tagId) {
            await trx('pin_tags').insert({ pin_id: pinId, tag_id: tagId });
            const newTagData = await trx('tags').where({id: tagId}).first();
            if (newTagData) tagsForNewPin.push({ id: newTagData.id, name: newTagData.name });
          }
        }
        const userDetails = await trx('users').where({id: userId}).select('username', 'avatar_url').first();
        return {
            ...insertedPinDetails,
            tags: tagsForNewPin,
            user: { id: userId, username: userDetails.username, avatar_url: userDetails.avatar_url },
            like_count: 0, comment_count: 0, is_liked: false
        };
      });
      res.status(201).json(newPinResponse);
    } catch (err) {
      console.error(`[${requestId}] [${timestamp}] Error creating pin:`, err.message, err.stack);
      if (req.file && req.file.path) {
        fs.unlink(req.file.path, (unlinkErr) => {
          if (unlinkErr) console.error(`[${requestId}] [${timestamp}] Failed to delete uploaded file: ${req.file.path}`, unlinkErr);
        });
      }
      const errorMessage = err.message || 'Failed to create pin.';
      res.status(500).json({ error: { message: errorMessage, details: err.message, requestId, timestamp }});
    }
  });

  // --- GET /pins/search ---
  router.get('/search', authenticate, async (req, res) => { // Tambahkan authenticate jika is_liked diperlukan
    let { query, page = 1, limit = 30 } = req.query;
    const currentAuthenticatedUserId = req.user ? req.user.id : null;
    const requestId = req.requestId || `req-${Date.now()}`;
    const timestamp = new Date().toISOString();

    page = parseInt(page, 10); limit = parseInt(limit, 10);
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1 || limit > 100) limit = 30;
    const offset = (page - 1) * limit;

    if (!query || query.trim() === '') {
      return res.status(400).json({ error: { message: 'Search query is required.' }});
    }
    try {
      const searchTerm = `%${query.trim()}%`;
      let searchResultsQuery = db('pins as p')
        .join('users as u', 'p.user_id', 'u.id')
        .leftJoin('pin_tags as pt', 'p.id', 'pt.pin_id')
        .leftJoin('tags as t', 'pt.tag_id', 't.id')
        .select(
          ...pinBasicColumns.map(col => col.startsWith('p.') ? col : `p.${col.split('.')[1]}`),
          'u.username as user_username',
          'u.avatar_url as user_avatar_url',
          db.raw(`(SELECT COUNT(*) FROM pin_likes WHERE pin_likes.pin_id = p.id) as like_count`),
          db.raw(`(SELECT COUNT(*) FROM pin_comments WHERE pin_comments.pin_id = p.id) as comment_count`)
        )
        .where(function() {
          this.where('p.title', 'like', searchTerm)
            .orWhere('p.description', 'like', searchTerm)
            .orWhere('t.name', 'like', searchTerm)
        })
        .distinct('p.id');
        
      searchResultsQuery.groupBy(...pinBasicColumns.map(col => col.startsWith('p.') ? col : `p.${col.split('.')[1]}`), 'u.username', 'u.avatar_url');
      searchResultsQuery.orderBy('p.created_at', 'desc').limit(limit).offset(offset);
        
      const searchResultsData = await searchResultsQuery;
      const countQuery = db('pins as p_count')
        .leftJoin('pin_tags as pt_count', 'p_count.id', 'pt_count.pin_id')
        .leftJoin('tags as t_count', 'pt_count.tag_id', 't_count.id')
        .where(function() {
          this.where('p_count.title', 'like', searchTerm)
            .orWhere('p_count.description', 'like', searchTerm)
            .orWhere('t_count.name', 'like', searchTerm)
        })
        .countDistinct('p_count.id as total').first();
      const totalPinsResult = await countQuery;
      const totalPins = totalPinsResult ? parseInt(totalPinsResult.total, 10) : 0;
      
      let processedResults = [];
      if (searchResultsData.length > 0) {
          const pinIds = searchResultsData.map(p => p.id);
          const tagsData = await db('pin_tags as pt_sr').join('tags as t_sr', 'pt_sr.tag_id', 't_sr.id')
              .whereIn('pt_sr.pin_id', pinIds).select('pt_sr.pin_id', 't_sr.id as tag_id', 't_sr.name as tag_name');
          let userLikesData = [];
          if (currentAuthenticatedUserId) {
              userLikesData = await db('pin_likes').whereIn('pin_id', pinIds).andWhere('user_id', currentAuthenticatedUserId).select('pin_id');
          }
          const likedPinIds = new Set(userLikesData.map(like => like.pin_id));
          processedResults = searchResultsData.map(pin => {
              const pinTags = tagsData.filter(tag => tag.pin_id === pin.id).map(tag => ({ id: tag.tag_id, name: tag.tag_name }));
              return {
                  ...pin, tags: pinTags,
                  user: { id: pin.user_id, username: pin.user_username, avatar_url: pin.user_avatar_url },
                  like_count: parseInt(pin.like_count, 10) || 0,
                  comment_count: parseInt(pin.comment_count, 10) || 0,
                  is_liked: currentAuthenticatedUserId ? likedPinIds.has(pin.id) : false
              };
          });
      }
      res.json({
        data: processedResults,
        pagination: { page, limit, totalItems: totalPins, totalPages: Math.ceil(totalPins / limit) }
      });
    } catch (err) {
      console.error(`[${requestId}] [${timestamp}] Failed to search pins:`, err.message, err.stack);
      res.status(500).json({ error: { message: 'Failed to search pins.', requestId, timestamp }});
    }
  });

  // --- POST /pins/:pinId/like - Toggle Like/Unlike pin ---
  router.post('/:pinId/like', authenticate, async (req, res) => {
    const { pinId } = req.params;
    const userId = req.user.id;
    const requestId = req.requestId;
    const timestamp = new Date().toISOString();
    try {
      const pin = await db('pins').where({ id: pinId }).first();
      if (!pin) return res.status(404).json({ error: { message: 'Pin not found', requestId, timestamp }});
      const existingLike = await db('pin_likes').where({ pin_id: pinId, user_id: userId }).first();
      let newLikeStatus;
      if (existingLike) {
        await db('pin_likes').where({ id: existingLike.id }).del();
        newLikeStatus = false;
      } else {
        await db('pin_likes').insert({ pin_id: pinId, user_id: userId, created_at: new Date() });
        newLikeStatus = true;
      }
      const [likeCountResult] = await db('pin_likes').where({ pin_id: pinId }).count('id as count');
      res.status(200).json({ 
        message: `Pin ${newLikeStatus ? 'liked' : 'unliked'} successfully`, 
        liked: newLikeStatus,
        new_like_count: parseInt(likeCountResult.count, 10) || 0 // Pastikan default ke 0
      });

      if (newLikeStatus === true) { // Hanya kirim notif saat me-like, bukan unlike
        const pinOwner = await db('pins').where({ id: pinId }).select('user_id').first();
        // Kirim notifikasi jika yang me-like bukan pemilik pin
        if (pinOwner && pinOwner.user_id !== userId) {
          await db('notifications').insert({
            user_id: pinOwner.user_id,
            actor_id: userId,
            type: 'like',
            entity_id: pinId
          });
        }
      }
    } catch (err) {
      console.error(`[${requestId}] [${timestamp}] Error toggling like:`, err.message, err.stack);
      res.status(500).json({ error: { message: 'Failed to toggle like.', requestId, timestamp }});
    }
  });
  
  // --- POST /pins/:pinId/comments - Menambah komentar ---
  router.post('/:pinId/comments', authenticate, async (req, res) => {
    const { pinId: pinIdParam } = req.params; // Ganti nama agar tidak konflik
    const userId = req.user.id;
    const { text } = req.body;
    const requestId = req.requestId;
    const timestamp = new Date().toISOString();

    if (!text || text.trim() === '') {
        return res.status(400).json({ error: { message: 'Comment text cannot be empty', requestId, timestamp }});
    }
    try {
        const pin = await db('pins').where({ id: pinIdParam }).first();
        if (!pin) return res.status(404).json({ error: { message: 'Pin not found', requestId, timestamp }});

        const commentToInsert = { 
            pin_id: parseInt(pinIdParam, 10), 
            user_id: userId, 
            text: text.trim(),
            created_at: new Date() 
        };
        const result = await db('pin_comments').insert(commentToInsert);
        const insertedCommentId = result[0]; 

        if (!insertedCommentId) {
            console.error(`[${requestId}] [${timestamp}] Failed to retrieve comment ID after insert. Result:`, result);
            return res.status(500).json({ error: { message: 'Failed to create comment, ID retrieval failed.', requestId, timestamp }});
        }
        const newCommentData = await db('pin_comments as pc')
            .where('pc.id', insertedCommentId)
            .join('users as u', 'pc.user_id', 'u.id')
            .select('pc.id', 'pc.text', 'pc.created_at', 'u.id as uid', 'u.username', 'u.avatar_url')
            .first(); 
        if (!newCommentData) {
            console.error(`[${requestId}] [${timestamp}] Failed to fetch newly created comment with ID: ${insertedCommentId}`);
            return res.status(500).json({ error: { message: 'Failed to fetch comment after creation.', requestId, timestamp }});
        }
        const formattedComment = {
            id: newCommentData.id, text: newCommentData.text, created_at: newCommentData.created_at,
            user: { id: newCommentData.uid, username: newCommentData.username, avatar_url: newCommentData.avatar_url }
        };
        res.status(201).json(formattedComment);

        if (pinOwner && pinOwner.user_id !== userId) {
        await db('notifications').insert({
          user_id: pinOwner.user_id,
          actor_id: userId,
          type: 'comment',
          entity_id: pinIdParam
        });
      }
    } catch (err) {
        console.error(`[${requestId}] [${timestamp}] Error adding comment:`, err.message, err.stack ? `\nStack: ${err.stack}`: '');
        res.status(500).json({ error: { message: 'Failed to add comment.', details: err.message, requestId, timestamp }});
    }
  });

  // --- GET /pins/:id - Mengambil detail satu pin ---
  // PASTIKAN 'authenticate' ADA DI SINI untuk 'is_liked'
  router.get('/:id', authenticate, async (req, res) => {
    const { id: pinIdFromParams } = req.params; // Ganti nama agar jelas
    const requestId = req.requestId || `req-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const currentAuthenticatedUserId = req.user ? req.user.id : null; // req.user dari middleware authenticate

    try {
      const pinData = await db('pins as p')
        .where('p.id', pinIdFromParams)
        .join('users as u', 'p.user_id', 'u.id')
        .select(...pinBasicColumns, 'u.username as user_username', 'u.avatar_url as user_avatar_url')
        .first();
      if (!pinData) return res.status(404).json({ error: { message: 'Pin not found', requestId, timestamp } });

      const tags = await db('pin_tags').join('tags', 'pin_tags.tag_id', 'tags.id')
                    .where('pin_tags.pin_id', pinIdFromParams).select('tags.id', 'tags.name');
      
      const commentsData = await db('pin_comments as pc').join('users as u', 'pc.user_id', 'u.id')
        .where('pc.pin_id', pinIdFromParams)
        .select('pc.id', 'pc.text', 'pc.created_at', 'u.id as uid', 'u.username', 'u.avatar_url')
        .orderBy('pc.created_at', 'asc');
      const formattedComments = commentsData.map(c => ({ id: c.id, text: c.text, created_at: c.created_at, user: { id: c.uid, username: c.username, avatar_url: c.avatar_url }}));
      
      const [likeCountResult] = await db('pin_likes').where({ pin_id: pinIdFromParams }).count('id as count');
      const like_count = likeCountResult ? parseInt(likeCountResult.count, 10) : 0;
      
      let is_liked = false;
      if (currentAuthenticatedUserId) { // Hanya cek jika user login
        const userLike = await db('pin_likes').where({ pin_id: pinIdFromParams, user_id: currentAuthenticatedUserId }).first();
        is_liked = !!userLike;
      }
      
      res.json({
        ...pinData,
        user: { id: pinData.user_id, username: pinData.user_username, avatar_url: pinData.user_avatar_url },
        tags: tags || [], comments: formattedComments || [],
        like_count: like_count, comment_count: formattedComments.length, is_liked: is_liked 
      });
    } catch (err) {
      console.error(`[${requestId}] [${timestamp}] Failed to fetch pin details:`, err.message, err.stack);
      res.status(500).json({ error: { message: 'Failed to fetch pin details.', requestId, timestamp } });
    }
  });

  return router;
};