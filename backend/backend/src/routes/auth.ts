import { Router } from 'express';
import { register, login, getMe, refreshToken } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { authLimiter, registrationLimiter } from '../middleware/rateLimiting';

const router = Router();

// Public routes with rate limiting
router.post('/register', registrationLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh', authLimiter, refreshToken);

// Protected routes
router.get('/me', authenticateToken, getMe);

export default router;