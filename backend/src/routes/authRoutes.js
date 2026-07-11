import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Route: POST /api/auth/register
 * Description: Register a new user
 * Access: Public
 */
router.post('/register', registerUser);

/**
 * Route: POST /api/auth/login
 * Description: Authenticate user & get JWT token
 * Access: Public
 */
router.post('/login', loginUser);

/**
 * Route: GET /api/auth/me
 * Description: Retrieves currently authenticated user details using protect middleware
 * Access: Private
 */
router.get('/me', protect, (req, res) => {
  res.status(200).json({
    status: 'success',
    user: req.user,
  });
});

export default router;
