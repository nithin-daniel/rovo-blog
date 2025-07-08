import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validate, userValidation } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import rateLimit from 'express-rate-limit';

const router = Router();
const authController = new AuthController();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
router.post('/register', authLimiter, validate(userValidation.register), authController.register);
router.post('/login', authLimiter, validate(userValidation.login), authController.login);
router.get('/verify-email', generalLimiter, authController.verifyEmail);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);

// Protected routes
router.use(authenticate);
router.get('/profile', generalLimiter, authController.getProfile);
router.post('/change-password', authLimiter, authController.changePassword);
router.post('/refresh-token', generalLimiter, authController.refreshToken);
router.post('/logout', generalLimiter, authController.logout);

export default router;