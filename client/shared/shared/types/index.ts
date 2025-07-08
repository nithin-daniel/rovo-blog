// User Types
export interface User {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  role: 'user' | 'admin' | 'moderator';
  isEmailVerified: boolean;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  preferences: {
    theme: 'light' | 'dark';
    emailNotifications: boolean;
    pushNotifications: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

// Post Types
export interface Post {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  author: User;
  categories: Category[];
  tags: Tag[];
  status: 'draft' | 'published' | 'archived';
  isPublic: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  readTime: number;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface CreatePostDto {
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  categories: string[];
  tags: string[];
  status?: 'draft' | 'published';
  isPublic?: boolean;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
}

export interface UpdatePostDto extends Partial<CreatePostDto> {}

// Category Types
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  postCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  color?: string;
}

// Tag Types
export interface Tag {
  _id: string;
  name: string;
  slug: string;
  postCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTagDto {
  name: string;
}

// Comment Types
export interface Comment {
  _id: string;
  content: string;
  author: User;
  post: string;
  parent?: string;
  replies: Comment[];
  isApproved: boolean;
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCommentDto {
  content: string;
  postId: string;
  parentId?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Search and Filter Types
export interface SearchFilters {
  query?: string;
  category?: string;
  tag?: string;
  author?: string;
  status?: 'draft' | 'published' | 'archived';
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: 'createdAt' | 'updatedAt' | 'viewCount' | 'likeCount' | 'title';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Notification Types
export interface Notification {
  _id: string;
  recipient: string;
  type: 'comment' | 'like' | 'follow' | 'post_published' | 'system';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
}

// Analytics Types
export interface PostAnalytics {
  postId: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  readTime: number;
  bounceRate: number;
  date: Date;
}

export interface UserAnalytics {
  userId: string;
  totalPosts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  followers: number;
  following: number;
}

// File Upload Types
export interface UploadedFile {
  url: string;
  publicId: string;
  originalName: string;
  size: number;
  mimeType: string;
}

// Error Types
export interface AppError {
  message: string;
  statusCode: number;
  isOperational: boolean;
  stack?: string;
}