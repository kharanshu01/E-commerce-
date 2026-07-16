const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('./asyncHandler');

/**
 * `protect` — authentication middleware.
 * Reads a JWT from the Authorization header (Bearer) or a cookie,
 * verifies it, and attaches the current user to req.user.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;
  const header = req.headers.authorization;

  if (header && header.startsWith('Bearer ')) {
    token = header.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized — please log in.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User no longer exists.' });
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Session expired or invalid — please log in again.' });
  }
});

/**
 * `admin` — authorization middleware. Must run after `protect`.
 */
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ message: 'Admin access required.' });
};

module.exports = { protect, admin };
