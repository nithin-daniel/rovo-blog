import { Router } from 'express';
import { PostController } from '../controllers/PostController';
import { validate, postValidation } from '../middleware/validation';
import { authenticate, optionalAuth } from '../middleware/auth';
import rateLimit from 'express-rate-limit';

const router = Router();
const postController = new PostController();

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 post creations per hour
  message: 'Too many posts created, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes (with optional auth for personalization)
router.get('/', generalLimiter, optionalAuth, postController.getAll);
router.get('/slug/:slug', generalLimiter, optionalAuth, postController.getBySlug);
router.get('/:id', generalLimiter, optionalAuth, postController.getById);

// Protected routes
router.use(authenticate);

// User's own posts
router.get('/my/posts', generalLimiter, postController.getMyPosts);

// Post CRUD operations
router.post('/', createLimiter, validate(postValidation.create), postController.create);
router.put('/:id', generalLimiter, validate(postValidation.update), postController.update);
router.delete('/:id', generalLimiter, postController.delete);

// Post interactions
router.post('/:id/like', generalLimiter, postController.likePost);
router.delete('/:id/like', generalLimiter, postController.unlikePost);

export default router;