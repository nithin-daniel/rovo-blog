import mongoose, { Schema, Document } from 'mongoose';
import { Post as IPost } from '../../../shared/types';

export interface PostDocument extends Omit<IPost, '_id' | 'author' | 'categories' | 'tags'>, Document {
  author: mongoose.Types.ObjectId;
  categories: mongoose.Types.ObjectId[];
  tags: mongoose.Types.ObjectId[];
  generateSlug(): void;
  calculateReadTime(): void;
}

const postSchema = new Schema<PostDocument>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  excerpt: {
    type: String,
    maxlength: [500, 'Excerpt cannot exceed 500 characters']
  },
  featuredImage: {
    type: String,
    default: null
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  categories: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }],
  tags: [{
    type: Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  likeCount: {
    type: Number,
    default: 0
  },
  commentCount: {
    type: Number,
    default: 0
  },
  readTime: {
    type: Number,
    default: 0
  },
  seo: {
    metaTitle: {
      type: String,
      maxlength: [60, 'Meta title cannot exceed 60 characters']
    },
    metaDescription: {
      type: String,
      maxlength: [160, 'Meta description cannot exceed 160 characters']
    },
    keywords: [String]
  },
  publishedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes
postSchema.index({ slug: 1 });
postSchema.index({ author: 1 });
postSchema.index({ status: 1 });
postSchema.index({ categories: 1 });
postSchema.index({ tags: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ publishedAt: -1 });
postSchema.index({ viewCount: -1 });
postSchema.index({ likeCount: -1 });
postSchema.index({ title: 'text', content: 'text' });

// Pre-save middleware
postSchema.pre('save', function(next) {
  if (this.isModified('title') || this.isNew) {
    this.generateSlug();
  }
  
  if (this.isModified('content') || this.isNew) {
    this.calculateReadTime();
  }
  
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  if (!this.excerpt && this.content) {
    // Generate excerpt from content (first 150 characters)
    const plainText = this.content.replace(/<[^>]*>/g, '');
    this.excerpt = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');
  }
  
  next();
});

// Instance method to generate slug
postSchema.methods.generateSlug = function(): void {
  let slug = this.title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  
  // Add timestamp to ensure uniqueness
  slug += '-' + Date.now().toString(36);
  this.slug = slug;
};

// Instance method to calculate read time
postSchema.methods.calculateReadTime = function(): void {
  const wordsPerMinute = 200;
  const wordCount = this.content.split(/\s+/).length;
  this.readTime = Math.ceil(wordCount / wordsPerMinute);
};

export const Post = mongoose.model<PostDocument>('Post', postSchema);