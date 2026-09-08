import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { registerSchema, loginSchema } from '../utils/authValidators';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, error: 'Too many requests, please try again later.' },
});

// Sensitive public routes (rate limited)
router.post('/register', authLimiter, validateRequest(registerSchema), AuthController.register as any);
router.post('/login', authLimiter, validateRequest(loginSchema), AuthController.login as any);

// Protected profile endpoint (unthrottled for regular app navigation)
router.get('/me', authenticate, AuthController.me as any);

export default router;