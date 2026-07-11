import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Authentication Middleware.
 * Intercepts incoming requests, validates Authorization Bearer JWT header,
 * loads corresponding user document, and maps details to `req.user`.
 */
export const protect = async (req, res, next) => {
  let token;

  // Check header for "Bearer <token>" pattern
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract signed token payload
      token = req.headers.authorization.split(' ')[1];

      // Decrypt signature check against JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Retrieve User details from database (exclude hashed password from request map)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          status: 'fail',
          message: 'Not authorized: User associated with this token no longer exists.',
        });
      }

      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return res.status(401).json({
        status: 'fail',
        message: 'Not authorized: Token signature verification failed.',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      status: 'fail',
      message: 'Not authorized: No bearer token provided.',
    });
  }
};
