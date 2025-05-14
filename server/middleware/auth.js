const jwt = require('jsonwebtoken');

exports.authenticate = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  // Logic for validating the token
  try {
    const secretKey = process.env.JWT_SECRET || 'your-secret-key';  // Ambil secret key dari env
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded; // Attach user data to request object
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
