// server/middleware/auth.js

const jwt = require('jsonwebtoken');

/**
 * Middleware untuk memverifikasi JWT dan meng–attach payload ke req.user
 */
exports.authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const requestId = req.requestId;        // di-assign di app.js
  const timestamp = new Date().toISOString();

  // 1) Pastikan header Authorization ada
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({
      error: {
        message: 'No token provided',
        requestId,
        timestamp,
      }
    });
  }

  // 2) Extract token
  const token = authHeader.split(' ')[1];
  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    console.error(`[${requestId}] Missing JWT_SECRET in environment`);
    return res.status(500).json({
      error: {
        message: 'Server misconfiguration',
        requestId,
        timestamp,
      }
    });
  }

  // 3) Verify token
  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;  // payload JWT nanti bisa diakses di req.user
    next();
  } catch (err) {
    console.error(`[${requestId}] JWT verification failed:`, err.message);
    return res.status(401).json({
      error: {
        message: 'Invalid or expired token',
        requestId,
        timestamp,
      }
    });
  }
};
