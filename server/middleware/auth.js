// server/middleware/auth.js

const jwt = require('jsonwebtoken');

exports.authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const requestId = req.requestId;        
  const timestamp = new Date().toISOString();


  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({
      error: {
        message: 'No token provided',
        requestId,
        timestamp,
      }
    });
  }

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

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;  
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
