import { Request, Response, NextFunction } from 'express';
import { PostRepository } from '../repositories/PostRepository';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth';
import { SearchFilters } from '../../shared/types';

export class PostController {
  private postRepository: PostRepository;

  constructor() {
    this.postRepository = new PostRepository();
  }

  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const post = await this.postRepository.create(req.body, req.user._id);
      
      res.status(201).json({
        success: true,
        message: 'Post created successfully',
        data: { post }
      });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters: SearchFilters = {
        query: req.query.q as string,
        category: req.query.category as string,
        tag: req.query.tag as string,
        author: req.query.author as string,
        status: req.query.status as any,
        dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
        dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
        sortBy: req.query.sortBy as any || 'createdAt',
        sortOrder: req.query.sortOrder as any || 'desc',
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10
      };

      const result = await this.postRepository.findAll(filters);
      
      res.json({
        success: true,
        data: {
          posts: result.posts,
          pagination: {
            page: filters.page!,
            limit: filters.limit!,
            total: result.total,
            pages: result.pages,
            hasNext: filters.page! < result.pages,
            hasPrev: filters.page! > 1
          }
        }
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const post = await this.postRepository.findById(id);
      
      if (!post) {
        return next(new AppError('Post not found', 404));
      }

      // Increment view count
      await this.postRepository.incrementViewCount(id);
      
      res.json({
        success: true,
        data: { post }
      });
    } catch (error) {
      next(error);
    }
  };

  getBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { slug } = req.params;
      const post = await this.postRepository.findBySlug(slug);
      
      if (!post) {
        return next(new AppError('Post not found', 404));
      }

      // Increment view count
      await this.postRepository.incrementViewCount(post._id.toString());
      
      res.json({
        success: true,
        data: { post }
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const post = await this.postRepository.findById(id);
      
      if (!post) {
        return next(new AppError('Post not found', 404));
      }

      // Check if user owns the post or is admin
      if (post.author._id.toString() !== req.user._id && req.user.role !== 'admin') {
        return next(new AppError('Not authorized to update this post', 403));
      }

      const updatedPost = await this.postRepository.update(id, req.body);
      
      res.json({
        success: true,
        message: 'Post updated successfully',
        data: { post: updatedPost }
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const post = await this.postRepository.findById(id);
      
      if (!post) {
        return next(new AppError('Post not found', 404));
      }

      // Check if user owns the post or is admin
      if (post.author._id.toString() !== req.user._id && req.user.role !== 'admin') {
        return next(new AppError('Not authorized to delete this post', 403));
      }

      await this.postRepository.delete(id);
      
      res.json({
        success: true,
        message: 'Post deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  likePost = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const post = await this.postRepository.findById(id);
      
      if (!post) {
        return next(new AppError('Post not found', 404));
      }

      await this.postRepository.incrementLikeCount(id);
      
      res.json({
        success: true,
        message: 'Post liked successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  unlikePost = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const post = await this.postRepository.findById(id);
      
      if (!post) {
        return next(new AppError('Post not found', 404));
      }

      await this.postRepository.decrementLikeCount(id);
      
      res.json({
        success: true,
        message: 'Post unliked successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  getMyPosts = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const filters: SearchFilters = {
        author: req.user._id,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sortBy: req.query.sortBy as any || 'createdAt',
        sortOrder: req.query.sortOrder as any || 'desc'
      };

      const result = await this.postRepository.findAll(filters);
      
      res.json({
        success: true,
        data: {
          posts: result.posts,
          pagination: {
            page: filters.page!,
            limit: filters.limit!,
            total: result.total,
            pages: result.pages,
            hasNext: filters.page! < result.pages,
            hasPrev: filters.page! > 1
          }
        }
      });
    } catch (error) {
      next(error);
    }
  };
}