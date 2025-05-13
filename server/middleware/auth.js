// server/middleware/auth.js

export const authenticate = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  // Logic for validating the token (e.g., using JWT)
  try {
    const decoded = jwt.verify(token, 'your-secret-key'); // replace with actual secret
    req.user = decoded; // Attach user data to request object
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
