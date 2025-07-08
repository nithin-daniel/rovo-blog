import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from '../utils/AppError';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const message = error.details.map(detail => detail.message).join(', ');
      return next(new AppError(message, 400));
    }
    
    next();
  };
};

// Validation schemas
export const userValidation = {
  register: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().max(50).required(),
    lastName: Joi.string().max(50).required()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  updateProfile: Joi.object({
    firstName: Joi.string().max(50),
    lastName: Joi.string().max(50),
    bio: Joi.string().max(500),
    socialLinks: Joi.object({
      twitter: Joi.string().uri(),
      linkedin: Joi.string().uri(),
      github: Joi.string().uri(),
      website: Joi.string().uri()
    }),
    preferences: Joi.object({
      theme: Joi.string().valid('light', 'dark'),
      emailNotifications: Joi.boolean(),
      pushNotifications: Joi.boolean()
    })
  })
};

export const postValidation = {
  create: Joi.object({
    title: Joi.string().max(200).required(),
    content: Joi.string().required(),
    excerpt: Joi.string().max(500),
    featuredImage: Joi.string().uri(),
    categories: Joi.array().items(Joi.string()),
    tags: Joi.array().items(Joi.string()),
    status: Joi.string().valid('draft', 'published'),
    isPublic: Joi.boolean(),
    seo: Joi.object({
      metaTitle: Joi.string().max(60),
      metaDescription: Joi.string().max(160),
      keywords: Joi.array().items(Joi.string())
    })
  }),

  update: Joi.object({
    title: Joi.string().max(200),
    content: Joi.string(),
    excerpt: Joi.string().max(500),
    featuredImage: Joi.string().uri(),
    categories: Joi.array().items(Joi.string()),
    tags: Joi.array().items(Joi.string()),
    status: Joi.string().valid('draft', 'published', 'archived'),
    isPublic: Joi.boolean(),
    seo: Joi.object({
      metaTitle: Joi.string().max(60),
      metaDescription: Joi.string().max(160),
      keywords: Joi.array().items(Joi.string())
    })
  })
};

export const categoryValidation = {
  create: Joi.object({
    name: Joi.string().max(50).required(),
    description: Joi.string().max(200),
    color: Joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
  })
};

export const tagValidation = {
  create: Joi.object({
    name: Joi.string().max(30).required()
  })
};

export const commentValidation = {
  create: Joi.object({
    content: Joi.string().max(1000).required(),
    postId: Joi.string().required(),
    parentId: Joi.string()
  })
};